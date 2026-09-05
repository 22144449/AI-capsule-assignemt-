const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

// We use passport ONLY to run the GitHub OAuth handshake.
// We do NOT use passport sessions - once we have the GitHub profile we
// mint our own application JWT and passport's job is done.
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.APP_BASE_URL}/auth/github/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      // profile.id is GitHub's stable numeric user id - this becomes our user_id.
      const user = {
        id: String(profile.id),
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      };
      return done(null, user);
    }
  )
);

// Required by passport even though we don't use sessions.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
