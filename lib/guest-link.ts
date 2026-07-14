export function slugifyGuestName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0400-\u04FF-]/g, '');
}

export function guestNameFromSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildInviteLink(guestName: string, baseUrl = '') {
  const slug = slugifyGuestName(guestName);
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}/invite/${encodeURIComponent(slug)}`;
}

export function readGuestNameFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const raw =
    params.get('mehmon') ||
    params.get('ism') ||
    params.get('guest') ||
    params.get('name') ||
    '';

  return raw.trim();
}
