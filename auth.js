const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BASE_URL}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await db.upsertGoogleUser({
        googleId: profile.id,
        email:    profile.emails?.[0]?.value || '',
        name:     profile.displayName || '',
        avatar:   profile.photos?.[0]?.value || '',
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
