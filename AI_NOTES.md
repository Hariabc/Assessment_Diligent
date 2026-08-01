# AI Notes

## What was AI-generated vs. written by me

I used Claude (Anthropic) to generate the initial implementation of this project:
`src/app.js`, `src/store.js`, `src/server.js`, the Jest/Supertest suite in
`tests/expenses.test.js`, `package.json`, and this README. I gave Claude the
assignment spec directly and asked for a Node.js/Express implementation with
JSON-file persistence, since Express is the backend I already work with
(used it in my AI Mock Interview Platform and EasyLearn projects).

After the initial generation, I personally reviewed and refined the code. I
updated validation logic for request inputs, improved error messages to make
them more consistent, adjusted API response formats for clarity, cleaned up
variable and function names where needed, and reviewed the overall project
structure to make it easier to understand and maintain.

## What I validated, tested, or changed, and why

- Ran `npm test` myself and confirmed all 15 tests pass before submitting.
- Manually smoke-tested the running server with `curl` for each endpoint
  (add, list, filter by category, overall total, grouped total, delete) to
  confirm the README's example commands actually work against a real server,
  not just the test suite.
- Checked the validation logic by hand: empty title, negative/non-numeric
  amount, empty category, and invalid date all return `400` with a message;
  deleting an unknown id returns `404` instead of a silent success.
- Verified the test suite doesn't touch the real `data/expenses.json` — it
  points the store at a temp file via `EXPENSES_DATA_FILE`, so tests are
  isolated and repeatable.
- Reviewed the code for readability and consistency, removing unnecessary
  duplication where possible and ensuring the API behavior matched the
  assignment requirements.
- Tested the project on a clean install using `npm install` followed by
  `npm test` to ensure there were no missing dependencies or setup issues.

## AI suggestions I decided not to use

- I did not add the Docker/Swagger/monthly-summary bonus features — the
  assignment says to pick at most one and it isn't required, so I kept the
  scope to the core requirements plus the `groupBy=category` totals option,
  which felt like a natural extension of the "total by category" requirement
  rather than a separate bonus feature.
- I kept persistence to a plain JSON file rather than accepting an in-memory-only
  suggestion, since a JSON file better demonstrates state surviving a server
  restart, which felt closer to what "personal expense tracker" implies.
- I chose not to introduce additional libraries for validation or persistence
  because the assignment is small enough that the built-in approach keeps the
  project lightweight and easier to review.
- I also avoided adding extra abstractions or design patterns that would
  increase complexity without providing meaningful value for the scope of this
  assignment.
