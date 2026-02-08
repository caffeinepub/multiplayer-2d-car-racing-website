import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Flag, User } from 'lucide-react';
import { useGetTracks, useCreatePlayer, useGetPlayerProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Track } from '../backend';

const PLAYER_ID_KEY = 'speed_racer_player_id';

export default function HomePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { data: tracks = [], isLoading: tracksLoading } = useGetTracks();
  const { mutate: createPlayer, isPending: isCreating } = useCreatePlayer();
  const { data: playerProfile } = useGetPlayerProfile(playerId || '');

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(PLAYER_ID_KEY);
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  const handleCreatePlayer = () => {
    if (!nickname.trim()) {
      toast.error('Please enter a nickname');
      return;
    }

    const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    createPlayer(
      {
        id: newPlayerId,
        nickname: nickname.trim(),
        stats: {
          racesCompleted: 0n,
          bestTime: undefined,
          averagePosition: undefined,
        },
      },
      {
        onSuccess: () => {
          localStorage.setItem(PLAYER_ID_KEY, newPlayerId);
          setPlayerId(newPlayerId);
          toast.success(`Welcome, ${nickname}!`);
        },
        onError: (error) => {
          toast.error('Failed to create player profile');
          console.error(error);
        },
      }
    );
  };

  const handleStartRace = (trackId: bigint) => {
    if (!playerId) {
      toast.error('Please create a player profile first');
      return;
    }
    navigate({ to: '/race/$trackId', params: { trackId: trackId.toString() } });
  };

  const getDifficultyColor = (difficulty: Track['difficulty']): string => {
    const difficultyStr = String(difficulty);
    switch (difficultyStr) {
      case 'easy':
        return 'bg-chart-2 text-white';
      case 'medium':
        return 'bg-chart-4 text-white';
      case 'hard':
        return 'bg-chart-1 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: Track['difficulty']): string => {
    return String(difficulty);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
          Speed Racer Championship
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Race against AI opponents, master challenging tracks, and climb the global leaderboard
        </p>
      </div>

      {/* Player Profile Section */}
      {!playerId ? (
        <Card className="max-w-md mx-auto border-2 border-chart-1/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Create Your Profile
            </CardTitle>
            <CardDescription>Enter your nickname to start racing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                placeholder="Enter your racing name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlayer()}
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleCreatePlayer}
              disabled={isCreating || !nickname.trim()}
              className="w-full"
              size="lg"
            >
              {isCreating ? 'Creating...' : 'Start Racing'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md mx-auto border-2 border-chart-2/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-4" />
              Welcome Back, {playerProfile?.nickname || 'Racer'}!
            </CardTitle>
            <CardDescription>
              {playerProfile && Number(playerProfile.stats.racesCompleted) > 0 ? (
                <span>
                  Races Completed: {Number(playerProfile.stats.racesCompleted)} | Best Time:{' '}
                  {playerProfile.stats.bestTime
                    ? `${(Number(playerProfile.stats.bestTime) / 1000).toFixed(2)}s`
                    : 'N/A'}
                </span>
              ) : (
                'Ready to race!'
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Track Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Flag className="h-7 w-7 text-chart-1" />
            Select Your Track
          </h2>
        </div>

        {tracksLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => {
              const trackImages: Record<string, string> = {
                '1': '/assets/generated/track-oval.dim_800x600.png',
                '2': '/assets/generated/track-mountain.dim_800x600.png',
                '3': '/assets/generated/track-figure8.dim_800x600.png',
              };

              return (
                <Card
                  key={track.id.toString()}
                  className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-chart-1/50"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-chart-1/10 to-chart-2/10">
                    <img
                      src={trackImages[track.id.toString()] || '/assets/generated/track-oval.dim_800x600.png'}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${getDifficultyColor(track.difficulty)}`}
                    >
                      {getDifficultyLabel(track.difficulty).toUpperCase()}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {track.name}
                      <Zap className="h-5 w-5 text-chart-4" />
                    </CardTitle>
                    <CardDescription>
                      Length: {Number(track.length)}m
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleStartRace(track.id)}
                      disabled={!playerId}
                      className="w-full"
                      size="lg"
                    >
                      Race Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3 pt-8">
        <Card className="border-chart-1/20">
          <CardHeader>
            <Trophy className="h-10 w-10 text-chart-4 mb-2" />
            <CardTitle>Global Leaderboard</CardTitle>
            <CardDescription>
              Compete with racers worldwide and climb to the top
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-chart-2/20">
          <CardHeader>
            <Flag className="h-10 w-10 text-chart-1 mb-2" />
            <CardTitle>Multiple Tracks</CardTitle>
            <CardDescription>
              Master different tracks with varying difficulty levels
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-chart-3/20">
          <CardHeader>
            <Zap className="h-10 w-10 text-chart-2 mb-2" />
            <CardTitle>Fast-Paced Action</CardTitle>
            <CardDescription>
              Experience smooth controls and exciting racing gameplay
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
