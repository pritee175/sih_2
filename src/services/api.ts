import { 
  Trainset, 
  OptimizationRun, 
  DecisionSnapshot, 
  MaintenanceJob, 
  Alert, 
  BrandingCampaign, 
  KPIMetrics, 
  SimulationParams, 
  SimulationResult,
  User,
  ApiResponse,
  PaginatedResponse
} from '../types';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response
    );
  }
  
  return response.json();
}

export const api = {
  // Fleet endpoints
  async getFleet(): Promise<Trainset[]> {
    const response = await fetch(`${API_BASE_URL}/fleet`);
    return handleResponse<Trainset[]>(response);
  },

  // Optimization endpoints
  async optimize(params: {
    date: string;
    params: {
      weighting: {
        reliability: number;
        branding: number;
        cost: number;
      };
      depot_balance: boolean;
    };
  }): Promise<OptimizationRun> {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<OptimizationRun>(response);
  },

  // Decision endpoints
  async saveDecisions(params: {
    run_id: string;
    decisions: Array<{
      id: string;
      action: string;
      operator: string;
      note?: string;
    }>;
    published: boolean;
  }): Promise<{ status: string; snapshot_id: string }> {
    const response = await fetch(`${API_BASE_URL}/decisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{ status: string; snapshot_id: string }>(response);
  },

  // History endpoints
  async getHistory(): Promise<DecisionSnapshot[]> {
    const response = await fetch(`${API_BASE_URL}/history`);
    return handleResponse<DecisionSnapshot[]>(response);
  },

  // Maintenance endpoints
  async getMaintenance(): Promise<MaintenanceJob[]> {
    const response = await fetch(`${API_BASE_URL}/maintenance`);
    return handleResponse<MaintenanceJob[]>(response);
  },

  // Alerts endpoints
  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    return handleResponse<Alert[]>(response);
  },

  // Branding campaigns endpoints
  async getBrandingCampaigns(): Promise<BrandingCampaign[]> {
    const response = await fetch(`${API_BASE_URL}/branding-campaigns`);
    return handleResponse<BrandingCampaign[]>(response);
  },

  // KPI endpoints
  async getKPIs(): Promise<KPIMetrics> {
    const response = await fetch(`${API_BASE_URL}/kpis`);
    return handleResponse<KPIMetrics>(response);
  },

  // Simulation endpoints
  async simulate(params: SimulationParams): Promise<SimulationResult> {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<SimulationResult>(response);
  },

  // Auth endpoints
  async login(credentials: { username: string; password: string }): Promise<{
    user: User;
    token: string;
    expires_at: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{
      user: User;
      token: string;
      expires_at: string;
    }>(response);
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`);
    return handleResponse<User>(response);
  },

  // Export endpoints
  async exportCSV(params: {
    snapshot_id?: string;
    date_range?: {
      start: string;
      end: string;
    };
  }): Promise<{ download_url: string; filename: string; expires_at: string }> {
    const response = await fetch(`${API_BASE_URL}/export/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{ download_url: string; filename: string; expires_at: string }>(response);
  },

  async exportPDF(params: {
    snapshot_id?: string;
    date_range?: {
      start: string;
      end: string;
    };
  }): Promise<{ download_url: string; filename: string; expires_at: string }> {
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{ download_url: string; filename: string; expires_at: string }>(response);
  },

  // Ingestion endpoint (CSV upload)
  async ingestUpload(source: string, file: File): Promise<{
    status: 'ok' | 'error';
    rows_ingested: number;
    warnings: string[];
    errors: Array<{ row: number; message: string }>;
    preview?: Array<Record<string, any>>;
  }> {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${API_BASE_URL}/ingest/${encodeURIComponent(source)}`, {
      method: 'POST',
      body: form,
    });
    return handleResponse(response);
  },
};

export { ApiError };


