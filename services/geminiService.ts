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

  const benefitsStr = profile.benefits && profile.benefits.length > 0 ? profile.benefits.join(', ') : 'None listed';

  const prompt = `
    Analyze the following professional profile for compensation benchmarking and career progression.
    
    Profile Details:
    - Role: ${profile.currentRole || 'Professional'}
    - Experience: ${safeNum(profile.yearsExperience)} years
    - Location: ${profile.location || 'Unknown'}
    - Industry: ${profile.industry || 'General'}
    - Currency: ${profile.currency || 'USD'}
    
    Compensation Breakdown (Annualized):
    - Base Salary (Annualized): ${annualBaseSalary}
    - Incentive (Annualized): ${annualIncentive}
    - Profit Share (Annual): ${profitShare}
    - Overtime (Annualized): ${annualOvertime}
    - Festival Bonus: ${festival}
    - Provident Fund: ${pf}
    - Gratuity: ${grat}
    - Total Annual Package: ${totalComp}
    
    Benefits / Perks:
    ${benefitsStr}
    
    TASK:
    1. Evaluate if the Current Total Annual Package (${totalComp} ${profile.currency}) is fair for the role of "${profile.currentRole}" with ${profile.yearsExperience} years experience specifically in ${profile.location}.
    2. Predict the NEXT likely role and the expected salary range for that NEXT role in ${profile.location}.
    3. Provide negotiation scripts:
       - "Why You Are Perfect": A persuasive script tailored to their experience level explaining why they are the ideal candidate.
       - "Why You Are Asking This": A data-backed script justifying the specific salary increase or package they should ask for, referencing market rates and inflation.
       - "Tips": Actionable, short tips for the negotiation meeting with HR.
    
    Provide a strict JSON response.
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
                percentile: { type: Type.NUMBER, description: "Estimated percentile of current pay vs market (0-100)" },
                gapAnalysis: { type: Type.STRING, description: "A concise explanation of the salary gap based on location." }
              },
              required: ["currentRoleMarketValue", "paymentStatus", "percentile", "gapAnalysis"]
            },
            nextCareerMove: {
              type: Type.OBJECT,
              properties: {
                roleTitle: { type: Type.STRING },
                timeframeYears: { type: Type.STRING, description: "e.g. '1-2 years'" },
                probabilityScore: { type: Type.NUMBER, description: "0-100 confidence in this path" },
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
                }
              },
              required: ["roleTitle", "timeframeYears", "probabilityScore", "salaryRange", "requiredSkills"]
            },
            negotiation: {
              type: Type.OBJECT,
              properties: {
                whyYouArePerfect: { type: Type.STRING, description: "Script explaining why the user is the perfect candidate." },
                whyYouDeserveIt: { type: Type.STRING, description: "Script explaining why they are asking for this specific compensation." },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3-4 short, bulleted actionable tips."
                }
              },
              required: ["whyYouArePerfect", "whyYouDeserveIt", "tips"]
            },
            verdictColor: { type: Type.STRING, description: "A hex color code representing the status (Red/Yellow/Green)" }
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