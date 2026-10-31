import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, ExternalLink } from 'lucide-react'
import { downloadReceipt } from '@/lib/download-receipt'
import { toast } from 'sonner'
import { CHAIN_NAME, money, shortAddr, toAmount, txUrl } from '@/lib/usdc'
import { receiptNumber, type Receipt as ReceiptData } from '@/lib/receipt'
import { STALL_LOCATION, STALL_NAME } from '@/menu'

export function Receipt({ receipt, onNew, buttonLabel = 'Start a new order' }: { receipt: ReceiptData; onNew: () => void; buttonLabel?: string }) {
  const [copied, setCopied] = useState(false)
  const when = new Date(receipt.paidAt)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(receipt.hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="space-y-4"
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dff3e4] text-[#1f7a3d]">
          <Check size={28} />
        </div>
        <h2 className="font-display mt-3 text-2xl font-semibold">Payment received</h2>
        <p className="text-sm text-[#8e796e]">Your suya is on the grill. Show this receipt at the stall.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#f0e4dc] bg-white shadow-sm backdrop-blur">
        <div className="h-1 bg-gradient-to-r from-[#da3f24] via-[#ffad70] to-[#da3f24]" />
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-lg font-semibold">{STALL_NAME}</p>
              <p className="text-xs text-[#8e796e]">{STALL_LOCATION}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#8e796e]">Receipt</p>
              <p className="font-mono-hash text-sm">#{receiptNumber(receipt.hash)}</p>
            </div>
          </div>

          <p className="text-xs text-[#8e796e]">
            {when.toLocaleDateString(undefined, { dateStyle: 'medium' })} at {when.toLocaleTimeString(undefined, { timeStyle: 'short' })}
          </p>

          <ul className="space-y-2 border-y border-dashed border-[#eedbcf] py-3">
            {receipt.lines.map((l) => (
              <li key={l.name} className="flex justify-between gap-3 text-sm">
                <span>
                  {l.qty} x {l.name}
                </span>
                <span className="tabular-nums">{money(BigInt(l.lineRaw))}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[#8e796e]">Total paid</span>
            <span className="font-display text-2xl font-semibold tabular-nums">{toAmount(BigInt(receipt.totalRaw)).toFixed(2)} USDC</span>
          </div>

          <dl className="space-y-1.5 text-xs text-[#8e796e]">
            <div className="flex justify-between"><dt>Network</dt><dd>{CHAIN_NAME}</dd></div>
            <div className="flex justify-between"><dt>Paid by</dt><dd className="font-mono-hash">{shortAddr(receipt.payer)}</dd></div>
            <div className="flex justify-between"><dt>Paid to</dt><dd className="font-mono-hash">{shortAddr(receipt.merchant)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Transaction</dt><dd className="font-mono-hash">{shortAddr(receipt.hash)}</dd></div>
          </dl>

          <div className="receipt-actions">
            <a
              href={txUrl(receipt.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#fff0e6] text-sm font-medium"
            >
              <ExternalLink size={16} /> View on explorer
            </a>
            <button type="button" onClick={() => void copy()} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#fff0e6] text-sm font-medium">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy tx hash'}
            </button>
            <button type="button" onClick={() => void downloadReceipt(receipt).catch(() => toast.error('Could not download your receipt. Please try again.'))} className="download-button"><Download size={16} /> Download receipt</button>
          </div>
        </div>
      </div>

      <button type="button" onClick={onNew} className="primary-button">
        {buttonLabel}
      </button>
    </motion.div>
  )
}
