// @/mcp/mockServer.ts
// Mock MCP Server for development/demo purposes
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

// Mock data store
const mockData = {
  nationalStats: {
    totalBudget: 150000000000,
    allocatedBudget: 100000000000,
    spentBudget: 45000000000,
    totalProjects: 1247,
    completedProjects: 342,
    ongoingProjects: 765,
    delayedProjects: 140,
    totalContractors: 523,
    provinces: 7,
    localUnits: 753,
  } as NationalStats,

  projects: [
    {
      id: '1',
      title: 'Kathmandu-Terai Fast Track',
      description: 'High-speed highway connecting Kathmandu to southern plains',
      budget: 45000000000,
      size: 'LARGE' as ProjectSize,
      createdBy: 'CENTRAL' as GovernmentLevel,
      spentAmount: 28000000000,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      province: 'Bagmati',
      localUnit: 'Multiple Districts',
      progress: 62,
      startDate: '2021-01-15',
      endDate: '2025-12-31',
      contractor: {
        id: 'c1',
        name: 'Ram Kumar Shrestha',
        company: 'Nepal Infrastructure Corp',
        rating: 4.5,
      },
    },
    {
      id: '2',
      title: 'Pokhara International Airport',
      description: 'International airport development project',
      budget: 25000000000,
      size: 'LARGE' as ProjectSize,
      createdBy: 'CENTRAL' as GovernmentLevel,
      spentAmount: 25000000000,
      status: 'COMPLETED',
      priority: 'HIGH',
      province: 'Gandaki',
      localUnit: 'Pokhara Metropolitan',
      progress: 100,
      startDate: '2016-04-01',
      endDate: '2023-01-01',
      contractor: {
        id: 'c2',
        name: 'Sita Devi Tamang',
        company: 'China CAMC Engineering',
        rating: 4.2,
      },
    },
    {
      id: '3',
      title: 'Melamchi Water Supply Phase 2',
      description: 'Expansion of Melamchi water supply to additional areas',
      budget: 8000000000,
      size: 'MEDIUM' as ProjectSize,
      createdBy: 'CENTRAL' as GovernmentLevel,
      spentAmount: 3200000000,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      province: 'Bagmati',
      localUnit: 'Kathmandu Valley',
      progress: 40,
      startDate: '2022-06-01',
      endDate: '2026-06-01',
      contractor: {
        id: 'c3',
        name: 'Hari Prasad Gautam',
        company: 'Sino Hydro Nepal',
        rating: 4.0,
      },
    },
  ] as Project[],

  allocations: [
    {
      id: '1',
      recipient: 'Bagmati Province',
      recipientType: 'PROVINCE',
      amount: 50000000000,
      purpose: 'Infrastructure Development',
      status: 'ALLOCATED',
      fiscalYear: '2080/81',
      allocatedDate: '2023-07-16',
      allocatedBy: 'admin',
    },
    {
      id: '2',
      recipient: 'Kathmandu Metropolitan',
      recipientType: 'LOCAL_UNIT',
      amount: 5000000000,
      purpose: 'Urban Development',
      status: 'ALLOCATED',
      fiscalYear: '2080/81',
      allocatedDate: '2023-07-20',
      allocatedBy: 'admin',
    },
    {
      id: '3',
      recipient: 'Gandaki Province',
      recipientType: 'PROVINCE',
      amount: 25000000000,
      purpose: 'Road Infrastructure',
      status: 'ALLOCATED',
      fiscalYear: '2080/81',
      allocatedDate: '2023-08-01',
      allocatedBy: 'admin',
    },
  ] as BudgetAllocation[],

  policies: [
    {
      id: '1',
      title: 'National Road Safety Policy 2080',
      description: 'Comprehensive policy for improving road safety standards across all infrastructure projects',
      category: 'INFRASTRUCTURE',
      status: 'PENDING',
      proposedBy: 'Ministry of Infrastructure',
      proposedDate: '2023-10-15',
      impact: 'All road construction projects nationwide',
    },
    {
      id: '2',
      title: 'Green Building Standards 2080',
      description: 'Mandatory environmental standards for all new government buildings',
      category: 'ENVIRONMENT',
      status: 'PENDING',
      proposedBy: 'Ministry of Environment',
      proposedDate: '2023-11-01',
      impact: 'All government building projects',
    },
    {
      id: '3',
      title: 'Digital Infrastructure Policy',
      description: 'Policy for mandatory digital systems in all infrastructure monitoring',
      category: 'TECHNOLOGY',
      status: 'APPROVED',
      proposedBy: 'Ministry of Communications',
      proposedDate: '2023-09-01',
      impact: 'All new infrastructure projects',
      decidedBy: 'PM Office',
      decidedDate: '2023-10-01',
    },
  ] as PolicyDecision[],

  paymentRequests: [
    {
      id: '1',
      projectId: '1',
      projectName: 'Kathmandu-Terai Fast Track',
      requester: 'Bagmati Province',
      amount: 500000000,
      purpose: 'Phase 3 Construction Materials',
      status: 'PENDING',
      requestDate: '2024-01-10',
    },
    {
      id: '2',
      projectId: '3',
      projectName: 'Melamchi Water Supply Phase 2',
      requester: 'Kathmandu Metropolitan',
      amount: 200000000,
      purpose: 'Pipeline Installation',
      status: 'PENDING',
      requestDate: '2024-01-15',
    },
  ] as PaymentRequest[],

  contractors: [
    {
      id: 'c1',
      name: 'Ram Kumar Shrestha',
      company: 'Nepal Infrastructure Corp',
      email: 'ram@nepinfra.com',
      phone: '+977-1-4444444',
      rating: 4.5,
      completedProjects: 15,
      ongoingProjects: 3,
      specialization: 'Road Construction',
      verified: true,
      registeredDate: '2018-01-15',
    },
    {
      id: 'c2',
      name: 'Sita Devi Tamang',
      company: 'Himalayan Builders',
      email: 'sita@himalayan.com',
      phone: '+977-1-5555555',
      rating: 4.2,
      completedProjects: 22,
      ongoingProjects: 5,
      specialization: 'Building Construction',
      verified: true,
      registeredDate: '2015-06-20',
    },
    {
      id: 'c3',
      name: 'Hari Prasad Gautam',
      company: 'Nepal Construction Group',
      email: 'hari@ncg.com',
      phone: '+977-1-6666666',
      rating: 4.0,
      completedProjects: 8,
      ongoingProjects: 2,
      specialization: 'Water Supply',
      verified: true,
      registeredDate: '2020-03-10',
    },
  ] as Contractor[],

  qualityReports: [
    {
      id: 'qr1',
      projectId: '1',
      projectName: 'Kathmandu-Terai Fast Track',
      inspectorName: 'Er. Krishna Sharma',
      inspectionDate: '2024-01-05',
      status: 'PASSED',
      findings: 'Road base construction meets standards. Proper drainage systems installed.',
      recommendations: 'Continue monitoring during monsoon season.',
    },
    {
      id: 'qr2',
      projectId: '3',
      projectName: 'Melamchi Water Supply Phase 2',
      inspectorName: 'Er. Maya Rai',
      inspectionDate: '2024-01-08',
      status: 'NEEDS_IMPROVEMENT',
      findings: 'Some pipeline joints need reinforcement.',
      recommendations: 'Re-inspect joints before pressure testing.',
    },
  ] as QualityReport[],

  provinceStats: [
    { name: 'Koshi', projects: 156, utilization: 65, completion: 42, budget: 15000000000, spent: 9750000000 },
    { name: 'Madhesh', projects: 189, utilization: 58, completion: 35, budget: 18000000000, spent: 10440000000 },
    { name: 'Bagmati', projects: 245, utilization: 72, completion: 48, budget: 30000000000, spent: 21600000000 },
    { name: 'Gandaki', projects: 134, utilization: 61, completion: 39, budget: 12000000000, spent: 7320000000 },
    { name: 'Lumbini', projects: 178, utilization: 55, completion: 32, budget: 16000000000, spent: 8800000000 },
    { name: 'Karnali', projects: 98, utilization: 48, completion: 28, budget: 10000000000, spent: 4800000000 },
    { name: 'Sudurpashchim', projects: 112, utilization: 52, completion: 31, budget: 11000000000, spent: 5720000000 },
  ] as ProvinceStats[],
};

