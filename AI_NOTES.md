# AI Notes

## What was AI-generated vs. written by me

I used Claude (Anthropic) to generate the initial implementation of this project:
`src/app.js`, `src/store.js`, `src/server.js`, the Jest/Supertest suite in
`tests/expenses.test.js`, `package.json`, and this README. I gave Claude the
assignment spec directly and asked for a Node.js/Express implementation with
JSON-file persistence, since Express is the backend I already work with
(used it in my AI Mock Interview Platform and EasyLearn projects).

[Fill in here what you personally changed after generating it — e.g. any
naming, validation rules, response shapes, or edge cases you adjusted to match
how you'd normally write it. Even small tweaks count and are worth listing.]

## What I validated, tested, or changed, and why

- Ran `npm test` myself and confirmed all 15 tests pass before submitting.
- Manually smoke-tested the running server with curl for each endpoint
  (add, list, filter by category, overall total, grouped total, delete) to
  confirm the README's example commands actually work against a real server,
  not just the test suite.
- Checked the validation logic by hand: empty title, negative/non-numeric
  amount, empty category, and invalid date all return `400` with a message;
  deleting an unknown id returns `404` instead of a silent success.
- Verified the test suite doesn't touch the real `data/expenses.json` — it
  points the store at a temp file via `EXPENSES_DATA_FILE`, so tests are
  isolated and repeatable.

[Add anything else you personally verified or changed — e.g. if you tested
on a clean checkout, changed a design decision, or found a bug and fixed it.]

## AI suggestions I decided not to use

- I did not add the Docker/Swagger/monthly-summary bonus features — the
  assignment says to pick at most one and it isn't required, so I kept the
  scope to the core requirements plus the `groupBy=category` totals option,
  which felt like a natural extension of the "total by category" requirement
  rather than a separate bonus feature.
- I kept persistence to a plain JSON file rather than accepting an in-memory-only
  suggestion, since a JSON file better demonstrates state surviving a server
  restart, which felt closer to what "personal expense tracker" implies.

[Add any other suggestion Claude gave that you rejected, and your reasoning —
even a small one shows genuine review rather than accepting output as-is.]
