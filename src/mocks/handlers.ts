import { http, HttpResponse } from 'msw';
import { mockTrainsets, mockMaintenanceJobs, mockAlerts, mockBrandingCampaigns, mockKPIMetrics, mockUsers } from '../data/mockData';
import { OptimizationRun, DecisionSnapshot, SimulationResult, MaintenanceJob, BrandingCampaign } from '../types';

// Mock optimization results aligned to user's AI Recommendation Table
const mockOptimizationResults: OptimizationRun = {
  run_id: 'r123',
  date: '2025-09-18',
  ranked: [
    { id: 'T13', score: 0.874, confidence: 0.82, reasons: ['high-fitness', 'low-mileage'], conflicts: [], depot_balance_impact: 0.6, branding_priority: 0 },
    { id: 'T05', score: 0.861, confidence: 0.8, reasons: ['high-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 0 },
    { id: 'T21', score: 0.861, confidence: 0.8, reasons: ['high-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 0 },
    { id: 'T14', score: 0.847, confidence: 0.79, reasons: ['branding-campaign', 'good-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 8 },
    { id: 'T17', score: 0.836, confidence: 0.78, reasons: ['branding-campaign', 'good-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 8 },
    { id: 'T01', score: 0.836, confidence: 0.78, reasons: ['branding-campaign', 'good-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 8 },
    { id: 'T16', score: 0.824, confidence: 0.77, reasons: ['branding-campaign', 'good-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 8 },
    { id: 'T11', score: 0.824, confidence: 0.77, reasons: ['branding-campaign', 'good-fitness'], conflicts: [], depot_balance_impact: 0.5, branding_priority: 8 },
    { id: 'T08', score: 0.821, confidence: 0.75, reasons: ['solid-fitness', 'recent-maintenance'], conflicts: [], depot_balance_impact: 0.4, branding_priority: 8 },
    { id: 'T24', score: 0.821, confidence: 0.75, reasons: ['solid-fitness', 'recent-maintenance'], conflicts: [], depot_balance_impact: 0.4, branding_priority: 8 },
    { id: 'T15', score: 0.805, confidence: 0.74, reasons: ['branding-campaign'], conflicts: [], depot_balance_impact: 0.4, branding_priority: 9 },
    { id: 'T18', score: 0.804, confidence: 0.73, reasons: ['branding-campaign'], conflicts: [], depot_balance_impact: 0.4, branding_priority: 6 },
    { id: 'T20', score: 0.799, confidence: 0.72, reasons: ['good-fitness'], conflicts: [], depot_balance_impact: 0.4, branding_priority: 0 },
    { id: 'T09', score: 0.796, confidence: 0.7, reasons: ['branding-campaign'], conflicts: [], depot_balance_impact: 0.4, branding_priority: 7 },
    { id: 'T10', score: 0.777, confidence: 0.69, reasons: ['branding-campaign'], conflicts: [], depot_balance_impact: 0.3, branding_priority: 6 },
    { id: 'T04', score: 0.766, confidence: 0.68, reasons: ['good-fitness'], conflicts: [], depot_balance_impact: 0.3, branding_priority: 0 },
    { id: 'T02', score: 0.756, confidence: 0.67, reasons: ['branding-campaign'], conflicts: [], depot_balance_impact: 0.3, branding_priority: 6 },
    { id: 'T19', score: 0.0, confidence: 0.6, reasons: ['maintenance'], conflicts: [], depot_balance_impact: 0.0, branding_priority: 8 },
    { id: 'T03', score: 0.0, confidence: 0.6, reasons: ['maintenance'], conflicts: [], depot_balance_impact: 0.0, branding_priority: 8 },
    { id: 'T06', score: 0.0, confidence: 0.6, reasons: ['maintenance'], conflicts: [], depot_balance_impact: 0.0, branding_priority: 8 },
    { id: 'T22', score: 0.0, confidence: 0.6, reasons: ['maintenance'], conflicts: [], depot_balance_impact: 0.0, branding_priority: 8 },
    { id: 'T07', score: 0.0, confidence: 0.55, reasons: ['unavailable', 'fitness-critical'], conflicts: [], depot_balance_impact: 0.0, branding_priority: 6 },
    { id: 'T23', score: 0.0, confidence: 0.55, reasons: ['unavailable', 'fitness-critical'], conflicts: [], depot_balance_impact: 0.0, branding_priority: 6 },
  ],
  meta: {
    execution_time_ms: 345,
    total_trains: 24,
    depot_balance: true,
    weighting: {
      reliability: 0.6,
      branding: 0.2,
      cost: 0.2
    }
  }
};

// Mock decision snapshots
const mockDecisionSnapshots: DecisionSnapshot[] = [
  {
    snapshot_id: 's456',
    date: '2025-09-18T22:10:00Z',
    operator: 'supervisor1',
    run_id: 'r123',
    summary: {
      inducted: 6,
      standby: 15,
      maintenance: 4,
      rejected: 0
    },
    decisions: [
      { id: 'T03', action: 'induct', operator: 'supervisor1', note: 'Approved - good fitness and depot balance', timestamp: '2025-09-18T22:10:00Z' },
      { id: 'T06', action: 'induct', operator: 'supervisor1', note: 'Approved - excellent condition', timestamp: '2025-09-18T22:10:00Z' },
      { id: 'T01', action: 'induct', operator: 'supervisor1', note: 'Approved - branding campaign active', timestamp: '2025-09-18T22:10:00Z' },
    ],
    reasons: [
      { id: 'T03', why: ['fitness ok', 'branding high'], action: 'induct' },
      { id: 'T06', why: ['fitness excellent', 'recent maintenance'], action: 'induct' },
      { id: 'T01', why: ['fitness good', 'branding campaign'], action: 'induct' },
    ]
  }
];

export const handlers = [
  // Fleet endpoints
  http.get('/api/fleet', () => {
    return HttpResponse.json(mockTrainsets);
  }),

  // Optimization endpoints
  http.post('/api/optimize', async ({ request }) => {
    await request.json();
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return HttpResponse.json(mockOptimizationResults);
  }),

  // Decision endpoints
  http.post('/api/decisions', async ({ request }) => {
    await request.json();
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return HttpResponse.json({ 
      status: 'ok', 
      snapshot_id: 's456',
      message: 'Decisions saved and published successfully'
    });
  }),

  // History endpoints
  http.get('/api/history', () => {
    return HttpResponse.json(mockDecisionSnapshots);
  }),

  // Maintenance endpoints
  http.get('/api/maintenance', () => {
    return HttpResponse.json(mockMaintenanceJobs);
  }),
  http.post('/api/maintenance', async ({ request }) => {
    const body = await request.json() as Partial<MaintenanceJob>;
    // Simple ID generator
    const nextNum = (mockMaintenanceJobs.length + 1).toString().padStart(2, '0');
    const newJob: MaintenanceJob = {
      id: `M${nextNum}`,
      train_id: body.train_id || 'T01',
      status: 'pending',
      expected_days: body.expected_days ?? 1,
      depot: body.depot || 'A',
      priority: (body.priority as any) || 'medium',
      description: body.description || 'Scheduled maintenance',
      assigned_crew: body.assigned_crew,
      start_date: body.start_date,
      completion_date: body.completion_date,
    };
    mockMaintenanceJobs.push(newJob);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  // Alerts endpoints
  http.get('/api/alerts', () => {
    return HttpResponse.json(mockAlerts);
  }),

  // Branding campaigns endpoints
  http.get('/api/branding-campaigns', () => {
    return HttpResponse.json(mockBrandingCampaigns);
  }),
  http.post('/api/branding-campaigns', async ({ request }) => {
    const body = await request.json() as Partial<BrandingCampaign>;
    const nextNum = (mockBrandingCampaigns.length + 1).toString().padStart(2, '0');
    const newCampaign: BrandingCampaign = {
      id: `BC${nextNum}`,
      name: body.name || 'New Campaign',
      description: body.description || '',
      priority: body.priority ?? 5,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      end_date: body.end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      target_trains: body.target_trains || [],
      status: (body.status as any) || 'active',
      visibility_score: body.visibility_score ?? 0.7,
    };
    mockBrandingCampaigns.push(newCampaign);
    return HttpResponse.json(newCampaign, { status: 201 });
  }),

  // KPI endpoints
  http.get('/api/kpis', () => {
    return HttpResponse.json(mockKPIMetrics);
  }),

  // Simulation endpoints
  http.post('/api/simulate', async ({ request }) => {
    await request.json();
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockSimulationResult: SimulationResult = {
      baseline: {
        inducted: 6,
        punctuality: 94.2,
        cost_savings: 125000
      },
      simulation: {
        inducted: 4,
        punctuality: 91.8,
        cost_savings: 98000
      },
      delta: {
        inducted: -2,
        punctuality: -2.4,
        cost_savings: -27000
      },
      recommendations: [
        'Consider reopening Depot A to maintain service levels',
        'Alternative: Increase utilization of remaining depots',
        'Monitor fitness scores closely during this period'
      ]
    };
    
    return HttpResponse.json(mockSimulationResult);
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    
    // Mock authentication
    if (body.username === 'supervisor1' && body.password === 'password') {
      return HttpResponse.json({
        user: mockUsers[0],
        token: 'mock-jwt-token-123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUsers[0]);
  }),

  // Export endpoints
  http.post('/api/export/csv', async ({ request }) => {
    await request.json();
    // Simulate file generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return HttpResponse.json({
      download_url: '/api/downloads/export-2025-09-18.csv',
      filename: 'induction-plan-2025-09-18.csv',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  }),

  http.post('/api/export/pdf', async ({ request }) => {
    await request.json();
    // Simulate file generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return HttpResponse.json({
      download_url: '/api/downloads/report-2025-09-18.pdf',
      filename: 'induction-report-2025-09-18.pdf',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  }),

  // Ingestion endpoint (CSV Upload)
  http.post('/api/ingest/:source', async ({ params, request: _request }) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 600));
    // For mocks, we won't parse the CSV; just return a plausible validation summary
    const source = params.source as string;
    const samplePreview = [
      { id: 'T01', metric: 0.92, ts: '2025-09-18T09:00:00Z' },
      { id: 'T02', metric: 0.87, ts: '2025-09-18T09:05:00Z' },
    ];
    return HttpResponse.json({
      status: 'ok',
      rows_ingested: 120,
      warnings: source === 'other' ? ['Unknown columns ignored: col_x'] : [],
      errors: [],
      preview: samplePreview,
    });
  }),
];


