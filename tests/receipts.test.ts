import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { loadReceipts, saveReceipt, type Receipt } from '../src/lib/receipt.ts'

let storage: Map<string, string>
beforeEach(() => {
  storage = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  } })
})
const makeReceipt = (digit: string, paidAt = 1000): Receipt => ({ hash: `0x${digit.repeat(64)}`, paidAt,
  payer: '0x1111111111111111111111111111111111111111', merchant: '0x2222222222222222222222222222222222222222',
  lines: [{ name: 'Beef Suya', qty: 2, unitRaw: '500000', lineRaw: '1000000' }], totalRaw: '1000000' })

test('multiple payments persist newest first without duplicate transaction hashes', () => {
  const first = makeReceipt('a', 1000)
  const second = makeReceipt('b', 2000)
  assert.equal(saveReceipt(first), true)
  assert.equal(saveReceipt(second), true)
  saveReceipt(first)
  assert.deepEqual(loadReceipts().map((r) => r.hash), [second.hash, first.hash])
})
test('original checkout receipts migrate when the next payment is saved', () => {
  const old = makeReceipt('a')
  storage.set('dozzie-suya:last-receipt', JSON.stringify(old))
  assert.deepEqual(loadReceipts(), [old])
  saveReceipt(makeReceipt('b', 2000))
  assert.equal(loadReceipts().length, 2)
  assert.equal(storage.has('dozzie-suya:last-receipt'), false)
})
test('malformed or inconsistent stored receipts cannot crash or misstate the total', () => {
  const valid = makeReceipt('a')
  storage.set('suyapay:receipts:v1', JSON.stringify([null, {}, { ...valid, totalRaw: '1' }, { ...valid, paidAt: 1e30 }, valid]))
  storage.set('dozzie-suya:last-receipt', 'broken json')
  assert.deepEqual(loadReceipts(), [valid])
})
test('storage failure reports failure without losing the payment object', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => null, setItem: () => { throw new Error('Storage quota exceeded') },
  } })
  assert.equal(saveReceipt(makeReceipt('a')), false)
  assert.deepEqual(loadReceipts(), [])
})
