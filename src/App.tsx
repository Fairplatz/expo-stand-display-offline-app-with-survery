import { useState, useRef, useEffect } from "react";
import initSqlJs from "sql.js";

export default function PremiumExpoSurvey() {
  // 1. Screen Navigation State - controls which screen is currently displayed
  const [currentScreen, setCurrentScreen] = useState<"start" | "video" | "survey" | "thankyou">("start");
  
  // 2. Form Data State - stores all the survey form data
  const [surveyData, setSurveyData] = useState<any>({
    name: "",
    email: "",
    company: "",
    rating: "",
    feedback: "",
    interests: [] as string[],
    sector: [] as string[], // Changed to array for multiple choice
    solution: [] as string[], // Changed to array for multiple choice
    capacity: "",
    challenges: [] as string[],
    seeking: "",
    followup: "",
    contact: "",
  });
  
  // 3. Loading State - boolean to show/hide loading spinner
  const [isLoading, setIsLoading] = useState(false);
  
  // 4. Countdown Timer State - number for countdown timer (7 seconds)
  const [countdown, setCountdown] = useState(7); 
  
  // 5. Animation State - boolean to control particle animation
  const [showParticles, setShowParticles] = useState(true);
  
  // 6. Video Error State - boolean to track if video failed to load
  const [videoError, setVideoError] = useState(false);

  // 7. useRef Hook - creates a reference to the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // 8. Admin mode state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [sqlModule, setSqlModule] = useState<any>(null);

  // Initialize SQL.js
  useEffect(() => {
    const loadSQL = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        });
        setSqlModule(SQL);
      } catch (err) {
        console.error("Error loading SQL.js:", err);
      }
    };
    
    loadSQL();
    initializeDB();
  }, []);

  const initializeDB = () => {
    const request = indexedDB.open("SurveyDatabase", 2);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for surveys if it doesn't exist
      if (!db.objectStoreNames.contains("surveys")) {
        const store = db.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  };

  // Save response to IndexedDB
  const saveResponseToDB = async (data: any): Promise<boolean> => {
    return new Promise((resolve) => {
      const request = indexedDB.open("SurveyDatabase", 2);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["surveys"], "readwrite");
        const store = transaction.objectStore("surveys");
        
        const responseWithTimestamp = {
          ...data,
          timestamp: new Date().toISOString()
        };
        
        const addRequest = store.add(responseWithTimestamp);
        
        addRequest.onsuccess = () => {
          console.log("Response saved to IndexedDB");
          resolve(true);
        };
        
        addRequest.onerror = () => {
          console.error("Error saving to IndexedDB");
          resolve(false);
        };
      };
      
      request.onerror = () => {
        console.error("Error opening IndexedDB");
        resolve(false);
      };
    });
  };

  // Export data from IndexedDB to SQLite format (for admin)
  const exportToSQLite = async () => {
    if (adminKey !== "altaaqa2024") {
      setExportStatus("Invalid admin key");
      return;
    }

    if (!sqlModule) {
      setExportStatus("SQL library not loaded yet");
      return;
    }

    setExportStatus("Exporting...");
    
    try {
      // Get all responses from IndexedDB
      const responses = await getAllResponses();
      
      // Create SQLite database
      const db = new sqlModule.Database();
      
      // Create table
      db.run(`
        CREATE TABLE surveys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT,
          sector TEXT,
          solution TEXT,
          capacity TEXT,
          challenges TEXT,
          fast_deployment INTEGER,
          cost_efficiency INTEGER,
          environmental_sustainability INTEGER,
          technical_support INTEGER,
          long_term_partnership INTEGER,
          seeking TEXT,
          followup TEXT,
          name TEXT,
          company TEXT,
          contact TEXT
        )
      `);
      
      // Insert data
      for (const response of responses) {
        db.run(
          `INSERT INTO surveys (
            timestamp, sector, solution, capacity, challenges,
            fast_deployment, cost_efficiency, environmental_sustainability,
            technical_support, long_term_partnership, seeking, followup,
            name, company, contact
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            response.timestamp,
            Array.isArray(response.sector) ? response.sector.join('; ') : (response.sector || ''),
            Array.isArray(response.solution) ? response.solution.join('; ') : (response.solution || ''),
            response.capacity || '',
            (response.challenges || []).join('; '),
            response['Fast deployment & availability'] || null,
            response['Cost efficiency'] || null,
            response['Environmental sustainability'] || null,
            response['Technical support & reliability'] || null,
            response['Long-term partnership'] || null,
            response.seeking || '',
            response.followup || '',
            response.name || '',
            response.company || '',
            response.contact || ''
          ]
        );
      }
      
      // Export database to file
      const data = db.export();
      const buffer = new Uint8Array(data);
      
      // Create and download SQLite file
      const blob = new Blob([buffer], { type: 'application/x-sqlite3' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `survey_database_${new Date().toISOString().slice(0, 10)}.db`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      setExportStatus("Exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("Export failed");
    }
  };

  const getAllResponses = (): Promise<any[]> => {
    return new Promise((resolve) => {
      const request = indexedDB.open("SurveyDatabase", 2);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["surveys"], "readonly");
        const store = transaction.objectStore("surveys");
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };
        
        getAllRequest.onerror = () => {
          resolve([]);
        };
      };
      
      request.onerror = () => {
        resolve([]);
      };
    });
  };

  // Event Handlers
  const handleStartClick = () => {
    setShowParticles(false);
    setTimeout(() => setCurrentScreen("video"), 300);
  };
  
  const handleVideoEnd = () => setCurrentScreen("survey");
  
  const handleVideoError = () => {
    console.error("Video failed to load");
    setVideoError(true);
    setTimeout(() => setCurrentScreen("survey"), 2000);
  };

  const handleChange = (field: string, value: string) => {
    setSurveyData((prev: any) => ({ ...prev, [field]: value }));
  };

  // New handler for multiple choice questions
  const handleMultipleChoice = (field: string, value: string, checked: boolean) => {
    setSurveyData((prev: any) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter((item: string) => item !== value),
    }));
  };

  const handleSubmit = async () => {
    // Validation - updated for array fields
    const requiredFields = ['sector', 'solution', 'capacity', 'seeking', 'followup'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'sector' || field === 'solution') {
        return !surveyData[field] || surveyData[field].length === 0;
      }
      return !surveyData[field];
    });
    
    if (missingFields.length > 0) {
      alert("Please complete all required fields to continue.");
      return;
    }

    if (surveyData.followup === 'Yes') {
      const contactFields = ['name', 'company', 'contact'];
      const missingContactFields = contactFields.filter(field => !surveyData[field]);
      
      if (missingContactFields.length > 0) {
        alert("Please provide your contact details for follow-up.");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Simulate API call with loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to IndexedDB
      const saveSuccess = await saveResponseToDB(surveyData);
      
      if (!saveSuccess) {
        throw new Error("Failed to save response");
      }
      
      setCurrentScreen("thankyou");

      setCountdown(7);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCurrentScreen("start");
            setSurveyData({
              name: "",
              email: "",
              company: "",
              rating: "",
              feedback: "",
              interests: [],
              sector: [], // Reset as array
              solution: [], // Reset as array
              capacity: "",
              challenges: [],
              seeking: "",
              followup: "",
              contact: "",
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

  // Toggle admin mode (triple click on logo)
  const handleAdminClick = () => {
    // Simple triple click detection
    const now = Date.now();
    if (window.lastClick && now - window.lastClick < 500) {
      window.clickCount = (window.clickCount || 0) + 1;
      
      if (window.clickCount >= 2) { // Triple click (first click + two more)
        setIsAdminMode(true);
        window.clickCount = 0;
      }
    } else {
      window.clickCount = 0;
    }
    window.lastClick = now;
  };

  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#01907C]/20 rounded-full animate-pulse"
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

  // START SCREEN
  if (currentScreen === "start") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#FFFEFE]">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#01907C]/20 via-transparent to-transparent" />
        {showParticles && <Particles />}
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFEFE]/50 via-transparent to-[#FFFEFE]/30 backdrop-blur-[2px]" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="text-center flex flex-col items-center justify-center space-y-8 max-w-4xl">
            {/* Logo/Icon */}
            <div 
              className="flex flex-col md:flex-row items-center justify-center gap-6 cursor-pointer"
              onClick={handleAdminClick}
            >
              <img src="/altaaqa.png" alt="Altaaqa Logo" className="w-48 h-auto" />
            </div>
            
            <p className="text-lg text-[#01907C] max-w-2xl mx-auto">
              Experience the future of technology through our immersive journey
            </p>
            
            <div className="pt-8">
              <button
                onClick={handleStartClick}
                className="group relative px-12 py-6 bg-[#FFFEFE] rounded-2xl text-2xl font-bold text-[#01907C] shadow-2xl border-2 border-[#01907C]/30 hover:border-[#01907C]/50 transform transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Begin Experience
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-[#01907C]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>

            {/* Admin Panel (if enabled) */}
            {isAdminMode && (
              <div className="mt-8 p-6 bg-[#01907C]/10 backdrop-blur-md rounded-2xl border border-[#01907C]/20">
                <h3 className="text-xl font-bold text-[#01907C] mb-4">Admin Export</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter admin key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#FFFEFE] text-[#01907C] placeholder-[#01907C]/70 border border-[#01907C]/30 focus:outline-none focus:ring-2 focus:ring-[#01907C]"
                  />
                  <button
                    onClick={exportToSQLite}
                    className="w-full py-3 bg-[#01907C] hover:bg-[#017a69] text-[#FFFEFE] rounded-lg transition-colors border border-[#01907C]"
                  >
                    Export to SQLite
                  </button>
                  {exportStatus && (
                    <p className="text-[#01907C] text-sm">{exportStatus}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VIDEO SCREEN
  if (currentScreen === "video") {
    return (
      <div className="min-h-screen w-full bg-[#FFFEFE] relative overflow-hidden flex items-center justify-center">
        {videoError ? (
          <div className="text-center text-[#01907C] p-8">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-[#01907C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[#01907C]">Video Unavailable</h3>
            <p className="text-lg text-[#01907C] mb-6">We're having trouble loading the video. Proceeding to survey...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01907C] mx-auto"></div>
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
              <source src="videoal.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Elegant skip button */}
            <button
              onClick={handleVideoEnd}
              className="absolute top-8 right-8 px-6 py-3 bg-[#FFFEFE]/80 backdrop-blur-md border border-[#01907C]/30 text-[#01907C] rounded-xl hover:bg-[#FFFEFE] transition-all duration-300 flex items-center gap-2"
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

  // SURVEY SCREEN
  if (currentScreen === "survey") {
    return (
      <div className="min-h-screen bg-[#FFFEFE] text-[#01907C] py-12 px-6">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center space-y-8">
          {/* Logos with divider */}
          <div className="flex flex-col items-center space-y-4">
            <img src="/altaaqa.png" alt="Altaaqa Logo" className="w-48 h-auto" />
          </div>

          {/* Survey Card */}
          <div className="bg-[#FFFEFE] rounded-3xl p-8 md:p-12 border border-[#01907C]/20 shadow-2xl space-y-8 w-full">

            {/* 1. Sector - Now Multiple Choice */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                1. Which sector best describes your business? (Select all that apply) <span className="text-red-500">*</span>
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
                <label key={opt} className="block mb-2 cursor-pointer hover:text-[#017a69]">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={surveyData.sector?.includes(opt)}
                    onChange={(e) => handleMultipleChoice("sector", opt, e.target.checked)}
                    className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* 2. Power Solution - Now Multiple Choice */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                2. What type of power solution do you usually require? (Select all that apply) <span className="text-red-500">*</span>
              </h3>
              {[
                "Temporary / Rental Power",
                "Long-term Power Projects",
                "Renewable / Hybrid Energy",
                "Emergency Backup Power",
                "Other",
              ].map((opt) => (
                <label key={opt} className="block mb-2 cursor-pointer hover:text-[#017a69]">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={surveyData.solution?.includes(opt)}
                    onChange={(e) => handleMultipleChoice("solution", opt, e.target.checked)}
                    className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* 3. Capacity - Remains Single Choice */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                3. What capacity range do you typically need? <span className="text-red-500">*</span>
              </h3>
              {["Below 1 MW", "1 – 10 MW", "10 – 50 MW", "Above 50 MW","Other"].map(
                (opt) => (
                  <label key={opt} className="block mb-2 cursor-pointer hover:text-[#017a69]">
                    <input
                      type="radio"
                      name="capacity"
                      value={opt}
                      checked={surveyData.capacity === opt}
                      onChange={(e) => handleChange("capacity", e.target.value)}
                      className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
                    />
                    {opt}
                  </label>
                )
              )}
            </div>

            {/* 4. Challenges */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                4. What challenges matter most to you today? (Select all that apply)
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
                <label key={opt} className="block mb-2 cursor-pointer hover:text-[#017a69]">
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
                    className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* 5. Partner importance */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                5. When choosing a power partner, how important are the following?
                (Not Important,Very Important)
              </h3>
              {[
                "Fast deployment & availability",
                "Cost efficiency",
                "Environmental sustainability",
                "Technical support & reliability",
                "Long-term partnership",
              ].map((q) => (
                <div key={q} className="mb-4">
                  <label className="block mb-2 font-medium">{q}:</label>
                  <select
                    value={surveyData[q] || ""}
                    onChange={(e) => handleChange(q, e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#FFFEFE] text-[#01907C] border border-[#01907C]/30 focus:outline-none focus:ring-2 focus:ring-[#01907C]"
                  >
                    <option value="">Select Rating</option>
                  
                      <option value='Very Important'>
                        Very Important
                      </option>
                      <option value='Not Important'>
                        Not Important
                      </option>
                   
                  </select>
                </div>
              ))}
            </div>

           {/* 6. Currently seeking */}
<div>
  <h3 className="text-xl font-semibold mb-3">
    6. Are you currently seeking a power solution provider? <span className="text-red-500">*</span>
  </h3>
  {[
    "Yes, urgently",
    "Yes, within the next 6 months",
    "Exploring options for the future",
    "Not at the moment",
  ].map((opt) => (
    <label key={opt} className="block mb-2 cursor-pointer hover:text-[#017a69]">
      <input
        type="radio"
        name="seeking"
        value={opt} 
        checked={surveyData.seeking === opt}
        onChange={(e) => handleChange("seeking", e.target.value)}
        className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
      />
      {opt}
    </label>
  ))}
</div>

            {/* 7. Follow-up */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                7. Would you like Altaaqa to follow up with a tailored solution? <span className="text-red-500">*</span>
              </h3>
              <label className="block mb-3 cursor-pointer hover:text-[#017a69]">
                <input
                  type="radio"
                  name="followup"
                  value="Yes"
                  checked={surveyData.followup === "Yes"}
                  onChange={(e) => handleChange("followup", e.target.value)}
                  className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
                />
                Yes (please share your details)
              </label>
              {surveyData.followup === "Yes" && (
                <div className="space-y-3 pl-6 mb-4">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={surveyData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#FFFEFE] text-[#01907C] border border-[#01907C]/30 focus:outline-none focus:ring-2 focus:ring-[#01907C]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company *"
                    value={surveyData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#FFFEFE] text-[#01907C] border border-[#01907C]/30 focus:outline-none focus:ring-2 focus:ring-[#01907C]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Email / Phone / WhatsApp *"
                    value={surveyData.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#FFFEFE] text-[#01907C] border border-[#01907C]/30 focus:outline-none focus:ring-2 focus:ring-[#01907C]"
                    required
                  />
                </div>
              )}
              <label className="block cursor-pointer hover:text-[#017a69]">
                <input
                  type="radio"
                  name="followup"
                  value="No"
                  checked={surveyData.followup === "No"}
                  onChange={(e) => handleChange("followup", e.target.value)}
                  className="mr-3 w-4 h-4 border-[#01907C] text-[#01907C] focus:ring-[#01907C]"
                />
                No, just exploring
              </label>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-5 rounded-xl text-xl font-bold bg-[#01907C] text-[#FFFEFE] hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-[#01907C]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFFEFE]"></div>
                    Processing...
                  </>
                ) : (
                  "Submit Survey"
                )}
              </button>
             
            </div>
          </div>
        </div>
      </div>
    );
  }

  // THANK YOU SCREEN
  if (currentScreen === "thankyou") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEFE] text-[#01907C] relative overflow-hidden">
        {/* Floating background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#01907C]/10 rounded-full blur-3xl animate-ping" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#01907C]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center space-y-10 max-w-3xl px-6 animate-fadeIn">
          {/* Altaaqa Logo + Header */}
          <div className="flex flex-col items-center space-y-4">
            <img src="/altaaqa.png" alt="Altaaqa Logo" className="w-48 h-auto" />
          </div>

          {/* Success icon */}
          <div className="mx-auto w-32 h-32 bg-[#FFFEFE] backdrop-blur-md rounded-full flex items-center justify-center animate-bounceSlow border border-[#01907C]/20">
            <svg className="w-16 h-16 text-[#01907C]" fill="currentColor" viewBox="0 0 20 20">
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
          <p className="text-xl font-light text-[#01907C] animate-fadeUp delay-150">
            Your feedback has been successfully recorded in our database.  
            We truly appreciate your time and support.
          </p>

          <p className="text-[#01907C]/60 animate-pulse">
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

// Add global variables for admin click detection
declare global {
  interface Window {
    lastClick: number;
    clickCount: number;
  }
}