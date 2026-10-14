/**
 * TipJar contract config — Arc Testnet
 * Generated from Foundry artifact after deploy.
 */
import artifact from '../contracts/out/TipJar.sol/TipJar.json'
import { getUsdc, requireChain } from '@/onchain-facts'

export const TARGET_CHAIN_ID = 5042002 // Arc Testnet

export const CHAIN = requireChain(TARGET_CHAIN_ID)

export const USDC = getUsdc(TARGET_CHAIN_ID)!

export const TIP_JAR = {
  address: '0x3fc3e8806cde6cb7165e55f91fc9e9467cc2273d' as const,
  abi: artifact.abi,
} as const

/** Preset tip amounts in USDC (human-readable) */
export const TIP_PRESETS = ['0.01', '0.05', '0.10', '0.25'] as const
