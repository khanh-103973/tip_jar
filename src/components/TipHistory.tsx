import { useEffect, useState } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { arcTestnet } from 'viem/chains'
import { MessageSquare, Clock } from 'lucide-react'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { TIP_JAR, TARGET_CHAIN_ID } from '@/tipjar-contract'

const glass = {
  card: {
    background: 'rgba(255,255,255,0.64)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.68)',
    boxShadow: '0 8px 32px rgba(18,45,69,0.08), inset 0 1px 0 rgba(255,255,255,0.55)',
  } as React.CSSProperties,
}

interface TipEntry {
  from: string
  amount: string
  message: string
  blockNumber: bigint
  txHash: string
}

const TIP_SENT_EVENT = parseAbiItem(
  'event TipSent(address indexed from, uint256 amount, string message)',
)

function formatAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export function TipHistory() {
  const [tips, setTips] = useState<TipEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    async function fetchTips() {
      try {
        setLoading(true)
        setError(null)

        // Fetch latest block to compute a safe fromBlock
        const latestBlock = await client.getBlockNumber()
        const fromBlock = latestBlock > 500n ? latestBlock - 500n : 0n

        const logs = await client.getLogs({
          address: TIP_JAR.address,
          event: TIP_SENT_EVENT,
          fromBlock,
          toBlock: 'latest',
        })

        const entries: TipEntry[] = logs
          .slice(-20) // show last 20 tips
          .reverse()
          .map((log) => ({
            from: (log.args.from as string) ?? '0x',
            amount: Amount.fromRaw(
              (log.args.amount as bigint) ?? 0n,
              usdcDecimalsFor(TARGET_CHAIN_ID),
            ).toFixed(2),
            message: (log.args.message as string) ?? '',
            blockNumber: log.blockNumber ?? 0n,
            txHash: log.transactionHash ?? '',
          }))

        setTips(entries)
      } catch {
        setError('Could not load tip history.')
      } finally {
        setLoading(false)
      }
    }

    void fetchTips()
    const interval = setInterval(() => { void fetchTips() }, 12000) // refresh every ~12s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-3xl p-5 space-y-3" style={glass.card}>
      <div className="flex items-center gap-2 mb-1">
        <Clock className="size-4" style={{ color: 'var(--subtle)' }} />
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
          Recent Tips
        </p>
      </div>

      {loading && (
        <div className="py-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Loading tip history...
        </div>
      )}

      {error && !loading && (
        <div className="py-4 text-center text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {!loading && !error && tips.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No tips yet — be the first!</p>
        </div>
      )}

      {tips.map((tip, i) => (
        <div
          key={tip.txHash || i}
          className="rounded-2xl p-3.5 flex items-start gap-3"
          style={{
            background: 'rgba(255,255,255,0.46)',
            border: '1px solid rgba(255,255,255,0.56)',
          }}
        >
          <div
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(18,45,69,0.06)' }}
          >
            <MessageSquare className="size-4" style={{ color: 'var(--ink-2)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
                {formatAddress(tip.from)}
              </span>
              <span className="tabular-nums text-sm font-bold" style={{ color: 'var(--success)' }}>
                +{tip.amount} USDC
              </span>
            </div>
            {tip.message && (
              <p className="mt-1 text-sm leading-snug" style={{ color: 'var(--ink-2)' }}>
                {tip.message}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
