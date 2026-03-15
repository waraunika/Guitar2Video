import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin-check";

export default async function AdminLayout({
    children
} : {
    children: React.ReactNode 
}) {
  const { authorized, redirectTo } = await requireAdmin();

  if (!authorized && redirectTo ) {
    redirect(redirectTo);
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}