import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moritz AI Stock Tracker',
  description: 'Professionelles Aktien-Dashboard mit KI-Prognosen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