// Project size budget ranges
const PROJECT_SIZE_RANGES = {
  SMALL: { min: 1000000, max: 100000000 },
  MEDIUM: { min: 100000000, max: 5000000000 },
  LARGE: { min: 5000000000, max: 50000000000 },
};

// Allowed project sizes by government level
const ALLOWED_SIZES: Record<GovernmentLevel, ProjectSize[]> = {
  CENTRAL: ['SMALL', 'MEDIUM', 'LARGE'],
  PROVINCIAL: ['SMALL', 'MEDIUM'],
  LOCAL: ['SMALL'],
};

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockMCPServer {
  private data = { ...mockData };

  async getNationalStats(): Promise<NationalStats> {
    await delay(300);
    return this.data.nationalStats;
  }

  async getProjects(filters?: Record<string, string>): Promise<Project[]> {
    await delay(400);
    let projects = [...this.data.projects];
    
    if (filters) {
      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }
      if (filters.province) {
        projects = projects.filter(p => p.province === filters.province);
      }
      if (filters.size) {
        projects = projects.filter(p => p.size === filters.size);
      }
      if (filters.priority) {
        projects = projects.filter(p => p.priority === filters.priority);
      }
    }
    
    return projects;
  }

  async getProjectById(id: string): Promise<Project | null> {
    await delay(200);
    return this.data.projects.find(p => p.id === id) || null;
  }

  async getAllocations(filters?: Record<string, string>): Promise<BudgetAllocation[]> {
    await delay(300);
    let allocations = [...this.data.allocations];
    
    if (filters) {
      if (filters.recipientType) {
        allocations = allocations.filter(a => a.recipientType === filters.recipientType);
      }
      if (filters.fiscalYear) {
        allocations = allocations.filter(a => a.fiscalYear === filters.fiscalYear);
      }
    }
    
    return allocations;
  }

  async getPolicies(status?: string): Promise<PolicyDecision[]> {
    await delay(300);
    if (status) {
      return this.data.policies.filter(p => p.status === status);
    }
    return [...this.data.policies];
  }

  async getPaymentRequests(status?: string): Promise<PaymentRequest[]> {
    await delay(300);
    if (status) {
      return this.data.paymentRequests.filter(p => p.status === status);
    }
    return [...this.data.paymentRequests];
  }

  async getContractors(filters?: Record<string, any>): Promise<Contractor[]> {
    await delay(300);
    let contractors = [...this.data.contractors];
    
    if (filters) {
      if (filters.verified !== undefined) {
        contractors = contractors.filter(c => c.verified === filters.verified);
      }
      if (filters.specialization) {
        contractors = contractors.filter(c => 
          c.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
        );
      }
    }
    
    return contractors;
  }

  async getQualityReports(projectId?: string): Promise<QualityReport[]> {
    await delay(300);
    if (projectId) {
      return this.data.qualityReports.filter(r => r.projectId === projectId);
    }
    return [...this.data.qualityReports];
  }

  async getProvinceStats(): Promise<ProvinceStats[]> {
    await delay(300);
    return [...this.data.provinceStats];
  }

  async createProject(input: CreateProjectInput): Promise<MCPResponse<Project>> {
    await delay(500);
    
    // Validate project size for government level
    const allowedSizes = ALLOWED_SIZES[input.createdBy];
    if (!allowedSizes.includes(input.size)) {
      return {
        success: false,
        error: `${input.createdBy} government cannot create ${input.size} projects`,
      };
    }
    
    // Validate budget range
    const range = PROJECT_SIZE_RANGES[input.size];
    if (input.budget < range.min || input.budget > range.max) {
      return {
        success: false,
        error: `Budget must be between ${range.min} and ${range.max} for ${input.size} projects`,
      };
    }
    
    const newProject: Project = {
      id: `p${Date.now()}`,
      title: input.title,
      description: input.description,
      budget: input.budget,
      size: input.size,
      createdBy: input.createdBy,
      spentAmount: 0,
      status: 'PLANNING',
      priority: input.priority,
      province: input.province,
      localUnit: input.localUnit,
      progress: 0,
      startDate: input.startDate,
      endDate: input.endDate,
    };
    
    this.data.projects.push(newProject);
    this.data.nationalStats.totalProjects++;
    
    return { success: true, data: newProject };
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<MCPResponse<Project>> {
    await delay(400);
    
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Project not found' };
    }
    
    this.data.projects[index] = { ...this.data.projects[index], ...updates };
    return { success: true, data: this.data.projects[index] };
  }

  async allocateBudget(input: AllocateBudgetInput): Promise<MCPResponse<BudgetAllocation>> {
    await delay(500);
    
    const remaining = this.data.nationalStats.totalBudget - this.data.nationalStats.allocatedBudget;
    if (input.amount > remaining) {
      return { success: false, error: 'Insufficient budget available for allocation' };
    }
    
    const newAllocation: BudgetAllocation = {
      id: `a${Date.now()}`,
      recipient: input.recipient,
      recipientType: input.recipientType,
      amount: input.amount,
      purpose: input.purpose,
      status: 'ALLOCATED',
      fiscalYear: input.fiscalYear,
      allocatedDate: new Date().toISOString().split('T')[0],
      allocatedBy: input.allocatedBy,
    };
    
    this.data.allocations.push(newAllocation);
    this.data.nationalStats.allocatedBudget += input.amount;
    
    return { success: true, data: newAllocation };
  }

  async decidePolicy(input: PolicyDecisionInput): Promise<MCPResponse<PolicyDecision>> {
    await delay(400);
    
    const index = this.data.policies.findIndex(p => p.id === input.policyId);
    if (index === -1) {
      return { success: false, error: 'Policy not found' };
    }
    
    this.data.policies[index] = {
      ...this.data.policies[index],
      status: input.status,
      decidedBy: input.decidedBy,
      decidedDate: new Date().toISOString().split('T')[0],
    };
    
    return { success: true, data: this.data.policies[index] };
  }

  async processPayment(input: PaymentProcessInput): Promise<MCPResponse<PaymentRequest>> {
    await delay(400);
    
    const index = this.data.paymentRequests.findIndex(p => p.id === input.paymentId);
    if (index === -1) {
      return { success: false, error: 'Payment request not found' };
    }
    
    this.data.paymentRequests[index] = {
      ...this.data.paymentRequests[index],
      status: input.status,
      approvedBy: input.approvedBy,
      approvedDate: new Date().toISOString().split('T')[0],
    };
    
    if (input.status === 'APPROVED') {
      const payment = this.data.paymentRequests[index];
      const project = this.data.projects.find(p => p.id === payment.projectId);
      if (project) {
        project.spentAmount += payment.amount;
        this.data.nationalStats.spentBudget += payment.amount;
      }
    }
    
    return { success: true, data: this.data.paymentRequests[index] };
  }

  async validateProjectSize(
    level: GovernmentLevel,
    size: ProjectSize,
    budget: number
  ): Promise<ValidationResult> {
    await delay(200);
    
    const allowedSizes = ALLOWED_SIZES[level];
    if (!allowedSizes.includes(size)) {
      return {
        valid: false,
        message: `${level} government can only create ${allowedSizes.join(', ')} projects`,
      };
    }
    
    const range = PROJECT_SIZE_RANGES[size];
    if (budget < range.min) {
      return {
        valid: false,
        message: `Budget too low for ${size} project. Minimum: Rs. ${(range.min / 10000000).toFixed(0)} Crore`,
      };
    }
    
    if (budget > range.max) {
      return {
        valid: false,
        message: `Budget too high for ${size} project. Maximum: Rs. ${(range.max / 10000000).toFixed(0)} Crore`,
      };
    }
    
    return { valid: true, message: 'Project size and budget are valid' };
  }
}

export const mockMCPServer = new MockMCPServer();