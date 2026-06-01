// ── State — localStorage persistence ────────────────────────────────────────
const PREFIX = 'cpmt_';

export function getState(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setState(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function clearState(key) {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

// Navigation guards — redirect if required data is missing
export function requireTeams() {
  if (!getState('teams')?.length) {
    location.href = './index.html'; return false;
  }
  return true;
}

export function requireSetup() {
  if (!requireTeams()) return false;
  // Both match_setup and competition_setup must exist to render lineup correctly
  if (!getState('match_setup') || !getState('competition_setup')) {
    location.href = './setup.html'; return false;
  }
  return true;
}
