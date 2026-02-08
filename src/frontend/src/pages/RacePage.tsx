import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Timer, Flag } from 'lucide-react';
import { useGetTrack, useSubmitRaceResult } from '../hooks/useQueries';
import { toast } from 'sonner';
import RaceGame from '../components/RaceGame';

const PLAYER_ID_KEY = 'speed_racer_player_id';

export default function RacePage() {
  const navigate = useNavigate();
  const { trackId } = useParams({ from: '/race/$trackId' });
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceTime, setRaceTime] = useState(0);
  const [finalPosition, setFinalPosition] = useState(1);
  const { data: track, isLoading } = useGetTrack(BigInt(trackId));
  const { mutate: submitResult, isPending: isSubmitting } = useSubmitRaceResult();

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!storedPlayerId) {
      toast.error('Please create a player profile first');
      navigate({ to: '/' });
      return;
    }
    setPlayerId(storedPlayerId);
  }, [navigate]);

  const handleRaceComplete = (time: number, position: number) => {
    setRaceTime(time);
    setFinalPosition(position);
    setRaceFinished(true);

    if (playerId && track) {
      submitResult(
        {
          playerId,
          trackId: track.id,
          completionTime: BigInt(Math.floor(time)),
          position: BigInt(position),
          timestamp: BigInt(Date.now() * 1000000),
        },
        {
          onSuccess: () => {
            toast.success('Race result saved!');
          },
          onError: (error) => {
            toast.error('Failed to save race result');
            console.error(error);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading track...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">Track not found</p>
            <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tracks
        </Button>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {track.name}
        </Badge>
      </div>

      {!raceStarted ? (
        <Card className="max-w-2xl mx-auto border-2 border-chart-1/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Flag className="h-6 w-6 text-chart-1" />
              Ready to Race?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Controls:</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Arrow Keys or WASD - Steer and accelerate</li>
                <li>• Up/W - Accelerate</li>
                <li>• Down/S - Brake/Reverse</li>
                <li>• Left/A - Turn Left</li>
                <li>• Right/D - Turn Right</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Objective:</h3>
              <p className="text-muted-foreground">
                Complete 3 laps as fast as possible. Beat the AI opponents to secure a better position!
              </p>
            </div>
            <Button onClick={() => setRaceStarted(true)} size="lg" className="w-full">
              Start Race
            </Button>
          </CardContent>
        </Card>
      ) : raceFinished ? (
        <Card className="max-w-2xl mx-auto border-2 border-chart-4/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="h-6 w-6 text-chart-4" />
              Race Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Time
                </p>
                <p className="text-2xl font-bold">{(raceTime / 1000).toFixed(2)}s</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Position
                </p>
                <p className="text-2xl font-bold">
                  {finalPosition === 1 ? '🥇' : finalPosition === 2 ? '🥈' : finalPosition === 3 ? '🥉' : ''}
                  {' '}{finalPosition}
                  {finalPosition === 1 ? 'st' : finalPosition === 2 ? 'nd' : finalPosition === 3 ? 'rd' : 'th'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/' })} variant="outline" className="flex-1">
                Back to Tracks
              </Button>
              <Button onClick={() => navigate({ to: '/leaderboard' })} className="flex-1">
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <RaceGame track={track} onRaceComplete={handleRaceComplete} />
      )}
    </div>
  );
}
