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
  const [countdown, setCountdown] = useState(7); 
  const [showParticles, setShowParticles] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartClick = () => {
    setShowParticles(false);
    setTimeout(() => setCurrentScreen("video"), 300);
  };
  
  const handleVideoEnd = () => setCurrentScreen("survey");
  
  const handleVideoError = () => {
    console.error("Video failed to load");
    setVideoError(true);
    // Automatically proceed to survey after a short delay
    setTimeout(() => setCurrentScreen("survey"), 2000);
  };

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

      setCountdown(7);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // After countdown, go to start
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
            setVideoError(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
      <div className="min-h-screen relative overflow-hidden bg-[#2b475c]">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a5c78]/20 via-transparent to-transparent" />
        {showParticles && <Particles />}
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b475c]/50 via-transparent to-[#2b475c]/30 backdrop-blur-[2px]" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">

          <div className="text-center flex flex-col items-center justify-center space-y-8 max-w-4xl">
            {/* Logo/Icon */}

             <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <img src="/altaaqa.png" alt="Altaaqa Logo" className="w-48 h-auto" />

             {/* Divider */}
            <div className="w-full md:w-px h-px md:h-20 bg-white/40" />

            <img src="/fast.png" alt="Fast Logo" className="w-48 h-auto" />
        </div>

            
           
            
  
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Experience the future of technology through our immersive journey
            </p>
            
            <div className="pt-8">
              <button
                onClick={handleStartClick}
                className="group relative px-12 py-6 bg-[#2b475c] rounded-2xl text-2xl font-bold text-white shadow-2xl border-2 border-white/30 hover:border-white/50 transform transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Begin Experience
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "video") {
    return (
      <div className="min-h-screen w-full bg-[#2b475c] relative overflow-hidden flex items-center justify-center">
        {videoError ? (
          <div className="text-center text-white p-8">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Video Unavailable</h3>
            <p className="text-lg text-white/80 mb-6">We're having trouble loading the video. Proceeding to survey...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-screen object-cover"
              autoPlay
              muted
              onEnded={handleVideoEnd}
              onError={handleVideoError}
              controls={false}
            >
              {/* Replace with your actual video URL - this is a sample placeholder */}
              <source src="videoal.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Elegant skip button */}
            <button
              onClick={handleVideoEnd}
              className="absolute top-8 right-8 px-6 py-3 bg-[#2b475c]/80 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-[#2b475c] transition-all duration-300 flex items-center gap-2"
            >
              <span>Skip</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    );
  }

 if (currentScreen === "survey") {
  return (
    <div className="min-h-screen bg-[#2b475c] py-12 px-6">
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center space-y-8">

        {/* Logos with divider */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <img src="/altaaqa.png" alt="Altaaqa Logo" className="w-48 h-auto" />
          <div className="w-full md:w-px h-px md:h-20 bg-white/40" />
          <img src="/fast.png" alt="Fast Logo" className="w-48 h-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-5xl font-bold text-white mb-4">
            Altaaqa Exhibition Survey
          </h2>
          <p className="text-xl text-white/80">
            Thank you for visiting Altaaqa! Your feedback helps us provide
            solutions that save costs, improve reliability, and support your
            growth.
          </p>
        </div>

        {/* Survey Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl space-y-8 text-white w-full">

          {/* 1. Sector */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              1. Which sector best describes your business?
            </h3>
            {[
              "Mining",
              "Construction",
              "Oil & Gas",
              "Manufacturing / Cement",
              "Data Centers / IT",
              "Events & Entertainment",
              "Utilities / Government",
              "Healthcare",
              "Other",
            ].map((opt) => (
              <label key={opt} className="block">
                <input
                  type="radio"
                  name="sector"
                  value={opt}
                  checked={surveyData.sector === opt}
                  onChange={(e) => handleChange("sector", e.target.value)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          {/* 2. Power Solution */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              2. What type of power solution do you usually require?
            </h3>
            {[
              "Temporary / Rental Power",
              "Long-term Power Projects",
              "Renewable / Hybrid Energy",
              "Emergency Backup Power",
              "Other",
            ].map((opt) => (
              <label key={opt} className="block">
                <input
                  type="radio"
                  name="solution"
                  value={opt}
                  checked={surveyData.solution === opt}
                  onChange={(e) => handleChange("solution", e.target.value)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          {/* 3. Capacity */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              3. What capacity range do you typically need?
            </h3>
            {["Below 1 MW", "1 – 10 MW", "10 – 50 MW", "Above 50 MW"].map(
              (opt) => (
                <label key={opt} className="block">
                  <input
                    type="radio"
                    name="capacity"
                    value={opt}
                    checked={surveyData.capacity === opt}
                    onChange={(e) => handleChange("capacity", e.target.value)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              )
            )}
          </div>

          {/* 4. Challenges */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              4. What challenges matter most to you today?
            </h3>
            {[
              "Reliability / Frequent Outages",
              "High Power Costs",
              "Sustainability & ESG Goals",
              "Scalability / Meeting Demand",
              "Speed of Deployment",
              "Service & Maintenance Quality",
              "Other",
            ].map((opt) => (
              <label key={opt} className="block">
                <input
                  type="checkbox"
                  value={opt}
                  checked={surveyData.challenges?.includes(opt)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSurveyData((prev: any) => ({
                      ...prev,
                      challenges: checked
                        ? [...(prev.challenges || []), opt]
                        : (prev.challenges || []).filter(
                            (c: string) => c !== opt
                          ),
                    }));
                  }}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          {/* 5. Partner importance */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              5. When choosing a power partner, how important are the following?
              (1 = Not Important, 5 = Very Important)
            </h3>
            {[
              "Fast deployment & availability",
              "Cost efficiency",
              "Environmental sustainability",
              "Technical support & reliability",
              "Long-term partnership",
            ].map((q) => (
              <div key={q} className="mb-3">
                <label className="block mb-1">{q}:</label>
                <select
                  value={surveyData[q] || ""}
                  onChange={(e) => handleChange(q, e.target.value)}
                  className="w-full p-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* 6. Currently seeking */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              6. Are you currently seeking a power solution provider?
            </h3>
            {[
              "Yes, urgently",
              "Yes, within the next 6 months",
              "Exploring options for the future",
              "Not at the moment",
            ].map((opt) => (
              <label key={opt} className="block">
                <input
                  type="radio"
                  name="seeking"
                  value={opt}
                  checked={surveyData.seeking === opt}
                  onChange={(e) => handleChange("seeking", e.target.value)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          {/* 7. Follow-up */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              7. Would you like Altaaqa to follow up with a tailored solution?
            </h3>
            <label className="block mb-2">
              <input
                type="radio"
                name="followup"
                value="Yes"
                checked={surveyData.followup === "Yes"}
                onChange={(e) => handleChange("followup", e.target.value)}
                className="mr-2"
              />
              Yes (please share your details)
            </label>
            {surveyData.followup === "Yes" && (
              <div className="space-y-3 pl-6">
                <input
                  type="text"
                  placeholder="Name"
                  value={surveyData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={surveyData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="w-full p-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Email / Phone / WhatsApp"
                  value={surveyData.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  className="w-full p-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
            <label className="block mt-2">
              <input
                type="radio"
                name="followup"
                value="No"
                checked={surveyData.followup === "No"}
                onChange={(e) => handleChange("followup", e.target.value)}
                className="mr-2"
              />
              No, just exploring
            </label>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-5 rounded-xl text-xl font-bold bg-white text-[#2b475c] hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-white"
            >
              {isLoading ? "Processing..." : "Submit Survey"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




if (currentScreen === "thankyou") {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2b475c] text-white relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-ping" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center space-y-10 max-w-3xl px-6 animate-fadeIn">
        {/* Altaaqa Logo + Header */}



        <div className="flex flex-col items-center space-y-4">
          
<div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <img src="/altaaqa.png" alt="Altaaqa Logo" className="w-48 h-auto" />
          <div className="w-full md:w-px h-px md:h-20 bg-white/40" />
          <img src="/fast.png" alt="Fast Logo" className="w-48 h-auto" />
        </div>

          <h2 className="text-4xl font-bold animate-fadeUp">
            Altaaqa Exhibition Survey
          </h2>
          <p className="text-lg text-white/70 max-w-2xl animate-fadeUp delay-200">
            Thank you for visiting Altaaqa! Your feedback helps us provide solutions that save costs, 
            improve reliability, and support your growth.
          </p>
        </div>

        {/* Success icon */}
        <div className="mx-auto w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-bounceSlow">
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

        {/* Thank you message */}
        <h1 className="text-5xl md:text-6xl font-extrabold animate-fadeUp">
          Thank You!
        </h1>
        <p className="text-xl font-light text-white/80 animate-fadeUp delay-150">
          Your feedback has been successfully recorded.  
          We truly appreciate your time and support.
        </p>

        <p className="text-white/60 animate-pulse">
          Returning to welcome screen in <span className="font-bold">{countdown}</span>...
        </p>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
        .animate-fadeUp {
          animation: fadeUp 1s ease-in-out;
        }
        .animate-fadeDown {
          animation: fadeDown 1s ease-in-out;
        }
        .animate-bounceSlow {
          animation: bounce 3s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

  return null;
}