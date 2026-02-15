// Supabase client helper (expects window.SUPABASE_URL and window.SUPABASE_ANON_KEY to be set)
;(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase URL / ANON KEY not found. Create a local config.js to set them (see config.example.js).');
    return;
  }

  // UMD global: supabase
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.supabaseClient = client;

  // Detect if current page is Traditional Chinese
  var isTC = window.location.pathname.indexOf('_tc') !== -1 || document.documentElement.lang === 'zh-Hant';
  var invoicesPage = isTC ? 'dashboard-invoices_tc.html' : 'dashboard-invoices.html';

  // Handle OAuth callback - check for access token in URL hash
  if (window.location.hash.includes('access_token')) {
    console.log('OAuth callback detected, waiting for session...');
    setTimeout(async function() {
      const { data: { session } } = await client.auth.getSession();
      if (session && session.user) {
        console.log('Session established, redirecting to dashboard:', session.user.email);
        window.location.href = invoicesPage;
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
        alert(isTC ? '請查看您的電子郵件以獲取確認連結。' : 'Check your email for a confirmation link.');
      } catch (err) {
        alert((isTC ? '註冊錯誤：' : 'Sign up error: ') + (err.message || err));
      }
    },
    signInWithEmail: async function(email, password) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email: email, password: password });
        if (error) throw error;
        window.location.href = invoicesPage;
      } catch (err) {
        alert((isTC ? '登入錯誤：' : 'Sign in error: ') + (err.message || err));
      }
    },
    signOut: async function(){
      await client.auth.signOut();
      window.location.href = isTC ? 'index_tc.html' : 'index.html';
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

  // --- Auth-aware navigation updates ---
  client.auth.getUser().then(function(result) {
    var user = result.data.user;
    if (!user) return;

    var displayName = user.user_metadata && user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (user.email ? user.email.split('@')[0] : 'User');
    var logoutText = isTC ? '登出' : 'Sign out';
    var invoicesText = isTC ? '帳單' : 'Invoices';

    // 1. Swap Login links to Invoices in the navbar
    document.querySelectorAll('.navbar-nav a').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href === 'login.html' || href === 'login_tc.html') {
        link.textContent = invoicesText;
        link.setAttribute('href', invoicesPage);
      }
    });

    // 2. Add user name + logout to right side of navbar (next to WhatsApp)
    var navRight = document.querySelector('.order-lg-3');
    if (navRight && !document.getElementById('auth-user-info')) {
      var el = document.createElement('div');
      el.id = 'auth-user-info';
      el.className = 'd-flex align-items-center ms-2';
      el.innerHTML =
        '<a class="btn btn-sm btn-translucent-primary ms-2" href="' + invoicesPage + '" style="white-space:nowrap">' +
          '<i class="ai-user me-1"></i>' + displayName +
        '</a>' +
        '<a class="btn btn-sm btn-translucent-primary ms-1" href="#" onclick="window.supabaseAuth.signOut(); return false;" title="' + logoutText + '" style="white-space:nowrap">' +
          '<i class="ai-log-out"></i><span class="d-none d-xl-inline ms-1">' + logoutText + '</span>' +
        '</a>';
      navRight.appendChild(el);
    }

    // 3. Update any existing user-name-header element (dashboard pages)
    var headerName = document.getElementById('user-name-header');
    if (headerName) headerName.textContent = displayName.split(' ')[0];

    // 4. If on login page and already logged in, redirect to invoices
    var path = window.location.pathname;
    if (path.indexOf('login') !== -1 && path.indexOf('login') === path.lastIndexOf('login')) {
      window.location.href = invoicesPage;
    }
  });

})();
