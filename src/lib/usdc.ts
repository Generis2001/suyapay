import { arcTestnet } from 'viem/chains'
import { buildTxExplorerUrl, getUsdc, requireChain } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'

export const CHAIN_ID = arcTestnet.id
export const CHAIN_NAME = requireChain(CHAIN_ID).name

const usdc = getUsdc(CHAIN_ID)
if (!usdc) throw new Error('USDC is not registered for Arc Testnet')
export const USDC_ADDRESS = usdc.address as `0x${string}`
export const DECIMALS = usdcDecimalsFor(CHAIN_ID)

export const toAmount = (raw: bigint) => Amount.fromRaw(raw, DECIMALS)
export const parsePrice = (price: string) => Amount.parse(price, DECIMALS)
export const money = (raw: bigint) => `${toAmount(raw).toFixed(2)} USDC`
export const txUrl = (hash: string) => buildTxExplorerUrl(CHAIN_ID, hash)

export const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`

export function parseError(e: unknown): string {
  const err = e as { message?: string; code?: number } | undefined
  const m = err?.message?.toLowerCase() ?? ''
  if (m.includes('user rejected') || m.includes('user denied') || err?.code === 4001) return 'Payment cancelled.'
  if (m.includes('insufficient') || m.includes('exceeds balance')) return 'Not enough USDC for this order.'
  if (m.includes('reverted')) return 'The payment failed onchain. Please try again.'
  if (m.includes('network') || m.includes('timeout')) return 'Network issue. Check your connection and retry.'
  return 'Something went wrong. Please try again.'
}
