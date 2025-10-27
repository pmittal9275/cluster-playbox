import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';

export type Algorithm = 'kmeans' | 'dbscan' | 'agglomerative';
export type Dataset = 'random' | 'circles' | 'moons' | 'blobs';

interface ControlPanelProps {
  algorithm: Algorithm;
  setAlgorithm: (algo: Algorithm) => void;
  dataset: Dataset;
  setDataset: (ds: Dataset) => void;
  numPoints: number;
  setNumPoints: (n: number) => void;
  k: number;
  setK: (k: number) => void;
  epsilon: number;
  setEpsilon: (e: number) => void;
  minPts: number;
  setMinPts: (m: number) => void;
  onRun: () => void;
  onReset: () => void;
}

export const ControlPanel = ({
  algorithm,
  setAlgorithm,
  dataset,
  setDataset,
  numPoints,
  setNumPoints,
  k,
  setK,
  epsilon,
  setEpsilon,
  minPts,
  setMinPts,
  onRun,
  onReset,
}: ControlPanelProps) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Algorithm</h3>
        <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kmeans">K-Means</SelectItem>
            <SelectItem value="dbscan">DBSCAN</SelectItem>
            <SelectItem value="agglomerative">Agglomerative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Dataset</h3>
        <Select value={dataset} onValueChange={(v) => setDataset(v as Dataset)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random Clusters</SelectItem>
            <SelectItem value="circles">Concentric Circles</SelectItem>
            <SelectItem value="moons">Two Moons</SelectItem>
            <SelectItem value="blobs">Blobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Number of Points: {numPoints}</Label>
        <Slider
          value={[numPoints]}
          onValueChange={(v) => setNumPoints(v[0])}
          min={50}
          max={500}
          step={50}
          className="w-full"
        />
      </div>

      {algorithm === 'kmeans' && (
        <div className="space-y-2">
          <Label>Number of Clusters (k): {k}</Label>
          <Slider
            value={[k]}
            onValueChange={(v) => setK(v[0])}
            min={2}
            max={10}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {algorithm === 'dbscan' && (
        <>
          <div className="space-y-2">
            <Label>Epsilon (ε): {epsilon}</Label>
            <Slider
              value={[epsilon]}
              onValueChange={(v) => setEpsilon(v[0])}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Min Points: {minPts}</Label>
            <Slider
              value={[minPts]}
              onValueChange={(v) => setMinPts(v[0])}
              min={2}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </>
      )}

      {algorithm === 'agglomerative' && (
        <div className="space-y-2">
          <Label>Number of Clusters: {k}</Label>
          <Slider
            value={[k]}
            onValueChange={(v) => setK(v[0])}
            min={2}
            max={10}
            step={1}
            className="w-full"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button onClick={onRun} className="flex-1 gap-2">
          <Sparkles className="w-4 h-4" />
          Run Algorithm
        </Button>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </Card>
  );
};
