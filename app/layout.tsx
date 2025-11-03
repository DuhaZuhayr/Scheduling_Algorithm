import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'OS Scheduling Simulator | Interactive Algorithm Visualization',
  description: 'Professional CPU scheduling algorithm simulator with interactive visualizations. Compare FCFS, Round Robin, SJF, Priority scheduling with real-time Gantt charts and performance metrics.',
  keywords: ['CPU scheduling', 'operating systems', 'algorithm visualization', 'FCFS', 'Round Robin', 'SJF', 'Priority scheduling', 'Gantt chart'],
  authors: [{ name: 'OS Scheduler Team' }],
  creator: 'OS Scheduler',
  publisher: 'OS Scheduler',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://os-scheduler.app',
    title: 'OS Scheduling Simulator',
    description: 'Interactive CPU scheduling algorithm visualization and comparison tool',
    siteName: 'OS Scheduling Simulator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OS Scheduling Simulator',
    description: 'Interactive CPU scheduling algorithm visualization',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
