import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Trophy, Flag } from 'lucide-react';
import type { Track } from '../backend';

interface RaceGameProps {
  track: Track;
  onRaceComplete: (time: number, position: number) => void;
}

interface Car {
  x: number;
  y: number;
  angle: number;
  speed: number;
  lap: number;
  checkpoints: boolean[];
}

interface AIOpponent extends Car {
  color: string;
  name: string;
}

export default function RaceGame({ track, onRaceComplete }: RaceGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLap, setCurrentLap] = useState(1);
  const [raceTime, setRaceTime] = useState(0);
  const [position, setPosition] = useState(1);
  const gameStateRef = useRef({
    player: {
      x: 400,
      y: 500,
      angle: -Math.PI / 2,
      speed: 0,
      lap: 0,
      checkpoints: [false, false, false, false],
    } as Car,
    opponents: [] as AIOpponent[],
    keys: {} as Record<string, boolean>,
    startTime: Date.now(),
    lastUpdate: Date.now(),
    raceComplete: false,
    trackPath: [] as { x: number; y: number }[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize track path based on track ID
    const trackPaths: Record<string, { x: number; y: number }[]> = {
      '1': [ // Oval
        { x: 400, y: 500 },
        { x: 400, y: 200 },
        { x: 600, y: 100 },
        { x: 700, y: 200 },
        { x: 700, y: 500 },
        { x: 600, y: 600 },
      ],
      '2': [ // Mountain
        { x: 400, y: 500 },
        { x: 300, y: 300 },
        { x: 500, y: 150 },
        { x: 700, y: 200 },
        { x: 750, y: 400 },
        { x: 600, y: 550 },
      ],
      '3': [ // Figure 8
        { x: 400, y: 500 },
        { x: 300, y: 350 },
        { x: 400, y: 200 },
        { x: 600, y: 200 },
        { x: 700, y: 350 },
        { x: 600, y: 500 },
      ],
    };

    gameStateRef.current.trackPath = trackPaths[track.id.toString()] || trackPaths['1'];

    // Initialize AI opponents
    gameStateRef.current.opponents = [
      { x: 380, y: 520, angle: -Math.PI / 2, speed: 0, lap: 0, checkpoints: [false, false, false, false], color: 'oklch(0.646 0.222 41.116)', name: 'Racer 1' },
      { x: 420, y: 520, angle: -Math.PI / 2, speed: 0, lap: 0, checkpoints: [false, false, false, false], color: 'oklch(0.6 0.118 184.704)', name: 'Racer 2' },
      { x: 360, y: 540, angle: -Math.PI / 2, speed: 0, lap: 0, checkpoints: [false, false, false, false], color: 'oklch(0.828 0.189 84.429)', name: 'Racer 3' },
    ];

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    let animationId: number;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - gameStateRef.current.lastUpdate) / 1000;
      gameStateRef.current.lastUpdate = now;

      if (!gameStateRef.current.raceComplete) {
        updateGame(deltaTime);
        renderGame(ctx);
        setRaceTime(now - gameStateRef.current.startTime);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    const updateGame = (deltaTime: number) => {
      const { player, keys, opponents, trackPath } = gameStateRef.current;

      // Player controls
      const acceleration = 300;
      const maxSpeed = 250;
      const turnSpeed = 3;
      const friction = 0.95;

      if (keys['arrowup'] || keys['w']) {
        player.speed = Math.min(player.speed + acceleration * deltaTime, maxSpeed);
      }
      if (keys['arrowdown'] || keys['s']) {
        player.speed = Math.max(player.speed - acceleration * deltaTime, -maxSpeed / 2);
      }
      if (keys['arrowleft'] || keys['a']) {
        player.angle -= turnSpeed * deltaTime * (player.speed / maxSpeed);
      }
      if (keys['arrowright'] || keys['d']) {
        player.angle += turnSpeed * deltaTime * (player.speed / maxSpeed);
      }

      player.speed *= friction;
      player.x += Math.cos(player.angle) * player.speed * deltaTime;
      player.y += Math.sin(player.angle) * player.speed * deltaTime;

      // Keep player in bounds
      player.x = Math.max(50, Math.min(750, player.x));
      player.y = Math.max(50, Math.min(550, player.y));

      // Update AI opponents
      opponents.forEach((opponent) => {
        const targetIndex = (opponent.lap * trackPath.length + Math.floor(trackPath.length * 0.5)) % trackPath.length;
        const target = trackPath[targetIndex];
        
        const dx = target.x - opponent.x;
        const dy = target.y - opponent.y;
        const targetAngle = Math.atan2(dy, dx);
        
        opponent.angle = targetAngle;
        opponent.speed = 180 + Math.random() * 40;
        opponent.x += Math.cos(opponent.angle) * opponent.speed * deltaTime;
        opponent.y += Math.sin(opponent.angle) * opponent.speed * deltaTime;

        updateCheckpoints(opponent, trackPath);
      });

      // Update player checkpoints
      updateCheckpoints(player, trackPath);

      // Calculate positions
      const allCars = [player, ...opponents];
      const sortedCars = allCars.sort((a, b) => {
        if (a.lap !== b.lap) return b.lap - a.lap;
        const aCheckpoints = a.checkpoints.filter(Boolean).length;
        const bCheckpoints = b.checkpoints.filter(Boolean).length;
        return bCheckpoints - aCheckpoints;
      });

      const playerPosition = sortedCars.indexOf(player) + 1;
      setPosition(playerPosition);

      // Check race completion
      if (player.lap >= 3 && !gameStateRef.current.raceComplete) {
        gameStateRef.current.raceComplete = true;
        const finalTime = Date.now() - gameStateRef.current.startTime;
        setTimeout(() => onRaceComplete(finalTime, playerPosition), 100);
      }
    };

    const updateCheckpoints = (car: Car, trackPath: { x: number; y: number }[]) => {
      const checkpointDistance = 80;
      
      trackPath.forEach((point, index) => {
        const dx = car.x - point.x;
        const dy = car.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < checkpointDistance && !car.checkpoints[index]) {
          car.checkpoints[index] = true;
        }
      });

      // Check if all checkpoints passed
      if (car.checkpoints.every(Boolean)) {
        car.lap++;
        car.checkpoints = [false, false, false, false];
        if (car === gameStateRef.current.player) {
          setCurrentLap(car.lap + 1);
        }
      }
    };

    const renderGame = (ctx: CanvasRenderingContext2D) => {
      const { player, opponents, trackPath } = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = 'oklch(0.205 0 0)';
      ctx.fillRect(0, 0, 800, 600);

      // Draw track
      ctx.strokeStyle = 'oklch(0.556 0 0)';
      ctx.lineWidth = 100;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      trackPath.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // Draw track center line
      ctx.strokeStyle = 'oklch(0.922 0 0)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      trackPath.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw start/finish line
      const startPoint = trackPath[0];
      ctx.strokeStyle = 'oklch(0.985 0 0)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(startPoint.x - 30, startPoint.y);
      ctx.lineTo(startPoint.x + 30, startPoint.y);
      ctx.stroke();

      // Draw AI opponents
      opponents.forEach((opponent) => {
        drawCar(ctx, opponent.x, opponent.y, opponent.angle, opponent.color);
      });

      // Draw player car
      drawCar(ctx, player.x, player.y, player.angle, 'oklch(0.704 0.191 22.216)');
    };

    const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Car body
      ctx.fillStyle = color;
      ctx.fillRect(-15, -8, 30, 16);
      
      // Car windows
      ctx.fillStyle = 'oklch(0.398 0.07 227.392)';
      ctx.fillRect(-8, -6, 12, 12);
      
      ctx.restore();
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [track, onRaceComplete]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-lg px-4 py-2 gap-2">
            <Flag className="h-4 w-4" />
            Lap {currentLap}/3
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2 gap-2">
            <Timer className="h-4 w-4" />
            {(raceTime / 1000).toFixed(2)}s
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2 gap-2">
            <Trophy className="h-4 w-4" />
            Position: {position}/4
          </Badge>
        </div>
        <div className="relative rounded-lg overflow-hidden border-2 border-chart-1/20">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-auto bg-background"
            tabIndex={0}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Use Arrow Keys or WASD to control your car
        </p>
      </CardContent>
    </Card>
  );
}
