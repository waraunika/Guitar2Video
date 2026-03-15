import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  console.log(profiles);

  // fetch auth users using admin API
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error feteching authh users: ', error);
  }

  const authUsersMap = new Map(
    authUsers?.users.map(user => [user.id, user]) || []
  );

  // combine profiles with auth data
  const combinedUsers = profiles?.map(profile => {
    const authUser = authUsersMap.get(profile.id);
    return {
      ...profile,
      email: authUser?.email || profile.email, // Fallback to profile if exists
      metadata: authUser?.user_metadata || {},
    };
  }) || [];
  console.log(combinedUsers);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        User Management
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>
            All Users
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {combinedUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.email || 'N/A'}
                  </TableCell>

                  <TableCell>
                    {user.metadata.display_name || 'N/A'}
                  </TableCell>
                  
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-yellow-500">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* for actions like toggle admin, delete user .... */}
                  <TableCell>
                    <button className="text-blue-500 hohver:underline">
                      Edit
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}