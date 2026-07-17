import type {Metadata} from 'next';
import { Old_Standard_TT } from 'next/font/google';
import './globals.css'; // Global styles

const oldStandardTT = Old_Standard_TT({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Hamidullo & Muborakhon - Nikoh To\'y Taklifnomasi',
  description: 'Hamidullo va Muboraxonning to\'y marosimi uchun interaktiv 3D kitob ko\'rinishidagi premium taklifnoma.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uz" className={oldStandardTT.variable}>
      <body suppressHydrationWarning className="bg-[#07090f] text-gray-100 min-h-screen selection:bg-amber-500/20 selection:text-amber-300 font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
