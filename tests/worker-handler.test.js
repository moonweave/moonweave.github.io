import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../worker/src/index.js';

function createMockEnv() {
  const calls = [];
  return {
    calls,
    DB: {
      prepare(sql) {
        calls.push({ type: 'prepare', sql });
        return {
          bind(...values) {
            calls.push({ type: 'bind', values });
            return {
              async run() {
                calls.push({ type: 'run' });
                return { success: true };
              },
            };
          },
        };
      },
    },
  };
}

test('GET /health returns ok', async () => {
  const response = await worker.fetch(new Request('https://api.example.test/health'), createMockEnv());
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true });
});

test('POST /submit stores accepted submissions', async () => {
  const env = createMockEnv();
  const response = await worker.fetch(
    new Request('https://api.example.test/submit', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://moonweave.github.io',
        'user-agent': 'node-test',
      },
      body: JSON.stringify({
        role: 'grad_student',
        area: 'figures_slides',
        pain: '발표자료 그림을 논문 스타일로 다시 정리하는 일이 자주 번거로워요.',
        wish: '그림 후보와 캡션 초안을 같이 만들어주는 도구',
      }),
    }),
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.match(body.id, /^[0-9a-f-]{36}$/);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://moonweave.github.io');
  assert.equal(env.calls.at(-1).type, 'run');
});

test('POST /submit rejects invalid submissions without writing to DB', async () => {
  const env = createMockEnv();
  const response = await worker.fetch(
    new Request('https://api.example.test/submit', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://moonweave.github.io',
      },
      body: JSON.stringify({
        role: 'grad_student',
        area: 'figures_slides',
        pain: '싫음',
        wish: '',
      }),
    }),
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.ok, false);
  assert.equal(body.errors.pain, 'pain_too_short');
  assert.equal(env.calls.length, 0);
});

