import { createClient } from '@supabase/supabase-js';

// Access environment variables. 
// Note: In a real Vite/CRA app, these would be import.meta.env.VITE_SUPABASE_URL or process.env.REACT_APP_SUPABASE_URL
// For this environment, we assume process.env.API_KEY is available or placeholders are used.
// IMPORTANT: REPLACEME with your actual Supabase project credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
