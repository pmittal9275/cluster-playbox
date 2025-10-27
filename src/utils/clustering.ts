export interface Point {
  x: number;
  y: number;
  cluster?: number;
}

// K-Means Clustering
export function kMeans(points: Point[], k: number, maxIterations: number = 100): Point[] {
  if (points.length === 0 || k <= 0) return points;
  
  const result = points.map(p => ({ ...p }));
  
  // Initialize centroids randomly
  const centroids: Point[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < k; i++) {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * result.length);
    } while (usedIndices.has(idx) && usedIndices.size < result.length);
    usedIndices.add(idx);
    centroids.push({ x: result[idx].x, y: result[idx].y });
  }
  
  // Iterate
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    result.forEach(point => {
      let minDist = Infinity;
      let closestCluster = 0;
      
      centroids.forEach((centroid, idx) => {
        const dist = distance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = idx;
        }
      });
      
      point.cluster = closestCluster;
    });
    
    // Update centroids
    const newCentroids: Point[] = [];
    for (let i = 0; i < k; i++) {
      const clusterPoints = result.filter(p => p.cluster === i);
      if (clusterPoints.length > 0) {
        const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
        const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
        newCentroids.push({ x: avgX, y: avgY });
      } else {
        newCentroids.push({ ...centroids[i] });
      }
    }
    
    // Check convergence
    const converged = centroids.every((c, i) => 
      Math.abs(c.x - newCentroids[i].x) < 0.001 && 
      Math.abs(c.y - newCentroids[i].y) < 0.001
    );
    
    centroids.splice(0, centroids.length, ...newCentroids);
    
    if (converged) break;
  }
  
  return result;
}

// DBSCAN Clustering
export function dbscan(points: Point[], epsilon: number, minPts: number): Point[] {
  const result = points.map(p => ({ ...p, cluster: -1 }));
  let clusterIdx = 0;
  
  for (let i = 0; i < result.length; i++) {
    if (result[i].cluster !== -1) continue;
    
    const neighbors = getNeighbors(result, i, epsilon);
    
    if (neighbors.length < minPts) {
      result[i].cluster = -1; // Noise
      continue;
    }
    
    // Start new cluster
    result[i].cluster = clusterIdx;
    const seeds = [...neighbors];
    
    for (let j = 0; j < seeds.length; j++) {
      const neighborIdx = seeds[j];
      
      if (result[neighborIdx].cluster === -1) {
        result[neighborIdx].cluster = clusterIdx;
      }
      
      if (result[neighborIdx].cluster !== -1 && result[neighborIdx].cluster !== clusterIdx) {
        continue;
      }
      
      result[neighborIdx].cluster = clusterIdx;
      
      const neighborNeighbors = getNeighbors(result, neighborIdx, epsilon);
      if (neighborNeighbors.length >= minPts) {
        seeds.push(...neighborNeighbors.filter(idx => 
          !seeds.includes(idx) && result[idx].cluster === -1
        ));
      }
    }
    
    clusterIdx++;
  }
  
  return result;
}

// HDBSCAN Clustering (Simplified version)
export function hdbscan(points: Point[], minClusterSize: number, minSamples: number): Point[] {
  const result = points.map(p => ({ ...p, cluster: -1 }));
  
  // Calculate core distances
  const coreDistances = result.map((point, idx) => {
    const distances = result
      .map((p, i) => ({ dist: distance(point, p), idx: i }))
      .sort((a, b) => a.dist - b.dist);
    return distances[minSamples] ? distances[minSamples].dist : Infinity;
  });
  
  // Build minimum spanning tree using mutual reachability distance
  const edges: { from: number; to: number; weight: number }[] = [];
  
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const dist = distance(result[i], result[j]);
      const mutualReachDist = Math.max(dist, coreDistances[i], coreDistances[j]);
      edges.push({ from: i, to: j, weight: mutualReachDist });
    }
  }
  
  // Sort edges by weight
  edges.sort((a, b) => a.weight - b.weight);
  
  // Build clusters using union-find
  const parent = Array.from({ length: result.length }, (_, i) => i);
  const clusterSizes = Array(result.length).fill(1);
  let clusterIdx = 0;
  
  const find = (x: number): number => {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  };
  
  const union = (x: number, y: number) => {
    const rootX = find(x);
    const rootY = find(y);
    
    if (rootX !== rootY) {
      parent[rootY] = rootX;
      clusterSizes[rootX] += clusterSizes[rootY];
      return true;
    }
    return false;
  };
  
  // Process edges to form clusters
  const clusters = new Map<number, number>();
  
  for (const edge of edges) {
    const rootFrom = find(edge.from);
    const rootTo = find(edge.to);
    
    if (rootFrom !== rootTo) {
      union(edge.from, edge.to);
    }
  }
  
  // Assign cluster labels based on size threshold
  const componentMap = new Map<number, number>();
  
  for (let i = 0; i < result.length; i++) {
    const root = find(i);
    
    if (!componentMap.has(root)) {
      if (clusterSizes[root] >= minClusterSize) {
        componentMap.set(root, clusterIdx++);
      } else {
        componentMap.set(root, -1); // Noise
      }
    }
    
    result[i].cluster = componentMap.get(root)!;
  }
  
  return result;
}

// Agglomerative Clustering (Single Linkage)
export function agglomerativeClustering(points: Point[], numClusters: number): Point[] {
  const result = points.map((p, idx) => ({ ...p, cluster: idx }));
  const clusters: number[][] = points.map((_, idx) => [idx]);
  
  while (clusters.length > numClusters) {
    let minDist = Infinity;
    let mergeI = 0;
    let mergeJ = 1;
    
    // Find closest clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const dist = clusterDistance(clusters[i], clusters[j], result);
        if (dist < minDist) {
          minDist = dist;
          mergeI = i;
          mergeJ = j;
        }
      }
    }
    
    // Merge clusters
    clusters[mergeI].push(...clusters[mergeJ]);
    clusters.splice(mergeJ, 1);
  }
  
  // Assign cluster numbers
  clusters.forEach((cluster, idx) => {
    cluster.forEach(pointIdx => {
      result[pointIdx].cluster = idx;
    });
  });
  
  return result;
}

// Helper functions
function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function getNeighbors(points: Point[], idx: number, epsilon: number): number[] {
  const neighbors: number[] = [];
  const point = points[idx];
  
  for (let i = 0; i < points.length; i++) {
    if (i === idx) continue;
    if (distance(point, points[i]) <= epsilon) {
      neighbors.push(i);
    }
  }
  
  return neighbors;
}

function clusterDistance(cluster1: number[], cluster2: number[], points: Point[]): number {
  let minDist = Infinity;
  
  for (const i of cluster1) {
    for (const j of cluster2) {
      const dist = distance(points[i], points[j]);
      if (dist < minDist) {
        minDist = dist;
      }
    }
  }
  
  return minDist;
}
