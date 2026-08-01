const fs = require('fs');
const path = require('path');
const os = require('os');

// Point the store at a fresh temp file for every test run so tests never
// touch (or depend on) the real data/expenses.json file.
const TEST_DATA_FILE = path.join(os.tmpdir(), `expenses-test-${Date.now()}.json`);
process.env.EXPENSES_DATA_FILE = TEST_DATA_FILE;

const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

function addSample(overrides = {}) {
  return request(app)
    .post('/expenses')
    .send({
      title: 'Lunch',
      amount: 250,
      category: 'Food',
      date: '2026-07-01',
      ...overrides,
    });
}

beforeEach(() => {
  // Reset the data file before each test for isolation.
  fs.writeFileSync(TEST_DATA_FILE, JSON.stringify([]), 'utf-8');
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA_FILE)) fs.unlinkSync(TEST_DATA_FILE);
});

describe('POST /expenses', () => {
  test('creates an expense with valid data', async () => {
    const res = await addSample();
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Lunch',
      amount: 250,
      category: 'Food',
      date: '2026-07-01',
    });
    expect(res.body.id).toBeDefined();
  });

  test.each([
    ['missing title', { title: '' }],
    ['negative amount', { amount: -10 }],
    ['non-numeric amount', { amount: 'ten' }],
    ['missing category', { category: '' }],
    ['invalid date', { date: 'not-a-date' }],
  ])('rejects invalid input: %s', async (_label, overrides) => {
    const res = await addSample(overrides);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /expenses', () => {
  test('returns an empty list initially', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all added expenses', async () => {
    await addSample({ title: 'Lunch' });
    await addSample({ title: 'Movie', category: 'Entertainment', amount: 500 });

    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('filters expenses by category (case-insensitive)', async () => {
    await addSample({ title: 'Lunch', category: 'Food' });
    await addSample({ title: 'Movie', category: 'Entertainment', amount: 500 });

    const res = await request(app).get('/expenses').query({ category: 'food' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Lunch');
  });
});

describe('GET /expenses/total', () => {
  test('returns 0 total when there are no expenses', async () => {
    const res = await request(app).get('/expenses/total');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  test('returns overall total across categories', async () => {
    await addSample({ amount: 100, category: 'Food' });
    await addSample({ amount: 200, category: 'Travel' });

    const res = await request(app).get('/expenses/total');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(300);
  });

  test('returns total filtered by a single category', async () => {
    await addSample({ amount: 100, category: 'Food' });
    await addSample({ amount: 200, category: 'Travel' });
    await addSample({ amount: 50, category: 'Food' });

    const res = await request(app).get('/expenses/total').query({ category: 'Food' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ category: 'Food', total: 150 });
  });

  test('returns totals grouped by category', async () => {
    await addSample({ amount: 100, category: 'Food' });
    await addSample({ amount: 200, category: 'Travel' });
    await addSample({ amount: 50, category: 'Food' });

    const res = await request(app).get('/expenses/total').query({ groupBy: 'category' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ Food: 150, Travel: 200 });
  });
});

describe('DELETE /expenses/:id', () => {
  test('deletes an existing expense', async () => {
    const created = await addSample();
    const id = created.body.id;

    const delRes = await request(app).delete(`/expenses/${id}`);
    expect(delRes.status).toBe(204);

    const listRes = await request(app).get('/expenses');
    expect(listRes.body).toHaveLength(0);
  });

  test('returns 404 for a non-existent id', async () => {
    const res = await request(app).delete('/expenses/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
