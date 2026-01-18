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
  Alert, AlertDescription
} from '@/components/ui/alert';
import { 
  Wallet, FileText, ClipboardList, DollarSign, LogOut, Plus, FileCheck, 
  Calendar, UserPlus, Star, Building2, TrendingUp, Shield, AlertTriangle,
  CheckCircle, XCircle, Eye, BarChart3, MapPin, Users, Briefcase,
  Landmark, PieChart, ArrowUpRight, ArrowDownRight, Clock, ThumbsUp, ThumbsDown,
  Info, Sparkles, Loader2, Search, Brain, TrendingDown
} from 'lucide-react';

// User roles for Central Government
type CentralGovRole = 'PM' | 'FINANCE_MINISTRY' | 'INFRASTRUCTURE_MINISTRY';
type GovernmentLevel = 'CENTRAL' | 'PROVINCIAL' | 'LOCAL';

interface User {
  id: string;
  name: string;
  role: CentralGovRole;
  ministry?: string;
  governmentLevel?: GovernmentLevel;
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

// PROJECT SIZE VALIDATION FUNCTIONS
const getProjectSizesByLevel = (level: GovernmentLevel): ('SMALL' | 'MEDIUM' | 'LARGE')[] => {
  switch (level) {
    case 'CENTRAL':
      return ['SMALL', 'MEDIUM', 'LARGE'];
    case 'PROVINCIAL':
      return ['SMALL', 'MEDIUM'];
    case 'LOCAL':
      return ['SMALL'];
    default:
      return [];
  }
};

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

const canCreateProjectSize = (
  userLevel: GovernmentLevel,
  projectSize: 'SMALL' | 'MEDIUM' | 'LARGE'
): boolean => {
  const allowedSizes = getProjectSizesByLevel(userLevel);
  return allowedSizes.includes(projectSize);
};

const validateProjectBudget = (
  size: 'SMALL' | 'MEDIUM' | 'LARGE',
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

export default function CentralGovernmentDashboard({ user, onLogout }: Props) {
  const defaultUser: User = {
    id: '1',
    name: 'Demo User',
    role: 'PM',
    ministry: 'Prime Minister Office',
    governmentLevel: 'CENTRAL'
  };
  
  const currentUser = user || defaultUser;
  const handleLogout = onLogout || (() => console.log('Logout clicked'));
  
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<CentralGovRole>(currentUser.role);
  const [nationalStats, setNationalStats] = useState<NationalStats>({
    totalBudget: 150000000000,
    allocatedBudget: 100000000000,
    spentBudget: 45000000000,
    totalProjects: 1247,
    completedProjects: 342,
    ongoingProjects: 765,
    delayedProjects: 140,
    totalContractors: 523,
    provinces: 7,
    localUnits: 753
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
  const [policyDecisions, setPolicyDecisions] = useState<PolicyDecision[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailModalOpen, setProjectDetailModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [contractorRatingModalOpen, setContractorRatingModalOpen] = useState(false);

  // MCP-related state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null);
  const [contractorRating, setContractorRating] = useState<ContractorRating | null>(null);
  const [selectedContractorForRating, setSelectedContractorForRating] = useState<any>(null);

  const [allocationForm, setAllocationForm] = useState({
    recipient: '',
    recipientType: 'PROVINCE' as const,
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
    province: '',
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
          title: 'Kathmandu-Terai Fast Track',
          description: 'High-speed highway connecting Kathmandu to southern plains',
          budget: 45000000000,
          size: 'LARGE',
          createdBy: 'CENTRAL',
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
            rating: 4.5
          }
        },
        {
          id: '2',
          title: 'Pokhara International Airport',
          description: 'International airport development project',
          budget: 25000000000,
          size: 'LARGE',
          createdBy: 'CENTRAL',
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
            rating: 4.2
          }
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
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ====== MCP FUNCTIONS ======

  // 1. AI-Powered Budget Allocation Analysis
  const analyzeBudgetAllocation = async (allocation: typeof allocationForm) => {
    setAiLoading(true);
    setBudgetAnalysis(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: `Analyze this budget allocation proposal for Nepal's government and return ONLY valid JSON (no markdown, no preamble):

{
  "feasibilityScore": <number 0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH>",
  "recommendations": [<array of 3-5 specific recommendations>],
  "potentialIssues": [<array of 2-4 potential problems>],
  "benchmarkComparison": "<comparison with similar allocations>",
  "approvalRecommendation": "<APPROVE|APPROVE_WITH_CONDITIONS|REJECT>"
}

Allocation Details:
- Recipient: ${allocation.recipient}
- Type: ${allocation.recipientType}
- Amount: ${formatCurrency(parseFloat(allocation.amount))}
- Purpose: ${allocation.purpose}
- Fiscal Year: ${allocation.fiscalYear}

Consider: Nepal's economic context, past allocation patterns, recipient's capacity, and purpose alignment with national priorities.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let jsonText = data.content
        .filter((item: any) => item.type === "text")
        .map((item: any) => item.text)
        .join("\n");

      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(jsonText);
      setBudgetAnalysis(analysis);
    } catch (err: any) {
      console.error('Budget analysis error:', err);
      // Provide simulated analysis as fallback
      const amount = parseFloat(allocation.amount);
      const simulatedAnalysis = {
        feasibilityScore: amount > 100000000000 ? 65 : amount > 10000000000 ? 80 : 90,
        riskLevel: amount > 100000000000 ? "HIGH" : amount > 10000000000 ? "MEDIUM" : "LOW",
        recommendations: [
          `Ensure ${allocation.recipient} has adequate project management capacity for ${formatCurrency(amount)}`,
          "Establish clear milestone-based payment schedules",
          "Require quarterly progress reports and financial audits",
          "Set up dedicated monitoring committee with local representation",
          "Include contingency fund (10-15%) for unforeseen circumstances"
        ],
        potentialIssues: [
          "Possible delays in fund utilization due to administrative capacity",
          "Risk of budget reallocation if spending targets not met",
          "Need for technical expertise in project implementation"
        ],
        benchmarkComparison: `This allocation is ${amount > 50000000000 ? 'above' : 'within'} the average for similar ${allocation.recipientType} allocations in Nepal.`,
        approvalRecommendation: amount > 100000000000 ? "APPROVE_WITH_CONDITIONS" : "APPROVE"
      };
      setBudgetAnalysis(simulatedAnalysis);
      alert('Using simulated AI analysis (API temporarily unavailable)');
    } finally {
      setAiLoading(false);
    }
  };

  // 2. AI-Powered Project Feasibility Analysis
  const analyzeProjectFeasibility = async (project: typeof projectForm) => {
    setAiLoading(true);
    setAiAnalysis('');
    setAiAnalysisModalOpen(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `As an infrastructure expert, analyze this proposed project for Nepal:

Project: ${project.title}
Description: ${project.description}
Budget: ${formatCurrency(parseFloat(project.budget))}
Size Category: ${project.size}
Timeline: ${project.startDate} to ${project.endDate}
Location: ${project.province}, ${project.localUnit}
Priority: ${project.priority}

Provide a comprehensive analysis covering:

1. FEASIBILITY ASSESSMENT
   - Technical feasibility
   - Financial viability
   - Timeline reasonableness

2. RISK ANALYSIS
   - Major risks and challenges
   - Mitigation strategies

3. BUDGET EVALUATION
   - Is the budget appropriate for this project type?
   - Comparison with similar projects
   - Cost breakdown suggestions

4. RECOMMENDATIONS
   - Should this project be approved?
   - Required modifications or conditions
   - Alternative approaches

5. SUCCESS FACTORS
   - Key elements needed for success
   - Critical milestones to monitor

Format your response clearly with headers and bullet points.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.content
        .filter((item: any) => item.type === "text")
        .map((item: any) => item.text)
        .join("\n");

      setAiAnalysis(analysisText);
    } catch (err: any) {
      console.error('Project analysis error:', err);
      // Provide simulated analysis
      const budget = parseFloat(project.budget);
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      setAiAnalysis(`⚠️ SIMULATED AI ANALYSIS (API temporarily unavailable)

PROJECT: ${project.title}
LOCATION: ${project.province}, ${project.localUnit}
BUDGET: ${formatCurrency(budget)}
TIMELINE: ${months} months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FEASIBILITY ASSESSMENT ✓

Technical Feasibility: ${project.size === 'LARGE' ? 'COMPLEX' : project.size === 'MEDIUM' ? 'MODERATE' : 'STRAIGHTFORWARD'}
• Project scope is ${project.size === 'LARGE' ? 'highly ambitious requiring specialized expertise' : 'manageable with proper planning'}
• Local infrastructure capacity: ${project.province === 'Bagmati' ? 'HIGH' : 'MODERATE'}
• Technical resources availability: ${project.size === 'SMALL' ? 'READILY AVAILABLE' : 'MAY REQUIRE EXTERNAL EXPERTISE'}

Financial Viability: ${budget > 50000000000 ? 'REQUIRES CAREFUL MONITORING' : 'REASONABLE'}
• Budget is ${budget > 100000000000 ? 'at the upper end' : 'within expected range'} for ${project.size} projects
• Funding structure should include milestone-based releases
• Recommend 15% contingency buffer

Timeline Reasonableness: ${months < 12 ? 'AGGRESSIVE' : months > 60 ? 'EXTENDED' : 'REALISTIC'}
• ${months} months timeline is ${months < 24 ? 'tight and may face delays' : 'adequate for proper execution'}
• Weather considerations for ${project.province} region important
• Buffer recommended for land acquisition and approvals

2. RISK ANALYSIS ⚠️

Major Risks:
• LAND ACQUISITION: High risk in populated areas, may cause 3-6 month delays
• BUDGET OVERRUN: ${budget > 50000000000 ? 'Significant risk (20-30%)' : 'Moderate risk (10-15%)'}
• CONTRACTOR CAPACITY: ${project.size === 'LARGE' ? 'Limited contractors can handle this scale' : 'Adequate contractors available'}
• POLITICAL STABILITY: Policy continuity needed across government terms
• ENVIRONMENTAL CLEARANCES: Required approvals may take 6-12 months

Mitigation Strategies:
✓ Complete land acquisition before work starts
✓ Establish strict quality control and monitoring systems
✓ Use milestone-based payments to contractors
✓ Regular stakeholder consultations
✓ Contingency planning for weather delays

3. BUDGET EVALUATION 💰

Budget Appropriateness: ${
  budget < getProjectSizeBudgetRange(project.size as any).min * 1.5 ? 'TIGHT' :
  budget > getProjectSizeBudgetRange(project.size as any).max * 0.8 ? 'GENEROUS' :
  'APPROPRIATE'
}

Cost Breakdown Suggestion:
• Construction: ${Math.round(budget * 0.60)} (60%)
• Land Acquisition: ${Math.round(budget * 0.15)} (15%)
• Engineering & Design: ${Math.round(budget * 0.08)} (8%)
• Project Management: ${Math.round(budget * 0.05)} (5%)
• Contingency: ${Math.round(budget * 0.12)} (12%)

Benchmark Comparison:
Similar ${project.size} infrastructure projects in Nepal typically cost ${formatCurrency(getProjectSizeBudgetRange(project.size as any).min)} to ${formatCurrency(getProjectSizeBudgetRange(project.size as any).max)}. Your budget is within this range.

4. RECOMMENDATIONS ✅

Approval Status: ${budget > 100000000000 ? 'CONDITIONAL APPROVAL RECOMMENDED' : 'APPROVAL RECOMMENDED'}

Required Conditions:
${budget > 100000000000 ? '• Split into 3-5 year phases\n• Annual budget review mechanism\n' : ''}• Complete Environmental Impact Assessment before work starts
• Establish Project Monitoring Committee with local representation
• Quarterly progress reports mandatory
• Quality audits every 6 months
• Penalty clauses for delays in contractor agreement

Alternative Approaches:
${project.size === 'LARGE' ? '• Consider Public-Private Partnership (PPP) model\n• Phase implementation to spread cost over years\n' : ''}• Explore regional cooperation for cross-border benefits
• Technology transfer clauses with international contractors

5. SUCCESS FACTORS 🎯

Critical Success Elements:
✓ Strong Project Management Office (PMO)
✓ Clear communication with local communities
✓ Regular monitoring and course correction
✓ Transparent financial management
✓ Quality-focused contractor selection

Key Milestones to Monitor:
📍 Month 3: Environmental clearances obtained
📍 Month 6: Land acquisition completed
📍 Month ${Math.round(months * 0.25)}: First quarter construction progress
📍 Month ${Math.round(months * 0.50)}: Mid-point review and adjustments
📍 Month ${Math.round(months * 0.75)}: Final phase initiation
📍 Month ${months}: Project completion and handover

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL VERDICT: ${
  budget > 100000000000 || months < 12 ? 
  '⚠️ PROCEED WITH CAUTION - Address highlighted concerns before approval' :
  '✅ RECOMMENDED FOR APPROVAL - Solid planning with manageable risks'
}

Note: This is a simulated analysis. For actual AI analysis, ensure API connectivity.`);
    } finally {
      setAiLoading(false);
    }
  };

  // 3. AI-Powered Contractor Rating System
  const generateContractorRating = async (contractorData: any) => {
    setAiLoading(true);
    setContractorRating(null);

    try {
      // Gather contractor performance data
      const contractorProjects = projects.filter(
        p => p.contractor?.id === contractorData.id
      );

      const performanceData = `
Contractor: ${contractorData.name}
Company: ${contractorData.company}
Current Rating: ${contractorData.rating || 'N/A'}

Projects History:
${contractorProjects.map((p, i) => `
${i + 1}. ${p.title}
   - Budget: ${formatCurrency(p.budget)}
   - Spent: ${formatCurrency(p.spentAmount)}
   - Progress: ${p.progress}%
   - Status: ${p.status}
   - Timeline: ${p.startDate} to ${p.endDate}
`).join('\n')}

Total Projects: ${contractorProjects.length}
Completed: ${contractorProjects.filter(p => p.status === 'COMPLETED').length}
In Progress: ${contractorProjects.filter(p => p.status === 'IN_PROGRESS').length}
Delayed: ${contractorProjects.filter(p => p.status === 'DELAYED').length}
`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: `Analyze this contractor's performance and generate a comprehensive rating. Return ONLY valid JSON (no markdown, no preamble):

{
  "overallRating": <number 0-5 with decimals>,
  "categories": {
    "timeManagement": <number 0-5>,
    "budgetAdherence": <number 0-5>,
    "quality": <number 0-5>,
    "safety": <number 0-5>
  },
  "strengths": [<array of 3-5 specific strengths>],
  "concerns": [<array of 2-4 specific concerns or areas for improvement>],
  "recommendation": "<detailed recommendation for future project assignments>"
}

${performanceData}

Consider:
- On-time delivery rate
- Budget management (over/under spending)
- Project completion rate
- Consistency across projects
- Scale and complexity of projects handled`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let jsonText = data.content
        .filter((item: any) => item.type === "text")
        .map((item: any) => item.text)
        .join("\n");

      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const rating = JSON.parse(jsonText);
      setContractorRating(rating);
      setContractorRatingModalOpen(true);
    } catch (err: any) {
      console.error('Contractor rating error:', err);
      
      // Provide simulated rating
      const contractorProjects = projects.filter(
        p => p.contractor?.id === contractorData.id
      );
      
      const completed = contractorProjects.filter(p => p.status === 'COMPLETED').length;
      const total = contractorProjects.length;
      const avgProgress = contractorProjects.reduce((sum, p) => sum + p.progress, 0) / total;
      const avgBudgetAdherence = contractorProjects.reduce((sum, p) => 
        sum + (p.spentAmount / p.budget), 0) / total;
      
      const simulatedRating: ContractorRating = {
        overallRating: Math.min(5, (avgProgress / 20) + (contractorData.rating || 3)),
        categories: {
          timeManagement: Math.min(5, (completed / total) * 5),
          budgetAdherence: Math.min(5, (1 / avgBudgetAdherence) * 5),
          quality: contractorData.rating || 4.0,
          safety: 4.2
        },
        strengths: [
          `Successfully completed ${completed} out of ${total} projects`,
          `Average project progress of ${avgProgress.toFixed(1)}%`,
          `Experienced in ${contractorProjects[0]?.size || 'various'} scale projects`,
          `Strong track record with ${contractorData.company}`,
          "Consistent performance across multiple provinces"
        ],
        concerns: [
          avgBudgetAdherence > 1.1 ? "Budget overruns observed in recent projects" : "Minor budget variance",
          total - completed > 1 ? "Multiple ongoing projects may affect focus" : "Project load is manageable",
          "Periodic quality audits recommended",
          "Safety training documentation should be updated"
        ],
        recommendation: avgProgress > 70 && avgBudgetAdherence < 1.2 
          ? `HIGHLY RECOMMENDED for future ${contractorProjects[0]?.size || 'similar'} projects. Contractor demonstrates consistent performance and reliability.`
          : `RECOMMENDED WITH MONITORING for future projects. Establish clear milestone reviews and budget oversight.`
      };
      
      setContractorRating(simulatedRating);
      setContractorRatingModalOpen(true);
      alert('Using simulated AI rating (API temporarily unavailable)');
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Search for Similar Projects (Web Search)
  const searchSimilarProjects = async (projectTitle: string) => {
    setAiLoading(true);
    setAiAnalysis('');
    setAiAnalysisModalOpen(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `Search for similar infrastructure projects to "${projectTitle}" in Nepal or South Asian countries. Find:

1. Similar completed projects with costs and timelines
2. Ongoing similar projects and their challenges
3. Best practices and lessons learned
4. Cost benchmarks and budget expectations
5. Common issues and how they were resolved

Provide a comprehensive summary with specific examples and data.`
            }
          ],
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.content
        .filter((item: any) => item.type === "text")
        .map((item: any) => item.text)
        .join("\n");

      setAiAnalysis(analysisText || 'Search completed. Please review the findings above.');
    } catch (err: any) {
      console.error('Search error:', err);
      setAiAnalysis(`⚠️ API Connection Issue

This feature requires the Anthropic API to be accessible. In the Claude.ai artifacts environment, API calls work automatically, but there might be temporary connectivity issues.

Simulated Analysis for "${projectTitle}":

📊 SIMILAR PROJECTS FOUND:

1. Pokhara International Airport (Nepal) - COMPLETED
   - Budget: Rs. 25 Billion
   - Timeline: 2016-2023 (7 years)
   - Status: Successfully completed and operational
   - Key Success: Strong government oversight and milestone-based payments

2. Kathmandu-Terai Madhesh Expressway (Ongoing)
   - Budget: Rs. 280 Billion
   - Current Status: 45% complete
   - Challenges: Land acquisition delays, cost overruns
   - Lessons: Need for better initial planning and land acquisition

3. Delhi Metro Phase 3 (India) - COMPLETED
   - Budget: ₹30,000 Crore (~Rs. 480 Billion NPR)
   - Timeline: 2011-2018
   - Relevance: Similar scale urban infrastructure
   - Best Practice: Public-Private Partnership model

💡 KEY INSIGHTS:
- Large infrastructure projects typically take 5-7 years
- Budget overruns of 10-20% are common in South Asia
- Early land acquisition and stakeholder management critical
- Regular quality audits improve outcomes
- Technology transfer clauses ensure local capacity building

Try the "Analyze with AI" feature for project feasibility analysis instead!`);
    } finally {
      setAiLoading(false);
    }
  };

  // ====== END MCP FUNCTIONS ======

  const handleAllocateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, analyze the allocation with AI
    await analyzeBudgetAllocation(allocationForm);
  };

  const confirmBudgetAllocation = async () => {
    try {
      const response = await fetch('/api/central/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...allocationForm,
          amount: parseFloat(allocationForm.amount),
          allocatedBy: currentUser.id,
          aiAnalysis: budgetAnalysis
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Budget allocated successfully!');
        setAllocationModalOpen(false);
        setBudgetAnalysis(null);
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
      alert('Demo mode: Budget allocation recorded with AI analysis');
      setAllocationModalOpen(false);
      setBudgetAnalysis(null);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectValidationError('');

    if (!projectForm.size) {
      setProjectValidationError('Please select a project size');
      return;
    }

    if (!canCreateProjectSize('CENTRAL', projectForm.size)) {
      setProjectValidationError(`Central Government cannot create ${projectForm.size} projects`);
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

    // Analyze project before creation
    await analyzeProjectFeasibility(projectForm);
  };

  const confirmProjectCreation = async () => {
    try {
      const response = await fetch('/api/central/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectForm,
          budget: parseFloat(projectForm.budget),
          createdBy: 'CENTRAL',
          createdById: currentUser.id,
          aiAnalysis: aiAnalysis
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Project created successfully!');
        setCreateProjectModalOpen(false);
        setAiAnalysisModalOpen(false);
        setProjectForm({
          title: '',
          description: '',
          budget: '',
          size: '',
          priority: 'MEDIUM',
          province: '',
          localUnit: '',
          startDate: '',
          endDate: ''
        });
        await loadDashboardData();
      } else {
        setProjectValidationError(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Project creation error:', error);
      alert('Demo mode: Project created with AI feasibility analysis');
      setCreateProjectModalOpen(false);
      setAiAnalysisModalOpen(false);
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
      alert(`Demo mode: Policy ${decision.toLowerCase()}`);
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

  // PM Dashboard View
  const PMDashboard = () => (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
        <TabsTrigger value="overview">National Overview</TabsTrigger>
        <TabsTrigger value="projects">Priority Projects</TabsTrigger>
        <TabsTrigger value="policies">Policy Decisions</TabsTrigger>
        <TabsTrigger value="contractors">Contractor Ratings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* AI Features Banner */}
        <Alert className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <strong className="text-purple-900 dark:text-purple-100">AI-Powered Features Active:</strong>
            <span className="text-purple-700 dark:text-purple-200"> Budget Analysis • Project Feasibility • Contractor Ratings • Web Research</span>
          </AlertDescription>
        </Alert>

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
      </TabsContent>

      <TabsContent value="projects">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  National Priority Projects
                </CardTitle>
                <CardDescription>AI-powered project management and analysis</CardDescription>
              </div>
              <Button onClick={() => setCreateProjectModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
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
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => searchSimilarProjects(project.title)}
                          disabled={aiLoading}
                        >
                          <Search className="h-4 w-4 mr-1" />
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

      <TabsContent value="contractors">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Contractor Ratings
            </CardTitle>
            <CardDescription>Generate comprehensive contractor performance ratings using AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.filter(p => p.contractor).map((project) => (
                <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{project.contractor?.name}</h4>
                        <Badge variant="outline">{project.contractor?.company}</Badge>
                        {project.contractor?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{project.contractor.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Project: {project.title}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedContractorForRating(project.contractor);
                        generateContractorRating(project.contractor);
                      }}
                      disabled={aiLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      Generate AI Rating
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const FinanceMinistryDashboard = () => <div className="p-8 text-center">Finance Ministry Dashboard</div>;
  const InfrastructureMinistryDashboard = () => <div className="p-8 text-center">Infrastructure Ministry Dashboard</div>;

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

      {/* Create Project Modal with AI Analysis */}
      <Dialog open={createProjectModalOpen} onOpenChange={setCreateProjectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Create New Project with AI Analysis
            </DialogTitle>
            <DialogDescription>
              Create a new infrastructure project. AI will analyze feasibility before submission.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
            {projectValidationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{projectValidationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="size">Project Size *</Label>
              <Select
                value={projectForm.size}
                onValueChange={(value) => {
                  setProjectForm({ ...projectForm, size: value as any, budget: '' });
                  setProjectValidationError('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project size" />
                </SelectTrigger>
                <SelectContent>
                  {getProjectSizesByLevel('CENTRAL').map((size) => {
                    const range = getProjectSizeBudgetRange(size);
                    return (
                      <SelectItem key={size} value={size}>
                        {size} - {range.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Central Government</strong> can create: SMALL, MEDIUM, and LARGE projects<br/>
                  <strong>Provincial Government</strong> can create: SMALL and MEDIUM projects<br/>
                  <strong>Local Government</strong> can create: SMALL projects only
                </AlertDescription>
              </Alert>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g., Kathmandu-Terai Fast Track"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Detailed project description"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">
                  Budget (Rs.) *
                  {projectForm.size && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({getProjectSizeBudgetRange(projectForm.size).label})
                    </span>
                  )}
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => {
                    setProjectForm({ ...projectForm, budget: e.target.value });
                    setProjectValidationError('');
                  }}
                  placeholder="Enter budget amount"
                  required
                  disabled={!projectForm.size}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={projectForm.priority}
                  onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Select
                  value={projectForm.province}
                  onValueChange={(value) => setProjectForm({ ...projectForm, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Koshi">Koshi Province</SelectItem>
                    <SelectItem value="Madhesh">Madhesh Province</SelectItem>
                    <SelectItem value="Bagmati">Bagmati Province</SelectItem>
                    <SelectItem value="Gandaki">Gandaki Province</SelectItem>
                    <SelectItem value="Lumbini">Lumbini Province</SelectItem>
                    <SelectItem value="Karnali">Karnali Province</SelectItem>
                    <SelectItem value="Sudurpashchim">Sudurpashchim Province</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localUnit">Local Unit *</Label>
                <Input
                  id="localUnit"
                  value={projectForm.localUnit}
                  onChange={(e) => setProjectForm({ ...projectForm, localUnit: e.target.value })}
                  placeholder="e.g., Kathmandu Metropolitan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Expected End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  required
                  min={projectForm.startDate}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateProjectModalOpen(false);
                  setProjectValidationError('');
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={aiLoading}>
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={aiAnalysisModalOpen} onOpenChange={setAiAnalysisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Analysis Results
            </DialogTitle>
            <DialogDescription>
              Comprehensive AI-powered analysis
            </DialogDescription>
          </DialogHeader>
          
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">AI is analyzing the project...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
                  {aiAnalysis}
                </pre>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setAiAnalysisModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {projectForm.title && (
                  <Button 
                    onClick={confirmProjectCreation}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Proceed with Project Creation
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Budget Allocation Modal with AI Analysis */}
      <Dialog open={allocationModalOpen} onOpenChange={setAllocationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Allocate Budget with AI Analysis
            </DialogTitle>
            <DialogDescription>
              Allocate budget to provinces or local units. AI will analyze before confirmation.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAllocateBudget} className="space-y-4 mt-4">
            {!budgetAnalysis ? (
              <>
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
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={aiLoading}>
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Alert className={
                  budgetAnalysis.riskLevel === 'LOW' ? 'border-green-200 bg-green-50' :
                  budgetAnalysis.riskLevel === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50'
                }>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Feasibility Score:</span>
                        <Badge variant={budgetAnalysis.feasibilityScore >= 70 ? 'default' : 'destructive'}>
                          {budgetAnalysis.feasibilityScore}/100
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Risk Level:</span>
                        <Badge variant={
                          budgetAnalysis.riskLevel === 'LOW' ? 'default' :
                          budgetAnalysis.riskLevel === 'MEDIUM' ? 'secondary' :
                          'destructive'
                        }>
                          {budgetAnalysis.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {budgetAnalysis.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Potential Issues:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                    {budgetAnalysis.potentialIssues.map((issue: string, i: number) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Recommendation:</strong> {budgetAnalysis.approvalRecommendation}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setBudgetAnalysis(null);
                      setAllocationModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmBudgetAllocation}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Allocation
                  </Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Contractor Rating Modal */}
      <Dialog open={contractorRatingModalOpen} onOpenChange={setContractorRatingModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Generated Contractor Rating
            </DialogTitle>
            <DialogDescription>
              {selectedContractorForRating?.name} - {selectedContractorForRating?.company}
            </DialogDescription>
          </DialogHeader>
          
          {contractorRating && (
            <div className="space-y-6">
              {/* Overall Rating */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-purple-600">
                      {contractorRating.overallRating.toFixed(1)}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                      Overall Rating (out of 5.0)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Time Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${(contractorRating.categories.timeManagement / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{contractorRating.categories.timeManagement.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Budget Adherence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${(contractorRating.categories.budgetAdherence / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{contractorRating.categories.budgetAdherence.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-600 h-3 rounded-full"
                          style={{ width: `${(contractorRating.categories.quality / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{contractorRating.categories.quality.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Safety</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-amber-600 h-3 rounded-full"
                          style={{ width: `${(contractorRating.categories.safety / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{contractorRating.categories.safety.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardHeader>
                    <CardTitle className="text-base text-green-700 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {contractorRating.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <CardHeader>
                    <CardTitle className="text-base text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {contractorRating.concerns.map((concern, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendation */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Recommendation:</strong> {contractorRating.recommendation}
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => setContractorRatingModalOpen(false)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}
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