import { Card } from '@/components/ui/card';
import { Point } from '@/utils/clustering';
import { useMemo } from 'react';

interface StatsPanelProps {
  points: Point[];
}

export const StatsPanel = ({ points }: StatsPanelProps) => {
  const stats = useMemo(() => {
    const clusterCounts = new Map<number, number>();
    let noiseCount = 0;

    points.forEach(point => {
      if (point.cluster === -1 || point.cluster === undefined) {
        noiseCount++;
      } else {
        clusterCounts.set(point.cluster, (clusterCounts.get(point.cluster) || 0) + 1);
      }
    });

    return {
      totalPoints: points.length,
      numClusters: clusterCounts.size,
      noisePoints: noiseCount,
      clusterSizes: Array.from(clusterCounts.entries()).sort((a, b) => a[0] - b[0]),
    };
  }, [points]);

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Statistics</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Points:</span>
          <span className="font-semibold text-foreground">{stats.totalPoints}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Clusters Found:</span>
          <span className="font-semibold text-primary">{stats.numClusters}</span>
        </div>
        
        {stats.noisePoints > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Noise Points:</span>
            <span className="font-semibold text-muted-foreground">{stats.noisePoints}</span>
          </div>
        )}
      </div>

      {stats.clusterSizes.length > 0 && (
        <>
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Cluster Sizes</h4>
            <div className="space-y-2">
              {stats.clusterSizes.map(([cluster, size]) => (
                <div key={cluster} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Cluster {cluster + 1}:</span>
                  <span className="font-medium text-foreground">{size}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
