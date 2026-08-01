const express = require('express');
const { randomUUID } = require('crypto');
const store = require('./store');

const VALID_CATEGORIES = null; // categories are free-text; set an array here to restrict them

function createApp() {
  const app = express();
  app.use(express.json());

  // --- Add an expense ---
  app.post('/expenses', (req, res) => {
    const { title, amount, category, date } = req.body;

    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' });
    }
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount is required and must be a positive number' });
    }
    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'category is required and must be a non-empty string' });
    }
    if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'date is required and must be a valid date string (e.g. YYYY-MM-DD)' });
    }

    const expense = {
      id: randomUUID(),
      title: title.trim(),
      amount,
      category: category.trim(),
      date,
    };

    store.addExpense(expense);
    return res.status(201).json(expense);
  });

  // --- View all expenses, optionally filtered by category ---
  app.get('/expenses', (req, res) => {
    const { category } = req.query;
    let expenses = store.getAll();

    if (category) {
      expenses = expenses.filter(
        (e) => e.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    return res.json(expenses);
  });

  // --- Totals: overall, or by category via ?category=, or grouped via ?groupBy=category ---
  app.get('/expenses/total', (req, res) => {
    const { category, groupBy } = req.query;
    const expenses = store.getAll();

    if (groupBy === 'category') {
      const totals = {};
      for (const e of expenses) {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      }
      return res.json(totals);
    }

    if (category) {
      const total = expenses
        .filter((e) => e.category.toLowerCase() === String(category).toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
      return res.json({ category, total });
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return res.json({ total });
  });

  // --- Delete an expense ---
  app.delete('/expenses/:id', (req, res) => {
    const deleted = store.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: `expense with id ${req.params.id} not found` });
    }
    return res.status(204).send();
  });

  return app;
}

module.exports = createApp;
