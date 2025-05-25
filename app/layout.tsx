import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스마트 가계부 - 시각화 대시보드',
  description: '개인 재정 관리를 위한 스마트 가계부 앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
