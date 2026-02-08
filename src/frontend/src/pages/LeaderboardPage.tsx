import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Timer, Flag } from 'lucide-react';
import { useGetLeaderboard } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  const { data: leaderboard = [], isLoading } = useGetLeaderboard();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-chart-4" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-chart-1" />;
      default:
        return <span className="text-muted-foreground font-semibold">{position}</span>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-chart-4" />
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground">Top racers from around the world</p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Top 100 Racers</CardTitle>
          <CardDescription>Ranked by best time and average position</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No racers yet. Be the first to set a record!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-accent/50 ${
                    index < 3 ? 'border-chart-4/30 bg-chart-4/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {getPositionIcon(index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{player.nickname}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flag className="h-3.5 w-3.5" />
                        {Number(player.stats.racesCompleted)} races
                      </span>
                      {player.stats.bestTime && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5" />
                          {(Number(player.stats.bestTime) / 1000).toFixed(2)}s
                        </span>
                      )}
                      {player.stats.averagePosition && (
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          Avg: {player.stats.averagePosition.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {index < 3 && (
                    <Badge variant="outline" className="hidden sm:flex">
                      {index === 0 ? '🥇 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third Place'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
