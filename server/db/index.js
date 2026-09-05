const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || path.join(__dirname, "capsule.db");

// Make sure the folder for the db file exists (matters on some hosts)
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);

// Required schema from the assignment brief.
db.exec(`
  CREATE TABLE IF NOT EXISTS capsules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    prompt_title TEXT NOT NULL,
    prompt_version TEXT,
    prompt_text TEXT NOT NULL,
    response_summary TEXT,
    category TEXT,
    usefulness TEXT,
    reviewed INTEGER DEFAULT 0,
    improved INTEGER DEFAULT 0,
    screenshot_url TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
