// Supabase client helper (expects window.SUPABASE_URL and window.SUPABASE_ANON_KEY to be set)
;(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase URL / ANON KEY not found. Create a local config.js to set them (see config.example.js).');
    return;
  }

  // UMD global: supabase
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.supabaseClient = client;

  // Expose helper functions
  window.supabaseAuth = {
    signInWithProvider: async function(provider) {
      try {
        await client.auth.signInWithOAuth({ provider: provider });
      } catch (err) {
        alert('Auth error: ' + (err.message || err));
      }
    },
    signUpWithEmail: async function(email, password, fullName) {
      try {
        const { data, error } = await client.auth.signUp({ email: email, password: password }, { data: { full_name: fullName } });
        if (error) throw error;
        alert('Check your email for a confirmation link.');
      } catch (err) {
        alert('Sign up error: ' + (err.message || err));
      }
    },
    signInWithEmail: async function(email, password) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email: email, password: password });
        if (error) throw error;
        // on success, reload to let protected pages fetch session
        location.reload();
      } catch (err) {
        alert('Sign in error: ' + (err.message || err));
      }
    },
    signOut: async function(){
      await client.auth.signOut();
      location.reload();
    },
    getUser: async function(){
      const { data } = await client.auth.getUser();
      return data.user;
    }
  };

})();
