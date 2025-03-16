import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import SignalRProvider from './context/signalRProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignalRProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SignalRProvider>
  </StrictMode>,
)
