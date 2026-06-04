import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_REQUEST_BYTES,
  parseAndValidateSubmission,
} from '../worker/src/validation.js';

test('parseAndValidateSubmission accepts valid JSON submissions', async () => {
  const result = await parseAndValidateSubmission(
    JSON.stringify({
      role: 'grad_student',
      area: 'automation',
      pain: '반복해서 하는 파일 정리와 보고서 초안 만들기가 은근히 시간을 많이 먹어요.',
      wish: '폴더를 읽고 다음 할 일을 제안해주는 작은 도구',
    }),
  );

  assert.equal(result.ok, true);
  assert.equal(result.value.role, 'grad_student');
  assert.equal(result.value.area, 'automation');
  assert.match(result.value.id, /^[0-9a-f-]{36}$/);
  assert.match(result.value.created_at, /^\d{4}-\d{2}-\d{2}T/);
});

test('parseAndValidateSubmission rejects invalid enum values', async () => {
  const result = await parseAndValidateSubmission(
    JSON.stringify({
      role: 'wizard',
      area: 'paper_reading',
      pain: '논문을 읽을 때 비교 정리가 번거로워요.',
      wish: '',
    }),
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 422);
  assert.equal(result.errors.role, 'role_invalid');
});

test('parseAndValidateSubmission rejects short pain text', async () => {
  const result = await parseAndValidateSubmission(
    JSON.stringify({
      role: 'researcher',
      area: 'writing',
      pain: '아',
      wish: '',
    }),
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.pain, 'pain_too_short');
});

test('parseAndValidateSubmission rejects overlong request bodies', async () => {
  const result = await parseAndValidateSubmission('x'.repeat(MAX_REQUEST_BYTES + 1));

  assert.equal(result.ok, false);
  assert.equal(result.status, 413);
  assert.equal(result.code, 'payload_too_large');
});

