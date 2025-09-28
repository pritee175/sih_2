import React, { useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Brain, RefreshCw, Info, Settings, Loader2 } from 'lucide-react';
import { useOptimize, useFleet } from '../hooks/useApi';

interface Assignment {
  slot: string; // e.g., "06:00", "06:15"
  train_id?: string;
}

const timeSlots = Array.from({ length: 16 }, (_, i) => `${String(6 + Math.floor(i / 4)).padStart(2, '0')}:${(i % 4) * 15 === 0 ? '00' : (i % 4) * 15}`);

export const Scheduling: React.FC = () => {
  const { data: fleet = [], isLoading: fleetLoading } = useFleet();
  const optimizeMutation = useOptimize();

  const [params, setParams] = useState({
    weighting: { reliability: 0.6, branding: 0.2, cost: 0.2 },
    depot_balance: true,
  });
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(
    () => Object.fromEntries(timeSlots.map((t) => [t, { slot: t }]))
  );
  const [dragTrain, setDragTrain] = useState<string | null>(null);

  const availableTrains = useMemo(() => fleet.map((t) => t.id), [fleet]);

  const runOptimization = async () => {
    await optimizeMutation.mutateAsync({ date: new Date().toISOString().split('T')[0], params });
  };

  const onDragStart = (trainId: string) => setDragTrain(trainId);
  const onDrop = (slot: string) => {
    if (!dragTrain) return;
    setAssignments((prev) => ({ ...prev, [slot]: { slot, train_id: dragTrain } }));
    setDragTrain(null);
  };

  const clearAssignments = () => setAssignments(Object.fromEntries(timeSlots.map((t) => [t, { slot: t }])));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Scheduling</h1>
            <p className="text-gray-400 mt-1">Interactive planning grid with AI optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={runOptimization} disabled={optimizeMutation.isPending || fleetLoading}>
              {optimizeMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Run Optimization
            </Button>
            <Button variant="secondary" onClick={clearAssignments}>
              <RefreshCw className="h-4 w-4 mr-2" /> Clear Grid
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Trains panel */}
          <Card>
            <CardHeader>
              <CardTitle>Available Trains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-auto">
                {availableTrains.map((id) => (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => onDragStart(id)}
                    className="px-3 py-2 rounded bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 cursor-grab active:cursor-grabbing"
                    title={`Drag to assign ${id} to a slot`}
                  >
                    {id}
                  </div>
                ))}
                {availableTrains.length === 0 && (
                  <div className="text-sm text-gray-500">No trains available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Planning grid */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Planning Grid (06:00 - 09:45)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <div key={slot} className="p-3 rounded-lg bg-white border border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">{slot}</div>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(slot)}
                      className="h-16 flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 hover:bg-white transition-colors"
                    >
                      {assignments[slot]?.train_id ? (
                        <span className="text-sm text-gray-900">{assignments[slot]?.train_id}</span>
                      ) : (
                        <span className="text-xs text-gray-500">Drop train here</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization controls and explanation */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Reliability</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={params.weighting.reliability}
                    onChange={(e) => setParams((p) => ({ ...p, weighting: { ...p.weighting, reliability: parseFloat(e.target.value) } }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Branding</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={params.weighting.branding}
                    onChange={(e) => setParams((p) => ({ ...p, weighting: { ...p.weighting, branding: parseFloat(e.target.value) } }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Cost</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={params.weighting.cost}
                    onChange={(e) => setParams((p) => ({ ...p, weighting: { ...p.weighting, cost: parseFloat(e.target.value) } }))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="depot_balance"
                    type="checkbox"
                    checked={params.depot_balance}
                    onChange={(e) => setParams((p) => ({ ...p, depot_balance: e.target.checked }))}
                  />
                  <label htmlFor="depot_balance" className="text-sm text-gray-300">Depot balance constraint</label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Decision Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded bg-white border border-gray-200 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2 text-gray-900">
                  <Info className="h-4 w-4" />
                  <span>How to use this workspace</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Drag trains from the left panel and drop them into time slots.</li>
                  <li>Adjust optimization parameters and run the optimizer for AI suggestions.</li>
                  <li>Future versions will show per-slot rationale and constraint indicators here.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Scheduling;
