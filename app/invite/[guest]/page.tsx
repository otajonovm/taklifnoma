import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getPageDescription, getPageTitle, INVITATION } from '@/lib/invitation-config';
import { guestNameFromSlug } from '@/lib/guest-link';

type Props = {
  params: Promise<{ guest: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guest } = await params;
  const guestName = guestNameFromSlug(guest);

  return {
    title: getPageTitle(guestName),
    description: getPageDescription(guestName),
    openGraph: {
      title: getPageTitle(guestName),
      description: getPageDescription(guestName),
      type: 'website',
      locale: 'uz_UZ',
      siteName: `${INVITATION.coupleShort} — Taklifnoma`,
    },
    twitter: {
      card: 'summary_large_image',
      title: getPageTitle(guestName),
      description: getPageDescription(guestName),
    },
  };
}

export default async function InvitePage({ params }: Props) {
  const { guest } = await params;
  const guestName = guestNameFromSlug(guest);
  redirect(`/?mehmon=${encodeURIComponent(guestName)}`);
}
