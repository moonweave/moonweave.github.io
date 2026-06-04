export const ROLE_OPTIONS = new Set([
  'grad_student',
  'researcher',
  'research_engineer',
  'other',
]);

export const AREA_OPTIONS = new Set([
  'paper_reading',
  'pdf_reference',
  'coding_analysis',
  'figures_slides',
  'writing',
  'automation',
  'other',
]);

export const MAX_TEXT_LENGTH = 800;
export const MIN_PAIN_LENGTH = 5;

export function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function buildSurveyPayload(fields) {
  return {
    role: normalizeText(fields.role),
    area: normalizeText(fields.area),
    pain: normalizeText(fields.pain),
    wish: normalizeText(fields.wish),
  };
}

export function validateSurveyPayload(payload) {
  const errors = {};
  const role = normalizeText(payload.role);
  const area = normalizeText(payload.area);
  const pain = normalizeText(payload.pain);
  const wish = normalizeText(payload.wish);

  if (!ROLE_OPTIONS.has(role)) {
    errors.role = 'role_invalid';
  }

  if (!AREA_OPTIONS.has(area)) {
    errors.area = 'area_invalid';
  }

  if (pain.length < MIN_PAIN_LENGTH) {
    errors.pain = 'pain_too_short';
  } else if (pain.length > MAX_TEXT_LENGTH) {
    errors.pain = 'pain_too_long';
  }

  if (wish.length > MAX_TEXT_LENGTH) {
    errors.wish = 'wish_too_long';
  }

  return Object.keys(errors).length === 0 ? { ok: true, errors: {} } : { ok: false, errors };
}

