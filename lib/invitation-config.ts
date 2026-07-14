export const INVITATION = {
  groom: 'Jasur',
  bride: 'Shahlo',
  coupleShort: 'Jasur va Shahlo',
  coupleAmpersand: 'Jasur & Shahlo',
  initials: 'J&S',
  eventTitle: 'Nikoh Visol Oqshomi',
  eventDate: '19-sentabr, 2026',
  eventDateISO: '2026-09-19T18:00:00+05:00',
  eventTime: '18:00',
  eventWeekday: 'Shanba',
  timezone: 'Toshkent vaqti',
  venue: '"Versal" Saroyi',
  venueFull: '"Versal" Tantanalar Saroyi',
  address: "Toshkent sh., Bobur ko'chasi, 23-uy",
  addressHint: "Mo'ljal: Bobur bog'i ro'parasi",
} as const;

export function getPageTitle(guestName?: string) {
  if (guestName) {
    return `${guestName} — ${INVITATION.coupleShort} nikoh taklifnomasi`;
  }
  return `${INVITATION.coupleShort} — ${INVITATION.eventTitle}`;
}

export function getPageDescription(guestName?: string) {
  if (guestName) {
    return `Hurmatli ${guestName}, siz ${INVITATION.coupleShort}ning ${INVITATION.eventTitle.toLowerCase()}iga taklif etildingiz. ${INVITATION.eventDate}, soat ${INVITATION.eventTime}, ${INVITATION.venue}.`;
  }
  return `${INVITATION.coupleShort}ning rasmiy nikoh taklifnomasi. ${INVITATION.eventDate}, soat ${INVITATION.eventTime}, ${INVITATION.venue}, ${INVITATION.address}.`;
}
