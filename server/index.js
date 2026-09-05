require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("./auth/passport");

const authRoutes = require("./routes/auth");
const capsuleRoutes = require("./routes/capsules");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Only needed if you ever run the React dev server (Vite) separately from
// Express during local development. In production both are served from the
// same origin, so CORS is not actually required there.
app.use(
  cors({
    origin: process.env.APP_BASE_URL,
    credentials: true,
  })
);

// ---- Public API routes ----
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
// /login is a convenience alias that just kicks off the GitHub OAuth flow.
app.get("/login", (req, res) => res.redirect("/auth/github"));

// ---- Protected API routes ----
app.use("/api/capsules", capsuleRoutes);

// ---- Serve the built React frontend (production) ----
const clientBuildPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuildPath));

// Anything that isn't an /api or /auth route falls through to React so the
// client-side router can handle /, /login and /dashboard.
app.get(/^(?!\/api|\/auth).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI Capsule server listening on port ${PORT}`);
});
