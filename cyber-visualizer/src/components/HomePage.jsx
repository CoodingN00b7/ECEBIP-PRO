import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Smartphone,
  Shield,
  CreditCard,
  Wifi,
  Link as LinkIcon,
  X,
  AlertTriangle,
  User,
  Filter,
  Globe,
  Calendar,
  LayoutTemplate,
  Activity,
  Server,
  Crosshair,
  Loader2,
  Lock,
  Database
} from "lucide-react";

const HomePage = ({ setIsModalOpen }) => {
  const [mode, setMode] = useState("API");
  const [identifier, setIdentifier] = useState("");
  const [type, setType] = useState("EMAIL");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (setIsModalOpen) {
      setIsModalOpen(!!result);
    }
  }, [result, setIsModalOpen]);

  const scanTypes = [
    { id: "EMAIL", label: "Email", icon: <Mail size={16} className="sm:w-5 sm:h-5" /> },
    { id: "PHONE", label: "Phone", icon: <Smartphone size={16} className="sm:w-5 sm:h-5" /> },
    { id: "AADHAAR", label: "Aadhaar", icon: <Shield size={16} className="sm:w-5 sm:h-5" /> },
    { id: "PAN", label: "PAN", icon: <CreditCard size={16} className="sm:w-5 sm:h-5" /> },
    { id: "IP", label: "IP", icon: <Wifi size={16} className="sm:w-5 sm:h-5" /> },
    { id: "URL", label: "URL", icon: <LinkIcon size={16} className="sm:w-5 sm:h-5" /> }
  ];

  const preventionMethods = {
    EMAIL: ["Monitor financial transactions linked with Email.", "Enable Two-Factor Authentication (2FA) immediately.", "Check your connected accounts for unauthorized access.", "Avoid sharing sensitive data via email replies."],
    PHONE: ["Never share OTPs or banking PINs over phone calls.", "Be wary of SMS phishing (Smishing) containing links.", "Register number on Do Not Call (DND) registry.", "Contact your carrier to prevent SIM swapping."],
    AADHAAR: ["Lock your Aadhaar biometrics using mAadhaar app.", "Use Virtual ID (VID) instead of real Aadhaar number.", "Check your Aadhaar authentication history for anomalies.", "Never share unmasked photocopies of your Aadhaar."],
    PAN: ["Monitor financial transactions linked with PAN.", "Check your credit report for unknown loans.", "Avoid sharing PAN on untrusted websites.", "Report misuse to financial authorities."],
    IP: ["Restart your router to obtain a new dynamic IP.", "Use a reputable VPN to mask your traffic.", "Ensure router's firmware is updated.", "Run a full malware scan on connected devices."],
    URL: ["Do not enter any personal credentials on this domain.", "Report the malicious URL to Google Safe Browsing.", "Ensure browser web-protection is enabled.", "Clear browser cache, cookies, and history."]
  };

  const tickerData = [
    { name: "Global DNS Spoofing", target: "120 Govt IPs", severity: "CRITICAL", color: "bg-red-500", time: "Live" },
    { name: "LinkedIn Data Dump", target: "50M Records", severity: "HIGH", color: "bg-orange-500", time: "2m ago" },
    { name: "AWS S3 Bucket Leak", target: "2.4GB Data", severity: "MEDIUM", color: "bg-yellow-500", time: "15m ago" }
  ];

  useEffect(() => {
    if (type === "AADHAAR" || type === "PAN") {
      setMode("LOCAL");
    }
  }, [type]);

  const handleInputChange = (e) => {
    let val = e.target.value;

    if (type === "PHONE") val = val.replace(/\D/g, '').slice(0, 10);
    else if (type === "AADHAAR") val = val.replace(/\D/g, '').slice(0, 12);
    else if (type === "PAN") val = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    
    setIdentifier(val);

    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)) setType("PAN");
    else if (/^\d{12}$/.test(val)) setType("AADHAAR");
    else if (/^\d{10}$/.test(val) && type !== "AADHAAR") setType("PHONE");
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) setType("EMAIL");
    else if (/^(https?:\/\/|www\.)/i.test(val)) setType("URL");
    else if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val)) setType("IP");
  };

  const handleSearch = async () => {
    if (!identifier) return;
    if (type === "PAN" && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(identifier)) return alert("Invalid PAN format. Example: ABCDE1234F");
    if (type === "AADHAAR" && !/^[0-9]{12}$/.test(identifier)) return alert("Aadhaar must be exactly 12 digits.");
    if (type === "PHONE" && !/^[0-9]{10}$/.test(identifier)) return alert("Phone number must be exactly 10 digits.");

    setLoading(true);
    setResult(null);

    const currentQuery = identifier;
    let finalStatus = "Safe";
    let finalResultData = null; 

    // Simulate network delay for UI polish
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      let response;
      let data;

      if (mode === "API") {
        response = await fetch(`${API_BASE_URL}/api/scan`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: currentQuery, type })
        });
        data = await response.json();
        finalStatus = data.status || "Safe";
        finalResultData = { ...data, scanType: type, queryId: currentQuery };
        setResult(finalResultData);
      } else {
        response = await fetch(`${API_BASE_URL}/api/attacks/search?query=${currentQuery}`);
        data = await response.json();

        if (!data || data.length === 0 || data[0].status?.toLowerCase() === "safe") {
          finalStatus = "Safe";
          finalResultData = { status: "Safe", scanType: type, queryId: currentQuery };
          setResult(finalResultData);
        } else {
          finalStatus = "Exposed";
          const record = data[0]; 
          finalResultData = {
            status: "Exposed", scanType: type, queryId: currentQuery, source: record.source, breachName: record.breachName || record.breachname, breachDate: record.breachDate || record.breachdate, compromisedData: record.compromisedData || record.compromiseddata, severityScore: record.severityScore || record.severityscore, scanDate: record.scanDate || record.scandate || new Date().toISOString().split('T')[0]
          };
          setResult(finalResultData);
        }
      }

      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && !currentUser.isGuest && currentUser.email) {
        const historyKey = `search_history_${currentUser.email}`;
        const pastHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        
        const newRecord = { 
          id: Date.now(), 
          query: currentQuery, 
          type: type, 
          status: finalStatus, 
          timestamp: new Date().toISOString(),
          source: finalResultData?.source,
          breachName: finalResultData?.breachName,
          compromisedData: finalResultData?.compromisedData,
          severityScore: finalResultData?.severityScore
        };
        
        localStorage.setItem(historyKey, JSON.stringify([newRecord, ...pastHistory]));
      }

      setIdentifier("");
    } catch (error) {
      console.error("Scan failed:", error);
    }
    
    setLoading(false);
  };

  const closeModal = () => setResult(null);

  const glassPanel = "bg-[#0f172a]/70 backdrop-blur-2xl border border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-slate-500/50 relative overflow-hidden";

  const getModalData = () => {
    if (!result) return null;
    const isSafe = result.status === "Safe";
    const source = result.source;
    const breachName = result.breachName;
    const scanDate = result.scanDate || new Date().toISOString().split('T')[0];
    
    // Failsafe parsing for compromised data
    let compromisedList = ["None"];
    if (!isSafe && result.compromisedData) {
      if (Array.isArray(result.compromisedData)) {
        compromisedList = result.compromisedData;
      } else if (typeof result.compromisedData === 'string') {
        compromisedList = result.compromisedData.split(',').map(s => s.trim());
      } else {
        compromisedList = ["Unknown Data"];
      }
    }

    // Risk Score: 0 (Safe) to 100 (Critical)
    const riskScore = isSafe ? 0 : (result.severityScore ? parseInt(result.severityScore) : 89);
    
    let riskLevel = "SAFE";
    let riskColor = "text-emerald-400";
    let gaugeShadow = "shadow-[0_0_30px_rgba(16,185,129,0.15)]";
    
    if (!isSafe) {
      if (riskScore >= 75) { 
        riskLevel = "CRITICAL"; 
        riskColor = "text-red-500"; 
        gaugeShadow = "shadow-[0_0_30px_rgba(239,68,68,0.15)]";
      }
      else if (riskScore >= 50) { 
        riskLevel = "MODERATE"; 
        riskColor = "text-orange-400"; 
        gaugeShadow = "shadow-[0_0_30px_rgba(249,115,22,0.15)]";
      }
      else if (riskScore > 0) { 
        riskLevel = "LOW"; 
        riskColor = "text-yellow-400"; 
        gaugeShadow = "shadow-[0_0_30px_rgba(234,179,8,0.15)]";
      }
    }

    const mockHash = Array.from({length: 12}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();

    return { isSafe, source, breachName, compromisedList, riskLevel, riskColor, gaugeShadow, scanDate, mockHash, riskScore };
  };

  const modalData = getModalData();

  const containerVars = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } } };
  const clickSpring = { type: "spring", stiffness: 400, damping: 17 };

  return (
    <>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen" 
        />
      </div>

      <motion.div key="home-page-container" variants={containerVars} initial="hidden" animate="visible" className="flex-1 w-full flex flex-col px-3 sm:px-4 md:px-8 py-6 overflow-y-auto relative z-10 custom-scrollbar font-sans text-slate-300">
        
        {/* Header Title */}
        <motion.div variants={itemVars} className="text-center mt-2 md:mt-4 mb-8 md:mb-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-widest mb-2 md:mb-3 drop-shadow-xl">
            CYBER ATTACK <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">VISUALIZER</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium tracking-wide px-2">Real-Time Breach Detection & Exposure Monitoring</p>
        </motion.div>

        {/* Search Panel */}
        <motion.div variants={itemVars} className={`max-w-4xl w-full mx-auto rounded-3xl mb-8 md:mb-10 ${glassPanel}`}>
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-full p-1.5 flex w-48 sm:w-56 relative backdrop-blur-md shadow-inner">
              <motion.div 
                layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1.5 bottom-1.5 w-[48%] bg-slate-800 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] ${mode === 'API' ? 'left-1.5' : 'left-[calc(50%-1px)]'}`}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={clickSpring} onClick={() => setMode("API")} className={`flex-1 text-xs font-bold py-2 z-10 transition-colors tracking-wider ${mode === "API" ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}>API</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={clickSpring} onClick={() => setMode("LOCAL")} className={`flex-1 text-xs font-bold py-2 z-10 transition-colors tracking-wider ${mode === "LOCAL" ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}>LOCAL</motion.button>
            </div>
          </div>

          {/* Scan Types */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center gap-2 sm:gap-4 mb-6 md:mb-8">
            <AnimatePresence>
              {scanTypes.map((t) => (
                <motion.button
                  key={t.id} whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }} whileTap={{ scale: 0.95 }} transition={clickSpring} onClick={() => setType(t.id)}
                  className={`flex items-center justify-center lg:justify-start gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl border transition-colors ${
                    type === t.id ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md" : "bg-slate-800/50 border-slate-700/50 text-slate-400 backdrop-blur-sm hover:border-slate-600"
                  }`}
                >
                  {t.icon} <span className="text-xs sm:text-sm md:text-base font-semibold tracking-wide">{t.label}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Search Input and Button */}
          <div className="mt-4 p-2 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-[0_8px_32px_rgba(6,182,212,0.1)] focus-within:shadow-[0_8px_40px_rgba(6,182,212,0.2)] focus-within:border-cyan-500/50 transition-all duration-300">
            <input
              value={identifier} onChange={handleInputChange} placeholder={`Enter ${type.toLowerCase()}...`}
              className="flex-1 bg-transparent px-4 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none w-full text-center sm:text-left font-mono"
            />
            
            <motion.button
              key="startScan"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              transition={clickSpring}
              onClick={handleSearch} 
              disabled={loading}
              className={`px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold sm:min-w-[180px] w-full sm:w-auto overflow-hidden relative ${
                loading 
                ? "bg-slate-700 text-slate-300 cursor-not-allowed border border-slate-600/50" 
                : "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/20"
              }`}
            >
              {loading ? (
                <motion.div key="loadingContent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 relative z-10">
                  <Loader2 size={18} className="animate-spin text-cyan-400" />
                  <span className="tracking-widest">SCANNING</span>
                </motion.div>
              ) : (
                <motion.div key="scanContent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 relative z-10">
                  <Crosshair size={18} />
                  <span className="tracking-widest">START SCAN</span>
                </motion.div>
              )}
              
              {/* Cyber Security Pulses during loading */}
              {loading && (
                <>
                  <motion.div initial={{ opacity: 0.4, scale: 0 }} animate={{ opacity: 0, scale: 2.2 }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 bg-cyan-400 rounded-xl" />
                  <motion.div initial={{ opacity: 0.2, scale: 0 }} animate={{ opacity: 0, scale: 1.8 }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }} className="absolute inset-0 bg-indigo-400 rounded-xl" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* BOTTOM WIDGETS AREA */}
        <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-auto max-w-5xl w-full mx-auto">
          
          <div className="col-span-full mb-[-0.5rem] md:mb-[-1rem] px-1 md:px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-cyan-500"></span>
               </span>
               <p className="text-[10px] sm:text-xs font-bold text-cyan-400 tracking-widest uppercase truncate">Global Nodes Online</p>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
              <Server size={10} className="text-slate-600 sm:w-3 sm:h-3" /> LATENCY: <span className="text-emerald-400">12ms</span>
            </div>
          </div>

          <motion.div whileHover={{ y: -2 }} transition={clickSpring} className={glassPanel}>
            <div className="flex justify-between items-center mb-4 sm:mb-5 border-b border-slate-700/50 pb-2.5 sm:pb-3 relative z-10">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-indigo-400 sm:w-4 sm:h-4" /> LIVE THREAT TICKER
              </h3>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 tracking-wider">REAL-TIME</span>
            </div>
            
            <div className="space-y-2.5 sm:space-y-3 relative z-10">
              {tickerData.map((item, i) => (
                <div key={i} className="group flex items-center justify-between bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-700/50 hover:border-slate-500 transition-colors">
                  <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${item.color} shadow-[0_0_8px_currentColor] animate-pulse`} />
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{item.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 truncate">Target: <span className="text-slate-400 font-mono">{item.target}</span></p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end flex-shrink-0 ml-2">
                    <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 mb-1">{item.time}</p>
                    <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      item.severity === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                      item.severity === 'HIGH' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                      'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={clickSpring} className={`${glassPanel} flex flex-col justify-between min-h-[200px] sm:min-h-[220px] !p-0`}>
            
            <div className="flex justify-between items-center border-b border-slate-700/50 p-4 sm:p-6 relative z-10 bg-[#0f172a]/40 backdrop-blur-sm">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-cyan-400 sm:w-4 sm:h-4" /> REGIONAL SURVEILLANCE
              </h3>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_currentColor]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_currentColor]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_currentColor]"></span>
              </div>
            </div>
            
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950/50 rounded-b-2xl py-8">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute w-[200%] h-[200%] rounded-full animate-[spin_4s_linear_infinite] pointer-events-none" style={{ background: 'conic-gradient(from 0deg, transparent 75%, rgba(6,182,212,0.1) 90%, rgba(6,182,212,0.4) 100%)' }} />
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 border border-cyan-500/20 rounded-full pointer-events-none" />
              <div className="absolute w-32 h-32 sm:w-40 sm:h-40 border border-cyan-500/30 rounded-full border-dashed animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
              <div className="absolute w-12 h-12 sm:w-16 sm:h-16 border border-cyan-500/50 rounded-full flex items-center justify-center pointer-events-none">
                <Crosshair size={20} className="text-cyan-500/40 animate-pulse sm:w-6 sm:h-6" />
              </div>

              <div className="relative w-full h-full pointer-events-none">
                 <svg className="absolute inset-0 w-full h-full opacity-60">
                   <path d="M 30% 45% L 50% 65% L 75% 35%" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" fill="none" className="animate-pulse" />
                 </svg>

                 <div className="absolute top-[45%] left-[30%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10">
                   <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)]" />
                   <div className="absolute w-6 h-6 sm:w-8 sm:h-8 border border-cyan-400 rounded-full animate-ping opacity-50" />
                   <span className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] text-cyan-100 font-bold tracking-widest bg-slate-900/90 px-1.5 sm:px-2 py-0.5 rounded border border-cyan-500/30 shadow-lg">MUMBAI</span>
                 </div>

                 <div className="absolute top-[65%] left-[50%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10">
                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]" />
                   <span className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] text-indigo-100 font-bold tracking-widest bg-slate-900/90 px-1.5 sm:px-2 py-0.5 rounded border border-indigo-500/30 shadow-lg">PUNE</span>
                 </div>

                 <div className="absolute top-[35%] left-[75%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10">
                   <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,1)]" />
                   <span className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] text-purple-100 font-bold tracking-widest bg-slate-900/90 px-1.5 sm:px-2 py-0.5 rounded border border-purple-500/30 shadow-lg">NAGPUR</span>
                 </div>
              </div>

              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-slate-700/30 pointer-events-none">
                <Shield size={60} className="sm:w-[90px] sm:h-[90px]" strokeWidth={1} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Area */}
        <motion.footer variants={itemVars} className="mt-10 sm:mt-14 mb-4 border-t border-slate-800/60 pt-6 sm:pt-8 pb-4 text-center max-w-5xl w-full mx-auto px-2">
          <p className="text-slate-500 text-[10px] sm:text-xs mb-3 sm:mb-4 font-semibold tracking-widest uppercase">
                               Developer: CoodingN00b7
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[8px] sm:text-[9px] text-slate-600 font-mono tracking-widest uppercase">
            <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-800">DPDP Act 2023 Compliant</span>
            <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-800">ISO 27001 Protocol</span>
            <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-800">SHA-256 Encryption Active</span>
          </div>
        </motion.footer>

      </motion.div>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {result && modalData && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(8px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/90 sm:bg-[#020617]/80 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`w-full h-full sm:h-auto sm:max-w-4xl bg-[#0f172a] sm:bg-[#0f172a]/95 backdrop-blur-3xl border-0 sm:border rounded-none sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col sm:max-h-[90vh] ${modalData.isSafe ? 'sm:border-emerald-500/30' : 'sm:border-red-500/30'}`}
            >
              
              {/* Sticky Header */}
              <div className="flex-none flex justify-between items-start px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-700/50 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md gap-3">
                
                {/* Title and Hash */}
                <div className="flex flex-col gap-2.5 min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    SCAN INTEL REPORT —
                    <span className="text-slate-300 font-medium break-all font-mono ml-1">SHA: {modalData.mockHash}</span>
                  </h2>
                  
                  {/* Status Badge */}
                  <div className="flex items-center">
                    {!modalData.isSafe ? (
                      <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="text-[9px] sm:text-[10px] bg-red-950 text-red-400 px-2 sm:px-3 py-1 rounded-full font-bold tracking-wider border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        THREAT DETECTED
                      </motion.span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] bg-emerald-950 text-emerald-400 px-2 sm:px-3 py-1 rounded-full font-bold tracking-wider border border-emerald-500/30">
                        SYSTEM SAFE
                      </span>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.9 }} onClick={closeModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                  <X size={16} />
                </motion.button>
              </div>

              <motion.div variants={containerVars} initial="hidden" animate="visible" className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-10 sm:pb-6 relative z-10">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  
                  {/* NEW PROFESSIONAL SPEEDOMETER GAUGE */}
                  <motion.div variants={itemVars} whileHover={{ y: -2 }} className={`bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-between relative shadow-inner group overflow-hidden ${modalData.gaugeShadow} transition-shadow duration-500`}>
                    
                    {/* Background faint cyber grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(148,163,184,0.4) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                    <h3 className="w-full text-left text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider mb-2 relative z-10">RISK PROFILE</h3>
                    
                    {/* Gauge Container */}
                    <div className="relative w-full aspect-[2/1] mt-2 flex items-end justify-center z-10">
                      <svg viewBox="0 0 200 110" className="w-[90%] h-auto overflow-visible drop-shadow-2xl">
                        
                        {/* 1. Track Background */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#1e293b" strokeWidth="16" strokeDasharray="314.16 500" transform="rotate(150 100 100)" strokeLinecap="round" />
                        
                        {/* 2. Colored Arc Segments (Total arc = 240 deg. Each 1/4 = 60 deg = 78.54 length) */}
                        {/* Green: 0 to 25 */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="78.54 500" transform="rotate(150 100 100)" />
                        {/* Yellow: 25 to 50 */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#eab308" strokeWidth="16" strokeDasharray="78.54 500" transform="rotate(210 100 100)" />
                        {/* Orange: 50 to 75 */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="78.54 500" transform="rotate(270 100 100)" />
                        {/* Red: 75 to 100 */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="78.54 500" transform="rotate(330 100 100)" />

                        {/* 3. Outer Tick Marks & Labels */}
                        {[0, 20, 40, 60, 80, 100].map((val) => {
                           // Mapping 0-100 to angle -120 to +120
                           const angle = -120 + (val / 100) * 240;
                           return (
                              <g key={val} transform={`rotate(${angle} 100 100)`}>
                                 {/* Tick line */}
                                 <line x1="100" y1="12" x2="100" y2="18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                                 {/* Label */}
                                 <text x="100" y="8" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(${-angle} 100 8)`}>
                                    {val}
                                 </text>
                              </g>
                           )
                        })}

                        {/* 4. Center Hub Display (Digital value inside the gauge) */}
                        <text x="100" y="80" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="900" className="font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                           {modalData.riskScore}
                        </text>
                        <text x="100" y="95" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold" className="tracking-widest">
                           / 100
                        </text>

                        {/* 5. Animated Needle */}
                        <motion.g
                          initial={{ rotate: -120 }}
                          animate={{ rotate: -120 + (modalData.riskScore / 100) * 240 }}
                          transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.3 }}
                          style={{ transformOrigin: "100px 100px" }}
                        >
                           {/* Needle Point */}
                           <polygon points="98,100 102,100 100,32" fill="#f8fafc" className="drop-shadow-md" />
                           {/* Center Pivot Base */}
                           <circle cx="100" cy="100" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                        </motion.g>

                      </svg>
                    </div>

                    <div className="text-center mt-3 relative z-10 w-full">
                      <p className={`text-xl sm:text-2xl font-black tracking-widest uppercase drop-shadow-md ${modalData.riskColor}`}>{modalData.riskLevel}</p>
                    </div>
                  </motion.div>

                  {/* Identifier Telemetry */}
                  <motion.div variants={itemVars} whileHover={{ y: -2 }} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-inner flex flex-col justify-center group relative overflow-hidden">
                    <h3 className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider mb-4 group-hover:text-cyan-400 transition-colors uppercase">Target Telemetry</h3>
                    <ul className="space-y-3 sm:space-y-4 font-mono relative z-10">
                      <li className="flex items-center text-[10px] sm:text-xs"><User size={12} className="text-slate-500 w-5 sm:w-6 mr-1" /><span className="text-slate-400 w-16 sm:w-20">TARGET:</span><span className="text-white font-medium truncate">{result.queryId}</span></li>
                      <li className="flex items-center text-[10px] sm:text-xs"><Filter size={12} className="text-slate-500 w-5 sm:w-6 mr-1" /><span className="text-slate-400 w-16 sm:w-20">VECTOR:</span><span className="text-white font-bold">{result.scanType}</span></li>
                      <li className="flex items-center text-[10px] sm:text-xs"><Globe size={12} className="text-slate-500 w-5 sm:w-6 mr-1" /><span className="text-slate-400 w-16 sm:w-20">ORIGIN:</span><span className={`${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'} font-medium truncate`}>{modalData.source || "Clean"}</span></li>
                      <li className="flex items-center text-[10px] sm:text-xs"><AlertTriangle size={12} className="text-slate-500 w-5 sm:w-6 mr-1" /><span className="text-slate-400 w-16 sm:w-20">BREACH:</span><span className={`${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'} font-medium truncate`}>{modalData.breachName || "None"}</span></li>
                      <li className="flex items-center text-[10px] sm:text-xs"><Calendar size={12} className="text-slate-500 w-5 sm:w-6 mr-1" /><span className="text-slate-400 w-16 sm:w-20">TSTAMP:</span><span className="text-white font-bold">{modalData.scanDate}</span></li>
                    </ul>
                  </motion.div>

                  {/* Compromised Assets Container */}
                  <motion.div variants={itemVars} whileHover={{ y: -2 }} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 sm:p-5 flex flex-col shadow-inner group relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <h3 className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider group-hover:text-cyan-400 transition-colors uppercase">Compromised Assets</h3>
                      <Lock size={12} className={modalData.isSafe ? "text-emerald-500" : "text-red-500"} />
                    </div>
                    <motion.div variants={containerVars} className="space-y-2 overflowing-assets pr-1 custom-scrollbar max-h-32 md:max-h-none flex-1 relative z-10">
                      {modalData.compromisedList.map((item, idx) => (
                        <motion.div variants={itemVars} key={idx} className={`flex items-center gap-2 sm:gap-3 p-1.5 rounded transition-colors group-hover:translate-x-1 ${modalData.isSafe ? 'bg-emerald-950/20' : 'bg-red-950/20'}`}>
                          <LayoutTemplate size={12} className={`flex-shrink-0 sm:w-3.5 sm:h-3.5 ${modalData.isSafe ? "text-emerald-400" : "text-red-400"}`} />
                          <span className="text-slate-200 text-xs sm:text-sm font-medium">{item}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>

                {/* Tactical Recommendations */}
                <motion.div variants={itemVars} whileHover={{ y: -2 }} className={`border rounded-xl p-4 sm:p-5 shadow-inner relative overflow-hidden z-10 ${modalData.isSafe ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-red-950/10 border-red-500/20'}`}>
                  <h3 className={`text-xs sm:text-sm font-semibold mb-3 tracking-wide uppercase ${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>Mitigation Strategy</h3>
                  <motion.div variants={containerVars} className="space-y-2 pl-1 sm:pl-2 relative z-10">
                    {preventionMethods[result.scanType]?.map((action, idx) => (
                      <motion.div variants={itemVars} key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <span className={`${modalData.isSafe ? 'text-emerald-500' : 'text-red-500'} mt-0 sm:mt-0.5`}>▹</span>
                        <span className="leading-relaxed">{action}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;
