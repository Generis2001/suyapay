import { money } from './usdc'
import { receiptNumber, type Receipt } from './receipt'
import { STALL_LOCATION, STALL_NAME } from '../menu'

/** Portable receipt image customers can save or send without an account. */
export async function downloadReceipt(receipt: Receipt): Promise<void> {
  const width = 760
  const height = 940 + receipt.lines.length * 48
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Receipt image export is unavailable in this browser')
  ctx.scale(2, 2)
  ctx.fillStyle = '#faf6f2'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(30, 30, width - 60, height - 60)
  ctx.fillStyle = '#da3f24'
  ctx.fillRect(30, 30, width - 60, 8)
  const write = (text: string, x: number, y: number, size = 18, color = '#39231d', weight = 400) => {
    ctx.fillStyle = color
    ctx.font = `${weight} ${size}px Arial, sans-serif`
    ctx.fillText(text, x, y)
  }
  const line = (y: number) => { ctx.strokeStyle = '#eadbd0'; ctx.beginPath(); ctx.moveTo(66, y); ctx.lineTo(width - 66, y); ctx.stroke() }
  write('suyapay.', 66, 102, 36, '#da3f24', 700)
  write('PAYMENT RECEIPT', 66, 143, 13, '#8e796e', 600)
  write('Payment confirmed', 66, 200, 27, '#39231d', 700)
  write(STALL_NAME, 66, 238, 19, '#39231d', 600)
  write(`${STALL_LOCATION}, Port Harcourt`, 66, 267, 16, '#8e796e')
  write(`Receipt #${receiptNumber(receipt.hash)}`, 66, 312, 16)
  write(new Date(receipt.paidAt).toLocaleString(), 66, 342, 15, '#8e796e')
  line(370)
  write('ORDER DETAILS', 66, 407, 13, '#8e796e', 600)
  let y = 449
  for (const item of receipt.lines) {
    write(`${item.qty} × ${item.name}`, 66, y, 18)
    const amount = money(BigInt(item.lineRaw))
    ctx.font = '500 18px Arial, sans-serif'
    write(amount, width - 66 - ctx.measureText(amount).width, y, 18, '#39231d', 500)
    y += 48
  }
  line(y - 13)
  write('Total paid', 66, y + 33, 18, '#8e796e')
  const total = money(BigInt(receipt.totalRaw))
  ctx.font = '700 28px Arial, sans-serif'
  write(total, width - 66 - ctx.measureText(total).width, y + 33, 28, '#39231d', 700)
  y += 96
  for (const [label, value] of [['Network', 'Arc Testnet · chain 5042002'], ['Paid by', receipt.payer], ['Paid to', receipt.merchant]]) {
    write(label.toUpperCase(), 66, y, 11, '#8e796e', 600)
    write(value, 66, y + 27, 17)
    y += 71
  }
  write('TRANSACTION HASH', 66, y, 11, '#8e796e', 600)
  write(receipt.hash.slice(0, 34), 66, y + 27, 17)
  write(receipt.hash.slice(34), 66, y + 53, 17)
  write('Testnet payment · Save this receipt for your records.', 66, height - 78, 14, '#8e796e')
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Could not create receipt image')), 'image/png'))
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `suyapay-receipt-${receiptNumber(receipt.hash)}.png`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
