# Smart Expense Tracker API

A small REST API for tracking personal expenses — add, list, filter by category,
get totals (overall and per category), and delete. Built with Node.js and Express,
with data persisted to a local JSON file (no database required).

## What's built

- `POST /expenses` — add an expense (`title`, `amount`, `category`, `date`)
- `GET /expenses` — list all expenses
- `GET /expenses?category=Food` — filter by category (case-insensitive)
- `GET /expenses/total` — overall total
- `GET /expenses/total?category=Food` — total for one category
- `GET /expenses/total?groupBy=category` — totals grouped by every category (bonus)
- `DELETE /expenses/:id` — delete an expense by id

Data is stored in `data/expenses.json`, created automatically on first write.
This file is gitignored so a clean checkout starts empty.

## Requirements

- Node.js 18+ and npm

## Install

```bash
npm install
```

## Run the server

```bash
npm start
```

The server starts on `http://localhost:3000` (override with `PORT=xxxx npm start`).

### Example requests

```bash
curl -X POST localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -d '{"title":"Groceries","amount":1200,"category":"Food","date":"2026-07-15"}'

curl localhost:3000/expenses
curl "localhost:3000/expenses?category=Food"
curl localhost:3000/expenses/total
curl "localhost:3000/expenses/total?category=Food"
curl "localhost:3000/expenses/total?groupBy=category"
curl -X DELETE localhost:3000/expenses/<id>
```

## Run the tests

```bash
npm test
```

Tests use Jest + Supertest and point the store at a temporary file
(via `EXPENSES_DATA_FILE`), so running them never touches `data/expenses.json`.

## Project structure

```
src/
  app.js      # Express app: routes, validation
  store.js    # JSON file persistence layer
  server.js   # entry point, starts the HTTP server
tests/
  expenses.test.js
```

## Design notes

- Expense IDs are generated with `crypto.randomUUID()`.
- Validation rejects missing/empty `title` or `category`, non-numeric or
  non-positive `amount`, and unparseable `date`, returning `400` with an
  `error` message.
- Deleting a non-existent id returns `404`.
- Category matching is case-insensitive on both the filter and total endpoints.
