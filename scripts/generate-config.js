#!/usr/bin/env node
// Generate config.js from .env (local only). Do not commit generated config.js.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const out = path.resolve(process.cwd(), 'config.js');
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const content = `// Auto-generated from .env - DO NOT COMMIT\nwindow.SUPABASE_URL = '${supabaseUrl}';\nwindow.SUPABASE_ANON_KEY = '${supabaseKey}';\n`;

fs.writeFileSync(out, content, { encoding: 'utf8' });
console.log('Wrote', out);
