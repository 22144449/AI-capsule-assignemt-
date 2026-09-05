const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Step 1: /login (and /auth/github) redirect the browser to GitHub.
router.get("/github", passport.authenticate("github", { session: false, scope: ["read:user"] }));

// Step 2: GitHub redirects back here with a code; passport exchanges it and
// gives us the GitHub profile in req.user. We then mint OUR OWN application
// JWT (this is the JWT the assignment requires - not GitHub's token) and
// store it in a Secure, HttpOnly cookie named "token".
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const payload = { sub: req.user.id, username: req.user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.redirect("/dashboard");
  }
);

// Lets the frontend ask "who am I" using only the cookie.
router.get("/me", requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

module.exports = router;
