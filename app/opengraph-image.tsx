import { ImageResponse } from 'next/og';
import { INVITATION } from '@/lib/invitation-config';

export const alt = `${INVITATION.coupleShort} nikoh taklifnomasi`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            right: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 60,
            right: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          }}
        />
        <p style={{ fontSize: 28, letterSpacing: '0.3em', color: '#D4AF37', margin: 0, textTransform: 'uppercase' }}>
          Rasmiy taklifnoma
        </p>
        <h1
          style={{
            fontSize: 72,
            fontStyle: 'italic',
            margin: '24px 0 16px',
            background: 'linear-gradient(180deg, #FFFFFF, #D4AF37)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {INVITATION.coupleShort}
        </h1>
        <p style={{ fontSize: 32, margin: '0 0 8px', color: '#E5D3B3' }}>{INVITATION.eventTitle}</p>
        <p style={{ fontSize: 26, margin: 0, color: '#94A3B8' }}>
          {INVITATION.eventDate} · soat {INVITATION.eventTime}
        </p>
        <p style={{ fontSize: 22, margin: '12px 0 0', color: '#94A3B8' }}>{INVITATION.venue}</p>
        <div
          style={{
            marginTop: 36,
            padding: '12px 32px',
            border: '2px solid #D4AF37',
            borderRadius: 999,
            fontSize: 20,
            color: '#D4AF37',
            letterSpacing: '0.2em',
          }}
        >
          {INVITATION.initials}
        </div>
      </div>
    ),
    { ...size },
  );
}
