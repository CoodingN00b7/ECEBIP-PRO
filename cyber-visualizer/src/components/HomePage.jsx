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
  Activity,
  Server,
  Crosshair,
  CheckCircle
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
    { id: "EMAIL", label: "Email", icon: <Mail size={18} className="sm:w-5 sm:h-5" /> },
    { id: "PHONE", label: "Phone", icon: <Smartphone size={18} className="sm:w-5 sm:h-5" /> },
    { id: "AADHAAR", label: "Aadhaar", icon: <Shield size={18} className="sm:w-5 sm:h-5" /> },
    { id: "PAN", label: "PAN", icon: <CreditCard size={18} className="sm:w-5 sm:h-5" /> },
    { id: "IP", label: "IP", icon: <Wifi size={18} className="sm:w-5 sm:h-5" /> },
    { id: "URL", label: "URL", icon: <LinkIcon size={18} className="sm:w-5 sm:h-5" /> }
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
    const compromisedStr = result.compromisedData;
    const scanDate = result.scanDate || new Date().toISOString().split('T')[0];
    const compromisedList = compromisedStr ? compromisedStr.split(',').map(s => s.trim()) : (isSafe ? ["None"] : ["Unknown Data"]);
    const score = isSafe ? 0 : (result.severityScore ? parseInt(result.severityScore) : 89);
    
    let riskLevel = "SAFE";
    let riskColor = "text-emerald-400";
    let gaugeColor = "#10b981";
    let bgPulse = "bg-emerald-500/10";
    
    if (!isSafe) {
      if (score < 40) { riskLevel = "LOW"; riskColor = "text-yellow-400"; gaugeColor = "#eab308"; bgPulse = "bg-yellow-500/10"; }
      else if (score < 75) { riskLevel = "MEDIUM"; riskColor = "text-orange-400"; gaugeColor = "#f97316"; bgPulse = "bg-orange-500/10"; }
      else { riskLevel = "CRITICAL"; riskColor = "text-red-500"; gaugeColor = "#ef4444"; bgPulse = "bg-red-500/10"; }
    }

    return { isSafe, source, breachName, compromisedList, score, riskLevel, riskColor, gaugeColor, bgPulse, scanDate };
  };

  const modalData = getModalData();

  const containerVars = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } } };
  const clickSpring = { type: "spring", stiffness: 400, damping: 17 };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen" />
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen" />
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
              <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={`absolute top-1.5 bottom-1.5 w-[48%] bg-slate-800 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] ${mode === 'API' ? 'left-1.5' : 'left-[calc(50%-1px)]'}`} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={clickSpring} onClick={() => setMode("API")} className={`flex-1 text-xs font-bold py-2 z-10 transition-colors tracking-wider ${mode === "API" ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}>API</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={clickSpring} onClick={() => setMode("LOCAL")} className={`flex-1 text-xs font-bold py-2 z-10 transition-colors tracking-wider ${mode === "LOCAL" ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}>LOCAL</motion.button>
            </div>
          </div>

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

          <div className="mt-4 p-2 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-[0_8px_32px_rgba(6,182,212,0.1)] focus-within:shadow-[0_8px_40px_rgba(6,182,212,0.2)] focus-within:border-cyan-500/50 transition-all duration-300">
            <input
              value={identifier} onChange={handleInputChange} placeholder={`Enter ${type.toLowerCase()}...`}
              className="flex-1 bg-transparent px-4 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none w-full text-center sm:text-left"
            />
            <motion.button
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 25px rgba(6,182,212,0.4)" } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              transition={clickSpring} onClick={handleSearch} disabled={loading}
              className={`px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold sm:min-w-[180px] w-full sm:w-auto shadow-[0_0_15px_rgba(6,182,212,0.2)] ${
                loading ? "bg-slate-700 text-slate-300 cursor-not-allowed animate-pulse" : "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-400 hover:to-cyan-400 transition-colors"
              }`}
            >
              {loading ? "SCANNING..." : "START SCAN"}
            </motion.button>
          </div>
        </motion.div>

        {/* BOTTOM WIDGETS */}
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
            <div className="space-y-2.5 sm:space-y-3">
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
                    }`}>{item.severity}</span>
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

      {/* NEW PROFESSIONAL POPUP MODAL */}
      <AnimatePresence>
        {result && modalData && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(8px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/90 sm:p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`w-full h-full sm:h-auto sm:max-w-4xl bg-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col sm:max-h-[90vh] sm:rounded-2xl border-0 sm:border ${modalData.isSafe ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            >
              
              {/* Sleek Header */}
              <div className={`flex-none flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5 border-b bg-slate-900/80 backdrop-blur-md z-20 ${modalData.isSafe ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {!modalData.isSafe ? (
                      <span className="flex items-center gap-1.5 text-[10px] bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md font-bold tracking-widest border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <AlertTriangle size={12} /> THREAT DETECTED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md font-bold tracking-widest border border-emerald-500/20">
                        <CheckCircle size={12} /> SYSTEM SAFE
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate mt-1">
                    <span className="text-slate-500 font-normal mr-2">TARGET:</span>{result.queryId}
                  </h2>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={closeModal} className="text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-all">
                  <X size={18} />
                </motion.button>
              </div>

              <motion.div variants={containerVars} initial="hidden" animate="visible" className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar bg-gradient-to-b from-[#0f172a] to-slate-900/50">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-6">
                  
                  {/* Fixed Meter Gauge */}
                  <motion.div variants={itemVars} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 flex flex-col items-center justify-center relative shadow-inner">
                    <h3 className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Risk Level</h3>
                    
                    <div className="relative w-32 h-20 sm:w-40 sm:h-24 mt-4 flex items-end justify-center">
                      <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible drop-shadow-lg">
                        {/* Background Track */}
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                        
                        {/* Colored Score Track */}
                        <motion.path 
                          initial={{ strokeDashoffset: 125.6 }} 
                          animate={{ strokeDashoffset: 125.6 - (modalData.score / 100) * 125.6 }} 
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                          d="M 10 50 A 40 40 0 0 1 90 50" 
                          fill="none" stroke={modalData.gaugeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={125.6}
                        />
                        
                        {/* FIXED: Dynamic Animated Needle with proper Origin */}
                        <motion.polygon
                          points="48,50 50,15 52,50"
                          fill={modalData.gaugeColor}
                          style={{ originX: 0.5, originY: 1 }}
                          initial={{ rotate: -90 }}
                          animate={{ rotate: (modalData.score / 100) * 180 - 90 }}
                          transition={{ duration: 1.5, type: "spring", stiffness: 60, damping: 15, delay: 0.4 }}
                        />

                        {/* Center Pin Base */}
                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} cx="50" cy="50" r="6" fill="#0f172a" />
                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} cx="50" cy="50" r="3" fill={modalData.gaugeColor} />
                      </svg>
                    </div>

                    <div className="text-center mt-4">
                      <p className={`text-xl font-black tracking-widest ${modalData.riskColor}`}>{modalData.riskLevel}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 inline-block">SCORE: {modalData.score}/100</p>
                    </div>
                  </motion.div>

                  {/* Clean Metadata Grid */}
                  <motion.div variants={itemVars} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6 flex flex-col justify-center shadow-inner">
                    <div className="grid grid-cols-2 gap-y-5 gap-x-3">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Scan Vector</p>
                        <p className="text-sm font-bold text-white">{result.scanType}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
                        <p className="text-xs font-mono text-slate-300 mt-0.5">{modalData.scanDate}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Intelligence Source</p>
                        <p className={`text-sm font-semibold truncate ${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{modalData.source || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Breach Event</p>
                        <p className={`text-sm font-semibold truncate ${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{modalData.breachName || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Minimalist Compromised Chips */}
                  <motion.div variants={itemVars} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 flex flex-col shadow-inner">
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4">Compromised Data</h3>
                    <motion.div variants={containerVars} className="flex flex-wrap gap-2 overflow-y-auto pr-1 custom-scrollbar max-h-32 md:max-h-none">
                      {modalData.compromisedList.map((item, idx) => (
                        <motion.span 
                          variants={itemVars} 
                          key={idx} 
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono border ${modalData.isSafe ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}
                        >
                          {!modalData.isSafe && <AlertTriangle size={10} />}
                          {item}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>

                {/* Sleek Recommendations Section */}
                <motion.div variants={itemVars} className="bg-[#0B1120] border border-slate-800/80 rounded-xl p-5 sm:p-6 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${modalData.isSafe ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={14} className={modalData.isSafe ? "text-emerald-400" : "text-amber-400"} />
                    Recommended Security Protocols
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {preventionMethods[result.scanType]?.map((action, idx) => (
                      <motion.div variants={itemVars} key={idx} className="flex items-start gap-3 bg-slate-900/40 p-3.5 rounded-lg border border-slate-800/60 transition-colors hover:border-slate-700">
                        <span className={`mt-0.5 shrink-0 ${modalData.isSafe ? 'text-emerald-500' : 'text-amber-500'}`}>
                          <CheckCircle size={14} />
                        </span>
                        <span className="text-xs text-slate-300 leading-relaxed font-medium">{action}</span>
                      </motion.div>
                    ))}
                  </div>
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
