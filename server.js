require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('./auth');
const db = require('./db');
const path = require('path');

const app = express();

// Session setup using cookie-session instead of sqlite store.
// This allows the app to run completely statelessly on Vercel Serverless!
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'fallback_secret_change_me'],
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// --- Auth Routes ---

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/profile.html');
  }
);

app.get('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// --- API Routes ---

app.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { username, city } = req.body;
  
  try {
    const updatedUser = await db.updateProfile(req.user.id, { username, city });
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    if (err.message === 'USERNAME_TAKEN') {
      res.status(400).json({ error: 'Username is already taken.' });
    } else {
      console.error('Profile update error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, service, budget, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  
  try {
    await db.insertMessage({ name, email, service, budget, message });
    res.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// --- Static File Serving ---
app.use(express.static(__dirname));

// Export for Vercel serverless integration
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
