export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const INDUSTRIES = [
  "Design & Creative",
  "Software & Technology",
  "Finance & Banking",
  "Healthcare & Medicine",
  "Manufacturing",
  "Retail & E-commerce",
  "Media & Entertainment",
  "Education",
  "Consulting",
  "Energy & Utilities",
  "Other"
];

export const BENEFIT_OPTIONS = [
  "Lunch / Snacks / Transport",
  "Laptop / Software subscription",
  "Training / Courses"
];

export const DEFAULT_PROFILE = {
  isEntryLevel: false,
  currentRole: '',
  yearsExperience: 0,
  location: '',
  currency: 'BDT',
  industry: 'Design & Creative',
  education: '',
  userSkills: '',
  projectDetails: '',
  expectedSalary: 0,
  monthlyBaseSalary: 0,
  monthlyIncentive: 0,
  annualProfitShare: 0,
  monthlyOvertime: 0,
  festivalBonus: 0,
  providentFund: 0,
  gratuity: 0,
  benefits: []
};