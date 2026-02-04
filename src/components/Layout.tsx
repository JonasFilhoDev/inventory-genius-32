import { Link, useLocation } from 'react-router-dom';
import { Package, Boxes, LayoutDashboard, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Matérias-Primas', href: '/materials', icon: Boxes },
  { name: 'Produção', href: '/production', icon: Factory },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Factory className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">StockControl</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
