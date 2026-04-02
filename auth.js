const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

console.log('--- AUTH STARTUP CHECK ---');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'EXISTS' : 'MISSING');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'EXISTS' : 'MISSING');
console.log('--------------------------');

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID || 'missing_client_id_placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing_client_secret_placeholder',
    callbackURL:  '/auth/google/callback', // Relative URL is better for Vercel!
    proxy: true // Tells Passport to trust Vercel's reverse proxy for 'https'
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
