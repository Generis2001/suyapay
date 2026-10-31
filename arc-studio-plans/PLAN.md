## Implementation Plan: Dozzie's Suya Stand

### Summary
A mobile-first checkout for Professor Dozzie's suya stall on Woji Road. Customers pick suya items, pay in USDC on Arc Testnet, and get an on-screen receipt with the transaction hash.

### Architecture
- Blockchain: Arc Testnet (USDC is the native gas token, so customers need only USDC).
- Contract: none. Payment is a plain USDC ERC-20 transfer straight to Dozzie's wallet.
- Frontend: React + Tailwind. wagmi `useWriteContract` for the USDC transfer, `useWaitForTransactionReceipt` for confirmation, `useReadContract` for the customer's USDC balance.
- Wallet: ConnectKit (default). Chain check and a switch-to-Arc-Testnet prompt before payment.

### Menu (testnet-friendly prices, editable in one file)
- Beef Suya (stick/skewer portion): 0.50 USDC
- Chicken Suya: 0.40 USDC
- Kidney / Liver Suya: 0.30 USDC
- Extra Yaji spice: 0.10 USDC
- Cold drink: 0.20 USDC
Prices are small on purpose so testnet USDC from the faucet goes far. Dozzie can change them in `src/menu.ts`.

### Files to Create/Modify
1. src/menu.ts - menu items, prices, and the merchant wallet address constant (Dozzie's address).
2. src/App.tsx - page layout: header, menu, cart, pay button, receipt view.
3. src/components/Menu.tsx - item cards with add/remove quantity controls.
4. src/components/Cart.tsx - order summary, running total in USDC, balance check, faucet reminder.
5. src/components/PayButton.tsx - chain check, USDC transfer, pending/confirmed/failed states.
6. src/components/Receipt.tsx - on-screen receipt: receipt number, date/time, items and quantities, total, payer address, merchant address, tx hash with Arc Testnet explorer link, "New order" button, and a copy/share button.
7. src/lib/usdc.ts - Arc Testnet USDC address and ERC-20 ABI helpers (6 decimals via `parseUnits`).
8. src/index.css - warm suya-stall styling (spice reds, charcoal, cream) on top of the Arc/Circle base.

### Build Sequence
1. Get Dozzie's real wallet address (the app will not use a made-up one) and set it in `src/menu.ts`.
2. Add USDC helpers and menu data.
3. Build menu and cart UI with quantity controls and total.
4. Wire wallet connection, chain check, balance check, and the USDC transfer with status feedback.
5. Build the receipt screen shown after the transaction confirms; keep the last receipt in local storage so a refresh doesn't lose it.
6. Add testnet faucet reminder and error states (rejected tx, insufficient USDC, wrong network).
7. Test in preview with a testnet wallet end to end.

### Done When
- [ ] Customer can add items to a cart and see the correct USDC total.
- [ ] Connecting a wallet on the wrong network prompts a switch to Arc Testnet.
- [ ] Paying sends the exact total in USDC to Dozzie's address.
- [ ] Insufficient balance disables Pay and links to the faucet.
- [ ] After confirmation, a receipt appears with items, total, payer, merchant, timestamp, and an explorer link to the tx.
- [ ] "New order" clears the cart and returns to the menu.
- [ ] Works on a phone-sized screen.

## Ready to build?
One thing I need from you at build time: Professor Dozzie's Arc Testnet wallet address (0x...). Send it when we start, and adjust the menu prices if you want different ones.
