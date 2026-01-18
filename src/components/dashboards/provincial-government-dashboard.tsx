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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Alert, AlertDescription
} from '@/components/ui/alert';
import { 
  MapPin, FileText, ClipboardList, DollarSign, LogOut, Plus, 
  Calendar, Star, Building2, TrendingUp, Shield, AlertTriangle,
  CheckCircle, Eye, Users, Briefcase,
  PieChart, ArrowUpRight, Clock, ThumbsUp, ThumbsDown,
  Info, Sparkles, Loader2, Search, Brain, TrendingDown, Wallet
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  province?: string;
  provinceId?: string;
}

interface Props {
  user?: User;
  onLogout?: () => void;
}

interface ProvinceStats {
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  delayedProjects: number;
  totalContractors: number;
  localUnits: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  createdBy: 'CENTRAL' | 'PROVINCIAL' | 'LOCAL';
  spentAmount: number;
  status: string;
  priority: string;
  province: string;
  localUnit: string;
  contractor?: {
    id?: string;
    name: string;
    company: string;
    rating: number;
  };
  progress: number;
  startDate: string;
  endDate: string;
}

interface BudgetAllocation {
  id: string;
  recipient: string;
  recipientType: 'LOCAL_UNIT' | 'MINISTRY';
  amount: number;
  purpose: string;
  status: string;
  fiscalYear: string;
  allocatedDate: string;
}

