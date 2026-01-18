// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Building2, HardHat, Users, Landmark, Wallet, Building, MapPin, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import actual dashboards
import CentralGovernmentDashboard from '@/components/dashboards/central-government-dashboard';
import ProvincialGovernmentDashboard from '@/components/dashboards/provincial-government-dashboard';
import LocalGovernmentDashboard from '@/components/dashboards/local-government-dashboard';
import ContractorDashboard from '@/components/dashboards/contractor-dashboard';
import CitizenDashboard from '@/components/dashboards/citizen-dashboard';



// All available roles
type UserRole = 
  | 'LOCAL_GOVERNMENT' 
  | 'CONTRACTOR' 
  | 'CITIZEN' 
  | 'CENTRAL_GOV_PM' 
  | 'CENTRAL_GOV_FINANCE' 
  | 'CENTRAL_GOV_INFRASTRUCTURE'
  | 'PROVINCIAL_GOVERNMENT';

// Role categories for grouping
type RoleCategory = 'CENTRAL' | 'PROVINCIAL' | 'LOCAL' | 'CONTRACTOR' | 'CITIZEN';

interface RoleOption {
  value: UserRole;
  label: string;
  category: RoleCategory;
  ministry?: string;
}

const roleOptions: RoleOption[] = [
  { value: 'CENTRAL_GOV_PM', label: 'Prime Minister Office', category: 'CENTRAL', ministry: 'Prime Minister Office' },
  { value: 'CENTRAL_GOV_FINANCE', label: 'Ministry of Finance', category: 'CENTRAL', ministry: 'Ministry of Finance' },
  { value: 'CENTRAL_GOV_INFRASTRUCTURE', label: 'Ministry of Infrastructure', category: 'CENTRAL', ministry: 'Ministry of Infrastructure Development' },
  { value: 'PROVINCIAL_GOVERNMENT', label: 'Provincial Government', category: 'PROVINCIAL' },
  { value: 'LOCAL_GOVERNMENT', label: 'Local Government', category: 'LOCAL' },
  { value: 'CONTRACTOR', label: 'Contractor', category: 'CONTRACTOR' },
  { value: 'CITIZEN', label: 'Citizen', category: 'CITIZEN' },
];

const provinces = [
  { id: 'koshi', name: 'Koshi Province', code: 'P1' },
  { id: 'madhesh', name: 'Madhesh Province', code: 'P2' },
  { id: 'bagmati', name: 'Bagmati Province', code: 'P3' },
  { id: 'gandaki', name: 'Gandaki Province', code: 'P4' },
  { id: 'lumbini', name: 'Lumbini Province', code: 'P5' },
  { id: 'karnali', name: 'Karnali Province', code: 'P6' },
  { id: 'sudurpashchim', name: 'Sudurpashchim Province', code: 'P7' },
];

