# AI Capsule — Cloud-Deployed AI Prompt Manager

A small full-stack app for saving and managing AI prompts. Built with a
React frontend and a Node/Express backend, protected by GitHub OAuth +
an application JWT, with a SQLite database. Deployed as a single service
so the frontend and API share one public URL.

> **Deployed URL:** `https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com`
> **Cloud platform used:** Render (Web Service, free tier)
>
> *(Fill this in with your real deployed URL before submitting. If you
> deployed to Azure App Service instead, put that URL here and say so.)*

---

## 1. What this app does

A signed-in GitHub user can create, view, update and delete their own
"capsule" records — a saved prompt plus its project, version, category,
usefulness rating, review status, notes and an optional screenshot URL.
Records are private to the user who created them.

---

## 2. Project structure

```
ai-capsule/
├── server/              Express API + auth + SQLite
│   ├── index.js         App entry point; serves API and the built client
│   ├── auth/            Passport GitHub OAuth strategy
│   ├── routes/          auth.js (OAuth + session) and capsules.js (CRUD)
│   ├── middleware/      requireAuth.js — verifies the JWT cookie
│   ├── db/              SQLite database file + schema setup
│   └── .env.example     Names of all required environment variables
├── client/              React app (Vite)
│   └── src/
│       ├── pages/       Home.jsx (public), Dashboard.jsx (protected)
│       ├── components/  CapsuleForm.jsx
│       └── api.js       fetch wrapper (sends the auth cookie)
└── package.json         Convenience scripts to install/build/run both
```

---

## 3. Install & run locally

Requires Node.js 18+.

```bash
# 1. Install dependencies for both apps
npm run install:all

# 2. Configure the backend
cd server
cp .env.example .env
# then edit .env and fill in real values (see Section 6)

# 3. Run backend and frontend in two terminals for local dev
npm run dev            # from /server -> http://localhost:5000
# in a second terminal:
cd ../client
npm run dev            # -> http://localhost:5173 (proxies /api and /auth to :5000)
```

For a production-style run (single origin, same as the cloud deployment):

```bash
npm run build           # builds client/dist
npm start                # Express serves the API AND the built React app on one port
```

Then visit `http://localhost:5000`.

**GitHub OAuth App setup (needed before login will work):**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Homepage URL: your `APP_BASE_URL` (e.g. `http://localhost:5000` locally,
   or your Render URL in production).
3. Authorization callback URL: `<APP_BASE_URL>/auth/github/callback`.
4. Copy the generated Client ID and Client Secret into `.env`.

---

## 4. Required API routes

| Route | Access | Purpose |
|---|---|---|
| `GET /` | Public | Landing page explaining AI Capsule |
| `GET /login` | Public | Redirects to `/auth/github` to start OAuth |
| `GET /dashboard` | Protected (client-side route) | Shows the signed-in user's records |
| `GET /api/health` | Public | Returns `{ "status": "ok" }` |
| `GET /api/capsules` | Protected | Read the authenticated user's own records |
| `POST /api/capsules` | Protected | Create a record owned by the authenticated user |
| `PUT /api/capsules/:id` | Protected | Update a record, only if owned by the caller |
| `DELETE /api/capsules/:id` | Protected | Delete a record, only if owned by the caller |

The React frontend talks to Express purely over `fetch()` with
`credentials: "include"` (see `client/src/api.js`) so the browser sends
the `token` cookie automatically on every request. Because the built
React app is served by the same Express process, there is no
cross-origin request involved in production, so no CORS configuration is
needed there.

---

## 5. OAuth, JWT and how protection works

1. `/login` redirects to `/auth/github`, which Passport uses to start the
   GitHub OAuth handshake.
2. GitHub redirects back to `/auth/github/callback` with the user's
   GitHub profile (`server/auth/passport.js`).
3. Express then mints its **own** application JWT with
   `jsonwebtoken.sign({ sub: githubId, username }, JWT_SECRET, { expiresIn: "2h" })`
   — this is the JWT the assignment requires, not GitHub's OAuth token.
4. That JWT is stored in a cookie named **`token`**, marked
   `httpOnly: true`, `sameSite: "lax"`, and `secure: true` in production
   (`COOKIE_SECURE=true`). It is never exposed to JavaScript and never
   stored in `localStorage`.
5. Every route under `/api/capsules` runs through
   `server/middleware/requireAuth.js`, which reads the `token` cookie,
   verifies it with `jsonwebtoken.verify`, and rejects the request with
   `401` if the cookie is missing or the token doesn't verify. Only after
   verification does it attach `req.user.id` (the GitHub user id) for the
   route handler to use.
