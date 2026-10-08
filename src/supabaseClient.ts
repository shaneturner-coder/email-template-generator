import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Publishable (anon) key only — never the secret/service_role key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Non-null when required environment variables are missing; the app shows an error screen instead of crashing. */
export const envError: string | null =
  !supabaseUrl || !supabasePublishableKey
    ? 'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env (see .env.example), then restart the dev server.'
    : null

export const supabase: SupabaseClient | null = envError
  ? null
  : createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
