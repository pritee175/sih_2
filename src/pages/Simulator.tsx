import React, { useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFleet } from '../hooks/useApi';
import { downloadFile, formatNumber } from '../utils';
import { 
  Brain, 
  Play, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Simulator: React.FC = () => {
  const { data: fleet } = useFleet();

  // UI State
  const [selectedTrains, setSelectedTrains] = useState<string[]>([]);
  const [perTrain, setPerTrain] = useState<Record<string, {
    fitness_score: number;
    maintenance_flag: boolean;
    branding_campaign: string | null;
    mileage_km: number;
  }>>({});
  const [globals, setGlobals] = useState({
    cleaning_slots: 0,
    stabling_slots: 0,
    external_delay: false,
  });
  const [compare, setCompare] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | {
    trainStatus: { id: string; fitness_score: number; maintenance_flag: boolean; status: string; comments: string }[];
    conflicts: Array<{ conflict_id: string; description: string; impacted_trains: string[] }>;
    analytics: {
      punctuality: { current: string; simulated: string };
      maintenance_cost: { current: string; simulated: string };
      branding_exposure: { current: string; simulated: string };
      depot_utilization: { current: string; simulated: string };
    };
  }>(null);

  const brandingOptions = ['AdCampaign1', 'AdCampaign2', 'AdCampaign3', 'None'];

  // Initialize defaults when trains are selected
  const ensureDefaults = (ids: string[]) => {
    setPerTrain(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        if (!next[id]) {
          const t = (fleet || []).find(tt => tt.id === id);
          next[id] = {
            fitness_score: t?.fitness_score ?? 0.9,
            maintenance_flag: !!t?.maintenance_flag,
            branding_campaign: t?.branding_campaign ?? null,
            mileage_km: t?.mileage_km ?? 100000,
          };
        }
      });
      return next;
    });
  };

  const currentMap = useMemo(() => {
    const map: Record<string, any> = {};
    (fleet || []).forEach(t => {
      map[t.id] = t;
    });
    return map;
  }, [fleet]);

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      // Hardcoded output per spec. If T03 is among selected, show the provided sample for T03.
      const statuses = selectedTrains.map(id => {
        if (id === 'T03') {
          return {
            id: 'T03',
            fitness_score: 0.65,
            maintenance_flag: true,
            status: 'Maintenance',
            comments: 'Critical fitness & maintenance',
          };
        }
        // For other trains, reflect user inputs into a simple status derivation
        const cfg = perTrain[id];
        const status = cfg?.maintenance_flag ? 'Maintenance' : (cfg && cfg.fitness_score < 0.7 ? 'Unavailable' : 'Available');
        const comments = cfg?.maintenance_flag ? 'Marked under maintenance' : (cfg && cfg.fitness_score < 0.7 ? 'Fitness below threshold' : 'OK');
        return {
          id,
          fitness_score: cfg?.fitness_score ?? 0.9,
          maintenance_flag: !!cfg?.maintenance_flag,
          status,
          comments,
        };
      });

      const hardcoded = {
        conflicts: [
          {
            conflict_id: 'C1',
            description: 'Maintenance scheduling clash with trains T06, T19, T22',
            impacted_trains: ['T03', 'T06', 'T19', 'T22'],
          },
          {
            conflict_id: 'C2',
            description: 'Depot cleaning slot overutilization',
            impacted_trains: ['T03', 'T05', 'T08'],
          },
        ],
        analytics: {
          punctuality: { current: '94.2%', simulated: '92.8%' },
          maintenance_cost: { current: '₹1,25,000', simulated: '₹1,35,000' },
          branding_exposure: { current: '87.5%', simulated: '86.8%' },
          depot_utilization: { current: '80.0%', simulated: '82.0%' },
        },
      };

      setTimeout(() => {
        setResult({ trainStatus: statuses, ...hardcoded });
        setRunning(false);
        toast.success('Simulation completed');
      }, 600);
    } catch (e: any) {
      setRunning(false);
      toast.error('Simulation failed');
    }
  };

  const handleReset = () => {
    setSelectedTrains([]);
    setPerTrain({});
    setGlobals({ cleaning_slots: 0, stabling_slots: 0, external_delay: false });
    setCompare(false);
    setResult(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">What-If Simulator</h1>
          <p className="text-gray-600 mt-1">
            Test different scenarios and analyze their impact on induction planning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Train Selector */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Select Trains</h4>
                <div className="flex flex-wrap gap-2">
                  {(fleet || []).map(t => {
                    const selected = selectedTrains.includes(t.id);
                    return (
                      <label key={t.id} className={`px-2 py-1 text-xs border rounded cursor-pointer ${selected ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-300'}`}>
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={selected}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...selectedTrains, t.id]
                              : selectedTrains.filter(id => id !== t.id);
                            setSelectedTrains(next);
                            ensureDefaults(next);
                          }}
                        />
                        {t.id}
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pick one or more trains (e.g., T03)</p>
              </div>

              {/* Per-Train Parameters */}
              {selectedTrains.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Parameters per Train</h4>
                  {selectedTrains.map(id => {
                    const cfg = perTrain[id];
                    if (!cfg) return null;
                    return (
                      <div key={id} className="p-3 border rounded-lg space-y-3">
                        <div className="font-medium">{id}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Fitness Score (0.0 - 1.0)</label>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={cfg.fitness_score}
                              onChange={(e) => setPerTrain(p => ({ ...p, [id]: { ...p[id], fitness_score: Number(e.target.value) } }))}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-600 mt-1">{formatNumber(cfg.fitness_score, 2)}</div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Maintenance</label>
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={cfg.maintenance_flag}
                                onChange={(e) => setPerTrain(p => ({ ...p, [id]: { ...p[id], maintenance_flag: e.target.checked } }))}
                              />
                              Maintenance Flag
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Branding Campaign</label>
                            <select
                              value={cfg.branding_campaign || 'None'}
                              onChange={(e) => setPerTrain(p => ({ ...p, [id]: { ...p[id], branding_campaign: e.target.value === 'None' ? null : e.target.value } }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {['AdCampaign1','AdCampaign2','AdCampaign3','None'].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Mileage (km)</label>
                            <input
                              type="number"
                              value={cfg.mileage_km}
                              onChange={(e) => setPerTrain(p => ({ ...p, [id]: { ...p[id], mileage_km: Number(e.target.value) } }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Global Inputs */}
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <h4 className="font-medium text-gray-900">Global Inputs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cleaning Slots Available</label>
                    <input type="range" min={0} max={10} value={globals.cleaning_slots} onChange={(e) => setGlobals(g => ({ ...g, cleaning_slots: Number(e.target.value) }))} className="w-full" />
                    <div className="text-xs text-gray-600 mt-1">{globals.cleaning_slots}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Depot Stabling Slots</label>
                    <input type="range" min={0} max={10} value={globals.stabling_slots} onChange={(e) => setGlobals(g => ({ ...g, stabling_slots: Number(e.target.value) }))} className="w-full" />
                    <div className="text-xs text-gray-600 mt-1">{globals.stabling_slots}</div>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={globals.external_delay} onChange={(e) => setGlobals(g => ({ ...g, external_delay: e.target.checked }))} />
                      External Delay (telecom clearance/disruption)
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button onClick={handleRunSimulation} loading={running} disabled={running || selectedTrains.length === 0} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={running}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <label className="ml-auto inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
                  Compare to Current
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Simulation Results */}
          <div>
            {running ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Running simulation...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <div className="space-y-6">
                {/* Updated Train Status Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Updated Train Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.trainStatus.map(ts => (
                        <div key={ts.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{ts.id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${ts.status === 'Available' ? 'text-success-600 border-success-200 bg-success-50' : ts.status === 'Maintenance' ? 'text-danger-600 border-danger-200 bg-danger-50' : 'text-warning-600 border-warning-200 bg-warning-50'}`}>
                              {ts.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <div>Fitness: {formatNumber(ts.fitness_score, 2)}</div>
                            <div>Maintenance: {ts.maintenance_flag ? 'Yes' : 'No'}</div>
                            <div className="text-gray-600 mt-1">{ts.comments}</div>
                          </div>
                          {compare && currentMap[ts.id] && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div>Current Fitness: {formatNumber(currentMap[ts.id].fitness_score, 2)}</div>
                              <div>Current Maintenance: {currentMap[ts.id].maintenance_flag ? 'Yes' : 'No'}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Conflicts Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Conflict Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.conflicts.map(c => (
                        <div key={c.conflict_id} className="flex items-start gap-3 p-3 bg-danger-50 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-danger-600 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium text-danger-800">{c.description}</div>
                            <div className="text-danger-700">Impacted: {c.impacted_trains.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Key Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">Punctuality</span>
                          <span className="text-sm text-gray-700">{result.analytics.punctuality.current} → {result.analytics.punctuality.simulated}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">Maintenance Cost</span>
                          <span className="text-sm text-gray-700">{result.analytics.maintenance_cost.current} → {result.analytics.maintenance_cost.simulated}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">Branding Exposure</span>
                          <span className="text-sm text-gray-700">{result.analytics.branding_exposure.current} → {result.analytics.branding_exposure.simulated}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">Depot Utilization</span>
                          <span className="text-sm text-gray-700">{result.analytics.depot_utilization.current} → {result.analytics.depot_utilization.simulated}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const report = {
                            timestamp: new Date().toISOString(),
                            selectedTrains,
                            perTrain,
                            globals,
                            results: result,
                          };
                          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          downloadFile(url, `what-if-report-${Date.now()}.json`);
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        }}
                      >
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Simulation Results</h3>
                    <p className="text-gray-600">Configure parameters and run a simulation to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};


