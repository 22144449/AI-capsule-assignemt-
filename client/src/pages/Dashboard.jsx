import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import CapsuleForm from "../components/CapsuleForm.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        setUser(me);
        await loadCapsules();
      } catch (err) {
        // Not logged in (or expired) -> bounce to the public login page.
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadCapsules() {
    const rows = await api.listCapsules();
    setCapsules(rows);
  }

  async function handleSave(data) {
    setError("");
    try {
      if (editing) {
        await api.updateCapsule(editing.id, data);
      } else {
        await api.createCapsule(data);
      }
      setEditing(null);
      await loadCapsules();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.deleteCapsule(id);
      await loadCapsules();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    await api.logout();
    window.location.href = "/";
  }

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>My Capsules</h1>
        <div>
          <span className="user-chip">Signed in as {user.username}</span>
          <button className="btn secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <CapsuleForm
        editing={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />

      <h2>Saved records ({capsules.length})</h2>
      <div className="capsule-list">
        {capsules.map((c) => (
          <div className="capsule-card" key={c.id}>
            <div className="capsule-card-header">
              <strong>{c.prompt_title}</strong>
              <span>{c.prompt_version}</span>
            </div>
            <p className="muted">
              {c.project_name} &middot; {c.category || "Uncategorised"}
            </p>
            <p>{c.prompt_text}</p>
            {c.response_summary && <p className="muted">Response: {c.response_summary}</p>}
            <p className="muted">
              Usefulness: {c.usefulness || "-"} | Reviewed: {c.reviewed ? "Yes" : "No"} |
              Improved: {c.improved ? "Yes" : "No"}
            </p>
            {c.notes && <p className="muted">Notes: {c.notes}</p>}
            <div className="form-actions">
              <button className="btn secondary" onClick={() => setEditing(c)}>
                Edit
              </button>
              <button className="btn danger" onClick={() => handleDelete(c.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {capsules.length === 0 && <p className="muted">No records yet - add your first one above.</p>}
      </div>
    </div>
  );
}
