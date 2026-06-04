import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSurveyPayload,
  validateSurveyPayload,
} from '../assets/survey-utils.js';

test('buildSurveyPayload trims text fields and keeps selected values', () => {
  const payload = buildSurveyPayload({
    role: 'grad_student',
    area: 'coding_analysis',
    pain: '  반복 분석 스크립트 정리가 매번 번거로워요.  ',
    wish: '  실험 로그랑 그래프를 자동으로 묶어주는 도구  ',
  });

  assert.deepEqual(payload, {
    role: 'grad_student',
    area: 'coding_analysis',
    pain: '반복 분석 스크립트 정리가 매번 번거로워요.',
    wish: '실험 로그랑 그래프를 자동으로 묶어주는 도구',
  });
});

test('validateSurveyPayload accepts a complete payload', () => {
  const result = validateSurveyPayload({
    role: 'researcher',
    area: 'paper_reading',
    pain: '논문 여러 편을 비교하면서 핵심 차이를 정리하는 일이 오래 걸려요.',
    wish: '',
  });

  assert.deepEqual(result, { ok: true, errors: {} });
});

test('validateSurveyPayload rejects short required pain text', () => {
  const result = validateSurveyPayload({
    role: 'researcher',
    area: 'paper_reading',
    pain: '힘듦',
    wish: '',
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.pain, 'pain_too_short');
});

test('validateSurveyPayload rejects overlong wish text', () => {
  const result = validateSurveyPayload({
    role: 'researcher',
    area: 'paper_reading',
    pain: '논문 읽을 때 표와 그림 근거를 빠르게 찾고 싶어요.',
    wish: 'a'.repeat(801),
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.wish, 'wish_too_long');
});

