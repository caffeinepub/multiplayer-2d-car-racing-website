import { useNavigate } from '@tanstack/react-router';
import { Trophy, Home, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-6 w-6 text-chart-1" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Speed Racer
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/leaderboard' })}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
        </nav>
      </div>
    </header>
  );
}
