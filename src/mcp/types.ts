// @/mcp/types.ts
export type GovernmentLevel = 'CENTRAL' | 'PROVINCIAL' | 'LOCAL';
export type ProjectSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type RecipientType = 'PROVINCE' | 'LOCAL_UNIT' | 'MINISTRY';
export type PolicyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';

export interface NationalStats {
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  delayedProjects: number;
  totalContractors: number;
  provinces: number;
  localUnits: number;
}

export interface ContractorInfo {
  id: string;
  name: string;
  company: string;
  rating: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  size: ProjectSize;
  createdBy: GovernmentLevel;
  spentAmount: number;
  status: ProjectStatus;
  priority: Priority;
  province: string;
  localUnit: string;
  contractor?: ContractorInfo;
  progress: number;
  startDate: string;
  endDate: string;
}

export interface BudgetAllocation {
  id: string;
  recipient: string;
  recipientType: RecipientType;
  amount: number;
  purpose: string;
  status: string;
  fiscalYear: string;
  allocatedDate: string;
  allocatedBy?: string;
}

export interface PolicyDecision {
  id: string;
  title: string;
  description: string;
  category: string;
  status: PolicyStatus;
  proposedBy: string;
  proposedDate: string;
  impact: string;
  decidedBy?: string;
  decidedDate?: string;
}

export interface PaymentRequest {
  id: string;
  projectId: string;
  projectName: string;
  requester: string;
  amount: number;
  purpose: string;
  status: PaymentStatus;
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  rating: number;
  completedProjects: number;
  ongoingProjects: number;
  specialization: string;
  verified: boolean;
  registeredDate: string;
}

export interface QualityReport {
  id: string;
  projectId: string;
  projectName: string;
  inspectorName: string;
  inspectionDate: string;
  status: 'PASSED' | 'FAILED' | 'NEEDS_IMPROVEMENT';
  findings: string;
  recommendations: string;
}

export interface ProvinceStats {
  name: string;
  projects: number;
  utilization: number;
  completion: number;
  budget: number;
  spent: number;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  budget: number;
  size: ProjectSize;
  priority: Priority;
  province: string;
  localUnit: string;
  startDate: string;
  endDate: string;
  createdBy: GovernmentLevel;
  createdById: string;
}

export interface AllocateBudgetInput {
  recipient: string;
  recipientType: RecipientType;
  amount: number;
  purpose: string;
  fiscalYear: string;
  allocatedBy: string;
}

export interface PolicyDecisionInput {
  policyId: string;
  status: 'APPROVED' | 'REJECTED';
  decidedBy: string;
}

export interface PaymentProcessInput {
  paymentId: string;
  status: 'APPROVED' | 'REJECTED';
  approvedBy: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}