import {
  buildSurveyPayload,
  validateSurveyPayload,
} from './survey-utils.js';

const form = document.querySelector('[data-survey-form]');
const statusBox = document.querySelector('[data-survey-status]');
const submitButton = document.querySelector('[data-survey-submit]');
const endpoint = document.querySelector('meta[name="survey-endpoint"]')?.content;

const messages = {
  role_invalid: '가장 가까운 역할을 골라주세요.',
  area_invalid: '어떤 작업에 가까운지 골라주세요.',
  pain_too_short: '불편했던 순간을 한 문장 정도로만 더 적어주세요.',
  pain_too_long: '첫 번째 답변은 800자 안으로 줄여주세요.',
  wish_too_long: '두 번째 답변은 800자 안으로 줄여주세요.',
};

function setStatus(kind, message) {
  statusBox.textContent = message;
  statusBox.dataset.state = kind;
}

function clearErrors() {
  form.querySelectorAll('[data-error-for]').forEach((node) => {
    node.textContent = '';
  });
}

function showErrors(errors) {
  clearErrors();
  Object.entries(errors).forEach(([field, code]) => {
    const node = form.querySelector(`[data-error-for="${field}"]`);
    if (node) {
      node.textContent = messages[code] || '입력값을 확인해주세요.';
    }
  });
}

function formFields() {
  const data = new FormData(form);
  return {
    role: data.get('role'),
    area: data.get('area'),
    pain: data.get('pain'),
    wish: data.get('wish'),
  };
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? '보내는 중...' : '가볍게 남기기';
}

function showThanks() {
  form.hidden = true;
  setStatus('success', '남겨줘서 고마워요. 아이디어는 모아서 실제로 만들어볼 후보로 볼게요.');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();
  setStatus('', '');

  const payload = buildSurveyPayload(formFields());
  const validation = validateSurveyPayload(payload);
  if (!validation.ok) {
    showErrors(validation.errors);
    setStatus('error', '조금만 더 적어주면 바로 보낼 수 있어요.');
    return;
  }

  setSubmitting(true);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.ok) {
      showErrors(body.errors || {});
      setStatus('error', '지금은 전송이 잘 안 됐어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    showThanks();
  } catch {
    setStatus('error', '네트워크 연결 때문에 전송하지 못했어요. 입력 내용은 그대로 둘게요.');
  } finally {
    setSubmitting(false);
  }
});

