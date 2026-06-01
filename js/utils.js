// ── Shared utilities ─────────────────────────────────────────────────────────

export function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function contrastColor(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55 ? '#111111' : '#FFFFFF';
}

export function isLight(hex) {
  const h = (hex || '#000').replace('#', '');
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55;
}

export function jerseyIconSvg(number, jerseyColor, textColor, size = 48, isFemale = false) {
  const hexRe = /^#[0-9A-Fa-f]{6}$/;
  const c  = hexRe.test(jerseyColor) ? jerseyColor : '#002F6C';
  const tc = hexRe.test(textColor)   ? textColor   : contrastColor(c);
  const r = parseInt(c.slice(1,3), 16);
  const g = parseInt(c.slice(3,5), 16);
  const b = parseInt(c.slice(5,7), 16);
  const light  = (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55;
  const stroke  = light ? '#999999' : 'rgba(0,0,0,0.12)';
  const strokeW = light ? 3 : 1.5;
  const femaleStripe = isFemale
    ? `<rect x="23" y="76" width="34" height="7" fill="#FF69B4" opacity="0.88" rx="1"/>`
    : '';
  return `<svg width="${size}" height="${Math.round(size*1.15)}" viewBox="0 0 80 92" xmlns="http://www.w3.org/2000/svg">
    <path d="M22,8 L4,34 L22,42 L22,84 L58,84 L58,42 L76,34 L58,8 C53,13 43,16 40,16 C37,16 27,13 22,8 Z"
          fill="${c}" stroke="${stroke}" stroke-width="${strokeW}"/>
    ${femaleStripe}
    <text x="40" y="58" text-anchor="middle" dominant-baseline="middle"
          font-family="system-ui,-apple-system,sans-serif" font-weight="800"
          font-size="${number > 9 ? 24 : 28}" fill="${tc}">${number}</text>
  </svg>`;
}
