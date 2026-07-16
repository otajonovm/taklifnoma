import type {Metadata} from 'next';
import { Inter, Playfair_Display, Cinzel } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Hamidullo & Muborakhon - Nikoh To\'y Taklifnomasi',
  description: 'Hamidullo va Muboraxonning to\'y marosimi uchun interaktiv 3D kitob ko\'rinishidagi premium taklifnoma.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uz" className={`${inter.variable} ${playfair.variable} ${cinzel.variable}`}>
      <body suppressHydrationWarning className="bg-[#05070f] text-gray-100 min-h-screen selection:bg-amber-500/20 selection:text-amber-300 font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
