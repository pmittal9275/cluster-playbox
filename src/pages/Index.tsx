import { useState, useEffect } from 'react';
import { ClusterCanvas } from '@/components/ClusterCanvas';
import { ControlPanel, Algorithm, Dataset } from '@/components/ControlPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { Point, kMeans, dbscan, hdbscan, agglomerativeClustering } from '@/utils/clustering';
import {
  generateRandomClusters,
  generateCircles,
  generateMoons,
  generateBlobs,
  generateSpiral,
  generateAnisotropic,
  generateVariedDensity,
  generateNoisyCircles,
} from '@/utils/datasetGenerators';
import { toast } from 'sonner';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const Index = () => {
  const [algorithm, setAlgorithm] = useState<Algorithm>('kmeans');
  const [dataset, setDataset] = useState<Dataset>('random');
  const [numPoints, setNumPoints] = useState(200);
  const [k, setK] = useState(3);
  const [epsilon, setEpsilon] = useState(40);
  const [minPts, setMinPts] = useState(5);
  const [points, setPoints] = useState<Point[]>([]);

  const generateDataset = () => {
    let newPoints: Point[] = [];
    
    switch (dataset) {
      case 'random':
        newPoints = generateRandomClusters(numPoints, 3, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'circles':
        newPoints = generateCircles(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'moons':
        newPoints = generateMoons(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'blobs':
        newPoints = generateBlobs(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'spiral':
        newPoints = generateSpiral(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'anisotropic':
        newPoints = generateAnisotropic(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'varied':
        newPoints = generateVariedDensity(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'noisy-circles':
        newPoints = generateNoisyCircles(numPoints, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
    }
    
    setPoints(newPoints);
  };

  useEffect(() => {
    generateDataset();
  }, [dataset, numPoints]);

  const runClustering = () => {
    if (points.length === 0) {
      toast.error('No data points to cluster');
      return;
    }

    let clusteredPoints: Point[] = [];
    
    try {
      switch (algorithm) {
        case 'kmeans':
          clusteredPoints = kMeans(points, k);
          toast.success(`K-Means completed with ${k} clusters`);
          break;
        case 'dbscan':
          clusteredPoints = dbscan(points, epsilon, minPts);
          const dbscanClusters = new Set(clusteredPoints.map(p => p.cluster).filter(c => c !== -1)).size;
          toast.success(`DBSCAN found ${dbscanClusters} clusters`);
          break;
        case 'hdbscan':
          clusteredPoints = hdbscan(points, k, minPts);
          const hdbscanClusters = new Set(clusteredPoints.map(p => p.cluster).filter(c => c !== -1)).size;
          toast.success(`HDBSCAN found ${hdbscanClusters} clusters`);
          break;
        case 'agglomerative':
          clusteredPoints = agglomerativeClustering(points, k);
          toast.success(`Agglomerative clustering completed with ${k} clusters`);
          break;
      }
      
      setPoints(clusteredPoints);
    } catch (error) {
      toast.error('Error running clustering algorithm');
      console.error(error);
    }
  };

  const resetDataset = () => {
    generateDataset();
    toast.success('Dataset reset');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Clustering Algorithm Simulator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore K-Means, DBSCAN, HDBSCAN, and Agglomerative clustering algorithms with interactive visualizations
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6 items-start">
          <div className="space-y-6">
            <ClusterCanvas 
              points={points} 
              width={CANVAS_WIDTH} 
              height={CANVAS_HEIGHT}
            />
            <StatsPanel points={points} />
          </div>

          <div className="lg:sticky lg:top-8">
            <ControlPanel
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              dataset={dataset}
              setDataset={setDataset}
              numPoints={numPoints}
              setNumPoints={setNumPoints}
              k={k}
              setK={setK}
              epsilon={epsilon}
              setEpsilon={setEpsilon}
              minPts={minPts}
              setMinPts={setMinPts}
              onRun={runClustering}
              onReset={resetDataset}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
