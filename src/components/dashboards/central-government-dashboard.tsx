'use client';

import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { 
  Wallet, FileText, ClipboardList, DollarSign, LogOut, Plus, FileCheck, 
  Calendar, UserPlus, Star, Building2, TrendingUp, Shield, AlertTriangle,
  CheckCircle, XCircle, Eye, BarChart3, MapPin, Users, Briefcase,
  Landmark, PieChart, ArrowUpRight, ArrowDownRight, Clock, ThumbsUp, ThumbsDown
} from 'lucide-react';

// User roles for Central Government
type CentralGovRole = 'PM' | 'FINANCE_MINISTRY' | 'INFRASTRUCTURE_MINISTRY';

interface User {
  id: string;
  name: string;
  role: CentralGovRole;
  ministry?: string;
}

interface Props {
  user?: User;
  onLogout?: () => void;
}

interface NationalStats {
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

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  spentAmount: number;
  status: string;
  priority: string;
  province: string;
  localUnit: string;
  contractor?: {
    name: string;
    company: string;
    rating: number;
  };
  progress: number;
  startDate: string;
  endDate: string;
  size: string;
}

interface BudgetAllocation {
  id: string;
  recipient: string;
  recipientType: 'PROVINCE' | 'LOCAL_UNIT' | 'MINISTRY';
  amount: number;
  purpose: string;
  status: string;
  fiscalYear: string;
  allocatedDate: string;
}

interface PolicyDecision {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proposedBy: string;
  proposedDate: string;
  impact: string;
}

