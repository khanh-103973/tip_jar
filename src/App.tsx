import { ConnectKitButton } from 'connectkit'
import { TokenUSDC } from '@web3icons/react'
import { USDCBalance } from './components/USDCBalance'
import { TipForm } from './components/TipForm'
import { TipHistory } from './components/TipHistory'

export default function App() {
  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f9f9fc 0%, #fffcf7 52%, #fbf7f2 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '5%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(133,177,237,0.22) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '8%',
            right: '8%',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,205,131,0.20) 0%, transparent 70%)',
            filter: 'blur(58px)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 pb-12 pt-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TokenUSDC variant="branded" size={24} />
            <span className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Tip Jar
            </span>
          </div>
          <div className="flex items-center gap-3">
            <USDCBalance />
            <ConnectKitButton />
          </div>
        </header>

        {/* Hero card */}
        <section className="mb-6 text-center">
          <h1 className="display text-3xl font-bold mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Support with USDC
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Send a tip directly onchain — no middleman, instant settlement.
          </p>
        </section>

        {/* Testnet notice */}
        <div
          className="mb-5 rounded-2xl px-4 py-3 text-xs text-center"
          style={{
            background: 'rgba(133,177,237,0.13)',
            border: '1px solid rgba(133,177,237,0.30)',
            color: 'var(--accent-hover)',
          }}
        >
          Running on Arc Testnet — use the{' '}
          <strong>Get test USDC</strong> button in the sidebar to fund your wallet.
        </div>

        <main className="space-y-4">
          <TipForm />
          <TipHistory />
        </main>
      </div>
    </div>
  )
}
