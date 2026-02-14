import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flip Analyzer - Real Estate Investment Tools',
  description: 'Professional real estate deal analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  )
}
