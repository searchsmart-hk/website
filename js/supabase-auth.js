// Supabase client helper (expects window.SUPABASE_URL and window.SUPABASE_ANON_KEY to be set)
;(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase URL / ANON KEY not found. Create a local config.js to set them (see config.example.js).');
    return;
  }

  // UMD global: supabase
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.supabaseClient = client;

  // Handle OAuth callback - check for access token in URL hash
  if (window.location.hash.includes('access_token')) {
    console.log('OAuth callback detected, waiting for session...');
    // Wait a moment for Supabase to process the token
    setTimeout(async function() {
      const { data: { session } } = await client.auth.getSession();
      if (session && session.user) {
        console.log('Session established, redirecting to dashboard-invoices:', session.user.email);
        window.location.href = 'dashboard-invoices.html';
      }
    }, 1000);
  }

  // Also listen for auth state changes throughout the session
  client.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
  });

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
        // on success, redirect to invoices page
        window.location.href = 'invoices.html';
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
    },
    getCurrentSession: async function(){
      const { data } = await client.auth.getSession();
      return data.session;
    }
  };

})();
