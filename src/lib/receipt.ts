import { isAddress, isHash } from 'viem'

export type ReceiptLine = { name: string; qty: number; unitRaw: string; lineRaw: string }
export type Receipt = { hash: `0x${string}`; paidAt: number; payer: string; merchant: string; lines: ReceiptLine[]; totalRaw: string }
const LEGACY_KEY = 'dozzie-suya:last-receipt'
const HISTORY_KEY = 'suyapay:receipts:v1'
const isAmount = (value: unknown): value is string => typeof value === 'string' && /^\d+$/.test(value)
const readStored = (key: string, fallback: unknown): unknown => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}

function isReceipt(value: unknown): value is Receipt {
  if (!value || typeof value !== 'object') return false
  const r = value as Partial<Receipt>
  if (typeof r.hash !== 'string' || !isHash(r.hash) || typeof r.payer !== 'string' || !isAddress(r.payer) ||
      typeof r.merchant !== 'string' || !isAddress(r.merchant) || typeof r.paidAt !== 'number' ||
      !Number.isFinite(r.paidAt) || r.paidAt <= 0 || r.paidAt > 8640000000000000 || !isAmount(r.totalRaw) || !Array.isArray(r.lines) || r.lines.length === 0) return false
  return r.lines.every((line) => line && typeof line.name === 'string' && Number.isSafeInteger(line.qty) &&
    line.qty > 0 && isAmount(line.unitRaw) && isAmount(line.lineRaw) &&
    BigInt(line.lineRaw) === BigInt(line.unitRaw) * BigInt(line.qty)) &&
    r.lines.reduce((total, line) => total + BigInt(line.lineRaw), 0n) === BigInt(r.totalRaw)
}

/** Local payment history, including receipts saved by the original checkout. */
export function loadReceipts(): Receipt[] {
  try {
    const stored = readStored(HISTORY_KEY, [])
    const legacy = readStored(LEGACY_KEY, null)
    const valid = Array.isArray(stored) ? stored.filter(isReceipt) : []
    if (isReceipt(legacy)) valid.push(legacy)
    return [...new Map(valid.map((r) => [r.hash.toLowerCase(), r])).values()].sort((a, b) => b.paidAt - a.paidAt)
  } catch { return [] }
}

export function saveReceipt(receipt: Receipt): boolean {
  if (!isReceipt(receipt)) return false
  try {
    const receipts = loadReceipts().filter((r) => r.hash.toLowerCase() !== receipt.hash.toLowerCase())
    receipts.unshift(receipt)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(receipts))
    localStorage.removeItem(LEGACY_KEY)
    return true
  } catch { return false }
}

export const receiptNumber = (hash: string) => hash.slice(-8).toUpperCase()
