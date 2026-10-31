import { Beef, Drumstick, Flame, CupSoda, Utensils, Minus, Plus } from 'lucide-react'
import { MENU, type MenuItem } from '@/menu'
import { parsePrice, toAmount } from '@/lib/usdc'
const ICONS: Record<MenuItem['icon'], typeof Beef> = { beef: Beef, chicken: Drumstick, offal: Utensils, spice: Flame, drink: CupSoda }
type Props = { cart: Record<string, number>; onChange: (id: string, qty: number) => void; disabled?: boolean }
export function Menu({ cart, onChange, disabled }: Props) {
  return <ul className="menu-list">{MENU.map((item) => {
    const Icon = ICONS[item.icon]
    const qty = cart[item.id] ?? 0
    return <li key={item.id} className={`menu-item ${qty ? 'in-cart' : ''}`}>
      <div className={`food-icon food-${item.icon}`}><Icon size={23} strokeWidth={1.6} aria-hidden /></div>
      <div className="menu-item-info"><h3>{item.name}</h3><p>{item.note}</p><span>{toAmount(parsePrice(item.price).raw).toFixed(2)} <small>USDC</small></span></div>
      <div className="quantity-control">{qty > 0 && <><button type="button" aria-label={`Remove one ${item.name}`} disabled={disabled} onClick={() => onChange(item.id, qty - 1)}><Minus size={15} /></button><span aria-label={`${qty} ${item.name}`}>{qty}</span></>}
        <button type="button" className="add-button" aria-label={`Add one ${item.name}`} disabled={disabled || qty >= 20} onClick={() => onChange(item.id, qty + 1)}><Plus size={17} /></button>
      </div>
    </li>
  })}</ul>
}
