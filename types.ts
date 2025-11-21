export interface UserProfile {
  currentRole: string;
  yearsExperience: number;
  location: string;
  currency: string;
  industry: string;
  
  // Newbie / Entry Level Fields
  isEntryLevel: boolean;
  education?: string;
  userSkills?: string;
  projectDetails?: string; // New field for Thesis/Projects
  expectedSalary?: number; // New field for expectations

  // Detailed Compensation (Optional for Entry Level)
  monthlyBaseSalary: number;
  monthlyIncentive: number;
  annualProfitShare: number;
  monthlyOvertime: number;
  festivalBonus: number;
  providentFund: number;
  gratuity: number;
  benefits: string[];
}

export interface SalaryRange {
  min: number;
  median: number;
  max: number;
}

export interface NextRolePrediction {
  roleTitle: string;
  timeframeYears: string;
  probabilityScore: number;
  salaryRange: SalaryRange;
  requiredSkills: string[];
  switchChecklist: string[]; 
}

export interface MarketAnalysis {
  currentRoleMarketValue: SalaryRange;
  paymentStatus: 'Underpaid' | 'Fair' | 'Highly Competitive' | 'Entry Level';
  percentile: number;
  gapAnalysis: string; // Used for Project/Skill Analysis for newbies
}

export interface NegotiationStrategy {
  whyYouArePerfect: string;
  whyYouDeserveIt: string;
  tips: string[];
}

export interface CompensationInsights {
  marketAnalysis: MarketAnalysis;
  nextCareerMove: NextRolePrediction;
  negotiation: NegotiationStrategy;
  verdictColor: string; 
}