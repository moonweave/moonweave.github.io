import { parseAndValidateSubmission } from './validation.js';

const ALLOWED_ORIGINS = new Set([
  'https://moonweave.github.io',
  'http://127.0.0.1:8123',
  'http://localhost:8123',
]);

function corsOrigin(request) {
  const origin = request.headers.get('origin') || '';
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://moonweave.github.io';
}

function jsonResponse(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': corsOrigin(request),
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
      'vary': 'origin',
    },
  });
}

async function insertSubmission(env, submission, request) {
  const userAgent = String(request.headers.get('user-agent') || '').slice(0, 300);
  await env.DB.prepare(
    `INSERT INTO submissions (id, created_at, role, area, pain, wish, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      submission.id,
      submission.created_at,
      submission.role,
      submission.area,
      submission.pain,
      submission.wish,
      userAgent,
    )
    .run();
}

async function handleSubmit(request, env) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse(request, { ok: false, code: 'content_type_required' }, 415);
  }

  const parsed = await parseAndValidateSubmission(await request.text());
  if (!parsed.ok) {
    return jsonResponse(request, {
      ok: false,
      code: parsed.code,
      errors: parsed.errors,
    }, parsed.status);
  }

  await insertSubmission(env, parsed.value, request);
  return jsonResponse(request, { ok: true, id: parsed.value.id }, 201);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return jsonResponse(request, { ok: true });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(request, { ok: true });
    }

    if (request.method === 'POST' && url.pathname === '/submit') {
      return handleSubmit(request, env);
    }

    return jsonResponse(request, { ok: false, code: 'not_found' }, 404);
  },
};

