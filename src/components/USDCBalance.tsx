import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { USDC, TARGET_CHAIN_ID } from '@/tipjar-contract'

export function USDCBalance() {
  const { address, isConnected } = useAccount()

  const { data: rawBalance, isLoading } = useReadContract({
    address: USDC.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: isConnected && !!address },
  })

  if (!isConnected || !address) return null

  const formatted = rawBalance !== undefined
    ? Amount.fromRaw(rawBalance, usdcDecimalsFor(TARGET_CHAIN_ID)).toFixed(2)
    : isLoading ? '...' : '0.00'

  return (
    <span className="tabular-nums text-sm font-semibold" style={{ color: 'var(--ink)' }}>
      {formatted} USDC
    </span>
  )
}
