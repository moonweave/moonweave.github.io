# Research Tool Survey Design

## Goal

Add a lightweight, no-login survey flow to `moonweave.github.io` so graduate students and researchers can leave tool ideas without being sent to Google Forms or GitHub login.

## User Experience

The home page keeps two primary cards:

- `GitHub Repository`: links to `https://github.com/moonweave`
- `Research Tool Survey`: links to `/survey.html`

`survey.html` presents a short, low-pressure form:

- Role: graduate student, researcher, developer/research engineer, other
- Research friction area: paper reading, reference/PDF organization, coding/analysis, figures/slides, writing, automation, other
- One required free-text field: the research task or moment that felt annoying
- One optional free-text field: what tool they wish existed

The tone is casual and invitation-based. The page should feel like an idea box, not a formal survey.

## Architecture

GitHub Pages continues to host the static frontend. A Cloudflare Worker provides one API endpoint for submissions and stores accepted rows in Cloudflare D1.

```text
moonweave.github.io/index.html
  -> survey.html
  -> POST https://phd-ai-log-survey.moonweave.workers.dev/submit
  -> Cloudflare Worker
  -> Cloudflare D1 table: submissions
```

The Worker endpoint is CORS-limited to `https://moonweave.github.io` and local development origins. It accepts JSON only.

## Data Model

`submissions`

- `id`: text UUID primary key
- `created_at`: ISO timestamp
- `role`: text
- `area`: text
- `pain`: text, required, max 800 characters
- `wish`: text, optional, max 800 characters
- `user_agent`: text, optional, max 300 characters

No email, name, account, or other identifying field is collected in the first version.

## Validation

Frontend validation exists for user feedback, but Worker validation is authoritative.

Rules:

- `role` must be one of the allowed role values.
- `area` must be one of the allowed area values.
- `pain` must contain at least 5 non-whitespace characters and at most 800 characters.
- `wish` may be empty, but must be at most 800 characters.
- Payloads over 10 KB are rejected.

## Success States

When a submission succeeds, the form is replaced with a short thank-you state:

```text
남겨줘서 고마워요.
아이디어는 모아서 실제로 만들어볼 후보로 볼게요.
```

When submission fails, the page keeps the user's input and shows a concise retry message.

## Deployment

The static site remains deployed through GitHub Pages. The Worker and D1 database are deployed with Wrangler after Cloudflare login is available on the machine.

Expected Worker name:

```text
phd-ai-log-survey
```

Expected public endpoint:

```text
https://phd-ai-log-survey.moonweave.workers.dev/submit
```

If Cloudflare account subdomain differs from `moonweave`, update the survey endpoint in `survey.html` before final push.

## Out Of Scope

- Admin dashboard
- CSV export
- Email notifications
- Turnstile spam protection
- Authentication
- Collecting respondent contact details

