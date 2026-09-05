const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Every route below requires a valid JWT. req.user.id comes from the
// verified token - it is never trusted from the request body/query.
router.use(requireAuth);

// GET /api/capsules - read only the authenticated user's own records
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM capsules WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

// POST /api/capsules - create a record owned by the authenticated user
router.post("/", (req, res) => {
  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes,
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res
      .status(400)
      .json({ error: "project_name, prompt_title and prompt_text are required" });
  }

  const stmt = db.prepare(`
    INSERT INTO capsules
      (user_id, project_name, prompt_title, prompt_version, prompt_text,
       response_summary, category, usefulness, reviewed, improved,
       screenshot_url, notes)
    VALUES (@user_id, @project_name, @prompt_title, @prompt_version, @prompt_text,
            @response_summary, @category, @usefulness, @reviewed, @improved,
            @screenshot_url, @notes)
  `);

  const info = stmt.run({
    user_id: req.user.id, // owner comes from the verified JWT, not the client
    project_name,
    prompt_title,
    prompt_version: prompt_version || null,
    prompt_text,
    response_summary: response_summary || null,
    category: category || null,
    usefulness: usefulness || null,
    reviewed: reviewed ? 1 : 0,
    improved: improved ? 1 : 0,
    screenshot_url: screenshot_url || null,
    notes: notes || null,
  });

  const created = db.prepare("SELECT * FROM capsules WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/capsules/:id - update a record, only if owned by the authenticated user
router.put("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM capsules WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    // Either it doesn't exist, or it belongs to someone else - same response
    // either way, so we don't leak which records exist.
    return res.status(404).json({ error: "Record not found" });
  }

  const merged = { ...existing, ...req.body, user_id: existing.user_id, id: existing.id };

  db.prepare(`
    UPDATE capsules SET
      project_name = @project_name,
      prompt_title = @prompt_title,
      prompt_version = @prompt_version,
      prompt_text = @prompt_text,
      response_summary = @response_summary,
      category = @category,
      usefulness = @usefulness,
      reviewed = @reviewed,
      improved = @improved,
      screenshot_url = @screenshot_url,
      notes = @notes
    WHERE id = @id AND user_id = @user_id
  `).run({
    ...merged,
    reviewed: merged.reviewed ? 1 : 0,
    improved: merged.improved ? 1 : 0,
  });

  const updated = db.prepare("SELECT * FROM capsules WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/capsules/:id - delete a record, only if owned by the authenticated user
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM capsules WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Record not found" });
  }

  res.json({ ok: true, deleted_id: Number(req.params.id) });
});

module.exports = router;