interface ContractorRating {
  overallRating: number;
  categories: {
    timeManagement: number;
    budgetAdherence: number;
    quality: number;
    safety: number;
  };
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

interface Contractor {
  id: string;
  name: string;
  company: string;
  rating: number;
  projectsCompleted: number;
  activeProjects: number;
  specialization: string;
  registrationNumber: string;
}

const getProjectSizeBudgetRange = (size: 'SMALL' | 'MEDIUM' | 'LARGE') => {
  switch (size) {
    case 'SMALL':
      return { min: 1000000, max: 100000000, label: 'Rs. 10 Lakh - 10 Crore' };
    case 'MEDIUM':
      return { min: 100000000, max: 5000000000, label: 'Rs. 10 Crore - 500 Crore' };
    case 'LARGE':
      return { min: 5000000000, max: 50000000000, label: 'Rs. 500 Crore - 5000 Crore' };
  }
};

const validateProjectBudget = (
  size: 'SMALL' | 'MEDIUM',
  budget: number
): { valid: boolean; message?: string } => {
  const range = getProjectSizeBudgetRange(size);
  
  if (budget < range.min) {
    return {
      valid: false,
      message: `Budget too low for ${size} project. Minimum: ${formatCurrency(range.min)}`
    };
  }
  
  if (budget > range.max) {
    return {
      valid: false,
      message: `Budget too high for ${size} project. Maximum: ${formatCurrency(range.max)}`
    };
  }
  
  return { valid: true };
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

export default function ProvincialGovernmentDashboard({ user, onLogout }: Props) {
  const defaultUser: User = {
    id: '1',
    name: 'jdzn',
    province: 'Madhesh Province',
    provinceId: 'madhesh'
  };
  
  const currentUser = user || defaultUser;
  const handleLogout = onLogout || (() => console.log('Logout clicked'));
  
  const [loading, setLoading] = useState(false);
  const [provinceStats] = useState<ProvinceStats>({
    totalBudget: 25000000000,
    allocatedBudget: 18000000000,
    spentBudget: 12000000000,
    totalProjects: 156,
    completedProjects: 45,
    ongoingProjects: 89,
    delayedProjects: 22,
    totalContractors: 78,
    localUnits: 108
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailModalOpen, setProjectDetailModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [contractorRatingModalOpen, setContractorRatingModalOpen] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null);
  const [contractorRating, setContractorRating] = useState<ContractorRating | null>(null);
  const [selectedContractorForRating, setSelectedContractorForRating] = useState<Contractor | null>(null);

  const [allocationForm, setAllocationForm] = useState<{
    recipient: string;
    recipientType: 'LOCAL_UNIT' | 'MINISTRY';
    amount: string;
    purpose: string;
    fiscalYear: string;
  }>({
    recipient: '',
    recipientType: 'LOCAL_UNIT',
    amount: '',
    purpose: '',
    fiscalYear: '2080/81'
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    budget: '',
    size: '' as 'SMALL' | 'MEDIUM' | 'LARGE' | '',
    priority: 'MEDIUM',
    localUnit: '',
    startDate: '',
    endDate: ''
  });

  const [projectValidationError, setProjectValidationError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      setProjects([
        {
          id: '1',
          title: 'Provincial Highway Improvement',
          description: 'Upgrading key highway sections in the province',
          budget: 3500000000,
          size: 'MEDIUM',
          createdBy: 'PROVINCIAL',
          spentAmount: 2100000000,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          province: currentUser.province || 'Madhesh Province',
          localUnit: 'Janakpur',
          progress: 60,
          startDate: '2022-07-15',
          endDate: '2025-06-30',
          contractor: {
            id: 'c1',
            name: 'Ram Kumar',
            company: 'Provincial Builders Ltd',
            rating: 4.3
          }
        },
        {
          id: '2',
          title: 'Rural Water Supply System',
          description: 'Water infrastructure for rural areas',
          budget: 850000000,
          size: 'MEDIUM',
          createdBy: 'PROVINCIAL',
          spentAmount: 850000000,
          status: 'COMPLETED',
          priority: 'HIGH',
          province: currentUser.province || 'Madhesh Province',
          localUnit: 'Birgunj',
          progress: 100,
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          contractor: {
            id: 'c2',
            name: 'Sita Devi',
            company: 'Water Works Nepal',
            rating: 4.7
          }
        },
        {
          id: '3',
          title: 'School Infrastructure Development',
          description: 'Building and renovating schools across the province',
          budget: 450000000,
          size: 'MEDIUM',
          createdBy: 'PROVINCIAL',
          spentAmount: 225000000,
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          province: currentUser.province || 'Madhesh Province',
          localUnit: 'Rajbiraj',
          progress: 50,
          startDate: '2023-01-01',
          endDate: '2024-12-31',
          contractor: {
            id: 'c3',
            name: 'Hari Prasad',
            company: 'Education Infrastructure Ltd',
            rating: 4.1
          }
        }
      ]);

      setBudgetAllocations([
        {
          id: '1',
          recipient: 'Janakpur Sub-Metropolitan',
          recipientType: 'LOCAL_UNIT',
          amount: 5000000000,
          purpose: 'Urban Development',
          status: 'ALLOCATED',
          fiscalYear: '2080/81',
          allocatedDate: '2023-08-01'
        },
        {
          id: '2',
          recipient: 'Birgunj Metropolitan',
          recipientType: 'LOCAL_UNIT',
          amount: 3500000000,
          purpose: 'Road Infrastructure',
          status: 'ALLOCATED',
          fiscalYear: '2080/81',
          allocatedDate: '2023-08-15'
        }
      ]);

      setContractors([
        {
          id: 'c1',
          name: 'Ram Kumar',
          company: 'Provincial Builders Ltd',
          rating: 4.3,
          projectsCompleted: 15,
          activeProjects: 3,
          specialization: 'Highway Construction',
          registrationNumber: 'PRV-2019-001'
        },
        {
          id: 'c2',
          name: 'Sita Devi',
          company: 'Water Works Nepal',
          rating: 4.7,
          projectsCompleted: 22,
          activeProjects: 2,
          specialization: 'Water Infrastructure',
          registrationNumber: 'PRV-2018-045'
        },
        {
          id: 'c3',
          name: 'Hari Prasad',
          company: 'Education Infrastructure Ltd',
          rating: 4.1,
          projectsCompleted: 12,
          activeProjects: 4,
          specialization: 'Building Construction',
          registrationNumber: 'PRV-2020-112'
        },
        {
          id: 'c4',
          name: 'Krishna Sharma',
          company: 'Bridge & Roads Pvt Ltd',
          rating: 4.5,
          projectsCompleted: 18,
          activeProjects: 2,
          specialization: 'Bridge Construction',
          registrationNumber: 'PRV-2017-088'
        }
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBudgetAllocation = async (allocation: typeof allocationForm) => {
    setAiLoading(true);
    setBudgetAnalysis(null);

    const amount = parseFloat(allocation.amount);
    const simulatedAnalysis = {
      feasibilityScore: amount > 10000000000 ? 65 : amount > 1000000000 ? 80 : 90,
      riskLevel: amount > 10000000000 ? "HIGH" : amount > 1000000000 ? "MEDIUM" : "LOW",
      recommendations: [
        `Ensure ${allocation.recipient} has adequate capacity`,
        "Establish milestone-based payment schedules",
        "Require quarterly progress reports",
        "Set up monitoring committee",
        "Include 10-15% contingency fund"
      ],
      potentialIssues: [
        "Possible delays in fund utilization",
        "Risk of budget reallocation if targets not met",
        "Need for technical expertise"
      ],
      benchmarkComparison: `This allocation is within normal range for provincial allocations.`,
      approvalRecommendation: amount > 10000000000 ? "APPROVE_WITH_CONDITIONS" : "APPROVE"
    };
    
    setTimeout(() => {
      setBudgetAnalysis(simulatedAnalysis);
      setAiLoading(false);
    }, 1500);
  };

  const analyzeProjectFeasibility = async (project: typeof projectForm) => {
    setAiLoading(true);
    setAiAnalysis('');
    setAiAnalysisModalOpen(true);

    const budget = parseFloat(project.budget);
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    setTimeout(() => {
      setAiAnalysis(`AI FEASIBILITY ANALYSIS

PROJECT: ${project.title}
PROVINCE: ${currentUser.province}
BUDGET: ${formatCurrency(budget)}
SIZE: ${project.size} (Provincial Authority: ✓ Approved)
TIMELINE: ${months} months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FEASIBILITY ASSESSMENT ✓
• Technical Feasibility: ${project.size === 'MEDIUM' ? 'MODERATE COMPLEXITY' : 'STRAIGHTFORWARD'}
• Financial Viability: WITHIN PROVINCIAL BUDGET
• Timeline: ${months < 24 ? 'AGGRESSIVE BUT ACHIEVABLE' : 'REALISTIC'}

2. RISK ANALYSIS ⚠️
• Budget Overrun Risk: ${budget > 2000000000 ? '15-20%' : '10-15%'}
• Coordination with local units required
• Weather delays possible
• Contractor capacity: Adequate for ${project.size} projects

3. BUDGET EVALUATION 💰
Budget Breakdown:
• Construction: 65%
• Land/Coordination: 10%
• Engineering: 10%
• Management: 5%
• Contingency: 10%

4. RECOMMENDATIONS ✅
• ${budget > 5000000000 ? 'CONDITIONAL APPROVAL' : 'APPROVED'}
• Establish Provincial Monitoring Committee
• Monthly progress reports mandatory
• Quality audits every 6 months

5. SUCCESS FACTORS 🎯
• Strong provincial coordination
• Local government participation
• Community engagement
• Transparent management

VERDICT: ${budget > 5000000000 ? '⚠️ PROCEED WITH OVERSIGHT' : '✅ RECOMMENDED FOR APPROVAL'}`);
      setAiLoading(false);
    }, 2000);
  };

  const generateContractorRating = async (contractorData: Contractor) => {
    setAiLoading(true);
    setContractorRating(null);
    setSelectedContractorForRating(contractorData);

    setTimeout(() => {
      const simulatedRating: ContractorRating = {
        overallRating: contractorData.rating || 4.2,
        categories: {
          timeManagement: 4.1,
          budgetAdherence: 4.3,
          quality: contractorData.rating || 4.2,
          safety: 4.0
        },
        strengths: [
          "Consistent project completion record",
          `Experienced in ${currentUser.province} projects`,
          "Good community relations",
          "Quality workmanship",
          "Safety compliance"
        ],
        concerns: [
          "Monitor budget adherence closely",
          "Regular safety audits recommended",
          "Documentation updates needed"
        ],
        recommendation: `RECOMMENDED for future provincial projects. Strong track record in ${currentUser.province}.`
      };
      
      setContractorRating(simulatedRating);
      setContractorRatingModalOpen(true);
      setAiLoading(false);
    }, 1500);
  };

  const searchSimilarProjects = async (projectTitle: string) => {
    setAiLoading(true);
    setAiAnalysis('');
    setAiAnalysisModalOpen(true);

    setTimeout(() => {
      setAiAnalysis(`SIMILAR PROJECTS RESEARCH: "${projectTitle}"

Provincial infrastructure projects show success with:

• Strong local government coordination
• Community participation from planning stage
• Regular monitoring and transparency
• Milestone-based contractor payments
• Environmental and social safeguards

Best practices from similar provincial projects:
✓ Early stakeholder engagement
✓ Clear communication channels
✓ Risk mitigation planning
✓ Quality control systems
✓ Timely fund releases

Use "Analyze with AI" for detailed project feasibility!`);
      setAiLoading(false);
    }, 1500);
  };

  const handleAllocateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    await analyzeBudgetAllocation(allocationForm);
  };

  const confirmBudgetAllocation = async () => {
    const newAllocation: BudgetAllocation = {
      id: Date.now().toString(),
      recipient: allocationForm.recipient,
      recipientType: allocationForm.recipientType,
      amount: parseFloat(allocationForm.amount),
      purpose: allocationForm.purpose,
      status: 'ALLOCATED',
      fiscalYear: allocationForm.fiscalYear,
      allocatedDate: new Date().toISOString().split('T')[0]
    };
    
    setBudgetAllocations([...budgetAllocations, newAllocation]);
    alert('Budget allocated successfully!');
    setAllocationModalOpen(false);
    setBudgetAnalysis(null);
    setAllocationForm({
      recipient: '',
      recipientType: 'LOCAL_UNIT',
      amount: '',
      purpose: '',
      fiscalYear: '2080/81'
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectValidationError('');

    if (!projectForm.size) {
      setProjectValidationError('Please select a project size');
      return;
    }

    if (projectForm.size === 'LARGE') {
      setProjectValidationError('Provincial Government can only create SMALL and MEDIUM projects');
      return;
    }

    const budgetValidation = validateProjectBudget(
      projectForm.size,
      parseFloat(projectForm.budget)
    );

    if (!budgetValidation.valid) {
      setProjectValidationError(budgetValidation.message || 'Invalid budget');
      return;
    }

    await analyzeProjectFeasibility(projectForm);
  };

  const confirmProjectCreation = async () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: projectForm.title,
      description: projectForm.description,
      budget: parseFloat(projectForm.budget),
      size: projectForm.size as 'SMALL' | 'MEDIUM',
      createdBy: 'PROVINCIAL',
      spentAmount: 0,
      status: 'PLANNED',
      priority: projectForm.priority,
      province: currentUser.province || 'Madhesh Province',
      localUnit: projectForm.localUnit,
      progress: 0,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate
    };

    setProjects([...projects, newProject]);
    alert('Project created successfully!');
    setCreateProjectModalOpen(false);
    setAiAnalysisModalOpen(false);
    setProjectForm({
      title: '',
      description: '',
      budget: '',
      size: '',
      priority: 'MEDIUM',
      localUnit: '',
      startDate: '',
      endDate: ''
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : star <= rating + 0.5
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Provincial Government Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {currentUser.name}</p>
                {currentUser.province && <p className="text-sm text-gray-500">{currentUser.province}</p>}
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
            <TabsTrigger value="overview">Province Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="allocations">Budget Allocations</TabsTrigger>
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Alert className="mb-6 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <AlertDescription>
                <strong className="text-indigo-900 dark:text-indigo-100">AI-Powered Features:</strong>
                <span className="text-indigo-700 dark:text-indigo-200"> Budget Analysis • Project Feasibility • Contractor Ratings</span>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-100">Province Budget</CardTitle>
                  <Wallet className="h-4 w-4 text-indigo-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(provinceStats.totalBudget)}</div>
                  <p className="text-xs text-indigo-200 mt-1">FY 2080/81</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Total Projects</CardTitle>
                  <ClipboardList className="h-4 w-4 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{provinceStats.totalProjects}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-green-200">{provinceStats.completedProjects} completed</span>
                    <span className="text-xs text-green-200">• {provinceStats.ongoingProjects} ongoing</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Local Units</CardTitle>
                  <Building2 className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{provinceStats.localUnits}</div>
                  <p className="text-xs text-blue-200 mt-1">Municipalities & Rural Municipalities</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">65%</div>
                  <p className="text-xs text-amber-200 mt-1">Above national average</p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Utilization Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-600" />
                    Budget Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Allocated</span>
                        <span>{((provinceStats.allocatedBudget / provinceStats.totalBudget) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-blue-600"
                          style={{ width: `${(provinceStats.allocatedBudget / provinceStats.totalBudget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spent</span>
                        <span>{((provinceStats.spentBudget / provinceStats.totalBudget) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-green-600"
                          style={{ width: `${(provinceStats.spentBudget / provinceStats.totalBudget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(provinceStats.allocatedBudget)}</div>
                          <div className="text-xs text-gray-500">Allocated</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(provinceStats.spentBudget)}</div>
                          <div className="text-xs text-gray-500">Spent</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                    Project Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Completed</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{provinceStats.completedProjects}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span>Ongoing</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{provinceStats.ongoingProjects}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span>Delayed</span>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{provinceStats.delayedProjects}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Provincial Authority:</strong> Can create SMALL and MEDIUM projects. LARGE projects require Central Government approval.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-indigo-600" />
                      Provincial Projects
                    </CardTitle>
                    <CardDescription>AI-powered project management</CardDescription>
                  </div>
                  <Button onClick={() => setCreateProjectModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading...
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No projects found</div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <Badge variant={project.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                                {project.priority}
                              </Badge>
                              <Badge variant="outline">{project.size}</Badge>
                              <Badge 
                                className={
                                  project.status === 'COMPLETED' ? 'bg-green-600' : 
                                  project.status === 'IN_PROGRESS' ? 'bg-blue-600' : 
                                  'bg-gray-600'
                                }
                              >
                                {project.status.replace('_', ' ')}
                              </Badge>
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
                                <div className="text-xs text-gray-500">Local Unit</div>
                                <div className="font-medium">{project.localUnit}</div>
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
                          
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => searchSimilarProjects(project.title)}
                              disabled={aiLoading}
                            >
                              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
                              Research
                            </Button>
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Budget Allocations
                    </CardTitle>
                    <CardDescription>Allocate budget to local units</CardDescription>
                  </div>
                  <Button onClick={() => setAllocationModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Allocate Budget
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {budgetAllocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No allocations yet</div>
                ) : (
                  <div className="space-y-4">
                    {budgetAllocations.map((allocation) => (
                      <div key={allocation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{allocation.recipient}</h3>
                              <Badge variant="outline">{allocation.recipientType.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{allocation.purpose}</p>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <div className="text-xs text-gray-500">Amount</div>
                                <div className="font-medium text-green-600">{formatCurrency(allocation.amount)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Fiscal Year</div>
                                <div className="text-sm">{allocation.fiscalYear}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Status</div>
                                <Badge className="bg-green-600">{allocation.status}</Badge>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Allocated on: {new Date(allocation.allocatedDate).toLocaleDateString()}
                            </div>
                          </div>
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
                  <Brain className="h-5 w-5 text-indigo-600" />
                  AI-Powered Contractor Ratings
                </CardTitle>
                <CardDescription>Generate comprehensive AI analysis for contractors working in your province</CardDescription>
              </CardHeader>
              <CardContent>
                {contractors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No contractors found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contractors.map((contractor) => (
                      <div key={contractor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-indigo-600" />
                              <h3 className="font-semibold text-lg">{contractor.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contractor.company}</p>
                            
                            <div className="mt-2">
                              {renderStars(contractor.rating)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500">Completed:</span>
                                <span className="ml-1 font-medium">{contractor.projectsCompleted}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Active:</span>
                                <span className="ml-1 font-medium">{contractor.activeProjects}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">Specialization:</span>
                                <span className="ml-1 font-medium">{contractor.specialization}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">Reg No:</span>
                                <span className="ml-1 font-medium">{contractor.registrationNumber}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateContractorRating(contractor)}
                            disabled={aiLoading}
                            className="ml-2"
                          >
                            {aiLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-1" />
                                AI Rating
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Project Detail Modal */}
      <Dialog open={projectDetailModalOpen} onOpenChange={setProjectDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{selectedProject.title}</h3>
                <p className="text-gray-600 mt-1">{selectedProject.description}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant={selectedProject.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                  {selectedProject.priority} Priority
                </Badge>
                <Badge variant="outline">{selectedProject.size} Project</Badge>
                <Badge className={
                  selectedProject.status === 'COMPLETED' ? 'bg-green-600' : 
                  selectedProject.status === 'IN_PROGRESS' ? 'bg-blue-600' : 
                  'bg-gray-600'
                }>
                  {selectedProject.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-lg font-bold">{formatCurrency(selectedProject.budget)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Spent Amount</div>
                  <div className="text-lg font-bold">{formatCurrency(selectedProject.spentAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Province</div>
                  <div className="font-medium">{selectedProject.province}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Local Unit</div>
                  <div className="font-medium">{selectedProject.localUnit}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</div>
                </div>
              </div>

              {selectedProject.contractor && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contractor Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-1 font-medium">{selectedProject.contractor.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <span className="ml-1 font-medium">{selectedProject.contractor.company}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Rating:</span>
                      <span className="ml-2">{renderStars(selectedProject.contractor.rating)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span>{selectedProject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${selectedProject.progress >= 75 ? 'bg-green-600' : selectedProject.progress >= 50 ? 'bg-blue-600' : 'bg-amber-600'}`}
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => searchSimilarProjects(selectedProject.title)}
                  disabled={aiLoading}
                  variant="outline"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Research Similar Projects
                </Button>
                {selectedProject.contractor && (
                  <Button 
                    onClick={() => generateContractorRating({
                      id: selectedProject.contractor?.id || '',
                      name: selectedProject.contractor?.name || '',
                      company: selectedProject.contractor?.company || '',
                      rating: selectedProject.contractor?.rating || 0,
                      projectsCompleted: 10,
                      activeProjects: 2,
                      specialization: 'General',
                      registrationNumber: 'N/A'
                    })}
                    disabled={aiLoading}
                    variant="outline"
                  >
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                    Rate Contractor
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Budget Allocation Modal */}
      <Dialog open={allocationModalOpen} onOpenChange={setAllocationModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Allocate Budget
            </DialogTitle>
            <DialogDescription>
              Allocate budget to local units with AI-powered analysis
            </DialogDescription>
          </DialogHeader>
          
          {!budgetAnalysis ? (
            <form onSubmit={handleAllocateBudget} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={allocationForm.recipient}
                  onChange={(e) => setAllocationForm({...allocationForm, recipient: e.target.value})}
                  placeholder="e.g., Janakpur Sub-Metropolitan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipient Type</Label>
                <Select 
                  value={allocationForm.recipientType} 
                  onValueChange={(value: 'LOCAL_UNIT' | 'MINISTRY') => 
                    setAllocationForm({...allocationForm, recipientType: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL_UNIT">Local Unit</SelectItem>
                    <SelectItem value="MINISTRY">Ministry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Rs.)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={allocationForm.amount}
                  onChange={(e) => setAllocationForm({...allocationForm, amount: e.target.value})}
                  placeholder="e.g., 1000000000"
                  required
                />
                {allocationForm.amount && (
                  <p className="text-sm text-gray-500">{formatCurrency(parseFloat(allocationForm.amount))}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={allocationForm.purpose}
                  onChange={(e) => setAllocationForm({...allocationForm, purpose: e.target.value})}
                  placeholder="Describe the purpose of this allocation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year</Label>
                <Select 
                  value={allocationForm.fiscalYear} 
                  onValueChange={(value) => setAllocationForm({...allocationForm, fiscalYear: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2080/81">2080/81</SelectItem>
                    <SelectItem value="2081/82">2081/82</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={aiLoading}>
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className={`${
                budgetAnalysis.riskLevel === 'HIGH' ? 'border-red-500 bg-red-50' :
                budgetAnalysis.riskLevel === 'MEDIUM' ? 'border-amber-500 bg-amber-50' :
                'border-green-500 bg-green-50'
              }`}>
                <AlertTriangle className={`h-4 w-4 ${
                  budgetAnalysis.riskLevel === 'HIGH' ? 'text-red-600' :
                  budgetAnalysis.riskLevel === 'MEDIUM' ? 'text-amber-600' :
                  'text-green-600'
                }`} />
                <AlertDescription>
                  <strong>Risk Level: {budgetAnalysis.riskLevel}</strong>
                  <br />
                  Feasibility Score: {budgetAnalysis.feasibilityScore}/100
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Recommendations
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {budgetAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Potential Issues
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {budgetAnalysis.potentialIssues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold mb-2">AI Recommendation</h4>
                <Badge className={
                  budgetAnalysis.approvalRecommendation === 'APPROVE' ? 'bg-green-600' : 'bg-amber-600'
                }>
                  {budgetAnalysis.approvalRecommendation.replace('_', ' ')}
                </Badge>
                <p className="text-sm mt-2">{budgetAnalysis.benchmarkComparison}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={confirmBudgetAllocation} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Allocation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setBudgetAnalysis(null);
                  }}
                  className="flex-1"
                >
                  Modify
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <Dialog open={createProjectModalOpen} onOpenChange={setCreateProjectModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Provincial Government can create SMALL and MEDIUM projects
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4">
            {projectValidationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{projectValidationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                placeholder="Describe the project"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Project Size</Label>
              <Select 
                value={projectForm.size} 
                onValueChange={(value: 'SMALL' | 'MEDIUM' | '') => {
                  setProjectForm({...projectForm, size: value});
                  setProjectValidationError('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">SMALL ({getProjectSizeBudgetRange('SMALL').label})</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM ({getProjectSizeBudgetRange('MEDIUM').label})</SelectItem>
                  <SelectItem value="LARGE" disabled>LARGE (Central Government Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Rs.)</Label>
              <Input
                id="budget"
                type="number"
                value={projectForm.budget}
                onChange={(e) => setProjectForm({...projectForm, budget: e.target.value})}
                placeholder="Enter budget amount"
                required
              />
              {projectForm.budget && (
                <p className="text-sm text-gray-500">{formatCurrency(parseFloat(projectForm.budget))}</p>
              )}
              {projectForm.size && (
                <p className="text-xs text-blue-600">
                  Budget range for {projectForm.size}: {getProjectSizeBudgetRange(projectForm.size as 'SMALL' | 'MEDIUM').label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={projectForm.priority} 
                onValueChange={(value) => setProjectForm({...projectForm, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localUnit">Local Unit</Label>
              <Input
                id="localUnit"
                value={projectForm.localUnit}
                onChange={(e) => setProjectForm({...projectForm, localUnit: e.target.value})}
                placeholder="e.g., Janakpur"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={aiLoading}>
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze & Create Project
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={aiAnalysisModalOpen} onOpenChange={setAiAnalysisModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI Analysis
            </DialogTitle>
          </DialogHeader>
          
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Analyzing with AI...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
                {aiAnalysis}
              </pre>
              
              {projectForm.title && (
                <div className="flex gap-2">
                  <Button onClick={confirmProjectCreation} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Create Project
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAiAnalysisModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contractor Rating Modal */}
      <Dialog open={contractorRatingModalOpen} onOpenChange={setContractorRatingModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI Contractor Rating
            </DialogTitle>
            {selectedContractorForRating && (
              <DialogDescription>
                Comprehensive analysis for {selectedContractorForRating.name} - {selectedContractorForRating.company}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {contractorRating && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {contractorRating.overallRating.toFixed(1)}
                </div>
                {renderStars(contractorRating.overallRating)}
                <p className="text-sm text-gray-600 mt-2">Overall Rating</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Management</span>
                    <span className="font-bold">{contractorRating.categories.timeManagement}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${(contractorRating.categories.timeManagement / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget Adherence</span>
                    <span className="font-bold">{contractorRating.categories.budgetAdherence}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${(contractorRating.categories.budgetAdherence / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quality</span>
                    <span className="font-bold">{contractorRating.categories.quality}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: `${(contractorRating.categories.quality / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Safety</span>
                    <span className="font-bold">{contractorRating.categories.safety}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-amber-600"
                      style={{ width: `${(contractorRating.categories.safety / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {contractorRating.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Areas of Concern
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {contractorRating.concerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  AI Recommendation
                </h4>
                <p className="text-sm">{contractorRating.recommendation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}