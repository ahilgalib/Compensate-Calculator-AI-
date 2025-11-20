import React, { useState } from 'react';
import { CompensationInsights, UserProfile } from '../types';

interface ResultsDashboardProps {
  results: CompensationInsights;
  userProfile: UserProfile;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, userProfile, onReset }) => {
  
  // --- 1. Financial Calculations ---
  const currentAnnual = (
    ((userProfile.monthlyBaseSalary || 0) * 12) +
    ((userProfile.monthlyIncentive || 0) * 12) +
    ((userProfile.monthlyOvertime || 0) * 12) +
    (userProfile.annualProfitShare || 0) +
    (userProfile.festivalBonus || 0) +
    (userProfile.providentFund || 0) +
    (userProfile.gratuity || 0)
  );

  const currentMonthly = currentAnnual / 12;

  const nextAnnualMedian = results.nextCareerMove.salaryRange.median;
  const nextMonthlyMedian = nextAnnualMedian / 12;

  const growthPercentage = ((nextAnnualMedian - currentAnnual) / currentAnnual) * 100;

  const currencySymbol = userProfile.currency === 'USD' ? '$' : 
                         userProfile.currency === 'EUR' ? '€' : 
                         userProfile.currency === 'GBP' ? '£' : 
                         userProfile.currency === 'BDT' ? '৳' : 
                         userProfile.currency === 'INR' ? '₹' : '$';

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short"
    }).format(amount);
  };

  // --- 2. Interactive Components ---

  const MarketSpectrum = ({ 
    min, 
    max, 
    median, 
    current, 
    label,
    type 
  }: { 
    min: number, 
    max: number, 
    median: number, 
    current?: number, 
    label: string,
    type: 'current' | 'future'
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Normalize values to percentages (0-100%)
    const getPos = (val: number) => Math.min(Math.max(((val - min) / (max - min)) * 100, 0), 100);

    const medianPos = getPos(median);
    const currentPos = current ? getPos(current) : 0;
    // Markers for 25th and 75th percentile approximations
    const p25Pos = getPos(min + (median - min) / 2); 
    const p75Pos = getPos(median + (max - median) / 2);

    const gradientClass = type === 'current' 
      ? 'from-indigo-500 via-purple-500 to-pink-500' 
      : 'from-emerald-400 via-teal-500 to-cyan-600';

    return (
      <div 
        className="relative pt-10 pb-6 group cursor-default"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex justify-between items-end mb-4 px-1">
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">{label}</h4>
          <div className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">
            Market Range: {currencySymbol}{formatMoney(min)} - {currencySymbol}{formatMoney(max)}
          </div>
        </div>

        {/* The Track */}
        <div className="h-3 bg-slate-100 rounded-full w-full relative shadow-inner">
          
          {/* Active Zone (25th to 75th percentile - The "Fat" part of the market) */}
          <div 
             className={`absolute top-0 h-full rounded-full bg-gradient-to-r ${gradientClass} opacity-30`}
             style={{ left: `${p25Pos}%`, width: `${p75Pos - p25Pos}%` }}
          ></div>

          {/* Ticks */}
          {[0, 25, 50, 75, 100].map(pct => (
             <div key={pct} className="absolute top-full mt-2 w-px h-2 bg-slate-200" style={{ left: `${pct}%` }}></div>
          ))}
          <div className="absolute top-full mt-2 left-0 -translate-x-1/2 text-[10px] text-slate-400 font-medium">Min</div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">Median</div>
          <div className="absolute top-full mt-2 right-0 translate-x-1/2 text-[10px] text-slate-400 font-medium">Max</div>

          {/* Median Marker */}
          <div 
            className="absolute -top-1 h-5 w-0.5 bg-slate-300 z-10"
            style={{ left: `${medianPos}%` }}
          ></div>

          {/* User Marker (The Dot) */}
          {current && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-[3px] transition-all duration-1000 ease-out z-20 hover:scale-125 hover:shadow-xl cursor-help"
              style={{ left: `${currentPos}%`, borderColor: type === 'current' ? '#6366f1' : '#10b981' }}
            >
               {/* Popup Tooltip */}
               <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max bg-slate-900/90 backdrop-blur-sm text-white text-xs p-3 rounded-xl shadow-xl transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                 <div className="font-bold mb-0.5">{type === 'current' ? 'You are here' : 'Target Salary'}</div>
                 <div className="text-slate-300 font-normal">
                   {currencySymbol}{formatMoney(current)} / yr
                 </div>
                 <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/90 rotate-45"></div>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- 3. Feasibility Score Component ---
  const FeasibilityCard = ({ score }: { score: number }) => {
     return (
        <div className="group relative h-full min-h-[200px] rounded-[2rem] p-1 bg-gradient-to-br from-slate-100 to-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-visible">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 rounded-[2rem] blur-xl transition-opacity duration-700 -z-10"></div>
            
            <div className="h-full bg-white/80 backdrop-blur-xl rounded-[1.8rem] p-6 flex flex-col items-center justify-center border border-white/50 relative overflow-hidden">
                
                {/* Label */}
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 z-10">Match Probability</h3>

                {/* Circle Chart */}
                <div className="relative w-32 h-32 z-10 flex items-center justify-center">
                    {/* Background Ring */}
                    <svg className="w-full h-full transform -rotate-90 absolute">
                        <circle cx="64" cy="64" r="58" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle 
                            cx="64" cy="64" r="58" 
                            stroke="url(#gradientScore)" 
                            strokeWidth="8" 
                            strokeLinecap="round"
                            fill="transparent" 
                            strokeDasharray={364} 
                            strokeDashoffset={364 - (364 * score) / 100} 
                            className="transition-all duration-1000 ease-out" 
                        />
                        <defs>
                            <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#c026d3" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="relative z-20 flex items-center justify-center flex-col">
                        {/* LIQUID TEXT ANIMATION applied here */}
                        <span className="text-4xl font-black liquid-text">{score}%</span>
                    </div>
                </div>
                
                <p className="text-sm font-semibold text-slate-500 mt-4 z-10 group-hover:text-fuchsia-600 transition-colors">
                    {score > 75 ? "High Potential" : score > 50 ? "Moderate Reach" : "Ambitious"}
                </p>

                {/* Hover Popup Content */}
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 rounded-[1.8rem]">
                    <div>
                        <div className="text-fuchsia-400 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-white text-sm font-medium leading-relaxed">
                            Based on current job market data for {userProfile.currentRole} with {userProfile.yearsExperience} years exp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
     )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* --- 1. Hero Comparison Section --- */}
      <div className="relative rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-200/40 overflow-hidden border border-slate-100 group">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-indigo-100 transition-colors duration-1000"></div>

          <div className="relative z-10 p-8 md:p-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-time Analysis</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        From <span className="text-indigo-600">{userProfile.currentRole}</span> to <span className="text-fuchsia-600">{results.nextCareerMove.roleTitle}</span>
                    </h2>
                </div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Projected Growth</p>
                     <p className={`text-xl font-black ${growthPercentage > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {growthPercentage > 0 ? '+' : ''}{growthPercentage.toFixed(0)}%
                     </p>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                
                {/* Left: Current Reality */}
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-200 hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Income</h3>
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black text-slate-900">{currencySymbol}{formatMoney(currentMonthly)}</span>
                         <span className="text-sm font-semibold text-slate-400">/mo</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-500">
                        {currencySymbol}{formatMoney(currentAnnual)} per year
                    </div>
                </div>

                {/* Right: Future Potential */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 border border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Potential Income</h3>
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm text-emerald-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{currencySymbol}{formatMoney(nextMonthlyMedian)}</span>
                            <span className="text-sm font-semibold text-indigo-300">/mo</span>
                        </div>
                        <div className="mt-2 text-sm font-medium text-indigo-200">
                            ~{currencySymbol}{formatMoney(nextAnnualMedian)} per year
                        </div>
                    </div>
                </div>

            </div>
          </div>
      </div>

      {/* --- 2. Market Spectrum Visualizers --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-center">
             <MarketSpectrum 
                type="current"
                label="Your Pay vs. Market"
                min={results.marketAnalysis.currentRoleMarketValue.min}
                max={results.marketAnalysis.currentRoleMarketValue.max}
                median={results.marketAnalysis.currentRoleMarketValue.median}
                current={currentAnnual}
             />
             <div className="mt-6 text-xs text-slate-500 leading-relaxed px-1">
                 <strong className="text-indigo-600">Insight:</strong> {results.marketAnalysis.gapAnalysis}
             </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-center">
             <MarketSpectrum 
                type="future"
                label="Future Salary Band"
                min={results.nextCareerMove.salaryRange.min}
                max={results.nextCareerMove.salaryRange.max}
                median={results.nextCareerMove.salaryRange.median}
                current={nextAnnualMedian} // Show median as the target
             />
             <div className="mt-6 text-xs text-slate-500 leading-relaxed px-1">
                 <strong className="text-emerald-600">Target:</strong> Moving to {results.nextCareerMove.roleTitle} places you in a higher bracket. Top earners in this role make up to {currencySymbol}{formatMoney(results.nextCareerMove.salaryRange.max)}.
             </div>
        </div>
      </div>

      {/* --- 3. Skills & Feasibility Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Skills Card */}
          <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-1">Skill Gap Analysis</h3>
                    <p className="text-sm text-slate-500">Acquire these skills to unlock the next level.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {results.nextCareerMove.requiredSkills.map((skill, i) => (
                        <span key={i} className="group relative px-4 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold tracking-wide border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-default overflow-hidden">
                            <span className="relative z-10">{skill}</span>
                        </span>
                    ))}
                </div>
          </div>

          {/* Feasibility Card */}
          <FeasibilityCard score={results.nextCareerMove.probabilityScore} />
      </div>
      
      {/* --- 3.5 Job Switch Checklist (New) --- */}
      {results.nextCareerMove.switchChecklist && results.nextCareerMove.switchChecklist.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
           <div className="relative z-10">
             <h3 className="text-xl font-black mb-6 flex items-center gap-3">
               <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Critical Checks Before You Switch
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {results.nextCareerMove.switchChecklist.map((item, idx) => (
                 <div key={idx} className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors">
                    <div className="min-w-[24px] h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">{item}</p>
                 </div>
               ))}
             </div>
             <p className="mt-6 text-xs text-slate-400 font-medium text-center opacity-70">
                * Verify these details in your offer letter to avoid future regret.
             </p>
           </div>
        </div>
      )}

      {/* --- 4. Negotiation Section --- */}
      <div className="pt-4">
          <div className="flex items-center space-x-4 mb-8 justify-center opacity-60">
            <div className="h-px w-8 bg-slate-300"></div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action Plan</h3>
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Script 1 */}
              <div className="bg-white p-8 rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-100/20 group hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-slate-900">Value Proposition</h4>
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">Script 1</span>
                  </div>
                  <div className="text-slate-600 italic leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-sm mb-4">
                      "{results.negotiation.whyYouArePerfect}"
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(results.negotiation.whyYouArePerfect)}
                    className="w-full py-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Copy to Clipboard
                  </button>
              </div>

              {/* Script 2 */}
              <div className="bg-white p-8 rounded-[2rem] border border-fuchsia-100 shadow-xl shadow-fuchsia-100/20 group hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-slate-900">Salary Justification</h4>
                      <span className="text-xs font-bold text-fuchsia-500 bg-fuchsia-50 px-2 py-1 rounded">Script 2</span>
                  </div>
                  <div className="text-slate-600 italic leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-sm mb-4">
                      "{results.negotiation.whyYouDeserveIt}"
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(results.negotiation.whyYouDeserveIt)}
                    className="w-full py-3 rounded-xl text-xs font-bold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors flex items-center justify-center gap-2"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Copy to Clipboard
                  </button>
              </div>
          </div>
      </div>

      {/* Reset Button */}
      <div className="pt-12 flex justify-center pb-12">
          <button 
              onClick={onReset}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105 flex items-center gap-2"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Analyze Another Profile
          </button>
      </div>

    </div>
  );
};

export default ResultsDashboard;