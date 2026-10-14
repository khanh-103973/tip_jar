# USDC Tip Jar

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** - what Arc Studio remembers about building this app. It helps future agents (or humans) understand and extend the project.

---

## What This App Does

A USDC tip jar on Arc Testnet. Users connect their wallet, pick a preset amount ($0.01, $0.05, $0.10, $0.25) or enter a custom amount, optionally add a message, then send USDC directly onchain to a fixed creator address. Tip history is read from contract events in real-time.

## Deployed Contracts

| Contract | Network | Address | Explorer |
|---|---|---|---|
| TipJar | Arc Testnet | 0x3fc3e8806cde6cb7165e55f91fc9e9467cc2273d | https://explorer.testnet.arc.io/address/0x3fc3e8806cde6cb7165e55f91fc9e9467cc2273d |

- Creator address (fixed at deploy): 0x5B12Ce46C7194aD57d143bC22847224047b1Ef42
- USDC address: 0x3600000000000000000000000000000000000000

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Testnet (Chain ID: 5042002, imported from `viem/chains`)
- Token: USDC (6 decimals) (Address: 0x3600000000000000000000000000000000000000, Chain: Arc Testnet)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/config.ts` - wagmi config (chains, connectors, transports)

## To Run

```bash
bun install
bun run dev
```
