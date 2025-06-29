
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in your .env file.');
}
if (!supabaseUrl.startsWith('http')) {
    throw new Error(
      `Invalid Supabase URL format: "${supabaseUrl}". It should start with "http://" or "https://" and be a complete URL (e.g., https://<your-project-ref>.supabase.co). Please check NEXT_PUBLIC_SUPABASE_URL in your .env file.`
    );
}

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase Anon Key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

