import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

;(function () {
  try {
    const saved = sessionStorage.getItem('triaffect-theme')
    const theme = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)