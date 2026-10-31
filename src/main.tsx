/*
 *  ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗
 *  ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
 *  ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
 *  ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
 *  ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
 *  ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝
 *
 *  Built with Arc Studio
 *  https://studio.arc.io
 */

import './tracing'
import './console-capture'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { Toaster } from 'sonner'
import { config } from './config'
import App from './App'
import { installShareSync } from './lib/share'
import './index.css'

const queryClient = new QueryClient()

installShareSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="light" customTheme={{
          '--ck-focus-color': '#da3f24',
          '--ck-spinner-color': '#da3f24',
          '--ck-body-color': '#39231d',
          '--ck-body-color-muted': '#8e796e',
          '--ck-body-background-secondary': '#faf3ed',
          '--ck-body-background-secondary-hover-background': '#f5e6da',
          '--ck-body-background-secondary-hover-outline': '#da3f24',
          '--ck-primary-button-color': '#39231d',
          '--ck-primary-button-background': '#fff0e9',
          '--ck-primary-button-hover-background': '#ffe1d1',
          '--ck-secondary-button-color': '#6c3f2d',
          '--ck-secondary-button-background': '#faf3ed',
          '--ck-secondary-button-hover-background': '#f5e6da',
          '--ck-body-divider': '#f0e4dc',
          '--ck-overlay-background': 'rgba(57, 35, 29, 0.24)',
        }}>
          <App />
          <Toaster position="top-center" />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
