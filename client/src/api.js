// Thin fetch wrapper. `credentials: "include"` is what lets the browser
// send the HttpOnly "token" cookie back to Express on every request.
async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 401) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  health: () => request("/api/health"),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  listCapsules: () => request("/api/capsules"),
  createCapsule: (data) =>
    request("/api/capsules", { method: "POST", body: JSON.stringify(data) }),
  updateCapsule: (id, data) =>
    request(`/api/capsules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCapsule: (id) => request(`/api/capsules/${id}`, { method: "DELETE" }),
};
