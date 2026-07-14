import type {Metadata} from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { getPageDescription, getPageTitle, INVITATION } from '@/lib/invitation-config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const title = getPageTitle();
const description = getPageDescription();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title,
  description,
  applicationName: `${INVITATION.coupleShort} Taklifnoma`,
  keywords: [
    INVITATION.coupleShort,
    INVITATION.groom,
    INVITATION.bride,
    'nikoh taklifnomasi',
    INVITATION.eventTitle,
    INVITATION.venue,
    INVITATION.eventDate,
  ],
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'uz_UZ',
    siteName: `${INVITATION.coupleShort} — Taklifnoma`,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uz" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body className="bg-[#0B0F19] text-gray-100 antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
