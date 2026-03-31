require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = {
  async findByGoogleId(googleId) {
    const { data } = await supabase.from('users').select('*').eq('google_id', googleId).maybeSingle();
    return data;
  },

  async findById(id) {
    const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    return data;
  },

  async upsertGoogleUser({ googleId, email, name, avatar }) {
    const { data: existing } = await supabase.from('users').select('*').eq('google_id', googleId).maybeSingle();
    
    if (existing) {
      const { data } = await supabase.from('users')
        .update({ name, avatar })
        .eq('google_id', googleId)
        .select()
        .single();
      return data;
    }
    
    // Insert new
    const { data } = await supabase.from('users')
      .insert({ google_id: googleId, email, name, avatar })
      .select()
      .single();
    return data;
  },

  async updateProfile(id, { username, city }) {
    if (username) {
      const { data: taken } = await supabase.from('users')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .maybeSingle();
      if (taken) throw new Error('USERNAME_TAKEN');
    }
    
    const { data } = await supabase.from('users')
      .update({ username: username || null, city: city || '' })
      .eq('id', id)
      .select()
      .single();
    return data;
  },

  async insertMessage({ name, email, service, budget, message }) {
    const { data } = await supabase.from('messages')
      .insert({ name, email, service: service || '', budget: budget || '', message })
      .select()
      .single();
    return data?.id;
  }
};
