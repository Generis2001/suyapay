import { useCallback, useMemo, useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { ArrowUpRight, MapPin, ReceiptText, ShieldCheck, ShoppingBag, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Menu } from '@/components/Menu'
import { PayBar } from '@/components/PayBar'
import { Receipt } from '@/components/Receipt'
import { TransactionReceipts } from '@/components/TransactionReceipts'
import { LiveFlame } from '@/components/LiveFlame'
import { MENU, MERCHANT_ADDRESS, STALL_LOCATION, STALL_NAME } from '@/menu'
import { money, parsePrice, shortAddr } from '@/lib/usdc'
import { loadReceipts, saveReceipt, type Receipt as ReceiptData } from '@/lib/receipt'

type Tab = 'order' | 'receipts'

export default function App() {
  const [tab, setTab] = useState<Tab>('order')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [history, setHistory] = useState<ReceiptData[]>(loadReceipts)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [busy, setBusy] = useState(false)
  const lines = useMemo(() => MENU.filter((m) => (cart[m.id] ?? 0) > 0).map((m) => {
    const qty = cart[m.id]
    const unit = parsePrice(m.price).raw
    return { name: m.name, qty, unitRaw: unit.toString(), lineRaw: (unit * BigInt(qty)).toString() }
  }), [cart])
  const totalRaw = lines.reduce((total, line) => total + BigInt(line.lineRaw), 0n)
  const itemCount = lines.reduce((total, line) => total + line.qty, 0)
  const setQty = (id: string, qty: number) => setCart((current) => {
    const next = { ...current }
    if (qty <= 0) delete next[id]
    else next[id] = Math.min(qty, 20)
    return next
  })
  const onPaid = useCallback((hash: `0x${string}`, payer: string) => {
    if (!MERCHANT_ADDRESS) return
    const paid = { hash, paidAt: Date.now(), payer, merchant: MERCHANT_ADDRESS, lines, totalRaw: totalRaw.toString() }
    if (!saveReceipt(paid)) toast.warning('Payment confirmed. Save the transaction hash; this browser could not store your receipt.')
    setHistory((current) => [paid, ...current.filter((r) => r.hash !== hash)])
    setReceipt(paid)
  }, [lines, totalRaw])
  const newOrder = () => { setReceipt(null); setSelectedReceipt(null); setCart({}); setTab('order') }

  return <div className="app-shell">
    <a className="skip-link" href="#checkout">Skip to checkout</a>
    <header className="site-header">
      <a className="brand" href="./" aria-label="SuyaPay home"><span className="brand-icon"><LiveFlame /></span>suya<span>pay</span><span className="brand-dot">.</span></a>
      <div className="header-actions"><span className="network-label"><span /> Arc Testnet</span>
        <ConnectKitButton.Custom>{({ isConnected, show, address }) => <button className="wallet-button" onClick={show} type="button"><Wallet size={16} /><span>{isConnected && address ? shortAddr(address) : 'Connect wallet'}</span></button>}</ConnectKitButton.Custom>
      </div>
    </header>
    <main className="main-layout">
      <section className="intro" aria-label="About SuyaPay">
        <div className="eyebrow"><span className="tiny-line" /> GOOD FOOD. EASY PAYMENTS.</div>
        <h1 className="sr-only">SuyaPay — Professor Dozzie’s suya checkout</h1>
        <p className="intro-description">Your favourite roadside ritual, with a fresh way to pay. Pick your suya, pay in USDC, and we’ll take care of the fire.</p>
        <div className="merchant-card"><div className="merchant-icon"><LiveFlame /></div><div><strong>{STALL_NAME}</strong><span><MapPin size={13} /> {STALL_LOCATION}, Port Harcourt</span></div></div>
        <figure className="suya-story"><img src="/suya-grill.webp" alt="Suya skewers roasting over a smoky charcoal fire" width="700" height="1220" /></figure>
        <div className="intro-note"><ShieldCheck size={17} /><span>Direct payments. No account needed.</span></div>
      </section>
      <section id="checkout" className="checkout-column" aria-label="Order and transaction receipts">
        <div className="checkout-tabs" role="tablist" aria-label="Checkout navigation">
          <button id="order-tab" role="tab" aria-selected={tab === 'order'} aria-controls="order-panel" tabIndex={tab === 'order' ? 0 : -1} className={tab === 'order' ? 'active' : ''} disabled={busy} onClick={() => setTab('order')} onKeyDown={(e) => { if (e.key === 'ArrowRight' && !busy) { setTab('receipts'); document.getElementById('receipts-tab')?.focus() } }}><ShoppingBag size={17} /> Your order</button>
          <button id="receipts-tab" role="tab" aria-selected={tab === 'receipts'} aria-controls="receipts-panel" tabIndex={tab === 'receipts' ? 0 : -1} className={tab === 'receipts' ? 'active' : ''} disabled={busy} onClick={() => setTab('receipts')} onKeyDown={(e) => { if (e.key === 'ArrowLeft' && !busy) { setTab('order'); document.getElementById('order-tab')?.focus() } }}><ReceiptText size={17} /> Transaction receipts {history.length > 0 && <span className="tab-count">{history.length}</span>}</button>
        </div>
        <div className="checkout-card" role="tabpanel" id={tab === 'order' ? 'order-panel' : 'receipts-panel'} aria-labelledby={tab === 'order' ? 'order-tab' : 'receipts-tab'} tabIndex={0}>
          {tab === 'receipts' ? selectedReceipt ? <Receipt receipt={selectedReceipt} onNew={() => setSelectedReceipt(null)} buttonLabel="Back to receipts" /> : <TransactionReceipts receipts={history} onSelect={setSelectedReceipt} onOrder={() => setTab('order')} /> : receipt ? <Receipt receipt={receipt} onNew={newOrder} /> : <>
            <div className="card-heading"><div><h2>What are you craving?</h2><p>A little pepper. A lot of flavour.</p></div><span className="menu-tag">THE MENU</span></div>
            {!MERCHANT_ADDRESS && <p className="payment-notice">We’re getting the checkout ready. You can browse the menu while the stall’s payment wallet is being set up.</p>}
            <Menu cart={cart} onChange={setQty} disabled={busy} />
            <div className="order-total" aria-live="polite" aria-atomic="true"><div><span>Your total</span><small>{itemCount} {itemCount === 1 ? 'item' : 'items'} in your order</small></div><strong>{money(totalRaw)}</strong></div>
            <PayBar totalRaw={totalRaw} itemCount={itemCount} onPaid={onPaid} onBusy={setBusy} />
            <p className="checkout-assurance"><ShieldCheck size={13} /> Paid directly to the stall. Receipt included.</p>
          </>}
        </div>
        <div className="below-card"><span>Just trying things out?</span><a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">Get test USDC <ArrowUpRight size={14} /></a></div>
      </section>
    </main>
    <footer className="site-footer"><span>Made for good food & good company.</span><span>Testnet payments only</span></footer>
  </div>
}
