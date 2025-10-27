import { useEffect, useRef } from 'react';
import { Point } from '@/utils/clustering';

interface ClusterCanvasProps {
  points: Point[];
  width: number;
  height: number;
}

const CLUSTER_COLORS = [
  'hsl(243, 75%, 59%)',   // Primary blue
  'hsl(188, 94%, 55%)',   // Cyan
  'hsl(280, 75%, 65%)',   // Purple
  'hsl(45, 100%, 60%)',   // Gold
  'hsl(150, 70%, 50%)',   // Green
  'hsl(15, 90%, 60%)',    // Orange
  'hsl(320, 85%, 60%)',   // Pink
  'hsl(200, 80%, 55%)',   // Sky blue
];

const NOISE_COLOR = 'hsl(240, 4%, 46%)'; // Muted for noise points

export const ClusterCanvas = ({ points, width, height }: ClusterCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw points
    points.forEach(point => {
      const color = point.cluster === -1 || point.cluster === undefined
        ? NOISE_COLOR
        : CLUSTER_COLORS[point.cluster % CLUSTER_COLORS.length];

      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Add subtle glow effect
      if (point.cluster !== -1 && point.cluster !== undefined) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = color.replace(')', ', 0.2)').replace('hsl', 'hsla');
        ctx.fill();
      }
    });
  }, [points, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)]"
    />
  );
};