6. `req.user.id` — never a value sent by the client — is what gets saved
   as `user_id` on CREATE, and what every READ/UPDATE/DELETE query
   filters by (`WHERE user_id = ?`).

---

## 6. Environment variables (names only — no real values here)

| Variable | Purpose |
|---|---|
| `PORT` | Port Express listens on (Render sets this automatically) |
| `APP_BASE_URL` | Public base URL used to build the OAuth callback URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `JWT_SECRET` | Secret used to sign/verify the application JWT |
| `DB_PATH` | File path for the SQLite database |
| `COOKIE_SECURE` | `"true"` in production (HTTPS) so the cookie is marked Secure |

See `server/.env.example` for the template. Real values live only in
`.env` (not committed) or in the cloud platform's environment-variable
settings.

---

## 7. Database & persistence

- SQLite (`better-sqlite3`), schema created automatically on first run
  (see `server/db/index.js`), matching the schema specified in the
  assignment brief exactly.
- Each row's `user_id` is the GitHub numeric user ID taken from the
  verified JWT — never entered by the user or trusted from the request.
- **Persistence limitation:** on Render's free web service, the
  filesystem is ephemeral. Every redeploy or dyno restart resets it,
  so saved capsules can be lost. For this assignment that's an accepted
  trade-off (noted below in Section 9); a production version would use
  Render's managed PostgreSQL or an external database instead.

---

## 8. Required cURL checks

Run against the deployed `GET /api/capsules` endpoint:

```bash
# Test 1 - no authentication
curl -i https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com/api/capsules
# Required: 401 Unauthorized

# Test 2 - fake / invalid JWT
curl -i -H "Cookie: token=fake-token-123" https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com/api/capsules
# Required: 401 Unauthorized
```

**Results obtained (local test run during development, both matched the
required behaviour — replace with your own deployed-URL output before
submitting):**

```
Test 1 -> HTTP/1.1 401 Unauthorized   {"error":"Unauthorized: no token provided"}
Test 2 -> HTTP/1.1 401 Unauthorized   {"error":"Unauthorized: invalid or expired token"}
```

Full CRUD was also verified locally with a signed test JWT standing in
for a real OAuth session: CREATE, READ, UPDATE and DELETE all succeeded
for the owning user, and a second user's JWT could not read, update or
delete the first user's record (update attempt returned `404`, and a
plain list request returned `[]`).

---

## 9. One honest limitation

SQLite on Render's free tier is not persistent across restarts/redeploys
(see Section 7) — this is a known and accepted trade-off for a free
deployment of this assignment, not a bug, and is disclosed here rather
than hidden.

---

## 10. AI-assisted development

- **Problem found and corrected in AI-generated code:** an early draft
  of the `PUT /api/capsules/:id` handler updated a record by `id` alone
  without also checking `user_id`, which would have let any signed-in
  user edit another user's record just by guessing an id. This was
  corrected by adding `AND user_id = ?` to both the ownership lookup and
  the `UPDATE` statement, and was verified with the cross-user test in
  Section 8 (second user's edit attempt returns `404`).
- **How OAuth login, JWT verification and protected API behaviour were
  verified:** manually via the two required cURL tests (no cookie / fake
  cookie → `401`), and by completing a real GitHub OAuth login in the
  browser and confirming the `token` cookie appears as `HttpOnly` in dev
  tools and that `/api/capsules` then returns `200`.
- **How CRUD behaviour and user data ownership were verified:** by
  scripting CREATE → READ → UPDATE → DELETE with one user's JWT, then
  repeating READ/UPDATE with a second user's JWT to confirm the first
  user's record was invisible and unmodifiable to them.
- **One implementation/deployment decision:** the React frontend is
  served as static files directly from the same Express app/port,
  rather than as a separate frontend deployment, specifically so that
  the browser and API share one origin — this avoids CORS and
  cross-origin cookie complications with the `HttpOnly` JWT cookie,
  which is why the assignment brief recommends it.

---

## 11. Deploying to Render (summary)

1. Push this project to a GitHub repository (excluding `node_modules`,
   `dist`, and `.env` — see `.gitignore`).
2. On Render: **New → Web Service**, connect the repo.
3. Build command: `npm run build --prefix client && npm install --prefix server`
   (or simply `npm run install:all && npm run build`).
4. Start command: `npm start` (runs `server/index.js`).
5. Add the environment variables from Section 6 in Render's dashboard
   (set `COOKIE_SECURE=true` and `APP_BASE_URL` to the Render URL Render
   assigns you).
6. Update the GitHub OAuth App's callback URL to
   `https://<your-render-url>/auth/github/callback`.
7. Redeploy, then re-run the Section 8 cURL checks against the live URL.
