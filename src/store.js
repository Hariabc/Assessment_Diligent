const fs = require('fs');
const path = require('path');

// Data file used for persistence. Tests point this at a temp file via env var
// so they never touch the real data during a run.
const DATA_FILE = process.env.EXPENSES_DATA_FILE || path.join(__dirname, '..', 'data', 'expenses.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function loadAll() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    // Corrupt or empty file - treat as no expenses rather than crashing the server.
    return [];
  }
}

function saveAll(expenses) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf-8');
}

function addExpense(expense) {
  const expenses = loadAll();
  expenses.push(expense);
  saveAll(expenses);
  return expense;
}

function getAll() {
  return loadAll();
}

function deleteById(id) {
  const expenses = loadAll();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return false;
  expenses.splice(index, 1);
  saveAll(expenses);
  return true;
}

module.exports = { addExpense, getAll, deleteById, DATA_FILE };
