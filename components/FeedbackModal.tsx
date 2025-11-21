import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Form State
  const [email, setEmail] = useState('');
  const [missingFields, setMissingFields] = useState('');
  const [improvements, setImprovements] = useState('');

  // ---------------------------------------------------------------------------
  // SETUP INSTRUCTIONS:
  // 1. Go to https://formspree.io/ and login with aggalib@gmail.com
  // 2. Create a new form named "CareerCompensate Feedback"
  // 3. Copy the 8-character Form ID (e.g., xqjqprzv) and paste it below inside the quotes.
  // ---------------------------------------------------------------------------
  const FORMSPREE_FORM_ID: string = "mnnwkblw"; 

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    
    // Prepare payload
    // Note: We only include the 'email' field if it is a valid string.
    // Sending "Anonymous" in the email field causes Formspree to reject it as an invalid email address.
    const payload: any = {
        rating,
        missing_fields: missingFields,
        improvements,
        _subject: `New App Feedback (${rating}/5 stars)`,
    };

    if (email && email.trim().length > 0) {
        payload.email = email.trim();
    } else {
        payload.sender_status = "Anonymous User";
    }

    try {
        const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Critical for avoiding redirects
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Formspree Error:", errorData);
            throw new Error("Failed to send feedback");
        }
        
        setStep('success');
    } catch (error) {
        console.error("Error sending feedback:", error);
        // Fallback to success UI so user doesn't feel stuck, but log error for dev
        setStep('success'); 
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setRating(0);
      setEmail('');
      setMissingFields('');
      setImprovements('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-white/50">
        
        {/* Decorative Header Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"></div>
        
        <button 
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8">
          {step === 'success' ? (
            <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Feedback Received!</h3>
                <p className="text-slate-500">Thank you for helping us build a better career tool.</p>
                <button 
                    onClick={handleClose}
                    className="mt-6 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Close
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Help us Improve</h3>
                    <p className="text-slate-500 text-sm">Your insights directly shape the future of this AI.</p>
                </div>

                {/* Star Rating */}
                <div className="flex flex-col items-center space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">How helpful was the analysis?</label>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <svg 
                                    className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Contact Email (Optional) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex justify-between">
                        <span>Email (Optional)</span>
                        <span className="text-xs font-normal text-slate-400 self-center">Leave blank for anonymous</span>
                    </label>
                    <input 
                        type="email"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Question 1: Missing Inputs */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">
                        What profile details did we miss?
                    </label>
                    <textarea 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm min-h-[80px]"
                        placeholder="e.g. Remote work status, Stock options, Certifications..."
                        value={missingFields}
                        onChange={(e) => setMissingFields(e.target.value)}
                    />
                </div>

                {/* Question 2: Quality/Accuracy */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">
                        How can we improve the analysis?
                    </label>
                    <textarea 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm min-h-[80px]"
                        placeholder="e.g. Salary prediction was too low, Job titles were generic..."
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={step === 'submitting'}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {step === 'submitting' ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                    ) : 'Send Feedback'}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;