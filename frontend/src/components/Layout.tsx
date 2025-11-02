import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Bell, User, PenSquare, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: userInfo ? `/user/${userInfo.username}` : '/profile' },
    { icon: PenSquare, label: 'Post', path: '/post/new' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-20 border-r border-border bg-card lg:w-64">
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center justify-center lg:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="ml-3 hidden text-xl font-bold lg:block">Microblog</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-center lg:justify-start"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="ml-3 hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive lg:justify-start"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 hidden lg:inline">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 flex-1 lg:ml-64">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
