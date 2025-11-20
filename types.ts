export interface UserProfile {
  currentRole: string;
  yearsExperience: number;
  location: string;
  currency: string;
  industry: string;
  
  // Detailed Compensation
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
  switchChecklist: string[]; // New field for job switch reminders
}

export interface MarketAnalysis {
  currentRoleMarketValue: SalaryRange;
  paymentStatus: 'Underpaid' | 'Fair' | 'Highly Competitive';
  percentile: number;
  gapAnalysis: string;
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