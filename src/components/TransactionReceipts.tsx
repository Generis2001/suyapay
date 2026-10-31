import { ArrowRight, ArrowUpRight, Check, Download, ReceiptText } from 'lucide-react'
import { downloadReceipt } from '@/lib/download-receipt'
import { toast } from 'sonner'
import { money, txUrl } from '@/lib/usdc'
import { receiptNumber, type Receipt } from '@/lib/receipt'
export function TransactionReceipts({ receipts, onSelect, onOrder }: { receipts: Receipt[]; onSelect: (receipt: Receipt) => void; onOrder: () => void }) {
  return <div className="receipts-view">
    <div className="card-heading"><div><h2>Your payment history</h2><p>Receipts saved on this device.</p></div><ReceiptText size={24} className="muted-icon" /></div>
    {receipts.length === 0 ? <div className="receipts-empty"><span className="empty-icon"><ReceiptText size={32} strokeWidth={1.4} /></span><h3>Your first receipt is a bite away.</h3><p>Once your payment is confirmed, you’ll find your receipt here. Come back any time to view the details.</p><button type="button" className="primary-button" onClick={onOrder}>Explore the menu <ArrowRight size={17} /></button></div> : <ul className="receipt-history">{receipts.map((r) => <li key={r.hash}>
      <div className="history-top"><span className="paid-badge"><Check size={12} /> Paid</span><time dateTime={new Date(r.paidAt).toISOString()}>{new Date(r.paidAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>
      <button type="button" className="history-open" onClick={() => onSelect(r)} aria-label={`View receipt ${receiptNumber(r.hash)}`}><div><strong>#{receiptNumber(r.hash)}</strong><p>{r.lines.map((line) => `${line.qty} × ${line.name}`).join(', ')}</p></div><span>{money(BigInt(r.totalRaw))}<ArrowRight size={17} /></span></button>
      <div className="history-actions"><a className="history-explorer" href={txUrl(r.hash)} target="_blank" rel="noopener noreferrer">View transaction on Arc <ArrowUpRight size={13} /></a><button type="button" className="history-download" onClick={() => void downloadReceipt(r).catch(() => toast.error('Could not download your receipt. Please try again.'))}><Download size={13} /> Download receipt</button></div>
    </li>)}</ul>}
  </div>
}
