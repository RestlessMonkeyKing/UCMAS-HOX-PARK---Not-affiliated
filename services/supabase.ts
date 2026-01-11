import { createClient } from '@supabase/supabase-js';

// --- REPLACE THESE WITH YOUR SUPABASE DETAILS ---
const SUPABASE_URL = 'https://jolsgntmxdyrayhpquqp.supabase.co';
// Fixed: Removed the leading "I" that was causing the invalid key error
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbHNnbnRteGR5cmF5aHBxdXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTczOTMsImV4cCI6MjA4MzY3MzM5M30.xcLfQdZPVBZQYg5VVFjosRCwzEY0edEW64bhwRWHho';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
