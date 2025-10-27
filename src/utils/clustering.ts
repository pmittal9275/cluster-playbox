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

// HDBSCAN Clustering (Heuristic MST-based extraction)
export function hdbscan(points: Point[], minClusterSize: number, minSamples: number): Point[] {
  const result = points.map(p => ({ ...p, cluster: -1 }));
  const n = result.length;
  if (n === 0) return result;

  // Core distance: distance to kth neighbor (k = minSamples)
  const coreDistances = new Array<number>(n).fill(Infinity);
  for (let i = 0; i < n; i++) {
    const dists: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      dists.push(distance(result[i], result[j]));
    }
    dists.sort((a, b) => a - b);
    coreDistances[i] = dists[Math.max(0, Math.min(dists.length - 1, minSamples - 1))] ?? Infinity;
  }

  const mrd = (i: number, j: number) => Math.max(distance(result[i], result[j]), coreDistances[i], coreDistances[j]);

  // Build MST using Prim's algorithm on mutual reachability distances
  const used = new Array<boolean>(n).fill(false);
  const minW = new Array<number>(n).fill(Infinity);
  const parent = new Array<number>(n).fill(-1);
  minW[0] = 0;

  const mstEdges: { u: number; v: number; w: number }[] = [];
  for (let it = 0; it < n; it++) {
    // Pick unused vertex with smallest key
    let u = -1;
    let best = Infinity;
    for (let v = 0; v < n; v++) {
      if (!used[v] && minW[v] < best) {
        best = minW[v];
        u = v;
      }
    }
    if (u === -1) break;
    used[u] = true;
    if (parent[u] !== -1) {
      mstEdges.push({ u, v: parent[u], w: mrd(u, parent[u]) });
    }

    // Relax neighbors
    for (let v = 0; v < n; v++) {
      if (used[v] || u === v) continue;
      const w = mrd(u, v);
      if (w < minW[v]) {
        minW[v] = w;
        parent[v] = u;
      }
    }
  }

  if (mstEdges.length === 0) return result;

  // Try multiple cut thresholds and pick the one that keeps most points in clusters >= minClusterSize
  const weights = mstEdges.map(e => e.w).sort((a, b) => a - b);
  const candidates: number[] = [];
  const quantiles = [0.4, 0.5, 0.6, 0.7, 0.8];
  quantiles.forEach(q => {
    const idx = Math.min(weights.length - 1, Math.max(0, Math.floor(q * weights.length)));
    candidates.push(weights[idx]);
  });
  // Add median unique weights as additional candidates
  if (weights.length > 5) candidates.push(weights[Math.floor(weights.length * 0.9)]);

  let bestLabels = new Array<number>(n).fill(-1);
  let bestKept = -1;
  let bestClusters = 0;

  for (const t of candidates) {
    // Union-Find
    const par = Array.from({ length: n }, (_, i) => i);
    const sz = new Array<number>(n).fill(1);
    const find = (x: number): number => (par[x] === x ? x : (par[x] = find(par[x])));
    const unite = (a: number, b: number) => {
      a = find(a); b = find(b);
      if (a === b) return;
      if (sz[a] < sz[b]) [a, b] = [b, a];
      par[b] = a; sz[a] += sz[b];
    };

    for (const { u, v, w } of mstEdges) {
      if (w <= t) unite(u, v);
    }

    // Component sizes
    const compSize = new Map<number, number>();
    for (let i = 0; i < n; i++) {
      const r = find(i);
      compSize.set(r, (compSize.get(r) || 0) + 1);
    }

    // Build labels, filter small comps
    let nextId = 0;
    const compId = new Map<number, number>();
    const labels = new Array<number>(n).fill(-1);
    for (let i = 0; i < n; i++) {
      const r = find(i);
      const size = compSize.get(r) || 0;
      if (size >= minClusterSize) {
        if (!compId.has(r)) compId.set(r, nextId++);
        labels[i] = compId.get(r)!;
      }
    }

    const kept = labels.filter(l => l !== -1).length;
    const clusters = nextId;
    if (kept > bestKept || (kept === bestKept && clusters > bestClusters)) {
      bestKept = kept;
      bestClusters = clusters;
      bestLabels = labels;
    }
  }

  // Apply best labels
  for (let i = 0; i < n; i++) result[i].cluster = bestLabels[i];
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
