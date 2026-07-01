export const SUPABASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const getHeaders = () => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, 
  "Prefer": "return=representation"
});
