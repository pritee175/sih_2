import { Trainset, MaintenanceJob, Alert, BrandingCampaign, KPIMetrics, User } from '../types';

export const mockTrainsets: Trainset[] = [
  { id: 'T01', depot: 'A', mileage_km: 125000, last_maintenance: '2025-08-10', maintenance_flag: false, fitness_score: 0.92, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T02', depot: 'A', mileage_km: 98000, last_maintenance: '2025-09-01', maintenance_flag: false, fitness_score: 0.88, branding_campaign: 'AdCampaign2', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T03', depot: 'A', mileage_km: 156000, last_maintenance: '2025-07-15', maintenance_flag: true, fitness_score: 0.95, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T04', depot: 'A', mileage_km: 87000, last_maintenance: '2025-09-05', maintenance_flag: false, fitness_score: 0.91, available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T05', depot: 'A', mileage_km: 67000, last_maintenance: '2025-09-10', maintenance_flag: false, fitness_score: 0.96, available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T06', depot: 'A', mileage_km: 234000, last_maintenance: '2025-05-15', maintenance_flag: true, fitness_score: 0.72, branding_campaign: 'AdCampaign1', available: false, model: 'Metro-3000', capacity: 300 },
  { id: 'T07', depot: 'A', mileage_km: 76000, last_maintenance: '2025-09-12', maintenance_flag: false, fitness_score: 0.45, branding_campaign: 'AdCampaign2', available: false, model: 'Metro-3000', capacity: 300 },
  { id: 'T08', depot: 'A', mileage_km: 102000, last_maintenance: '2025-09-03', maintenance_flag: false, fitness_score: 0.89, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T09', depot: 'A', mileage_km: 143000, last_maintenance: '2025-08-20', maintenance_flag: false, fitness_score: 0.86, branding_campaign: 'AdCampaign3', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T10', depot: 'A', mileage_km: 165000, last_maintenance: '2025-07-20', maintenance_flag: false, fitness_score: 0.84, branding_campaign: 'AdCampaign2', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T11', depot: 'A', mileage_km: 116000, last_maintenance: '2025-08-28', maintenance_flag: false, fitness_score: 0.90, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T12', depot: 'B', mileage_km: 189000, last_maintenance: '2025-06-10', maintenance_flag: true, fitness_score: 0.68, available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T13', depot: 'B', mileage_km: 56000, last_maintenance: '2025-09-15', maintenance_flag: false, fitness_score: 0.97, available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T14', depot: 'B', mileage_km: 97000, last_maintenance: '2025-09-06', maintenance_flag: false, fitness_score: 0.92, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T15', depot: 'B', mileage_km: 147000, last_maintenance: '2025-08-05', maintenance_flag: false, fitness_score: 0.88, branding_campaign: 'AdCampaign3', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T16', depot: 'B', mileage_km: 116000, last_maintenance: '2025-08-28', maintenance_flag: false, fitness_score: 0.90, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T17', depot: 'B', mileage_km: 125000, last_maintenance: '2025-08-10', maintenance_flag: false, fitness_score: 0.92, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T18', depot: 'B', mileage_km: 98000, last_maintenance: '2025-09-01', maintenance_flag: false, fitness_score: 0.88, branding_campaign: 'AdCampaign2', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T19', depot: 'B', mileage_km: 156000, last_maintenance: '2025-07-15', maintenance_flag: true, fitness_score: 0.95, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T20', depot: 'B', mileage_km: 87000, last_maintenance: '2025-09-05', maintenance_flag: false, fitness_score: 0.91, available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T21', depot: 'B', mileage_km: 67000, last_maintenance: '2025-09-10', maintenance_flag: false, fitness_score: 0.96, available: true, model: 'Metro-3000', capacity: 300 },
  { id: 'T22', depot: 'B', mileage_km: 234000, last_maintenance: '2025-05-15', maintenance_flag: true, fitness_score: 0.72, branding_campaign: 'AdCampaign1', available: false, model: 'Metro-3000', capacity: 300 },
  { id: 'T23', depot: 'B', mileage_km: 76000, last_maintenance: '2025-09-12', maintenance_flag: false, fitness_score: 0.45, branding_campaign: 'AdCampaign2', available: false, model: 'Metro-3000', capacity: 300 },
  { id: 'T24', depot: 'B', mileage_km: 102000, last_maintenance: '2025-09-03', maintenance_flag: false, fitness_score: 0.89, branding_campaign: 'AdCampaign1', available: true, model: 'Metro-3000', capacity: 300 },
];

export const mockMaintenanceJobs: MaintenanceJob[] = [
  { id: 'M01', train_id: 'T03', status: 'pending', expected_days: 2, depot: 'B', priority: 'medium', description: 'Brake system inspection', assigned_crew: 'Crew-B1' },
  { id: 'M02', train_id: 'T14', status: 'in_progress', expected_days: 5, depot: 'B', priority: 'high', description: 'Engine overhaul', assigned_crew: 'Crew-B2', start_date: '2025-09-15' },
  { id: 'M04', train_id: 'T09', status: 'completed', expected_days: 4, depot: 'A', priority: 'high', description: 'Body panel replacement', assigned_crew: 'Crew-A1', start_date: '2025-09-10', completion_date: '2025-09-14' },
];

export const mockAlerts: Alert[] = [
  // Critical maintenance required
  { id: 'A01', train_id: 'T03', type: 'maintenance_overdue', severity: 'critical', timestamp: '2025-09-18T21:40:00Z', message: 'Maintenance required', resolved: false },
  { id: 'A02', train_id: 'T06', type: 'maintenance_overdue', severity: 'critical', timestamp: '2025-09-18T21:35:00Z', message: 'Maintenance required', resolved: false },
  { id: 'A03', train_id: 'T12', type: 'maintenance_overdue', severity: 'critical', timestamp: '2025-09-18T21:30:00Z', message: 'Maintenance required', resolved: false },
  { id: 'A04', train_id: 'T19', type: 'maintenance_overdue', severity: 'critical', timestamp: '2025-09-18T21:25:00Z', message: 'Maintenance required', resolved: false },
  { id: 'A05', train_id: 'T22', type: 'maintenance_overdue', severity: 'critical', timestamp: '2025-09-18T21:20:00Z', message: 'Maintenance required', resolved: false },
  // Critical fitness
  { id: 'A06', train_id: 'T07', type: 'fitness_fail', severity: 'critical', timestamp: '2025-09-18T21:15:00Z', message: 'Fitness critical', resolved: false },
  { id: 'A07', train_id: 'T23', type: 'fitness_fail', severity: 'critical', timestamp: '2025-09-18T21:10:00Z', message: 'Fitness critical', resolved: false },
  // High priority maintenance overdue
  { id: 'A08', train_id: 'T01', type: 'maintenance_overdue', severity: 'high', timestamp: '2025-09-18T21:05:00Z', message: 'Maintenance overdue by 10 days', resolved: false },
  { id: 'A09', train_id: 'T10', type: 'maintenance_overdue', severity: 'high', timestamp: '2025-09-18T21:00:00Z', message: 'Maintenance overdue by 31 days', resolved: false },
];

export const mockBrandingCampaigns: BrandingCampaign[] = [
  { id: 'BC01', name: 'AdCampaign1', description: 'Tourism promotion campaign', priority: 8, start_date: '2025-09-01', end_date: '2025-12-31', target_trains: ['T01', 'T03', 'T09', 'T15', 'T20', 'T24'], status: 'active', visibility_score: 0.85 },
  { id: 'BC02', name: 'AdCampaign2', description: 'Corporate partnership branding', priority: 6, start_date: '2025-08-15', end_date: '2025-11-30', target_trains: ['T02', 'T07', 'T12', 'T16', 'T18', 'T21', 'T25'], status: 'active', visibility_score: 0.72 },
  { id: 'BC03', name: 'AdCampaign3', description: 'Safety awareness campaign', priority: 9, start_date: '2025-09-10', end_date: '2025-10-31', target_trains: ['T05', 'T11', 'T17', 'T23'], status: 'active', visibility_score: 0.91 },
];

export const mockKPIMetrics: KPIMetrics = {
  punctuality: {
    on_time_percentage: 94.2,
    target_percentage: 95.0,
    trend: 'up'
  },
  maintenance_cost: {
    savings_estimate: 125000,
    target_savings: 150000,
    trend: 'stable'
  },
  transparency: {
    auto_explained_percentage: 87.5,
    target_percentage: 90.0,
    trend: 'up'
  },
  depot_utilization: {
    depot_a: 72.7,
    depot_b: 69.2,
    average: 70.8
  }
};

export const mockUsers: User[] = [
  {
    id: 'U01',
    username: 'ramesh',
    role: 'Maintenance Engineer',
    name: 'Ramesh Kumar',
    depot_access: ['A', 'B'],
    permissions: ['view_all', 'make_decisions', 'override_ai', 'export_data']
  },
  {
    id: 'U02',
    username: 'dilip',
    role: 'Operations Control Manager',
    name: 'Dilip Singh',
    depot_access: ['A', 'B'],
    permissions: ['view_all', 'make_decisions', 'override_ai', 'export_data']
  },
];
