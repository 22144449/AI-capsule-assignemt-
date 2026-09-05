import React, { useEffect, useState } from "react";

const EMPTY = {
  project_name: "",
  prompt_title: "",
  prompt_version: "",
  prompt_text: "",
  response_summary: "",
  category: "",
  usefulness: "",
  reviewed: false,
  improved: false,
  screenshot_url: "",
  notes: "",
};

// Used for both CREATE (editing=null) and UPDATE (editing=the record).
export default function CapsuleForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(editing ? { ...EMPTY, ...editing } : EMPTY);
  }, [editing]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form className="capsule-form" onSubmit={handleSubmit}>
      <h3>{editing ? "Edit prompt record" : "New prompt record"}</h3>

      <label>
        Project name*
        <input
          required
          value={form.project_name}
          onChange={(e) => update("project_name", e.target.value)}
        />
      </label>

      <label>
        Prompt title*
        <input
          required
          value={form.prompt_title}
          onChange={(e) => update("prompt_title", e.target.value)}
        />
      </label>

      <label>
        Version
        <input
          placeholder="v1"
          value={form.prompt_version}
          onChange={(e) => update("prompt_version", e.target.value)}
        />
      </label>

      <label>
        Prompt text*
        <textarea
          required
          rows={3}
          value={form.prompt_text}
          onChange={(e) => update("prompt_text", e.target.value)}
        />
      </label>

      <label>
        Response summary
        <textarea
          rows={2}
          value={form.response_summary}
          onChange={(e) => update("response_summary", e.target.value)}
        />
      </label>

      <label>
        Category
        <input
          placeholder="Coding / Writing / Research"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />
      </label>

      <label>
        Usefulness
        <input
          placeholder="Good / Needs Improvement"
          value={form.usefulness}
          onChange={(e) => update("usefulness", e.target.value)}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={!!form.reviewed}
          onChange={(e) => update("reviewed", e.target.checked)}
        />
        Reviewed
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={!!form.improved}
          onChange={(e) => update("improved", e.target.checked)}
        />
        Improved
      </label>

      <label>
        Screenshot URL
        <input
          placeholder="https://..."
          value={form.screenshot_url}
          onChange={(e) => update("screenshot_url", e.target.value)}
        />
      </label>

      <label>
        Notes
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn">
          {editing ? "Save changes" : "Add record"}
        </button>
        {editing && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
