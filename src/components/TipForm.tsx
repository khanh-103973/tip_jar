import { useState, useCallback } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useReadContract,
} from 'wagmi'
import { erc20Abi } from 'viem'
import { Loader2, ExternalLink, CheckCircle2, Send } from 'lucide-react'
import { parseAmount, Amount, usdcDecimalsFor } from '@/onchain-money'
import { TIP_JAR, USDC, TARGET_CHAIN_ID, TIP_PRESETS, CHAIN } from '@/tipjar-contract'
import { buildTxExplorerUrl } from '@/onchain-facts'

const glass = {
  card: {
    background: 'rgba(255,255,255,0.64)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.68)',
    boxShadow: '0 8px 32px rgba(18,45,69,0.08), inset 0 1px 0 rgba(255,255,255,0.55)',
  } as React.CSSProperties,
  inner: {
    background: 'rgba(255,255,255,0.46)',
    border: '1px solid rgba(255,255,255,0.56)',
  } as React.CSSProperties,
}

function parseOnchainError(error: unknown): string {
  const msg = (error as { message?: string })?.message?.toLowerCase() ?? ''
  if (msg.includes('user rejected') || (error as { code?: number })?.code === 4001) {
    return 'Transaction cancelled.'
  }
  if (msg.includes('insufficient funds') || msg.includes('exceeds balance')) {
    return 'Insufficient balance.'
  }
  if (msg.includes('reverted')) {
    const match = msg.match(/reason="([^"]+)"/)
    return match ? `Transaction failed: ${match[1]}` : 'Transaction failed.'
  }
  if (msg.includes('network') || msg.includes('timeout')) {
    return 'Network error. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export function TipForm() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [approvalError, setApprovalError] = useState<string | null>(null)
  const [tipError, setTipError] = useState<string | null>(null)

  const isWrongChain = isConnected && chainId !== TARGET_CHAIN_ID

  // Read user USDC balance
  const { data: rawBalance } = useReadContract({
    address: USDC.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: isConnected && !!address },
  })

  const formattedBalance = rawBalance !== undefined
    ? Amount.fromRaw(rawBalance, usdcDecimalsFor(TARGET_CHAIN_ID)).toFixed(2)
    : null

  // Approve USDC spend
  const { writeContract: approve, data: approveTxHash, isPending: isApprovePending } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })

  // Send tip
  const { writeContract: sendTip, data: tipTxHash, isPending: isTipPending } = useWriteContract()
  const { isLoading: isTipConfirming, isSuccess: isTipSuccess } = useWaitForTransactionReceipt({ hash: tipTxHash })

  const parsedAmount = (() => {
    try {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return null
      return parseAmount(TARGET_CHAIN_ID, amount)
    } catch {
      return null
    }
  })()

  const isReady = isConnected && !isWrongChain && !!parsedAmount

  const handleApprove = useCallback(() => {
    if (!parsedAmount) return
    setApprovalError(null)
    approve(
      {
        address: USDC.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [TIP_JAR.address, parsedAmount.raw],
        chainId: TARGET_CHAIN_ID,
      },
      {
        onError: (err) => {
          setApprovalError(parseOnchainError(err))
        },
      },
    )
  }, [approve, parsedAmount])

  const handleSendTip = useCallback(() => {
    if (!parsedAmount) return
    setTipError(null)
    sendTip(
      {
        address: TIP_JAR.address,
        abi: TIP_JAR.abi,
        functionName: 'sendTip',
        args: [parsedAmount.raw, message],
        chainId: TARGET_CHAIN_ID,
      },
      {
        onError: (err) => {
          setTipError(parseOnchainError(err))
        },
      },
    )
  }, [sendTip, parsedAmount, message])

  const handleReset = () => {
    setAmount('')
    setMessage('')
    setApprovalError(null)
    setTipError(null)
  }

  if (isTipSuccess && tipTxHash) {
    return (
      <div className="rounded-3xl p-6 space-y-4" style={glass.card}>
        {/* Spectral top strip */}
        <div className="h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #5fbeff, #af8ff4, #f05c6b, #ffcd83, #7ef1b3)' }} />

        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(26,128,71,0.1)' }}
          >
            <CheckCircle2 className="size-7" style={{ color: 'var(--success)' }} />
          </div>
          <p className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>
            Tip sent!
          </p>
          <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
            {amount} USDC has been delivered onchain.
          </p>
        </div>

        <a
          href={buildTxExplorerUrl(TARGET_CHAIN_ID, tipTxHash)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--accent-hover)' }}
        >
          View on {CHAIN.name} explorer <ExternalLink className="size-3" />
        </a>

        <button
          onClick={handleReset}
          className="w-full rounded-2xl py-3 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
        >
          Send another tip
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 space-y-4" style={glass.card}>
      {/* Amount presets */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
          Amount
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {TIP_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className="rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: amount === preset ? 'var(--accent)' : 'rgba(255,255,255,0.58)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: amount === preset ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.66)',
                color: amount === preset ? 'white' : 'var(--ink)',
              }}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div className="rounded-2xl p-4" style={glass.inner}>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, '')
              if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v)
            }}
            placeholder="0.00"
            className="display w-full bg-transparent text-3xl font-bold tabular-nums outline-none placeholder:text-slate-300"
            style={{ color: 'var(--ink)' }}
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>USDC</span>
            {formattedBalance !== null && (
              <button
                onClick={() => formattedBalance && setAmount(formattedBalance)}
                className="text-xs font-semibold"
                style={{ color: 'var(--accent-hover)' }}
              >
                Balance: {formattedBalance} · Max
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
          Message (optional)
        </p>
        <div className="rounded-2xl p-3" style={glass.inner}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a note with your tip..."
            maxLength={200}
            rows={2}
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-slate-300"
            style={{ color: 'var(--ink-2)' }}
          />
          <p className="text-right text-xs" style={{ color: 'var(--subtle)' }}>
            {message.length}/200
          </p>
        </div>
      </div>

      {/* Step 1: Approve */}
      {!isApproveSuccess && (
        <>
          {approvalError && (
            <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{approvalError}</p>
          )}
          <button
            disabled={!isReady || isApprovePending || isApproveConfirming}
            onClick={isWrongChain ? () => switchChain({ chainId: TARGET_CHAIN_ID }) : handleApprove}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            {!isConnected
              ? 'Connect wallet to tip'
              : isWrongChain
              ? 'Switch to Arc Testnet'
              : isApprovePending
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Confirm in wallet...</span>
              : isApproveConfirming
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Approving USDC...</span>
              : `Allow ${amount || '0'} USDC`}
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
            Step 1 of 2 — Allow the tip jar to use your USDC
          </p>
        </>
      )}

      {/* Step 2: Send tip */}
      {isApproveSuccess && (
        <>
          {tipError && (
            <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{tipError}</p>
          )}
          <button
            disabled={isTipPending || isTipConfirming}
            onClick={handleSendTip}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            {isTipPending
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Confirm in wallet...</span>
              : isTipConfirming
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Sending tip...</span>
              : <span className="flex items-center justify-center gap-2"><Send className="size-4" /> Send {amount} USDC tip</span>}
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
            Step 2 of 2 — Send the tip onchain
          </p>
        </>
      )}
    </div>
  )
}
