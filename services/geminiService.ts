import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, CompensationInsights } from "../types";

// Helper to safely get the API key
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing. Please set process.env.API_KEY.");
    return "";
  }
  return key;
};

// Helper to ensure numbers are valid (convert NaN/undefined to 0)
const safeNum = (val: number | undefined | null): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  return 0;
};

export const analyzeCompensation = async (profile: UserProfile): Promise<CompensationInsights | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Calculate annual totals with safe numbers
  const monthlyBase = safeNum(profile.monthlyBaseSalary);
  const monthlyInc = safeNum(profile.monthlyIncentive);
  const monthlyOver = safeNum(profile.monthlyOvertime);
  const profitShare = safeNum(profile.annualProfitShare);
  const festival = safeNum(profile.festivalBonus);
  const pf = safeNum(profile.providentFund);
  const grat = safeNum(profile.gratuity);

  const annualBaseSalary = monthlyBase * 12;
  const annualIncentive = monthlyInc * 12;
  const annualOvertime = monthlyOver * 12;

  const totalComp = annualBaseSalary + annualIncentive + profitShare + annualOvertime + festival + pf + grat;

  const prompt = `
    Act as an Expert Executive Headhunter and Senior Compensation Data Scientist. 
    Analyze the following profile using REAL-TIME market data contexts for late 2024/2025.
    
    User Profile:
    - Role: ${profile.currentRole || 'Professional'}
    - Experience: ${safeNum(profile.yearsExperience)} years
    - Location: ${profile.location || 'Unknown'} (Factor in cost of living and local market demand)
    - Industry: ${profile.industry || 'General'}
    - Currency: ${profile.currency || 'USD'}
    
    Total Annual Compensation: ${totalComp}
    
    TASK:
    1. ACCURATE MARKET ANALYSIS: Compare this user against the *actual* market rates. Be precise.
    2. CAREER LADDER PREDICTION: Identify the exact next logical role. Not just a generic step, but the industry-standard promotion title.
    3. CHECKLIST FOR SWITCHING: Generate 5 critical, specific things this user must check in their offer letter or interview for the NEXT role (e.g., specific benefits, remote policy, equity vesting, team structure) that people often forget.
    4. NEGOTIATION SCRIPT: Create a data-backed argument for why they are ready for this next step.
    
    Provide a strict JSON response conforming to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketAnalysis: {
              type: Type.OBJECT,
              properties: {
                currentRoleMarketValue: {
                  type: Type.OBJECT,
                  properties: {
                    min: { type: Type.NUMBER },
                    median: { type: Type.NUMBER },
                    max: { type: Type.NUMBER },
                  },
                  required: ["min", "median", "max"]
                },
                paymentStatus: { type: Type.STRING, enum: ["Underpaid", "Fair", "Highly Competitive"] },
                percentile: { type: Type.NUMBER },
                gapAnalysis: { type: Type.STRING }
              },
              required: ["currentRoleMarketValue", "paymentStatus", "percentile", "gapAnalysis"]
            },
            nextCareerMove: {
              type: Type.OBJECT,
              properties: {
                roleTitle: { type: Type.STRING },
                timeframeYears: { type: Type.STRING },
                probabilityScore: { type: Type.NUMBER },
                salaryRange: {
                    type: Type.OBJECT,
                    properties: {
                        min: { type: Type.NUMBER },
                        median: { type: Type.NUMBER },
                        max: { type: Type.NUMBER },
                    },
                    required: ["min", "median", "max"]
                },
                requiredSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                switchChecklist: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "5 specific things to verify before accepting the next job offer"
                }
              },
              required: ["roleTitle", "timeframeYears", "probabilityScore", "salaryRange", "requiredSkills", "switchChecklist"]
            },
            negotiation: {
              type: Type.OBJECT,
              properties: {
                whyYouArePerfect: { type: Type.STRING },
                whyYouDeserveIt: { type: Type.STRING },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["whyYouArePerfect", "whyYouDeserveIt", "tips"]
            },
            verdictColor: { type: Type.STRING }
          },
          required: ["marketAnalysis", "nextCareerMove", "negotiation", "verdictColor"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CompensationInsights;
    }
    return null;

  } catch (error) {
    console.error("Error fetching Gemini analysis:", error);
    throw error;
  }
};