import {
  buildSurveyPayload,
  validateSurveyPayload,
} from '../../assets/survey-utils.js';

export const MAX_REQUEST_BYTES = 10 * 1024;

function makeSubmission(payload) {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    role: payload.role,
    area: payload.area,
    pain: payload.pain,
    wish: payload.wish,
  };
}

export async function parseAndValidateSubmission(bodyText) {
  if (new TextEncoder().encode(bodyText).length > MAX_REQUEST_BYTES) {
    return {
      ok: false,
      status: 413,
      code: 'payload_too_large',
      errors: {},
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return {
      ok: false,
      status: 400,
      code: 'invalid_json',
      errors: {},
    };
  }

  const payload = buildSurveyPayload(parsed);
  const validation = validateSurveyPayload(payload);
  if (!validation.ok) {
    return {
      ok: false,
      status: 422,
      code: 'validation_failed',
      errors: validation.errors,
    };
  }

  return {
    ok: true,
    value: makeSubmission(payload),
  };
}

