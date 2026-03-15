import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // fetch some stats for the admin
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: tabCount } = await supabase
    .from('tabs')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              No of Users 
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {userCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              No of Tabs
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {tabCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Admin Tools
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              <li>Manage Users</li>
              <li>System Settings</li>
              <li>View Logs</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}