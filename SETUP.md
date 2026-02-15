# Setup & Configuration — Supabase Auth

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

> **Important:** `.env` is in `.gitignore` — never commit it.

### 3. Generate `config.js`
Run the config generator script:
```bash
npm run gen-config
```

This creates `config.js` with your Supabase keys (also git-ignored).

### 4. Start Local Server
```bash
python -m http.server 8000
```

Then open http://localhost:8000/signin-signup.html

## Testing Auth & Invoices

1. **Sign Up / Sign In**
   - Use email/password or OAuth buttons (Google, LinkedIn, etc.) if enabled in Supabase.
   - After successful sign-in, you'll be redirected.

2. **View Invoices**
   - Navigate to http://localhost:8000/invoices.html
   - You'll see invoices matching your Supabase user email.

## Supabase Configuration

### Enable OAuth Providers
In your Supabase project:
1. Go to **Auth** → **Providers**
2. Enable Google, LinkedIn, or other providers
3. Add redirect URIs:
   - Local: `http://localhost:8000/`
   - Production: `https://your-domain.com/`

### Ensure Invoice Query Works
The `invoices.html` page queries:
```sql
SELECT invoice_number, total_amount, is_paid, payment_due
FROM invoices
JOIN customers ON invoices.customer_id = customers.id
WHERE customers.email = current_user_email
```

Verify that:
- Your `customers` table has an `email` column.
- Your `invoices` table has a foreign key to `customers`.

## File Structure

```
.
├── .env                    (IGNORED - local secrets)
├── .env.example            (template)
├── .gitignore              (ignores .env, config.js, node_modules)
├── config.js               (IGNORED - auto-generated from .env)
├── config.example.js       (optional reference - not used by default)
├── package.json            (gen-config script)
├── scripts/
│   └── generate-config.js  (reads .env, writes config.js)
├── js/
│   └── supabase-auth.js    (client helper)
├── invoices.html           (protected page - requires auth)
├── signin-signup.html      (auth forms + OAuth buttons)
├── login.html              (alt auth page)
└── ...
```

## Security Notes

- **Never commit `.env` or `config.js`** — they contain your public Supabase key (which is public by design, but keep it out of git).
- **Public key is safe** — Supabase anon key is intentionally public; it's restricted at the RLS (Row Level Security) level in your database.
- **Protect sensitive data** — Only expose what users should see via RLS policies in Supabase.

## Troubleshooting

### "Supabase client not configured"
- Ensure `.env` exists with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Run `npm run gen-config` to generate `config.js`.
- Reload the browser page.

### "No invoices found"
- Check that your Supabase user email matches customer emails in DB.
- Verify RLS policies allow reads on `invoices` and `customers` tables.

### OAuth not working
- Confirm provider is enabled in Supabase Auth settings.
- Add `http://localhost:8000` or `http://localhost:3000` to Redirect URLs.
- Check browser console for errors.

## Deployment

1. Set `.env` values in your hosting environment (e.g., GitHub Secrets, Vercel, netlify).
2. Run `npm run gen-config` during build/deploy to generate `config.js`.
3. Deploy the static site (e.g., GitHub Pages, Vercel, Netlify).
