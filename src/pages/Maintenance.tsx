import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMaintenance, useFleet, useCreateMaintenance } from '../hooks/useApi';
import { formatDate, formatRelativeTime, getSeverityColor } from '../utils';
import { MaintenanceJob } from '../types';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Calendar,
  Filter,
  Plus
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const Maintenance: React.FC = () => {
  const { data: maintenanceJobs, isLoading: maintenanceLoading } = useMaintenance();
  const { data: fleet, isLoading: fleetLoading } = useFleet();
  const createMaintenance = useCreateMaintenance();
  const [selectedDepot, setSelectedDepot] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    train_id: '',
    depot: 'A',
    expected_days: 1,
    priority: 'medium',
    description: '',
    assigned_crew: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = maintenanceLoading || fleetLoading;

  const filteredJobs = maintenanceJobs?.filter(job => {
    const matchesDepot = selectedDepot === 'all' || job.depot === selectedDepot;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    const matchesSearch = job.train_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepot && matchesStatus && matchesSearch;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-primary-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-warning-600" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-danger-100 text-danger-800';
      case 'high':
        return 'bg-warning-100 text-warning-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepotStats = () => {
    const stats = maintenanceJobs?.reduce((acc, job) => {
      if (!acc[job.depot]) {
        acc[job.depot] = { total: 0, pending: 0, in_progress: 0, completed: 0 };
      }
      acc[job.depot].total++;
      acc[job.depot][job.status as keyof typeof acc[string]]++;
      return acc;
    }, {} as Record<string, { total: number; pending: number; in_progress: number; completed: number }>) || {};

    return stats;
  };

  const depotStats = getDepotStats();

  const resetForm = () => {
    setForm({ train_id: '', depot: 'A', expected_days: 1, priority: 'medium', description: '', assigned_crew: '' });
    setFormError(null);
  };

  const handleScheduleClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.train_id) {
      setFormError('Please select a Train ID');
      return;
    }
    if (!form.description.trim()) {
      setFormError('Please enter a short description');
      return;
    }
    try {
      await createMaintenance.mutateAsync({
        train_id: form.train_id,
        depot: form.depot,
        expected_days: Number(form.expected_days) || 1,
        priority: form.priority as any,
        description: form.description.trim(),
        assigned_crew: form.assigned_crew || undefined,
        status: 'pending',
      } as any);
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create maintenance job');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading maintenance data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance & Depot</h1>
            <p className="text-gray-600 mt-1">
              Manage maintenance schedules and depot operations
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleScheduleClick}>
            <Plus className="h-4 w-4" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Schedule Maintenance Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Create Maintenance Job
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Train ID</label>
                  <select
                    value={form.train_id}
                    onChange={(e) => setForm((f) => ({ ...f, train_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select train</option>
                    {(fleet || []).map((t) => (
                      <option key={t.id} value={t.id}>{t.id} (Depot {t.depot})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Depot</label>
                  <select
                    value={form.depot}
                    onChange={(e) => setForm((f) => ({ ...f, depot: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="A">Depot A</option>
                    <option value="B">Depot B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Expected Days</label>
                  <input
                    type="number"
                    min={1}
                    value={form.expected_days}
                    onChange={(e) => setForm((f) => ({ ...f, expected_days: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="urgent">urgent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="E.g. Brake system inspection"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Assigned Crew (optional)</label>
                  <input
                    type="text"
                    value={form.assigned_crew}
                    onChange={(e) => setForm((f) => ({ ...f, assigned_crew: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Crew-A1"
                  />
                </div>

                {formError && (
                  <div className="md:col-span-2 text-danger-600 text-sm">{formError}</div>
                )}

                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" loading={createMaintenance.isPending}>Create</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Depot Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(depotStats).map(([depot, stats]) => (
            <Card key={depot}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Depot {depot}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Jobs:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending:</span>
                    <span className="font-medium text-warning-600">{stats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">In Progress:</span>
                    <span className="font-medium text-primary-600">{stats.in_progress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="font-medium text-success-600">{stats.completed}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completion Rate:</span>
                      <span className="font-medium">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Maintenance Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by train ID or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedDepot}
                  onChange={(e) => setSelectedDepot(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Depots</option>
                  <option value="A">Depot A</option>
                  <option value="B">Depot B</option>
                  <option value="C">Depot C</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Maintenance Jobs List */}
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-gray-900">{job.train_id}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.depot}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {job.expected_days} days
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-900 mb-2">{job.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        {job.assigned_crew && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{job.assigned_crew}</span>
                          </div>
                        )}
                        {job.start_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Started: {formatDate(job.start_date)}</span>
                          </div>
                        )}
                        {job.completion_date && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed: {formatDate(job.completion_date)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {job.status === 'pending' && (
                          <Button size="sm">
                            Start Work
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredJobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No maintenance jobs found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Clock className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceJobs?.filter(job => job.status === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Wrench className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceJobs?.filter(job => job.status === 'in_progress').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceJobs?.filter(job => 
                      job.status === 'completed' && 
                      job.completion_date === new Date().toISOString().split('T')[0]
                    ).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-danger-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceJobs?.filter(job => job.priority === 'urgent').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
