import { ImageResponse } from 'next/og';
import { INVITATION } from '@/lib/invitation-config';
import { guestNameFromSlug } from '@/lib/guest-link';

export const alt = 'Shaxsiy nikoh taklifnomasi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = {
  params: Promise<{ guest: string }>;
};

export default async function InviteOpenGraphImage({ params }: Props) {
  const { guest } = await params;
  const guestName = guestNameFromSlug(guest);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B0F19 0%, #1a1f35 50%, #0B0F19 100%)',
          color: '#FFFDF0',
          fontFamily: 'serif',
          padding: 60,
        }}
      >
        <p style={{ fontSize: 24, letterSpacing: '0.25em', color: '#D4AF37', margin: 0, textTransform: 'uppercase' }}>
          Siz taklif etildingiz
        </p>
        <h2 style={{ fontSize: 52, fontStyle: 'italic', margin: '20px 0 8px', color: '#FFFFFF' }}>
          Hurmatli {guestName}
        </h2>
        <div
          style={{
            width: 120,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            margin: '16px 0',
          }}
        />
        <h1 style={{ fontSize: 64, fontStyle: 'italic', margin: '8px 0', color: '#D4AF37' }}>
          {INVITATION.coupleShort}
        </h1>
        <p style={{ fontSize: 30, margin: '8px 0', color: '#E5D3B3' }}>{INVITATION.eventTitle}</p>
        <p style={{ fontSize: 24, margin: '8px 0 0', color: '#94A3B8' }}>
          {INVITATION.eventDate} · {INVITATION.venue}
        </p>
      </div>
    ),
    { ...size },
  );
}
