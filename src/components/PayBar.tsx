import { useEffect, useRef, useState } from 'react'
import { useAccount, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { ConnectKitButton } from 'connectkit'
import { Loader2, AlertCircle } from 'lucide-react'
import { CHAIN_ID, CHAIN_NAME, USDC_ADDRESS, money, parseError } from '@/lib/usdc'
import { MERCHANT_ADDRESS } from '@/menu'

type Props = {
  totalRaw: bigint
  itemCount: number
  onPaid: (hash: `0x${string}`, payer: string) => void
  onBusy: (busy: boolean) => void
}

export function PayBar({ totalRaw, itemCount, onPaid, onBusy }: Props) {
  const { address, chainId, isConnected } = useAccount()
  const { switchChain, isPending: switching } = useSwitchChain()
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: confirming, isSuccess, isError: receiptFailed } = useWaitForTransactionReceipt({ hash, chainId: CHAIN_ID })
  const notified = useRef<string | null>(null)
  const [payer, setPayer] = useState<`0x${string}`>()

  const { data: balance, isError: balanceFailed } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 8000 },
  })

  useEffect(() => {
    if (isSuccess && hash && payer && notified.current !== hash) {
      notified.current = hash
      onPaid(hash, payer)
    }
  }, [isSuccess, hash, payer, onPaid])

  useEffect(() => {
    onBusy(isPending || confirming)
  }, [isPending, confirming, onBusy])

  const wrongChain = isConnected && chainId !== CHAIN_ID
  const insufficient = balance !== undefined && balance < totalRaw
  const busy = isPending || confirming
  const empty = itemCount === 0
  const errMsg = error ? parseError(error) : receiptFailed ? 'The payment failed onchain. Please try again.' : null
  const showErr = errMsg && errMsg !== 'Payment cancelled.'

  const pay = () => {
    if (!MERCHANT_ADDRESS || !address || empty || busy || insufficient || balance === undefined || wrongChain) return
    setPayer(address)
    onBusy(true)
    reset()
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [MERCHANT_ADDRESS, totalRaw],
      chainId: CHAIN_ID,
    })
  }

  const btn = 'primary-button'

  return (
    <div className="space-y-3">
      {isConnected && balance !== undefined && (
        <p className="text-center text-xs text-[#7a675b] tabular-nums">Your balance: {money(balance)}</p>
      )}

      {!isConnected ? (
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button type="button" onClick={show} className={btn}>
              Connect wallet to pay
            </button>
          )}
        </ConnectKitButton.Custom>
      ) : wrongChain ? (
        <button type="button" className={btn} disabled={switching} onClick={() => switchChain({ chainId: CHAIN_ID })}>
          {switching ? 'Switching...' : `Switch to ${CHAIN_NAME}`}
        </button>
      ) : (
        <button type="button" className={btn} disabled={empty || busy || insufficient || !MERCHANT_ADDRESS || balance === undefined} onClick={pay}>
          {isPending ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Confirm in your wallet</span>
          ) : confirming ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Confirming payment</span>
          ) : balance === undefined && !empty ? (
            balanceFailed ? 'Unable to check balance' : 'Checking USDC balance…'
          ) : empty ? (
            'Add something to your order'
          ) : (
            `Pay ${money(totalRaw)}`
          )}
        </button>
      )}

      {insufficient && !empty && isConnected && !wrongChain && (
        <p className="flex items-start gap-2 rounded-xl bg-[#fdeeda] p-3 text-sm text-[#8a4b0f]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            You need {money(totalRaw)} but have {money(balance ?? 0n)}. <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="underline">Get test USDC</a> to top up, and leave some for network fees.
          </span>
        </p>
      )}
      {showErr && (
        <p className="flex items-start gap-2 rounded-xl bg-[#fde4e0] p-3 text-sm text-[#9b2c1c]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </p>
      )}
    </div>
  )
}
