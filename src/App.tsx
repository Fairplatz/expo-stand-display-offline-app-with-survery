"use client";
import { useState, useRef } from "react";

export default function PremiumExpoSurvey() {
  const [currentScreen, setCurrentScreen] = useState<"start" | "video" | "survey" | "thankyou">("start");
  const [surveyData, setSurveyData] = useState<any>({
    name: "",
    email: "",
    company: "",
    rating: "",
    feedback: "",
    interests: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartClick = () => {
    setShowParticles(false);
    setTimeout(() => setCurrentScreen("video"), 300);
  };
  
  const handleVideoEnd = () => setCurrentScreen("survey");
  const handleVideoError = () => setCurrentScreen("survey");

  const handleChange = (field: string, value: string) => {
    setSurveyData((prev:any) => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async () => {
    if (!surveyData) {
      alert("Please complete all required fields to continue.");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentScreen("thankyou");

      setTimeout(() => {
        setCurrentScreen("start");
        setSurveyData({
          name: "",
          email: "",
          company: "",
          rating: "",
          feedback: "",
          interests: [],
        });
        setShowParticles(true);
        setIsLoading(false);
      }, 4000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Unable to save your response. Please try again.");
      setIsLoading(false);
    }
  };

  // Animated particles component
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );

  // --- UI Screens ---

  if (currentScreen === "start") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        {showParticles && <Particles />}
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 backdrop-blur-[2px]" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="text-center space-y-8 max-w-4xl">
            {/* Logo/Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100 leading-tight">
              Altaaqa 2025
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 font-light tracking-wide">
              Innovation • Vision • Excellence
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Experience the future of technology through our immersive journey
            </p>
            
            <div className="pt-8">
              <button
                onClick={handleStartClick}
                className="group relative px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl text-2xl font-bold text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Begin Experience
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "video") {
    return (
      <div className="min-h-screen w-full bg-black relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-screen object-cover"
          autoPlay
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          controls={false}
        >
          <source src="/video.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Elegant skip button */}
        <button
          onClick={handleVideoEnd}
          className="absolute top-8 right-8 px-6 py-3 bg-black/30 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-black/50 transition-all duration-300 flex items-center gap-2"
        >
          <span>Skip</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  if (currentScreen === "survey") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-4">
            Presentation Feedback
          </h2>
          <p className="text-xl text-slate-300">Your input helps us improve future sessions</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl space-y-8">
          
          {/* Overall Rating */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-2">Overall, how would you rate the presentation?</h3>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleChange("rating", String(num))}
                  className={`w-16 h-16 rounded-2xl font-bold text-xl transition-all duration-300 ${
                    surveyData.rating === String(num)
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl shadow-yellow-500/30 scale-110"
                      : "bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20 hover:scale-105 border border-white/20"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Clarity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">How clear and easy to understand was the content?</label>
            <select
              value={surveyData.clarity || ""}
              onChange={(e) => handleChange("clarity", e.target.value)}
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select an option</option>
              <option value="Very unclear">Very unclear</option>
              <option value="Unclear">Unclear</option>
              <option value="Neutral">Neutral</option>
              <option value="Clear">Clear</option>
              <option value="Very clear">Very clear</option>
            </select>
          </div>

          {/* Expectations */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Did the presentation meet your expectations?</label>
            <div className="flex gap-4">
              {["Yes", "Somewhat", "No"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange("expectations", opt)}
                  className={`px-6 py-3 rounded-xl transition-all ${
                    surveyData.expectations === opt
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">How engaging was the presenter?</label>
            <select
              value={surveyData.engagement || ""}
              onChange={(e) => handleChange("engagement", e.target.value)}
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-400 outline-none"
            >
              <option value="">Select an option</option>
              <option value="Not engaging">Not engaging</option>
              <option value="Slightly engaging">Slightly engaging</option>
              <option value="Neutral">Neutral</option>
              <option value="Engaging">Engaging</option>
              <option value="Very engaging">Very engaging</option>
            </select>
          </div>

          {/* Most Useful */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Which part of the presentation did you find most useful or interesting?</label>
            <textarea
              value={surveyData.useful || ""}
              onChange={(e) => handleChange("useful", e.target.value)}
              placeholder="Your thoughts..."
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">What improvements would you suggest for future presentations?</label>
            <textarea
              value={surveyData.improvements || ""}
              onChange={(e) => handleChange("improvements", e.target.value)}
              placeholder="Suggestions..."
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-400 outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Recommend */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Would you recommend this presentation to others?</label>
            <div className="flex gap-4">
              {["Yes", "Maybe", "No"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange("recommend", opt)}
                  className={`px-6 py-3 rounded-xl transition-all ${
                    surveyData.recommend === opt
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      : "bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-5 rounded-xl text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? "Processing..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


  if (currentScreen === "thankyou") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 text-white relative overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="text-center space-y-8 z-10 relative max-w-2xl px-6">
          {/* Success Icon */}
          <div className="mx-auto w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 animate-bounce">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 
                  00-1.414-1.414L9 10.586 7.707 9.293a1 1 
                  0 00-1.414 1.414l2 2a1 1 
                  0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
            Thank You!
          </h1>
          <p className="text-2xl font-light text-blue-100">
            Your presentation feedback has been successfully recorded
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-lg text-blue-100">
              Thank you for taking the time to evaluate our Altaaqa presentation.
              Your feedback helps us deliver better experiences and content.
            </p>
          </div>
          <p className="text-slate-300 animate-pulse">
            Returning to welcome screen...
          </p>
        </div>
      </div>
    );
  }

  return null;
}