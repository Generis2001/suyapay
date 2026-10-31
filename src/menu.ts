import { isAddress, type Address } from 'viem'

export type MenuItem = {
  id: string
  name: string
  note: string
  /** USDC price as a decimal string, e.g. "0.50" */
  price: string
  icon: 'beef' | 'chicken' | 'offal' | 'spice' | 'drink'
}

// Edit names and prices here. Prices are in USDC.
export const MENU: MenuItem[] = [
  { id: 'beef', name: 'Beef Suya', note: 'Classic skewer, rubbed in yaji', price: '0.50', icon: 'beef' },
  { id: 'chicken', name: 'Chicken Suya', note: 'Charcoal grilled, tender', price: '0.40', icon: 'chicken' },
  { id: 'offal', name: 'Kidney / Liver Suya', note: 'For the real suya lovers', price: '0.30', icon: 'offal' },
  { id: 'yaji', name: 'Extra Yaji', note: 'Added heat on the side', price: '0.10', icon: 'spice' },
  { id: 'drink', name: 'Cold Drink', note: 'Chilled, to cool the pepper', price: '0.20', icon: 'drink' },
]

export const STALL_NAME = "Prof. Dozzie's Suya"
export const STALL_LOCATION = 'Woji Road'

// Dozzie's Arc Testnet wallet. Set VITE_MERCHANT_ADDRESS in .env, then restart the dev server.
const raw = import.meta.env.VITE_MERCHANT_ADDRESS
export const MERCHANT_ADDRESS: Address | undefined =
  raw && isAddress(raw) ? (raw) : undefined
