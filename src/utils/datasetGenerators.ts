import { Point } from './clustering';

export function generateRandomClusters(
  numPoints: number,
  numClusters: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const padding = 100;
  
  for (let i = 0; i < numClusters; i++) {
    const centerX = padding + Math.random() * (width - 2 * padding);
    const centerY = padding + Math.random() * (height - 2 * padding);
    const spread = 30 + Math.random() * 40;
    const pointsPerCluster = Math.floor(numPoints / numClusters);
    
    for (let j = 0; j < pointsPerCluster; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * spread;
      
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }
  }
  
  return points;
}

export function generateCircles(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Inner circle
  const innerRadius = 80;
  const innerPoints = Math.floor(numPoints * 0.4);
  for (let i = 0; i < innerPoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * innerRadius;
    
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  
  // Outer circle
  const outerRadius = 180;
  const outerPoints = numPoints - innerPoints;
  for (let i = 0; i < outerPoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = outerRadius + (Math.random() - 0.5) * 30;
    
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  
  return points;
}

export function generateMoons(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 100;
  const noise = 15;
  
  // Upper moon
  const upperPoints = Math.floor(numPoints / 2);
  for (let i = 0; i < upperPoints; i++) {
    const angle = Math.PI * (i / upperPoints);
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * noise;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * noise;
    
    points.push({ x, y });
  }
  
  // Lower moon
  const lowerPoints = numPoints - upperPoints;
  for (let i = 0; i < lowerPoints; i++) {
    const angle = Math.PI + Math.PI * (i / lowerPoints);
    const x = centerX + Math.cos(angle) * radius + radius / 2 + (Math.random() - 0.5) * noise;
    const y = centerY + Math.sin(angle) * radius - radius / 2 + (Math.random() - 0.5) * noise;
    
    points.push({ x, y });
  }
  
  return points;
}

export function generateBlobs(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const padding = 80;
  
  // Create 4 distinct blobs
  const positions = [
    { x: padding + 100, y: padding + 80 },
    { x: width - padding - 100, y: padding + 80 },
    { x: padding + 100, y: height - padding - 80 },
    { x: width - padding - 100, y: height - padding - 80 },
  ];
  
  positions.forEach((pos, idx) => {
    const pointsPerBlob = Math.floor(numPoints / 4);
    const spread = 50;
    
    for (let i = 0; i < pointsPerBlob; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * spread;
      
      points.push({
        x: pos.x + Math.cos(angle) * radius,
        y: pos.y + Math.sin(angle) * radius,
      });
    }
  });
  
  return points;
}