export default function CentralGovernmentDashboard({ user, onLogout }: Props) {
  // Default user for demo purposes
  const defaultUser: User = {
    id: '1',
    name: 'Demo User',
    role: 'PM',
    ministry: 'Prime Minister Office'
  };
  
  const currentUser = user || defaultUser;
  const handleLogout = onLogout || (() => console.log('Logout clicked'));
  
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<CentralGovRole>(currentUser.role);
  const [nationalStats, setNationalStats] = useState<NationalStats>({
    totalBudget: 0,
    allocatedBudget: 0,
    spentBudget: 0,
    totalProjects: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    delayedProjects: 0,
    totalContractors: 0,
    provinces: 7,
    localUnits: 753
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
  const [policyDecisions, setPolicyDecisions] = useState<PolicyDecision[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [qualityReports, setQualityReports] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailModalOpen, setProjectDetailModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const [allocationForm, setAllocationForm] = useState({
    recipient: '',
    recipientType: 'PROVINCE' as const,
    amount: '',
    purpose: '',
    fiscalYear: '2080/81'
  });

  const [policyForm, setPolicyForm] = useState({
    title: '',
    description: '',
    category: 'INFRASTRUCTURE',
    impact: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check if running in development/demo mode
      const isDemoMode = true; // Set to false when you have real API endpoints
      
      if (isDemoMode) {
        // Use demo data directly
        throw new Error('Demo mode - using static data');
      }

      const [statsRes, projectsRes, allocationsRes, policiesRes, paymentsRes, qualityRes, contractorsRes] = await Promise.all([
        fetch('/api/central/stats'),
        fetch('/api/central/projects'),
        fetch('/api/central/allocations'),
        fetch('/api/central/policies'),
        fetch('/api/central/payments'),
        fetch('/api/central/quality-reports'),
        fetch('/api/contractors')
      ]);

      // Check if responses are ok
      if (!statsRes.ok) throw new Error('Stats API failed');
      if (!projectsRes.ok) throw new Error('Projects API failed');

      const statsData = await statsRes.json();
      const projectsData = await projectsRes.json();
      const allocationsData = await allocationsRes.json();
      const policiesData = await policiesRes.json();
      const paymentsData = await paymentsRes.json();
      const qualityData = await qualityRes.json();
      const contractorsData = await contractorsRes.json();

      setNationalStats(statsData.stats || nationalStats);
      setProjects(projectsData.projects || []);
      setBudgetAllocations(allocationsData.allocations || []);
      setPolicyDecisions(policiesData.policies || []);
      setPaymentRequests(paymentsData.payments || []);
      setQualityReports(qualityData.reports || []);
      setContractors(contractorsData.contractors || []);
    } catch (err) {
      console.error('Failed to load dashboard data, using demo data:', err);
      // Set demo data for preview
      setNationalStats({
        totalBudget: 500000000000,
        allocatedBudget: 350000000000,
        spentBudget: 180000000000,
        totalProjects: 1250,
        completedProjects: 420,
        ongoingProjects: 680,
        delayedProjects: 150,
        totalContractors: 856,
        provinces: 7,
        localUnits: 753
      });
      
      setProjects([
        {
          id: '1',
          title: 'Kathmandu-Terai Fast Track',
          description: 'Major highway connecting Kathmandu to Terai region',
          budget: 15000000000,
          spentAmount: 8500000000,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          province: 'Bagmati',
          localUnit: 'Multiple',
          contractor: { name: 'ABC Construction', company: 'ABC Infra Pvt Ltd', rating: 4.5 },
          progress: 56,
          startDate: '2022-01-15',
          endDate: '2025-12-31',
          size: 'LARGE'
        },
        {
          id: '2',
          title: 'Pokhara International Airport Phase 2',
          description: 'Expansion of Pokhara International Airport',
          budget: 8000000000,
          spentAmount: 2000000000,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          province: 'Gandaki',
          localUnit: 'Pokhara Metropolitan',
          contractor: { name: 'XYZ Builders', company: 'XYZ Construction', rating: 4.2 },
          progress: 25,
          startDate: '2023-06-01',
          endDate: '2026-06-30',
          size: 'LARGE'
        }
      ]);

      setBudgetAllocations([
        {
          id: '1',
          recipient: 'Bagmati Province',
          recipientType: 'PROVINCE',
          amount: 50000000000,
          purpose: 'Infrastructure Development',
          status: 'ALLOCATED',
          fiscalYear: '2080/81',
          allocatedDate: '2023-07-16'
        },
        {
          id: '2',
          recipient: 'Kathmandu Metropolitan',
          recipientType: 'LOCAL_UNIT',
          amount: 5000000000,
          purpose: 'Urban Development',
          status: 'ALLOCATED',
          fiscalYear: '2080/81',
          allocatedDate: '2023-07-20'
        }
      ]);

      setPolicyDecisions([
        {
          id: '1',
          title: 'National Road Safety Policy 2080',
          description: 'Comprehensive policy for improving road safety standards',
          category: 'INFRASTRUCTURE',
          status: 'PENDING',
          proposedBy: 'Ministry of Infrastructure',
          proposedDate: '2023-10-15',
          impact: 'All road construction projects nationwide'
        }
      ]);

      setPaymentRequests([
        {
          id: '1',
          project: 'Kathmandu-Terai Fast Track',
          requester: 'Bagmati Province',
          amount: 500000000,
          purpose: 'Phase 3 Construction',
          status: 'PENDING',
          requestDate: '2024-01-10'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/central/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...allocationForm,
          amount: parseFloat(allocationForm.amount),
          allocatedBy: currentUser.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Budget allocated successfully!');
        setAllocationModalOpen(false);
        setAllocationForm({
          recipient: '',
          recipientType: 'PROVINCE',
          amount: '',
          purpose: '',
          fiscalYear: '2080/81'
        });
        await loadDashboardData();
      } else {
        alert(result.error || 'Failed to allocate budget');
      }
    } catch (error) {
      console.error('Allocation error:', error);
      alert('Failed to allocate budget. Please try again.');
    }
  };

  const handlePolicyDecision = async (policyId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/central/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision, decidedBy: currentUser.id })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Policy ${decision.toLowerCase()} successfully!`);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Policy decision error:', error);
    }
  };

  const handlePaymentApproval = async (paymentId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/central/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: approved ? 'APPROVED' : 'REJECTED',
          approvedBy: currentUser.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Payment ${approved ? 'approved' : 'rejected'} successfully!`);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Payment approval error:', error);
    }
  };

  const getRoleIcon = (role: CentralGovRole) => {
    switch (role) {
      case 'PM': return <Landmark className="h-6 w-6 text-white" />;
      case 'FINANCE_MINISTRY': return <DollarSign className="h-6 w-6 text-white" />;
      case 'INFRASTRUCTURE_MINISTRY': return <Building2 className="h-6 w-6 text-white" />;
    }
  };

  const getRoleTitle = (role: CentralGovRole) => {
    switch (role) {
      case 'PM': return 'Prime Minister Office';
      case 'FINANCE_MINISTRY': return 'Ministry of Finance';
      case 'INFRASTRUCTURE_MINISTRY': return 'Ministry of Infrastructure Development';
    }
  };

  const getRoleColor = (role: CentralGovRole) => {
    switch (role) {
      case 'PM': return 'from-purple-600 to-indigo-600';
      case 'FINANCE_MINISTRY': return 'from-green-600 to-emerald-600';
      case 'INFRASTRUCTURE_MINISTRY': return 'from-blue-600 to-cyan-600';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rs. ${(amount / 1000000000).toFixed(2)} Billion`;
    } else if (amount >= 10000000) {
      return `Rs. ${(amount / 10000000).toFixed(2)} Crore`;
    } else if (amount >= 100000) {
      return `Rs. ${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `Rs. ${amount.toLocaleString()}`;
  };

  // PM Dashboard View
  const PMDashboard = () => (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
        <TabsTrigger value="overview">National Overview</TabsTrigger>
        <TabsTrigger value="projects">Priority Projects</TabsTrigger>
        <TabsTrigger value="policies">Policy Decisions</TabsTrigger>
        <TabsTrigger value="provinces">Provincial Status</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total National Budget</CardTitle>
              <Wallet className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(nationalStats.totalBudget)}</div>
              <p className="text-xs text-purple-200 mt-1">FY 2080/81</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Projects</CardTitle>
              <ClipboardList className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nationalStats.totalProjects.toLocaleString()}</div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-green-200">{nationalStats.completedProjects} completed</span>
                <span className="text-xs text-green-200">• {nationalStats.ongoingProjects} ongoing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Active Contractors</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nationalStats.totalContractors.toLocaleString()}</div>
              <p className="text-xs text-blue-200 mt-1">Across {nationalStats.provinces} provinces</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Delayed Projects</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nationalStats.delayedProjects}</div>
              <p className="text-xs text-amber-200 mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Budget Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Allocated</span>
                    <span>{formatCurrency(nationalStats.allocatedBudget)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${(nationalStats.allocatedBudget / nationalStats.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spent</span>
                    <span>{formatCurrency(nationalStats.spentBudget)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full" 
                      style={{ width: `${(nationalStats.spentBudget / nationalStats.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Remaining</span>
                    <span>{formatCurrency(nationalStats.totalBudget - nationalStats.spentBudget)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-amber-600 h-3 rounded-full" 
                      style={{ width: `${((nationalStats.totalBudget - nationalStats.spentBudget) / nationalStats.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Project Status Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{nationalStats.completedProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Ongoing</span>
                  </div>
                  <span className="font-bold text-blue-600">{nationalStats.ongoingProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Delayed</span>
                  </div>
                  <span className="font-bold text-amber-600">{nationalStats.delayedProjects}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="projects">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              National Priority Projects
            </CardTitle>
            <CardDescription>High priority infrastructure projects across Nepal</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No projects found</div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <Badge variant={project.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                            {project.priority}
                          </Badge>
                          <Badge variant="outline">{project.size}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-gray-500">Budget</div>
                            <div className="font-medium">{formatCurrency(project.budget)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Spent</div>
                            <div className="font-medium">{formatCurrency(project.spentAmount)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Province</div>
                            <div className="font-medium">{project.province}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Contractor</div>
                            <div className="font-medium">{project.contractor?.name || 'Not assigned'}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${project.progress >= 75 ? 'bg-green-600' : project.progress >= 50 ? 'bg-blue-600' : 'bg-amber-600'}`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setProjectDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="policies">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Pending Policy Decisions
            </CardTitle>
            <CardDescription>Review and approve policy proposals</CardDescription>
          </CardHeader>
          <CardContent>
            {policyDecisions.filter(p => p.status === 'PENDING').length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending policy decisions</div>
            ) : (
              <div className="space-y-4">
                {policyDecisions.filter(p => p.status === 'PENDING').map((policy) => (
                  <div key={policy.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{policy.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{policy.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-gray-500">Category</div>
                            <Badge variant="outline">{policy.category}</Badge>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Proposed By</div>
                            <div className="text-sm">{policy.proposedBy}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Date</div>
                            <div className="text-sm">{new Date(policy.proposedDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Impact</div>
                          <div className="text-sm">{policy.impact}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePolicyDecision(policy.id, 'APPROVED')}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="danger"
                          onClick={() => handlePolicyDecision(policy.id, 'REJECTED')}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="provinces">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Provincial Performance
            </CardTitle>
            <CardDescription>Budget utilization and project status by province</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'].map((province, index) => (
                <div key={province} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold">{province} Province</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Projects</span>
                      <span>{Math.floor(Math.random() * 200) + 50}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget Utilized</span>
                      <span>{Math.floor(Math.random() * 40) + 40}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completion Rate</span>
                      <span>{Math.floor(Math.random() * 30) + 30}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  // Finance Ministry Dashboard View
  const FinanceMinistryDashboard = () => (
    <Tabs defaultValue="budget" className="space-y-6">
      <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
        <TabsTrigger value="budget">Budget Management</TabsTrigger>
        <TabsTrigger value="allocations">Fund Allocations</TabsTrigger>
        <TabsTrigger value="payments">Payment Approvals</TabsTrigger>
        <TabsTrigger value="reports">Financial Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="budget">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Budget</CardTitle>
              <Wallet className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(nationalStats.totalBudget)}</div>
              <p className="text-xs text-green-200 mt-1">National Infrastructure Budget</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Allocated</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(nationalStats.allocatedBudget)}</div>
              <p className="text-xs text-blue-200 mt-1">
                {((nationalStats.allocatedBudget / nationalStats.totalBudget) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Disbursed</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(nationalStats.spentBudget)}</div>
              <p className="text-xs text-purple-200 mt-1">
                {((nationalStats.spentBudget / nationalStats.allocatedBudget) * 100).toFixed(1)}% utilized
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Unallocated</CardTitle>
              <PieChart className="h-4 w-4 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(nationalStats.totalBudget - nationalStats.allocatedBudget)}</div>
              <p className="text-xs text-amber-200 mt-1">Available for allocation</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Budget Overview
              </CardTitle>
              <CardDescription>National infrastructure budget distribution</CardDescription>
            </div>
            <Button onClick={() => setAllocationModalOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Allocate Budget
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Provincial Allocation</h4>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(nationalStats.allocatedBudget * 0.6)}</p>
                  <p className="text-xs text-gray-500 mt-1">60% of allocated budget</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Local Unit Allocation</h4>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(nationalStats.allocatedBudget * 0.3)}</p>
                  <p className="text-xs text-gray-500 mt-1">30% of allocated budget</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Central Projects</h4>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(nationalStats.allocatedBudget * 0.1)}</p>
                  <p className="text-xs text-gray-500 mt-1">10% of allocated budget</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="allocations">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Budget Allocations
            </CardTitle>
            <CardDescription>Track all budget allocations to provinces and local units</CardDescription>
          </CardHeader>
          <CardContent>
            {budgetAllocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No allocations yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscal Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {budgetAllocations.map((allocation) => (
                      <tr key={allocation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{allocation.recipient}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{allocation.recipientType}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(allocation.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{allocation.purpose}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{allocation.fiscalYear}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={allocation.status === 'ALLOCATED' ? 'default' : 'secondary'}>
                            {allocation.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Payment Approval Requests
            </CardTitle>
            <CardDescription>Review and approve payment requests from provinces and local units</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending payment requests</div>
            ) : (
              <div className="space-y-4">
                {paymentRequests.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{payment.project}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{payment.requester}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <div className="text-xs text-gray-500">Amount</div>
                            <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Purpose</div>
                            <div className="text-sm">{payment.purpose}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePaymentApproval(payment.id, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="danger"
                          onClick={() => handlePaymentApproval(payment.id, false)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Financial Reports
            </CardTitle>
            <CardDescription>Generate and view financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <FileText className="h-6 w-6 mb-2" />
                <span>Monthly Expenditure Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <PieChart className="h-6 w-6 mb-2" />
                <span>Budget Allocation Summary</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Provincial Utilization Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <ClipboardList className="h-6 w-6 mb-2" />
                <span>Audit Trail Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <DollarSign className="h-6 w-6 mb-2" />
                <span>Payment History</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>Yearly Comparison</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  // Infrastructure Ministry Dashboard View
  const InfrastructureMinistryDashboard = () => (
    <Tabs defaultValue="projects" className="space-y-6">
      <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
        <TabsTrigger value="projects">All Projects</TabsTrigger>
        <TabsTrigger value="quality">Quality Monitoring</TabsTrigger>
        <TabsTrigger value="contractors">Contractor Management</TabsTrigger>
        <TabsTrigger value="standards">Standards & Guidelines</TabsTrigger>
      </TabsList>

      <TabsContent value="projects">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nationalStats.totalProjects}</div>
              <p className="text-xs text-gray-500 mt-1">Across all provinces</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{nationalStats.completedProjects}</div>
              <p className="text-xs text-gray-500 mt-1">
                {((nationalStats.completedProjects / nationalStats.totalProjects) * 100).toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{nationalStats.ongoingProjects}</div>
              <p className="text-xs text-gray-500 mt-1">Active construction</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delayed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{nationalStats.delayedProjects}</div>
              <p className="text-xs text-gray-500 mt-1">Require intervention</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Infrastructure Projects
            </CardTitle>
            <CardDescription>Monitor all infrastructure projects nationwide</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No projects found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contractor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-xs text-gray-500">{project.size}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{project.province}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{project.contractor?.name || 'Not assigned'}</div>
                          {project.contractor?.rating && (
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {project.contractor.rating}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(project.budget)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${project.progress >= 75 ? 'bg-green-600' : project.progress >= 50 ? 'bg-blue-600' : 'bg-amber-600'}`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={project.status === 'COMPLETED' ? 'default' : project.status === 'DELAYED' ? 'destructive' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quality">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Quality Monitoring Reports
            </CardTitle>
            <CardDescription>Review quality assessments and compliance reports</CardDescription>
          </CardHeader>
          <CardContent>
            {qualityReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No quality reports available</p>
                <p className="text-sm">Quality reports from field inspections will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qualityReports.map((report: any) => (
                  <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{report.projectName}</h4>
                        <p className="text-sm text-gray-600">{report.inspectorName}</p>
                      </div>
                      <Badge variant={report.status === 'PASSED' ? 'default' : 'destructive'}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contractors">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Registered Contractors
            </CardTitle>
            <CardDescription>Manage and monitor contractor performance nationwide</CardDescription>
          </CardHeader>
          <CardContent>
            {contractors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No contractors registered</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractors.map((contractor: any) => (
                  <div key={contractor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{contractor.name}</h4>
                        <p className="text-sm text-gray-600">{contractor.company}</p>
                      </div>
                      {contractor.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{contractor.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-sm text-gray-500">({contractor.completedProjects || 0} projects)</span>
                      </div>
                      {contractor.specialization && (
                        <p className="text-sm text-gray-500">
                          Specialization: {contractor.specialization}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Performance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="standards">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Standards & Guidelines
            </CardTitle>
            <CardDescription>Infrastructure development standards and technical guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Road Construction Standards
                </h4>
                <p className="text-sm text-gray-600 mt-1">National standards for road construction and maintenance</p>
                <Button variant="ghost" className="px-0 mt-2">Download PDF</Button>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Building Construction Code
                </h4>
                <p className="text-sm text-gray-600 mt-1">Nepal National Building Code requirements</p>
                <Button variant="ghost" className="px-0 mt-2">Download PDF</Button>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Bridge Design Guidelines
                </h4>
                <p className="text-sm text-gray-600 mt-1">Technical specifications for bridge construction</p>
                <Button variant="ghost" className="px-0 mt-2">Download PDF</Button>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Environmental Compliance
                </h4>
                <p className="text-sm text-gray-600 mt-1">Environmental impact assessment requirements</p>
                <Button variant="ghost" className="px-0 mt-2">Download PDF</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  // Render based on role
  const renderDashboard = () => {
    switch (activeRole) {
      case 'PM':
        return <PMDashboard />;
      case 'FINANCE_MINISTRY':
        return <FinanceMinistryDashboard />;
      case 'INFRASTRUCTURE_MINISTRY':
        return <InfrastructureMinistryDashboard />;
      default:
        return <PMDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getRoleColor(activeRole)}`}>
                {getRoleIcon(activeRole)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Central Government Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{getRoleTitle(activeRole)} • {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Role Switcher for Demo */}
              <Select value={activeRole} onValueChange={(value) => setActiveRole(value as CentralGovRole)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Switch Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PM">Prime Minister</SelectItem>
                  <SelectItem value="FINANCE_MINISTRY">Ministry of Finance</SelectItem>
                  <SelectItem value="INFRASTRUCTURE_MINISTRY">Ministry of Infrastructure</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {renderDashboard()}
      </main>

      {/* Budget Allocation Modal */}
      <Dialog open={allocationModalOpen} onOpenChange={setAllocationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Budget</DialogTitle>
            <DialogDescription>
              Allocate budget to provinces or local units
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAllocateBudget} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipientType">Recipient Type</Label>
              <Select
                value={allocationForm.recipientType}
                onValueChange={(value) => setAllocationForm({ ...allocationForm, recipientType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROVINCE">Province</SelectItem>
                  <SelectItem value="LOCAL_UNIT">Local Unit</SelectItem>
                  <SelectItem value="MINISTRY">Ministry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Name</Label>
              <Input
                id="recipient"
                value={allocationForm.recipient}
                onChange={(e) => setAllocationForm({ ...allocationForm, recipient: e.target.value })}
                placeholder="e.g., Bagmati Province"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rs.)</Label>
              <Input
                id="amount"
                type="number"
                value={allocationForm.amount}
                onChange={(e) => setAllocationForm({ ...allocationForm, amount: e.target.value })}
                placeholder="1000000000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={allocationForm.purpose}
                onChange={(e) => setAllocationForm({ ...allocationForm, purpose: e.target.value })}
                placeholder="e.g., Infrastructure Development"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year</Label>
              <Select
                value={allocationForm.fiscalYear}
                onValueChange={(value) => setAllocationForm({ ...allocationForm, fiscalYear: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2080/81">2080/81</SelectItem>
                  <SelectItem value="2081/82">2081/82</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAllocationModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Allocate Budget
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Detail Modal */}
      <Dialog open={projectDetailModalOpen} onOpenChange={setProjectDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription>
              Project details and progress
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Budget</Label>
                  <p className="font-medium">{formatCurrency(selectedProject.budget)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Spent</Label>
                  <p className="font-medium">{formatCurrency(selectedProject.spentAmount)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Province</Label>
                  <p className="font-medium">{selectedProject.province}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Local Unit</Label>
                  <p className="font-medium">{selectedProject.localUnit}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Start Date</Label>
                  <p className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">End Date</Label>
                  <p className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="text-sm mt-1">{selectedProject.description}</p>
              </div>
              
              <div>
                <Label className="text-gray-500">Contractor</Label>
                {selectedProject.contractor ? (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">{selectedProject.contractor.name}</p>
                    <span className="text-sm text-gray-500">({selectedProject.contractor.company})</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedProject.contractor.rating}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Not assigned</p>
                )}
              </div>
              
              <div>
                <Label className="text-gray-500">Progress</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${selectedProject.progress >= 75 ? 'bg-green-600' : selectedProject.progress >= 50 ? 'bg-blue-600' : 'bg-amber-600'}`}
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{selectedProject.progress}%</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}