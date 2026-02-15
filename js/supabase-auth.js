// Supabase client helper (expects window.SUPABASE_URL and window.SUPABASE_ANON_KEY to be set)
;(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase URL / ANON KEY not found. Create a local config.js to set them (see config.example.js).');
    return;
  }

  // UMD global: supabase
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.supabaseClient = client;

  // Handle OAuth callback (URL will have #access_token=... after redirect)
  client.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in:', session.user.email);
      // Redirect to dashboard-invoices page
      if (window.location.pathname !== '/dashboard-invoices.html') {
        console.log('Redirecting to dashboard-invoices');
        window.location.href = 'dashboard-invoices.html';
      }
    }
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
