// @/mcp/client.ts
import type {
  NationalStats,
  Project,
  BudgetAllocation,
  PolicyDecision,
  PaymentRequest,
  Contractor,
  QualityReport,
  ProvinceStats,
  CreateProjectInput,
  AllocateBudgetInput,
  PolicyDecisionInput,
  PaymentProcessInput,
  ValidationResult,
  MCPResponse,
  GovernmentLevel,
  ProjectSize,
} from './types';

// MCP Server Configuration
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3001';

class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = MCP_SERVER_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MCPResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('MCP Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // ==================== READ OPERATIONS ====================

  async getNationalStats(): Promise<NationalStats | null> {
    const result = await this.request<NationalStats>('/api/stats/national');
    return result.success ? result.data! : null;
  }

  async getProjects(filters?: {
    status?: string;
    province?: string;
    size?: ProjectSize;
    priority?: string;
  }): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<Project[]>(`/api/projects${query}`);
    return result.success ? result.data! : [];
  }

  async getProjectById(id: string): Promise<Project | null> {
    const result = await this.request<Project>(`/api/projects/${id}`);
    return result.success ? result.data! : null;
  }

  async getAllocations(filters?: {
    recipientType?: string;
    fiscalYear?: string;
  }): Promise<BudgetAllocation[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<BudgetAllocation[]>(`/api/allocations${query}`);
    return result.success ? result.data! : [];
  }

  async getPolicies(status?: string): Promise<PolicyDecision[]> {
    const query = status ? `?status=${status}` : '';
    const result = await this.request<PolicyDecision[]>(`/api/policies${query}`);
    return result.success ? result.data! : [];
  }

  async getPaymentRequests(status?: string): Promise<PaymentRequest[]> {
    const query = status ? `?status=${status}` : '';
    const result = await this.request<PaymentRequest[]>(`/api/payments${query}`);
    return result.success ? result.data! : [];
  }

  async getContractors(filters?: {
    verified?: boolean;
    specialization?: string;
  }): Promise<Contractor[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<Contractor[]>(`/api/contractors${query}`);
    return result.success ? result.data! : [];
  }

  async getQualityReports(projectId?: string): Promise<QualityReport[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    const result = await this.request<QualityReport[]>(`/api/quality-reports${query}`);
    return result.success ? result.data! : [];
  }

  async getProvinceStats(): Promise<ProvinceStats[]> {
    const result = await this.request<ProvinceStats[]>('/api/stats/provinces');
    return result.success ? result.data! : [];
  }

  // ==================== WRITE OPERATIONS ====================

  async createProject(input: CreateProjectInput): Promise<MCPResponse<Project>> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<MCPResponse<Project>> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async allocateBudget(input: AllocateBudgetInput): Promise<MCPResponse<BudgetAllocation>> {
    return this.request<BudgetAllocation>('/api/allocations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async decidePolicy(input: PolicyDecisionInput): Promise<MCPResponse<PolicyDecision>> {
    return this.request<PolicyDecision>(`/api/policies/${input.policyId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: input.status,
        decidedBy: input.decidedBy,
      }),
    });
  }

  async processPayment(input: PaymentProcessInput): Promise<MCPResponse<PaymentRequest>> {
    return this.request<PaymentRequest>(`/api/payments/${input.paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: input.status,
        approvedBy: input.approvedBy,
      }),
    });
  }

  // ==================== VALIDATION OPERATIONS ====================

  async validateProjectSize(
    level: GovernmentLevel,
    size: ProjectSize,
    budget: number
  ): Promise<ValidationResult | null> {
    const result = await this.request<ValidationResult>('/api/validate/project-size', {
      method: 'POST',
      body: JSON.stringify({ level, size, budget }),
    });
    return result.success ? result.data! : null;
  }

  // ==================== UTILITY OPERATIONS ====================

  async generateReport(type: string, params: Record<string, any>): Promise<MCPResponse<any>> {
    return this.request('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, params }),
    });
  }

  async exportData(format: 'csv' | 'pdf' | 'excel', data: any[]): Promise<MCPResponse<Blob>> {
    return this.request(`/api/export/${format}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }
}

// Singleton instance
export const mcpClient = new MCPClient();
export default mcpClient;