// Demo credentials for quick access
const demoCredentials: Record<RoleCategory, { email: string; password: string; name: string }> = {
  CENTRAL: { email: 'pm@gov.np', password: 'demo123', name: 'Hon. Prime Minister' },
  PROVINCIAL: { email: 'governor@bagmati.gov.np', password: 'demo123', name: 'Provincial Governor' },
  LOCAL: { email: 'mayor@kathmandu.gov.np', password: 'demo123', name: 'Mayor' },
  CONTRACTOR: { email: 'contractor@company.com', password: 'demo123', name: 'Ram Kumar Shrestha' },
  CITIZEN: { email: 'citizen@email.com', password: 'demo123', name: 'Sita Sharma' },
};

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedLocalUnit, setSelectedLocalUnit] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleCategorySelect = (category: RoleCategory) => {
    setSelectedCategory(category);
    setLoginError(null);
    const rolesInCategory = roleOptions.filter(r => r.category === category);
    if (rolesInCategory.length === 1) {
      setSelectedRole(rolesInCategory[0].value);
    } else {
      setSelectedRole(null);
    }
    // Reset province and local unit when category changes
    setSelectedProvince('');
    setSelectedLocalUnit('');
  };

  const handleDemoLogin = () => {
    if (!selectedCategory) return;
    
    const demo = demoCredentials[selectedCategory];
    
    // Set form values
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    if (emailInput) emailInput.value = demo.email;
    if (nameInput) nameInput.value = demo.name;
    if (passwordInput) passwordInput.value = demo.password;
    
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError(null);
  
  if (!selectedRole && selectedCategory !== 'CENTRAL') {
    setLoginError('Please select a role');
    return;
  }

  if (selectedCategory === 'CENTRAL' && !selectedRole) {
    setLoginError('Please select a ministry/office');
    return;
  }

  if (selectedCategory === 'PROVINCIAL' && !selectedProvince) {
    setLoginError('Please select a province');
    return;
  }

  if (selectedCategory === 'LOCAL' && (!selectedProvince || !selectedLocalUnit)) {
    setLoginError('Please select province and enter local unit name');
    return;
  }

  setIsLoading(true);
  
  const formData = new FormData(e.currentTarget as HTMLFormElement);
  
  try {
    // Call the actual registration/login API
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email') as string,
        name: formData.get('name') as string,
        role: selectedRole,
        nidNumber: selectedCategory === 'CITIZEN' ? formData.get('nidNumber') as string : undefined,
        phone: formData.get('phone') as string || undefined,
        address: formData.get('address') as string || undefined,
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      setLoginError(result.error || 'Login failed');
      setIsLoading(false);
      return;
    }

    // Use the real user data from the API
    const loginData = {
      ...result.user,
      category: selectedCategory,
      province: selectedProvince ? provinces.find(p => p.id === selectedProvince)?.name : undefined,
      provinceId: selectedProvince || undefined,
      localUnit: selectedLocalUnit || undefined,
      governmentLevel: selectedCategory === 'CENTRAL' ? 'CENTRAL' : 
                       selectedCategory === 'PROVINCIAL' ? 'PROVINCIAL' : 
                       selectedCategory === 'LOCAL' ? 'LOCAL' : undefined,
    };

    setUser(loginData);
    console.log('Login successful:', loginData);
    
  } catch (error) {
    setLoginError('Login failed. Please try again.');
    console.error('Login error:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleLogout = () => {
    console.log('Logging out...');
    setUser(null);
    setSelectedRole(null);
    setSelectedCategory(null);
    setSelectedProvince('');
    setSelectedLocalUnit('');
    setLoginError(null);
  };

  const isCentralGovRole = (role: UserRole | null): boolean => {
    return role === 'CENTRAL_GOV_PM' || role === 'CENTRAL_GOV_FINANCE' || role === 'CENTRAL_GOV_INFRASTRUCTURE';
  };

  const getCentralGovRoleType = (role: UserRole): 'PM' | 'FINANCE_MINISTRY' | 'INFRASTRUCTURE_MINISTRY' => {
    switch (role) {
      case 'CENTRAL_GOV_PM': return 'PM';
      case 'CENTRAL_GOV_FINANCE': return 'FINANCE_MINISTRY';
      case 'CENTRAL_GOV_INFRASTRUCTURE': return 'INFRASTRUCTURE_MINISTRY';
      default: return 'PM';
    }
  };

  // Render dashboard based on role
  const renderDashboard = () => {
    if (!user || !selectedRole) {
      console.log('No user or role, returning to login');
      return null;
    }

    console.log('Rendering dashboard for:', selectedRole);

    if (isCentralGovRole(selectedRole)) {
      return (
        <CentralGovernmentDashboard 
          user={{
            ...user,
            role: getCentralGovRoleType(selectedRole),
            ministry: roleOptions.find(r => r.value === selectedRole)?.ministry,
            governmentLevel: 'CENTRAL',
          }} 
          onLogout={handleLogout} 
        />
      );
    }

    switch (selectedRole) {
      case 'LOCAL_GOVERNMENT':
        return <LocalGovernmentDashboard user={user} onLogout={handleLogout} />;
      case 'CONTRACTOR':
        return <ContractorDashboard user={user} onLogout={handleLogout} />;
      case 'CITIZEN':
        return <CitizenDashboard user={user} onLogout={handleLogout} />;
      case 'PROVINCIAL_GOVERNMENT':
        return <ProvincialGovernmentDashboard user={user} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  // Show dashboard if user is logged in
  if (user && selectedRole) {
    return (
      <div className="min-h-screen">
        {renderDashboard()}
      </div>
    );
  }

  // Show login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
              <Landmark className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Civic Track Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A comprehensive system for tracking government projects, payments, and ensuring 
            transparency from Central Government to Local Units.
          </p>
        </div>

        {/* Role Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-5xl mx-auto">
          {/* Central Government */}
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === 'CENTRAL' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
                : 'border-purple-200 hover:border-purple-400'
            }`}
            onClick={() => handleCategorySelect('CENTRAL')}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  selectedCategory === 'CENTRAL' ? 'bg-purple-500' : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  <Landmark className={`h-6 w-6 ${
                    selectedCategory === 'CENTRAL' ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
              </div>
              <h3 className="font-semibold text-sm">Central Government</h3>
              <p className="text-xs text-gray-500 mt-1">PM & Ministries</p>
            </CardContent>
          </Card>

          {/* Provincial Government */}
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === 'PROVINCIAL' 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg' 
                : 'border-indigo-200 hover:border-indigo-400'
            }`}
            onClick={() => handleCategorySelect('PROVINCIAL')}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  selectedCategory === 'PROVINCIAL' ? 'bg-indigo-500' : 'bg-indigo-100 dark:bg-indigo-900'
                }`}>
                  <MapPin className={`h-6 w-6 ${
                    selectedCategory === 'PROVINCIAL' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                  }`} />
                </div>
              </div>
              <h3 className="font-semibold text-sm">Provincial Government</h3>
              <p className="text-xs text-gray-500 mt-1">7 Provinces</p>
            </CardContent>
          </Card>

          {/* Local Government */}
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === 'LOCAL' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' 
                : 'border-emerald-200 hover:border-emerald-400'
            }`}
            onClick={() => handleCategorySelect('LOCAL')}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  selectedCategory === 'LOCAL' ? 'bg-emerald-500' : 'bg-emerald-100 dark:bg-emerald-900'
                }`}>
                  <Building2 className={`h-6 w-6 ${
                    selectedCategory === 'LOCAL' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                  }`} />
                </div>
              </div>
              <h3 className="font-semibold text-sm">Local Government</h3>
              <p className="text-xs text-gray-500 mt-1">Municipalities</p>
            </CardContent>
          </Card>

          {/* Contractor */}
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === 'CONTRACTOR' 
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg' 
                : 'border-teal-200 hover:border-teal-400'
            }`}
            onClick={() => handleCategorySelect('CONTRACTOR')}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  selectedCategory === 'CONTRACTOR' ? 'bg-teal-500' : 'bg-teal-100 dark:bg-teal-900'
                }`}>
                  <HardHat className={`h-6 w-6 ${
                    selectedCategory === 'CONTRACTOR' ? 'text-white' : 'text-teal-600 dark:text-teal-400'
                  }`} />
                </div>
              </div>
              <h3 className="font-semibold text-sm">Contractor</h3>
              <p className="text-xs text-gray-500 mt-1">Construction</p>
            </CardContent>
          </Card>

          {/* Citizen */}
          <Card 
            className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === 'CITIZEN' 
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-lg' 
                : 'border-cyan-200 hover:border-cyan-400'
            }`}
            onClick={() => handleCategorySelect('CITIZEN')}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  selectedCategory === 'CITIZEN' ? 'bg-cyan-500' : 'bg-cyan-100 dark:bg-cyan-900'
                }`}>
                  <Users className={`h-6 w-6 ${
                    selectedCategory === 'CITIZEN' ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'
                  }`} />
                </div>
              </div>
              <h3 className="font-semibold text-sm">Citizen</h3>
              <p className="text-xs text-gray-500 mt-1">Public Access</p>
            </CardContent>
          </Card>
        </div>

        {/* Role Details & Login Form */}
        {selectedCategory && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  {selectedCategory === 'CENTRAL' && <Landmark className="h-5 w-5 text-purple-600" />}
                  {selectedCategory === 'PROVINCIAL' && <MapPin className="h-5 w-5 text-indigo-600" />}
                  {selectedCategory === 'LOCAL' && <Building2 className="h-5 w-5 text-emerald-600" />}
                  {selectedCategory === 'CONTRACTOR' && <HardHat className="h-5 w-5 text-teal-600" />}
                  {selectedCategory === 'CITIZEN' && <Users className="h-5 w-5 text-cyan-600" />}
                  
                  {selectedCategory === 'CENTRAL' && 'Central Government Login'}
                  {selectedCategory === 'PROVINCIAL' && 'Provincial Government Login'}
                  {selectedCategory === 'LOCAL' && 'Local Government Login'}
                  {selectedCategory === 'CONTRACTOR' && 'Contractor Login'}
                  {selectedCategory === 'CITIZEN' && 'Citizen Login'}
                </CardTitle>
                <CardDescription className="text-center">
                  {selectedCategory === 'CENTRAL' && 'Access the national dashboard for policy decisions and budget allocation'}
                  {selectedCategory === 'PROVINCIAL' && 'Manage provincial projects and monitor local unit performance'}
                  {selectedCategory === 'LOCAL' && 'Manage contracts, approve payments, and monitor work progress'}
                  {selectedCategory === 'CONTRACTOR' && 'Submit work plans, report progress, and request payments'}
                  {selectedCategory === 'CITIZEN' && 'Monitor government spending and project progress in your area'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Demo Login Button */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Demo Mode</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleDemoLogin}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Fill Demo Credentials
                    </Button>
                  </div>
                </div>

                {/* Error Alert */}
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  
                  {/* Central Government Role Selection */}
                  {selectedCategory === 'CENTRAL' && (
                    <div className="space-y-2">
                      <Label>Select Ministry/Office <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-1 gap-2">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                            selectedRole === 'CENTRAL_GOV_PM' 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                              : 'hover:border-purple-300'
                          }`}
                          onClick={() => setSelectedRole('CENTRAL_GOV_PM')}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                            <Landmark className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Prime Minister Office</p>
                            <p className="text-xs text-gray-500">National oversight, policy approval</p>
                          </div>
                          {selectedRole === 'CENTRAL_GOV_PM' && (
                            <Badge className="bg-purple-600">Selected</Badge>
                          )}
                        </div>
                        
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                            selectedRole === 'CENTRAL_GOV_FINANCE' 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'hover:border-green-300'
                          }`}
                          onClick={() => setSelectedRole('CENTRAL_GOV_FINANCE')}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <Wallet className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Ministry of Finance</p>
                            <p className="text-xs text-gray-500">Budget allocation, payment approval</p>
                          </div>
                          {selectedRole === 'CENTRAL_GOV_FINANCE' && (
                            <Badge className="bg-green-600">Selected</Badge>
                          )}
                        </div>
                        
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                            selectedRole === 'CENTRAL_GOV_INFRASTRUCTURE' 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedRole('CENTRAL_GOV_INFRASTRUCTURE')}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Ministry of Infrastructure Development</p>
                            <p className="text-xs text-gray-500">Project monitoring, quality control</p>
                          </div>
                          {selectedRole === 'CENTRAL_GOV_INFRASTRUCTURE' && (
                            <Badge className="bg-blue-600">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Provincial Government - Province Selection */}
                  {selectedCategory === 'PROVINCIAL' && (
                    <div className="space-y-2">
                      <Label>Select Province <span className="text-red-500">*</span></Label>
                      <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.id} value={province.id}>
                              {province.name} ({province.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Local Government - Province & Local Unit Selection */}
                  {selectedCategory === 'LOCAL' && (
                    <>
                      <div className="space-y-2">
                        <Label>Select Province <span className="text-red-500">*</span></Label>
                        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province.id} value={province.id}>
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Local Unit Name <span className="text-red-500">*</span></Label>
                        <Input
                          name="localUnit"
                          type="text"
                          placeholder="e.g., Kathmandu Metropolitan City"
                          value={selectedLocalUnit}
                          onChange={(e) => setSelectedLocalUnit(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Contractor - Company Info */}
                  {selectedCategory === 'CONTRACTOR' && (
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Your construction company name"
                        required
                      />
                    </div>
                  )}

                  {/* Citizen - National ID */}
                  {selectedCategory === 'CITIZEN' && (
                    <div className="space-y-2">
                      <Label htmlFor="nidNumber">National ID Number</Label>
                      <Input
                        id="nidNumber"
                        name="nidNumber"
                        type="text"
                        placeholder="Your National ID number (optional)"
                      />
                      <p className="text-xs text-gray-500">
                        Providing your NID helps verify your identity and show projects in your area
                      </p>
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Designation for Government Officials */}
                  {(selectedCategory === 'CENTRAL' || selectedCategory === 'PROVINCIAL' || selectedCategory === 'LOCAL') && (
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g., Secretary, Director, Mayor, Officer"
                      />
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms and Privacy */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      required
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{' '}
                      <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className={`w-full ${
                      selectedCategory === 'CENTRAL' ? 'bg-purple-600 hover:bg-purple-700' :
                      selectedCategory === 'PROVINCIAL' ? 'bg-indigo-600 hover:bg-indigo-700' :
                      selectedCategory === 'LOCAL' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      selectedCategory === 'CONTRACTOR' ? 'bg-teal-600 hover:bg-teal-700' :
                      'bg-cyan-600 hover:bg-cyan-700'
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login as {
                          selectedCategory === 'CENTRAL' ? 'Central Government' :
                          selectedCategory === 'PROVINCIAL' ? 'Provincial Government' :
                          selectedCategory === 'LOCAL' ? 'Local Government' :
                          selectedCategory === 'CONTRACTOR' ? 'Contractor' :
                          'Citizen'
                        }
                      </>
                    )}
                  </Button>

                  {/* Additional Links */}
                  <div className="text-center space-y-2 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <a href="#" className="text-emerald-600 hover:underline font-medium">
                        Register here
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <a href="#" className="text-emerald-600 hover:underline">
                        Forgot password?
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="flex justify-center mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <h4 className="font-semibold text-sm">Secure Access</h4>
                <p className="text-xs text-gray-500 mt-1">Role-based authentication with secure data encryption</p>
              </div>
              <div className="text-center p-4">
                <div className="flex justify-center mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <h4 className="font-semibold text-sm">Full Transparency</h4>
                <p className="text-xs text-gray-500 mt-1">Track every rupee spent on public projects</p>
              </div>
              <div className="text-center p-4">
                <div className="flex justify-center mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <h4 className="font-semibold text-sm">Real-time Updates</h4>
                <p className="text-xs text-gray-500 mt-1">Live project status and payment tracking</p>
              </div>
            </div>
          </div>
        )}

        {/* Default State - No Category Selected */}
        {!selectedCategory && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Select your role above to continue to the login form
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Civic Track</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-emerald-600">About</a>
              <a href="#" className="hover:text-emerald-600">Contact</a>
              <a href="#" className="hover:text-emerald-600">Help</a>
              <a href="#" className="hover:text-emerald-600">Privacy</a>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Government of Nepal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}