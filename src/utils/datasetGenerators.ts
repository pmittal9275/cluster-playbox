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

export function generateSpiral(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 180;
  const noise = 8;
  
  // Two intertwined spirals
  const pointsPerSpiral = Math.floor(numPoints / 2);
  
  for (let i = 0; i < pointsPerSpiral; i++) {
    const t = (i / pointsPerSpiral) * 4 * Math.PI;
    const radius = (t / (4 * Math.PI)) * maxRadius;
    
    // First spiral
    const x1 = centerX + Math.cos(t) * radius + (Math.random() - 0.5) * noise;
    const y1 = centerY + Math.sin(t) * radius + (Math.random() - 0.5) * noise;
    points.push({ x: x1, y: y1 });
    
    // Second spiral (offset by π)
    const x2 = centerX + Math.cos(t + Math.PI) * radius + (Math.random() - 0.5) * noise;
    const y2 = centerY + Math.sin(t + Math.PI) * radius + (Math.random() - 0.5) * noise;
    points.push({ x: x2, y: y2 });
  }
  
  return points;
}

export function generateAnisotropic(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Create 3 elongated clusters with different orientations
  const clusters = [
    { cx: centerX - 150, cy: centerY - 100, angle: 0.3, scaleX: 80, scaleY: 30 },
    { cx: centerX + 150, cy: centerY - 80, angle: -0.5, scaleX: 70, scaleY: 35 },
    { cx: centerX, cy: centerY + 120, angle: 0, scaleX: 100, scaleY: 25 },
  ];
  
  clusters.forEach((cluster) => {
    const pointsPerCluster = Math.floor(numPoints / 3);
    
    for (let i = 0; i < pointsPerCluster; i++) {
      // Generate point in unit circle
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random();
      
      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius;
      
      // Scale
      x *= cluster.scaleX;
      y *= cluster.scaleY;
      
      // Rotate
      const cos = Math.cos(cluster.angle);
      const sin = Math.sin(cluster.angle);
      const rotX = x * cos - y * sin;
      const rotY = x * sin + y * cos;
      
      // Translate
      points.push({
        x: cluster.cx + rotX,
        y: cluster.cy + rotY,
      });
    }
  });
  
  return points;
}

export function generateVariedDensity(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Dense cluster
  const densePoints = Math.floor(numPoints * 0.4);
  for (let i = 0; i < densePoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 50;
    
    points.push({
      x: centerX - 150 + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  
  // Medium density cluster
  const mediumPoints = Math.floor(numPoints * 0.3);
  for (let i = 0; i < mediumPoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 70;
    
    points.push({
      x: centerX + 150 + Math.cos(angle) * radius,
      y: centerY - 50 + Math.sin(angle) * radius,
    });
  }
  
  // Sparse cluster
  const sparsePoints = numPoints - densePoints - mediumPoints;
  for (let i = 0; i < sparsePoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 100;
    
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + 150 + Math.sin(angle) * radius,
    });
  }
  
  return points;
}

export function generateNoisyCircles(
  numPoints: number,
  width: number,
  height: number
): Point[] {
  const points: Point[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Three concentric circles with varying noise
  const circles = [
    { radius: 60, noise: 10, points: Math.floor(numPoints * 0.3) },
    { radius: 120, noise: 15, points: Math.floor(numPoints * 0.35) },
    { radius: 180, noise: 20, points: Math.floor(numPoints * 0.35) },
  ];
  
  circles.forEach((circle) => {
    for (let i = 0; i < circle.points; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = circle.radius + (Math.random() - 0.5) * circle.noise * 2;
      
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }
  });
  
  return points;
}
