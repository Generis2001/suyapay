import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createPublicClient, createWalletClient, erc20Abi, formatEther, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from 'viem/chains'

const rpc = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const usdc = '0x3600000000000000000000000000000000000000'
const manifestPath = new URL('../deployments/arc-testnet.json', import.meta.url)
const artifact = JSON.parse(await readFile(new URL('../contracts/out/Create2Factory.sol/Create2Factory.json', import.meta.url), 'utf8'))
const publicClient = createPublicClient({ chain: arcTestnet, transport: http(rpc) })
const chainId = await publicClient.getChainId()
if (chainId !== 5042002) throw new Error(`Refusing to deploy to unexpected chain ${chainId}`)
const usdcCode = await publicClient.getCode({ address: usdc })
if (!usdcCode || usdcCode === '0x') throw new Error('Arc USDC has no deployed bytecode')
const decimals = await publicClient.readContract({ address: usdc, abi: erc20Abi, functionName: 'decimals' })
if (decimals !== 6) throw new Error(`Unexpected USDC precision: ${decimals}`)
console.log(`Verified Arc Testnet (${chainId}) USDC at ${usdc}, ${decimals} decimals.`)

let previous
try { previous = JSON.parse(await readFile(manifestPath, 'utf8')) } catch { /* first deployment */ }
let factory = previous?.create2Factory
if (factory) {
  const code = await publicClient.getCode({ address: factory.address })
  if (code?.toLowerCase() !== artifact.deployedBytecode.object.toLowerCase()) throw new Error('Recorded factory bytecode does not match the compiled contract')
  console.log(`Verified existing Create2Factory at ${factory.address}`)
} else {
  const key = process.env.DEPLOYER_PRIVATE_KEY
  if (!key) throw new Error('Set DEPLOYER_PRIVATE_KEY in the process environment to deploy the included factory')
  const account = privateKeyToAccount(key)
  const wallet = createWalletClient({ account, chain: arcTestnet, transport: http(rpc) })
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`Deployer ${account.address}; native gas balance ${formatEther(balance)} USDC.`)
  const gas = await publicClient.estimateGas({ account, data: artifact.bytecode.object })
  const gasPrice = await publicClient.getGasPrice()
  if (balance < gas * gasPrice * 2n) throw new Error('Deployer needs additional testnet USDC for deployment gas')
  const hash = await wallet.deployContract({ abi: artifact.abi, bytecode: artifact.bytecode.object, gas: gas * 12n / 10n })
  console.log(`Deployment transaction ${hash}`)
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success' || !receipt.contractAddress) throw new Error('Factory deployment failed')
  const code = await publicClient.getCode({ address: receipt.contractAddress })
  if (code?.toLowerCase() !== artifact.deployedBytecode.object.toLowerCase()) throw new Error('Deployed bytecode verification failed')
  factory = { address: receipt.contractAddress, deployer: account.address, transactionHash: hash, blockNumber: receipt.blockNumber.toString() }
  console.log(`Deployed and bytecode-verified Create2Factory at ${factory.address}`)
}
await mkdir(new URL('../deployments/', import.meta.url), { recursive: true })
await writeFile(manifestPath, JSON.stringify({ chainId, network: 'Arc Testnet', rpc, checkedAt: new Date().toISOString(),
  usdc: { address: usdc, decimals, bytecodeVerified: true }, create2Factory: factory,
  checkout: 'Direct USDC ERC-20 transfer to VITE_MERCHANT_ADDRESS; the factory is reusable deployment infrastructure and is not used by checkout.' }, null, 2) + '\n')
