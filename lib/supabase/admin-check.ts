import { createClient } from "./server";

export async function isUserAdmin(userId?: string) {
  const supabase = await createClient();

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return profile?.is_admin || false;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, redirectTo: '/auth/login' };
  }

  const isAdmin = await isUserAdmin(user.id);

  if (!isAdmin) {
    return { authorized: false, redirectedTo: '/dashboard' };
  }

  return { authorized: true, user };
}