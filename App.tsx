import React, { useState, useRef } from 'react';
import SalaryForm from './components/SalaryForm';
import ResultsDashboard from './components/ResultsDashboard';
import LoadingScreen from './components/LoadingScreen';
import FeedbackModal from './components/FeedbackModal';
import { UserProfile, CompensationInsights } from './types';
import { analyzeCompensation } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompensationInsights | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const handleAnalysis = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    setUserProfile(profile);
    
    try {
      const data = await analyzeCompensation(profile);
      if (data) {
        setResults(data);
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setError("Could not generate analysis. Please try again.");
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "MISSING_API_KEY") {
        setError(
          <span>
            API Key is missing. Please configure your Environment Variables with 'API_KEY'.
            <br />
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-red-800 mt-2 inline-block"
            >
              Get a free API Key here
            </a>
          </span>
        );
      } else {
        setError("Analysis failed. Please check your internet connection and try again.");
      }
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setUserProfile(null);
    setError(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 flex flex-col relative overflow-hidden">
      
      {/* Background Decor (Blobs) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-200/30 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Modern Glass Navigation */}
      <nav ref={topRef} className="sticky top-0 z-50 py-4 backdrop-blur-md bg-white/70 border-b border-white/50 supports-[backdrop-filter]:bg-white/50">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Compensate<span className="text-indigo-600">AI</span></span>
            </div>
            
            <div className="flex items-center gap-4">
                {results && (
                    <button onClick={handleReset} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">
                        New Analysis
                    </button>
                )}
                <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-indigo-100 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                    Feedback
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-grow w-full relative z-10">
        
        {!results && !isLoading && (
           <div className="max-w-3xl mx-auto mb-12 text-center animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                  <span>✨ AI-Powered Career Intelligence</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Know Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">True Worth</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto font-medium">
                Get precise salary benchmarking, predict your next role, and generate negotiation scripts in seconds.
              </p>
           </div>
        )}

        <div className="transition-all duration-500 ease-in-out">
          {isLoading ? (
            <LoadingScreen />
          ) : results && userProfile ? (
            <ResultsDashboard 
                results={results} 
                userProfile={userProfile} 
                onReset={handleReset}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
               {error && (
                 <div className="mb-8 p-6 bg-red-50 text-red-700 rounded-2xl flex items-center gap-4 border border-red-100 shadow-sm">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <p className="font-bold">Analysis Error</p>
                        <div className="text-sm opacity-90">{error}</div>
                    </div>
                 </div>
               )}
               <SalaryForm onSubmit={handleAnalysis} isLoading={isLoading} />
            </div>
          )}
        </div>

      </main>
      
      {/* Minimal Footer */}
      <footer className="py-8 mt-auto text-center">
        <p className="text-slate-400 text-sm font-medium">
          Developed by <a href="https://www.linkedin.com/in/aggalib/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors underline decoration-indigo-200 hover:decoration-indigo-600">ahilgalib</a>
        </p>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

    </div>
  );
};

export default App;