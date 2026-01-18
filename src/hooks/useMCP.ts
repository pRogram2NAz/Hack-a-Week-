// @/hooks/useMCP.ts
import { useState, useCallback, useMemo } from 'react';
import { mockMCPServer } from '@/mcp/mockServer';
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
} from '@/mcp/types';

// Use mock server for development, can switch to real MCP client later
const USE_MOCK = true;

export interface MCPHookReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Read operations
  getNationalStats: () => Promise<NationalStats | null>;
  getProjects: (filters?: Record<string, string>) => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | null>;
  getAllocations: (filters?: Record<string, string>) => Promise<BudgetAllocation[]>;
  getPolicies: (status?: string) => Promise<PolicyDecision[]>;
  getPaymentRequests: (status?: string) => Promise<PaymentRequest[]>;
  getContractors: (filters?: Record<string, any>) => Promise<Contractor[]>;
  getQualityReports: (projectId?: string) => Promise<QualityReport[]>;
  getProvinceStats: () => Promise<ProvinceStats[]>;
  
  // Write operations
  createProject: (input: CreateProjectInput) => Promise<MCPResponse<Project>>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<MCPResponse<Project>>;
  allocateBudget: (input: AllocateBudgetInput) => Promise<MCPResponse<BudgetAllocation>>;
  decidePolicy: (input: PolicyDecisionInput) => Promise<MCPResponse<PolicyDecision>>;
  processPayment: (input: PaymentProcessInput) => Promise<MCPResponse<PaymentRequest>>;
  
  // Validation
  validateProjectSize: (level: GovernmentLevel, size: ProjectSize, budget: number) => Promise<ValidationResult | null>;
  
  // Utilities
  clearError: () => void;
}

export function useMCP(): MCPHookReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    showLoading = true
  ): Promise<T | null> => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('MCP Error:', err);
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleResponse = useCallback(async <T>(
    operation: () => Promise<MCPResponse<T>>
  ): Promise<MCPResponse<T>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Read operations
  const getNationalStats = useCallback(async () => {
    return handleAsync(() => mockMCPServer.getNationalStats());
  }, [handleAsync]);

  const getProjects = useCallback(async (filters?: Record<string, string>) => {
    const result = await handleAsync(() => mockMCPServer.getProjects(filters));
    return result || [];
  }, [handleAsync]);

  const getProjectById = useCallback(async (id: string) => {
    return handleAsync(() => mockMCPServer.getProjectById(id));
  }, [handleAsync]);

  const getAllocations = useCallback(async (filters?: Record<string, string>) => {
    const result = await handleAsync(() => mockMCPServer.getAllocations(filters));
    return result || [];
  }, [handleAsync]);

  const getPolicies = useCallback(async (status?: string) => {
    const result = await handleAsync(() => mockMCPServer.getPolicies(status));
    return result || [];
  }, [handleAsync]);

  const getPaymentRequests = useCallback(async (status?: string) => {
    const result = await handleAsync(() => mockMCPServer.getPaymentRequests(status));
    return result || [];
  }, [handleAsync]);

  const getContractors = useCallback(async (filters?: Record<string, any>) => {
    const result = await handleAsync(() => mockMCPServer.getContractors(filters));
    return result || [];
  }, [handleAsync]);

  const getQualityReports = useCallback(async (projectId?: string) => {
    const result = await handleAsync(() => mockMCPServer.getQualityReports(projectId));
    return result || [];
  }, [handleAsync]);

  const getProvinceStats = useCallback(async () => {
    const result = await handleAsync(() => mockMCPServer.getProvinceStats());
    return result || [];
  }, [handleAsync]);

  // Write operations
  const createProject = useCallback(async (input: CreateProjectInput) => {
    return handleResponse(() => mockMCPServer.createProject(input));
  }, [handleResponse]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    return handleResponse(() => mockMCPServer.updateProject(id, updates));
  }, [handleResponse]);

  const allocateBudget = useCallback(async (input: AllocateBudgetInput) => {
    return handleResponse(() => mockMCPServer.allocateBudget(input));
  }, [handleResponse]);

  const decidePolicy = useCallback(async (input: PolicyDecisionInput) => {
    return handleResponse(() => mockMCPServer.decidePolicy(input));
  }, [handleResponse]);

  const processPayment = useCallback(async (input: PaymentProcessInput) => {
    return handleResponse(() => mockMCPServer.processPayment(input));
  }, [handleResponse]);

  // Validation
  const validateProjectSize = useCallback(async (
    level: GovernmentLevel,
    size: ProjectSize,
    budget: number
  ) => {
    return handleAsync(() => mockMCPServer.validateProjectSize(level, size, budget), false);
  }, [handleAsync]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(() => ({
    loading,
    error,
    getNationalStats,
    getProjects,
    getProjectById,
    getAllocations,
    getPolicies,
    getPaymentRequests,
    getContractors,
    getQualityReports,
    getProvinceStats,
    createProject,
    updateProject,
    allocateBudget,
    decidePolicy,
    processPayment,
    validateProjectSize,
    clearError,
  }), [
    loading,
    error,
    getNationalStats,
    getProjects,
    getProjectById,
    getAllocations,
    getPolicies,
    getPaymentRequests,
    getContractors,
    getQualityReports,
    getProvinceStats,
    createProject,
    updateProject,
    allocateBudget,
    decidePolicy,
    processPayment,
    validateProjectSize,
    clearError,
  ]);
}

// Convenience hook for loading data with automatic refresh
export function useMCPData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, ...deps]);

  return { data, loading, error, refresh };
}