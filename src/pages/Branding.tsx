import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useBrandingCampaigns, useFleet, useCreateBrandingCampaign } from '../hooks/useApi';
import { formatDate, formatPercentage } from '../utils';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Eye, 
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const Branding: React.FC = () => {
  const { data: campaigns, isLoading: campaignsLoading } = useBrandingCampaigns();
  const { data: fleet, isLoading: fleetLoading } = useFleet();
  const createCampaign = useCreateBrandingCampaign();
  // const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    priority: 5,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    status: 'active',
    visibility_score: 0.7,
    target_trains: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = campaignsLoading || fleetLoading;

  const getCampaignTrains = (campaignId: string) => {
    const campaign = campaigns?.find(c => c.id === campaignId);
    if (!campaign) return [];
    return fleet?.filter(train => campaign.target_trains.includes(train.id)) || [];
  };

  const getCampaignStatus = (campaign: any) => {
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    
    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'completed';
    if (campaign.status === 'paused') return 'paused';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'paused':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-danger-100 text-danger-800';
    if (priority >= 6) return 'bg-warning-100 text-warning-800';
    if (priority >= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading branding campaigns...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const activeCampaigns = campaigns?.filter(c => getCampaignStatus(c) === 'active').length || 0;
  const totalTrainsWithBranding = campaigns?.reduce((acc, c) => acc + c.target_trains.length, 0) || 0;

  const resetForm = () => {
    setForm({
      name: '', description: '', priority: 5,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      status: 'active', visibility_score: 0.7, target_trains: [],
    });
    setFormError(null);
  };

  const handleNewCampaignClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) { setFormError('Please enter a campaign name'); return; }
    if (!form.start_date || !form.end_date) { setFormError('Please provide start and end dates'); return; }
    try {
      await createCampaign.mutateAsync({
        name: form.name.trim(), description: form.description.trim(), priority: Number(form.priority),
        start_date: form.start_date, end_date: form.end_date,
        target_trains: form.target_trains, status: form.status as any,
        visibility_score: Number(form.visibility_score),
      } as any);
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create campaign');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branding Campaigns</h1>
            <p className="text-gray-600 mt-1">
              Manage advertising campaigns and train branding assignments
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleNewCampaignClick}>
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* New Campaign Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Create Branding Campaign
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="AdCampaignX"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Campaign details"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Target Trains</label>
                  <div className="flex flex-wrap gap-2">
                    {(fleet || []).map((t) => {
                      const checked = form.target_trains.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-1 text-xs px-2 py-1 border rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setForm((f) => ({
                                ...f,
                                target_trains: e.target.checked
                                  ? [...f.target_trains, t.id]
                                  : f.target_trains.filter((id) => id !== t.id)
                              }));
                            }}
                          />
                          {t.id}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Visibility Score (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={form.visibility_score}
                    onChange={(e) => setForm((f) => ({ ...f, visibility_score: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {formError && (
                  <div className="md:col-span-2 text-danger-600 text-sm">{formError}</div>
                )}

                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" loading={createCampaign.isPending}>Create</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Campaign Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Megaphone className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Target className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branded Trains</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTrainsWithBranding}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Visibility</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns?.length ? 
                      formatPercentage(campaigns.reduce((acc, c) => acc + c.visibility_score, 0) / campaigns.length * 100) 
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns?.map((campaign) => {
                const status = getCampaignStatus(campaign);
                const campaignTrains = getCampaignTrains(campaign.id);
                
                return (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(campaign.priority)}`}>
                            Priority {campaign.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start Date:</span>
                            <div className="font-medium">{formatDate(campaign.start_date)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">End Date:</span>
                            <div className="font-medium">{formatDate(campaign.end_date)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Target Trains:</span>
                            <div className="font-medium">{campaign.target_trains.length} trains</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Visibility Score:</span>
                            <div className="font-medium">{formatPercentage(campaign.visibility_score * 100)}</div>
                          </div>
                        </div>
                        
                        {/* Train List */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Trains:</h4>
                          <div className="flex flex-wrap gap-2">
                            {campaignTrains.slice(0, 10).map((train) => (
                              <span
                                key={train.id}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {train.id}
                              </span>
                            ))}
                            {campaignTrains.length > 10 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{campaignTrains.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!campaigns || campaigns.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No branding campaigns found</p>
                  <p className="text-sm">Create your first campaign to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
