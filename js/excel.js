// ── Excel parser (mirrors utils/excel_reader.py) ─────────────────────────────
// Requires SheetJS (xlsx) loaded before this module

const GENDER_MAP = {
  'male':'male','female':'female',
  'homme':'male','femme':'female',
  'm':'male','f':'female',
};

const REQUIRED_GROUPS = [
  { label:'Number_Numero',    aliases:new Set(['number_numero','shirt_number','shirt_num','maillot_numero']) },
  { label:'Lastname_Nom',     aliases:new Set(['lastname_nom','nom','surname']) },
  { label:'Firstname_Prenom', aliases:new Set(['firstname_prenom','prenom','first_name']) },
  { label:'DoB_DateNaissance',aliases:new Set(['dob_datenaissance','date_de_naissance','dob']) },
  { label:'Gender_Genre',     aliases:new Set(['gender_genre','genre','gender']) },
  { label:'Sport_class',      aliases:new Set(['sport_class','player_class']) },
  { label:'Sport_status',     aliases:new Set(['sport_status']) },
];

const NON_TEAM_SHEETS = new Set(['dropdownlist','dropdown','lists','listes','ref','reference']);

function normalizeCol(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g,'_');
}

function missingColumns(cols) {
  const present = new Set(cols);
  return REQUIRED_GROUPS
    .filter(g => ![...g.aliases].some(a => present.has(a)))
    .map(g => g.label);
}

function hasShirtCol(cols) {
  const shirt = new Set(['number_numero','shirt_number','shirt_num','maillot_numero']);
  return cols.some(c => shirt.has(c));
}

function get(row, ...keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  }
  return '';
}

function cleanClass(val, validClasses) {
  if (val === '' || val === null || val === undefined) return null;
  const v = parseFloat(String(val).replace(',', '.'));
  if (isNaN(v)) return null;
  const rounded = Math.round(v * 10) / 10;
  return validClasses.includes(rounded) ? rounded : null;
}

function parseDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2,'0');
    const m = String(val.getMonth()+1).padStart(2,'0');
    return `${d}/${m}/${val.getFullYear()}`;
  }
  // Excel serial date number
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const d = String(date.getUTCDate()).padStart(2,'0');
    const m = String(date.getUTCMonth()+1).padStart(2,'0');
    return `${d}/${m}/${date.getUTCFullYear()}`;
  }
  return String(val).trim();
}

function parsePlayer(row, validClasses, validStatuses) {
  const shirtRaw = get(row, 'number_numero','shirt_number','shirt_num','maillot_numero');
  if (shirtRaw === '') return null;
  const shirt = parseInt(shirtRaw);
  if (isNaN(shirt) || shirt < 1 || shirt > 99) return null;

  const playerClass = cleanClass(
    get(row, 'sport_class','player_class'), validClasses);
  if (playerClass === null) return null;

  const genderRaw = String(get(row,'gender_genre','genre','gender') || 'male').trim().toLowerCase();
  const gender = GENDER_MAP[genderRaw] || 'male';

  const surname    = String(get(row,'lastname_nom','nom','surname') || '').trim().toUpperCase();
  const first_name = String(get(row,'firstname_prenom','prenom','first_name') || '').trim();
  const dob        = parseDate(get(row,'dob_datenaissance','date_de_naissance','dob'));

  let sport_status = String(get(row,'sport_status') || '').trim();
  if (validStatuses.length && !validStatuses.includes(sport_status)) sport_status = '';

  return { shirt_number:shirt, surname, first_name, player_class:playerClass, dob, gender, sport_status };
}

export function parseExcel(arrayBuffer, defaults) {
  const validClasses  = defaults.valid_classes  || [];
  const validStatuses = defaults.valid_statuses || [];

  let wb;
  try {
    wb = XLSX.read(arrayBuffer, { type:'array', cellDates:false });
  } catch {
    return { error:'upload_err_corrupt' };
  }

  const teams = [];

  for (const sheetName of wb.SheetNames) {
    if (NON_TEAM_SHEETS.has(sheetName.trim().toLowerCase())) continue;

    const ws   = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval:'' });
    if (!rows.length) continue;

    // Normalize column names
    const rawCols = Object.keys(rows[0]);
    const normMap = {};
    rawCols.forEach(c => { normMap[c] = normalizeCol(c); });
    const normCols = rawCols.map(c => normMap[c]);

    if (!hasShirtCol(normCols)) continue;

    // Duplicate column check
    const seen = new Set();
    const dupes = normCols.filter(c => seen.size === seen.add(c).size);
    if (dupes.length) {
      return { error:'upload_err_duplicate_cols', sheet:sheetName, cols:dupes.join(', ') };
    }

    // Missing columns check
    const missing = missingColumns(normCols);
    if (missing.length) {
      return { error:'upload_err_missing_cols', sheet:sheetName, cols:missing.join(', ') };
    }

    // Normalize row keys
    const normRows = rows.map(row => {
      const nr = {};
      Object.entries(row).forEach(([k, v]) => { nr[normMap[k]] = v; });
      return nr;
    });

    const players = normRows.map(r => parsePlayer(r, validClasses, validStatuses)).filter(Boolean);

    // Deduplicate shirt numbers (keep first occurrence)
    const seen_shirts = new Set();
    const unique = players.filter(p => {
      if (seen_shirts.has(p.shirt_number)) return false;
      seen_shirts.add(p.shirt_number);
      return true;
    });

    if (unique.length) teams.push({ name:sheetName, players:unique });
  }

  if (!teams.length) return { error:'upload_err_no_teams' };
  return { teams, competition_name:'' };
}
