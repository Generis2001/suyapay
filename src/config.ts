/**
 * wagmi configuration
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { arcTestnet } from 'viem/chains'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
const arcRpc = import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
registerChain(arcTestnet.id, arcRpc)

export const config = createConfig({
  chains: [arcTestnet, mainnet], // mainnet needed for ENS resolution
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(arcRpc),
    [mainnet.id]: http(), // ENS resolution uses mainnet
  },
})
