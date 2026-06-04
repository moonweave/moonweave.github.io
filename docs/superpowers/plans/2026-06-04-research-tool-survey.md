# Research Tool Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-login survey page backed by a Cloudflare Worker and D1 database.

**Architecture:** GitHub Pages serves `index.html`, `survey.html`, and browser JavaScript. The browser submits JSON to a Cloudflare Worker, which validates and stores the row in D1.

**Tech Stack:** Static HTML/CSS/ES modules, Node built-in test runner, Cloudflare Workers, Cloudflare D1.

---

## File Structure

- Create `assets/survey-utils.js`: shared browser-testable payload constants and validation helpers.
- Create `assets/survey.js`: browser form behavior and `fetch` submit flow.
- Create `survey.html`: the user-facing survey page.
- Modify `index.html`: make the survey card active and link it to `survey.html`.
- Create `worker/src/validation.js`: Worker-side payload validation.
- Create `worker/src/index.js`: Worker HTTP handlers.
- Create `worker/schema.sql`: D1 table schema.
- Create `worker/wrangler.toml`: Worker deployment configuration.
- Create `tests/survey-utils.test.js`: frontend validation tests.
- Create `tests/worker-validation.test.js`: Worker validation tests.
- Create `package.json`: test scripts and module type.

## Tasks

### Task 1: Shared Survey Validation

- [ ] Create `assets/survey-utils.js` with allowed role/area values, `normalizeText`, `validateSurveyPayload`, and `buildSurveyPayload`.
- [ ] Create `tests/survey-utils.test.js` with tests for valid payloads, short required text, long text, and optional wish text.
- [ ] Run `npm test` and verify the survey utility tests pass.

### Task 2: Worker Validation And API

- [ ] Create `worker/src/validation.js` with Worker-side validation independent of browser DOM.
- [ ] Create `tests/worker-validation.test.js` with tests for accepted payloads, invalid enum values, short text, overlong text, and oversized request bodies.
- [ ] Create `worker/src/index.js` with `OPTIONS`, `GET /health`, and `POST /submit` handlers.
- [ ] Create `worker/schema.sql` and `worker/wrangler.toml`.
- [ ] Run `npm test` and verify all tests pass.

### Task 3: Survey Frontend

- [ ] Create `survey.html` with the survey UI, casual copy, and a configured API endpoint.
- [ ] Create `assets/survey.js` to bind the form, validate input, submit JSON, show loading state, show thank-you state, and preserve input on errors.
- [ ] Update `index.html` so the survey card links to `survey.html` and is no longer disabled.
- [ ] Run local static server and verify desktop/mobile rendering with Playwright screenshots.

### Task 4: Deploy

- [ ] Commit the implemented files.
- [ ] Push GitHub Pages changes to `main`.
- [ ] Install or run Wrangler if needed.
- [ ] Create the D1 database and apply `worker/schema.sql`.
- [ ] Deploy the Worker.
- [ ] Submit one test response from the live survey page and verify it is stored in D1.

