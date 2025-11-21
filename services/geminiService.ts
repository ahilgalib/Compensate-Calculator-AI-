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

  // Calculate annual totals with safe numbers (Only for experienced)
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

  let prompt = "";

  if (profile.isEntryLevel) {
    prompt = `
      Act as an Inspiring Career Mentor and Market Analyst for Fresh Graduates.
      Analyze this Entry-Level profile.
      
      Profile:
      - Target Role: ${profile.currentRole || 'Not Specified'}
      - Education: ${profile.education || 'Not Specified'}
      - Key Skills: ${profile.userSkills || 'Not Specified'}
      - Key Projects/Thesis: "${profile.projectDetails || 'None listed'}"
      - Location: ${profile.location || 'Unknown'}
      - Industry: ${profile.industry || 'General'}
      - Currency: ${profile.currency || 'USD'}
      - User's Expected Monthly Salary: ${profile.expectedSalary || 0}

      TASK:
      1. REAL-TIME MARKET DATA: Estimate the *actual* Entry-Level salary range (Annual) for this role in this location based on platforms like Glassdoor/LinkedIn/Levels.fyi.
      2. PROJECT VALUATION: In 'gapAnalysis', specifically analyze their Project/Thesis. How does this project translate to real-world value? (e.g., "Your thesis on AI shows you can handle complex data...").
      3. GROWTH MAP: Instead of "Next Role", predict where they could be in 2 years (e.g. "Mid-Level Engineer").
      4. SKILL GAP: List 3-5 "Money-Making Skills" they should add immediately to increase their value.
      5. INTERVIEW PITCH: Create a script on how to SELL their Project/Thesis during an interview to negotiate a higher salary.
         - Map "whyYouArePerfect" to "How to explain your Project's Impact".
         - Map "whyYouDeserveIt" to "Why your skills define your value, not your experience".

      Provide a strict JSON response conforming to the schema.
    `;
  } else {
    prompt = `
      Act as an Expert Executive Headhunter and Senior Compensation Data Scientist. 
      Analyze the following EXPERIENCED profile using REAL-TIME market data contexts for late 2024/2025.
      
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
      3. CHECKLIST FOR SWITCHING: Generate 5 critical, specific things this user must check in their offer letter or interview for the NEXT role.
      4. NEGOTIATION SCRIPT: Create a data-backed argument for why they are ready for this next step.
      
      Provide a strict JSON response conforming to the schema.
    `;
  }

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
                paymentStatus: { type: Type.STRING, enum: ["Underpaid", "Fair", "Highly Competitive", "Entry Level"] },
                percentile: { type: Type.NUMBER },
                gapAnalysis: { type: Type.STRING, description: "For newbies: Project Valuation & Employability Sentiment" }
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
                  items: { type: Type.STRING },
                  description: "For newbies: High demand skills to learn"
                },
                switchChecklist: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific things to verify before accepting the job offer"
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