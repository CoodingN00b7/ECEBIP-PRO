import React, { useEffect, useState } from "react";
import { 
  Shield, AlertTriangle, Activity, CheckCircle, User, 
  Mail, Clock, Search, Trash2, Server, Fingerprint, 
  Zap, Globe, Smartphone, CreditCard, Wifi, Crosshair,
  X, Filter, Calendar, LayoutTemplate 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const PIE_COLORS = ["#06b6d4", "#6366f1", "#8b5cf6", "#3b82f6", "#eab308", "#10b981"];

const preventionMethods = {
  EMAIL: ["Monitor financial transactions linked with Email.", "Enable Two-Factor Authentication (2FA) immediately.", "Check your connected accounts for unauthorized access.", "Avoid sharing sensitive data via email replies."],
  PHONE: ["Never share OTPs or banking PINs over phone calls.", "Be wary of SMS phishing (Smishing) containing links.", "Register number on Do Not Call (DND) registry.", "Contact your carrier to prevent SIM swapping."],
  AADHAAR: ["Lock your Aadhaar biometrics using mAadhaar app.", "Use Virtual ID (VID) instead of real Aadhaar number.", "Check your Aadhaar authentication history for anomalies.", "Never share unmasked photocopies of your Aadhaar."],
  PAN: ["Monitor financial transactions linked with PAN.", "Check your credit report for unknown loans.", "Avoid sharing PAN on untrusted websites.", "Report misuse to financial authorities."],
  IP: ["Restart your router to obtain a new dynamic IP.", "Use a reputable VPN to mask your traffic.", "Ensure router's firmware is updated.", "Run a full malware scan on connected devices."],
  URL: ["Do not enter any personal credentials on this domain.", "Report the malicious URL to Google Safe Browsing.", "Ensure browser web-protection is enabled.", "Clear browser cache, cookies, and history."]
};

export default function DashboardPage({ setIsModalOpen }) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, exposed: 0, safe: 0, riskScore: 100, typeData: [], timelineData: [] });
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (setIsModalOpen) {
      setIsModalOpen(!!selectedRecord);
    }
  }, [selectedRecord, setIsModalOpen]);

  const loadUserData = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      const historyKey = `search_history_${storedUser.email}`;
      const storedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
      setHistory(storedHistory);
      calculateMetrics(storedHistory);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const calculateMetrics = (data) => {
    const exposedCount = data.filter(item => item.status === "Exposed").length;
    const safeCount = data.filter(item => item.status === "Safe").length;
    const risk = data.length === 0 ? 100 : Math.max(0, Math.round(100 - ((exposedCount / data.length) * 100)));

    const typeCounts = {};
    data.forEach(item => { typeCounts[item.type] = (typeCounts[item.type] || 0) + 1; });
    const typeData = Object.keys(typeCounts).map(key => ({ name: key, value: typeCounts[key] }));

    const dateCounts = {};
    data.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    const timelineData = Object.keys(dateCounts).slice(-7).map(date => ({ date, scans: dateCounts[date] }));

    setStats({ total: data.length, exposed: exposedCount, safe: safeCount, riskScore: risk, typeData, timelineData });
  };

  const handleClearHistory = () => {
    if (window.confirm("CRITICAL WARNING: Purging intelligence ledger. This cannot be undone. Proceed?")) {
      const historyKey = `search_history_${user.email}`;
      localStorage.removeItem(historyKey);
      setHistory([]);
      calculateMetrics([]);
    }
  };

  const glassPanel = "bg-[#0f172a]/70 backdrop-blur-2xl border border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-4 md:p-6 transition-all duration-300 hover:border-slate-500/50 hover:shadow-[0_8px_40px_0_rgba(6,182,212,0.1)] relative overflow-hidden";
  const containerVars = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVars = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } } };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'EMAIL': return <Mail size={14} className="text-blue-400" />;
      case 'URL': return <Globe size={14} className="text-indigo-400" />;
      case 'IP': return <Wifi size={14} className="text-cyan-400" />;
      case 'PHONE': return <Smartphone size={14} className="text-emerald-400" />;
      case 'AADHAAR': return <Shield size={14} className="text-orange-400" />;
      case 'PAN': return <CreditCard size={14} className="text-yellow-400" />;
      default: return <Search size={14} className="text-slate-400" />;
    }
  };

  const closeModal = () => setSelectedRecord(null);

  const getModalData = () => {
    if (!selectedRecord) return null;
    const isSafe = selectedRecord.status === "Safe";
    const source = selectedRecord.source || "System History";
    const breachName = selectedRecord.breachName || (isSafe ? "None" : "Multiple Risks Detected");
    const compromisedStr = selectedRecord.compromisedData || "";
    const scanDate = formatDate(selectedRecord.timestamp);
    const compromisedList = compromisedStr ? compromisedStr.split(',').map(s => s.trim()) : (isSafe ? ["None"] : ["Archived Threat Data"]);
    const score = selectedRecord.severityScore !== undefined ? parseInt(selectedRecord.severityScore) : (isSafe ? 0 : 85);
    
    let riskLevel = "SAFE";
    let riskColor = "text-emerald-400";
    let gaugeColor = "#10b981";
    
    if (!isSafe) {
      if (score < 40) { riskLevel = "LOW"; riskColor = "text-yellow-400"; gaugeColor = "#eab308"; }
      else if (score < 75) { riskLevel = "MEDIUM"; riskColor = "text-orange-400"; gaugeColor = "#f97316"; }
      else { riskLevel = "CRITICAL"; riskColor = "text-red-500"; gaugeColor = "#ef4444"; }
    }

    return { isSafe, source, breachName, compromisedList, score, riskLevel, riskColor, gaugeColor, scanDate };
  };

  const modalData = getModalData();

  if (!user) return null;

  // Extract a display name (use name, or first part of email, or fallback)
  const displayName = user.name || (user.email ? user.email.split('@')[0] : "PERSONALIZED");

  const gaugeRadius = 40;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (stats.riskScore / 100) * gaugeCircumference;
  const gaugeColor = stats.riskScore > 80 ? "#10b981" : stats.riskScore > 50 ? "#eab308" : "#ef4444";

  return (
    <motion.div variants={containerVars} initial="hidden" animate="visible" className="flex-1 w-full flex flex-col px-4 md:px-8 py-4 md:py-6 overflow-y-auto relative z-10 custom-scrollbar font-sans text-slate-300">
      
      {/* HEADER */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-slate-800/80 pb-4 relative">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-widest drop-shadow-md uppercase">
            {displayName}'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">DASHBOARD</span>
          </h1>
          <span className="flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] md:text-[10px] font-bold text-emerald-400 tracking-widest animate-pulse">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400" /> LIVE
          </span>
        </div>
      </motion.div>

      {/* TOP ROW: PROFILE & QUICK STATS */}
      <motion.div variants={itemVars} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 mb-8">
        
        {/* User Card */}
        <div className={`md:col-span-5 flex items-center gap-4 md:gap-6 bg-gradient-to-br from-[#0f172a]/90 to-indigo-950/40 backdrop-blur-2xl border border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-2xl p-4 md:p-6 relative overflow-hidden group`}>
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-700" />
          <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] rotate-3 group-hover:rotate-0 transition-transform shrink-0">
            <User size={24} className="md:w-[30px] md:h-[30px]" />
          </div>
          <div className="z-10 flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-white tracking-wide mb-1 truncate">{user.name || "Analyst Profile"}</h2>
            <div className="flex items-center gap-2 text-cyan-300/80 text-[10px] md:text-sm mb-2 md:mb-3 font-mono bg-slate-950/50 w-max max-w-full px-2 py-0.5 md:px-3 md:py-1 rounded-md border border-slate-800">
              <Mail size={12} className="text-cyan-500 shrink-0" /> <span className="truncate">{user.email}</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5 text-slate-400 text-[9px] md:text-[11px] uppercase tracking-widest font-bold">
                <Fingerprint size={12} className="text-indigo-400" /> <span className="hidden xs:inline">Clearance:</span> <span className="text-indigo-300">Lvl 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Risk Score */}
        <div className={`${glassPanel} md:col-span-3 flex flex-col items-center justify-center text-center py-6`}>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-widest mb-3 uppercase">Safety Index</p>
          <div className="relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28">
            <svg viewBox="0 0 112 112" className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r={gaugeRadius} stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle 
                cx="56" cy="56" r={gaugeRadius} stroke={gaugeColor} strokeWidth="8" fill="none"
                strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeOffset} strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_currentColor]"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl md:text-3xl font-black text-white leading-none">{stats.riskScore}</span>
            </div>
          </div>
          <p className={`text-[9px] md:text-[11px] font-bold tracking-widest uppercase mt-3 px-2 md:px-3 py-1 rounded-full border ${
            stats.riskScore > 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
            stats.riskScore > 50 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 
            'text-red-400 border-red-500/30 bg-red-500/10'
          }`}>
            {stats.riskScore > 80 ? 'Optimal' : stats.riskScore > 50 ? 'Warning' : 'Critical'}
          </p>
        </div>

        {/* Action Metrics */}
        <div className={`${glassPanel} sm:col-span-2 md:col-span-4 flex flex-col justify-center`}>
          <div className="flex items-center gap-2 mb-4 md:mb-5 border-b border-slate-700/50 pb-3">
            <Crosshair size={14} className="text-cyan-400"/> 
            <h3 className="text-[10px] md:text-sm font-bold text-white tracking-widest uppercase">Threat Summary</h3>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Search size={12} className="text-cyan-400" />
                </div>
                <span className="text-slate-300 text-[11px] md:text-sm font-semibold">Total Scans</span>
              </div>
              <span className="text-white font-black text-lg md:text-xl">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                  <AlertTriangle size={12} className="text-red-500" />
                </div>
                <span className="text-slate-300 text-[11px] md:text-sm font-semibold">Exposed</span>
              </div>
              <span className="text-red-400 font-black text-lg md:text-xl">{stats.exposed}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MIDDLE ROW: CHARTS & API HEALTH */}
      <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Timeline Area Chart */}
        <div className={`${glassPanel} lg:col-span-5 flex flex-col min-h-[250px]`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
            <h3 className="font-bold text-white tracking-widest text-[10px] md:text-sm flex items-center gap-2 uppercase">
              <Activity size={14} className="text-cyan-400" /> Network Telemetry
            </h3>
            <span className="text-[9px] text-slate-500 font-mono border border-slate-700 px-1.5 py-0.5 rounded uppercase">7D</span>
          </div>
          {stats.total > 0 ? (
            <div className="flex-1 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dx={0} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <Activity size={24} className="mb-2 opacity-20" />
              <p className="text-xs font-medium">Awaiting Data</p>
            </div>
          )}
        </div>

        {/* Scan Type Distribution */}
        <div className={`${glassPanel} lg:col-span-3 flex flex-col min-h-[250px]`}>
          <h3 className="mb-4 font-bold text-white tracking-widest text-[10px] md:text-sm border-b border-slate-700/50 pb-3 flex items-center gap-2 uppercase">
            <PieChart size={14} className="text-indigo-400" /> Vector Analysis
          </h3>
          {stats.total > 0 ? (
            <div className="flex-1 relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.typeData} dataKey="value" innerRadius="60%" outerRadius="80%" stroke="none" paddingAngle={4}>
                    {stats.typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl md:text-2xl font-black text-white">{stats.typeData.length}</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Vectors</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <PieChart size={24} className="mb-2 opacity-20" />
              <p className="text-xs font-medium">No vectors</p>
            </div>
          )}
        </div>

        {/* API Health */}
        <div className={`${glassPanel} lg:col-span-4 flex flex-col`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
            <h3 className="font-bold text-white tracking-widest text-[10px] md:text-sm flex items-center gap-2 uppercase">
              <Server size={14} className="text-emerald-400" /> Integrations
            </h3>
            <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              OPTIMAL
            </span>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { name: "VirusTotal", latency: "14ms", color: "text-blue-400", bg: "bg-blue-400" },
              { name: "LeakCheck", latency: "22ms", color: "text-purple-400", bg: "bg-purple-400" },
              { name: "AbuseIPDB", latency: "18ms", color: "text-cyan-400", bg: "bg-cyan-400" },
              { name: "Numverify", latency: "31ms", color: "text-emerald-400", bg: "bg-emerald-400" }
            ].map((api, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#0a0f1c] p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${api.bg} shrink-0`} />
                  <p className="text-[10px] md:text-xs font-bold text-slate-200 truncate">{api.name}</p>
                </div>
                <span className={`text-[9px] font-mono ${api.color}`}>{api.latency}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* BOTTOM ROW: ADVANCED HISTORY LEDGER - Card layout on Mobile, Table on Desktop */}
      <motion.div variants={itemVars} className={`${glassPanel} overflow-hidden flex flex-col flex-1 min-h-[350px]`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 border-b border-slate-700/50 pb-4 gap-3">
          <div>
            <h3 className="font-bold text-white tracking-widest text-[10px] md:text-sm flex items-center gap-2 mb-1 uppercase">
              <Clock size={14} className="text-indigo-400" /> Intelligence Ledger
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Local security query history.</p>
          </div>
          {history.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearHistory}
              className="flex items-center justify-center gap-2 px-3 py-2 text-[9px] font-bold text-red-400 border border-red-500/40 rounded-lg bg-red-950/30 uppercase shrink-0"
            >
              <Trash2 size={12} /> Purge Records
            </motion.button>
          )}
        </div>
        
        {history.length > 0 ? (
          <>
            {/* MOBILE VIEW (Stacked Cards) */}
            <div className="md:hidden flex flex-col space-y-3 pb-2">
              <AnimatePresence>
                {history.map((record) => (
                  <motion.div 
                    key={record.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-2.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDate(record.timestamp)}
                      </span>
                      <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                        {getTypeIcon(record.type)}
                        <span className="text-[9px] font-bold tracking-widest text-slate-400">{record.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-0.5">
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="text-xs font-bold text-slate-200 truncate">{record.query}</div>
                        {record.status === "Exposed" && (
                          <p className="text-[9px] text-red-400 truncate mt-0.5">{record.breachName}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className={`px-2.5 py-1.5 rounded text-[9px] font-black tracking-widest border uppercase shrink-0 flex items-center gap-1 ${
                          record.status === "Exposed" ? "text-red-400 border-red-500/30 bg-red-950/20" : "text-emerald-400 border-emerald-500/20 bg-emerald-950/10"
                        }`}
                      >
                        {record.status === "Exposed" ? "THREAT" : "CLEARED"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* DESKTOP VIEW (Standard Table) */}
            <div className="hidden md:block overflow-x-auto -mx-4 px-4 flex-1 custom-scrollbar">
              <table className="w-full text-left text-sm border-collapse min-w-[650px]">
                <thead className="text-slate-500 uppercase tracking-widest text-[9px] bg-slate-950/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 font-bold">Timestamp</th>
                    <th className="px-4 py-3 font-bold">Target</th>
                    <th className="px-4 py-3 font-bold text-center">Vector</th>
                    <th className="px-4 py-3 font-bold text-right">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  <AnimatePresence>
                    {history.map((record) => (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[10px] font-mono">
                          {formatDate(record.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-slate-200 text-xs font-medium">
                          <div className="truncate max-w-[200px]">{record.query}</div>
                          {record.status === "Exposed" && <p className="text-[9px] text-slate-500 truncate max-w-[200px]">{record.breachName}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2 bg-slate-900/60 w-max mx-auto px-2 py-1 rounded border border-slate-800">
                            {getTypeIcon(record.type)}
                            <span className="text-[9px] font-bold tracking-widest text-slate-400">{record.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className={`px-2 py-1 rounded text-[8px] font-black tracking-widest border uppercase inline-flex items-center gap-1.5 ${
                              record.status === "Exposed" ? "text-red-400 border-red-500/30 bg-red-950/20" : "text-emerald-400 border-emerald-500/20 bg-emerald-950/10"
                            }`}
                          >
                            {record.status === "Exposed" ? "THREAT" : "CLEARED"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-600 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 mt-2">
            <Shield size={24} className="mb-2 opacity-20" />
            <p className="text-sm font-bold">Ledger is Empty</p>
          </div>
        )}
      </motion.div>

      {/* HISTORY MODAL */}
      <AnimatePresence>
        {selectedRecord && modalData && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(8px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/90 sm:bg-[#020617]/80 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`w-full h-full sm:h-auto sm:max-w-4xl bg-[#0f172a] sm:bg-[#0f172a]/95 backdrop-blur-3xl border-0 sm:border rounded-none sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col sm:max-h-[90vh] ${modalData.isSafe ? 'sm:border-emerald-500/30' : 'sm:border-red-500/30'}`}
            >
              
              {/* Sticky Header inside Modal */}
              <div className="flex-none flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-700/50 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
                <h2 className="text-[10px] sm:text-sm font-bold text-white tracking-wide flex items-center gap-1 sm:gap-2 w-[80%] sm:w-auto overflow-hidden">
                  <span className="whitespace-nowrap uppercase text-slate-400">Record:</span> 
                  <span className="truncate">{selectedRecord.query}</span>
                </h2>
                <div className="flex items-center justify-end">
                  <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.9 }} onClick={closeModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-10 sm:pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  
                  {/* ---> FIX: Updated Needle Gauge Visualizer <--- */}
                  <div className="bg-slate-900/60 border border-slate-700/50 p-4 sm:p-5 rounded-xl flex flex-col items-center justify-center relative shadow-inner">
                    <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[10px] sm:text-xs font-semibold text-slate-300">Risk Profile</span>
                    
                    <div className="relative w-24 h-16 sm:w-32 sm:h-20 mt-6">
                      {/* SVG Arc Gauge */}
                      <svg viewBox="0 0 100 50" className="absolute top-0 left-0 w-full h-full overflow-visible z-0">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                        <motion.path 
                          initial={{ strokeDashoffset: 125.6 }} animate={{ strokeDashoffset: 125.6 - (modalData.score / 100) * 125.6 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                          d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={modalData.gaugeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={125.6}
                        />
                      </svg>
                      
                      {/* Animated Gauge Needle */}
                      <motion.div
                        className="absolute bottom-0 z-10 rounded-t-full origin-bottom shadow-lg h-[36px] sm:h-[48px]"
                        style={{ 
                          left: "calc(50% - 3px)", 
                          width: "6px", 
                          backgroundColor: modalData.gaugeColor 
                        }}
                        initial={{ rotate: -90 }}
                        animate={{ rotate: -90 + (modalData.score / 100) * 180 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      />
                      
                      {/* Needle center pivot dot */}
                      <div className="absolute bottom-[-4px] sm:bottom-[-5px] left-[calc(50%-4px)] sm:left-[calc(50%-5px)] w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white border-2 border-slate-900 rounded-full z-20" />
                    </div>
                    
                    <div className="text-center mt-3 sm:mt-4">
                      <p className={`text-base sm:text-lg font-bold tracking-widest ${modalData.riskColor}`}>{modalData.riskLevel}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">({modalData.score}/100)</p>
                    </div>
                  </div>

                  {/* Metadata Card */}
                  <div className="bg-slate-900/60 border border-slate-700/50 p-4 sm:p-5 rounded-xl shadow-inner flex flex-col justify-center">
                    <ul className="space-y-3 sm:space-y-4">
                      <li className="flex items-center text-[10px] sm:text-xs"><Filter size={12} className="text-slate-500 w-5 sm:w-6" /><span className="text-slate-400 w-20 sm:w-24">Type:</span><span className="text-white font-bold">{selectedRecord.type}</span></li>
                      <li className="flex items-center text-[10px] sm:text-xs"><Globe size={12} className="text-slate-500 w-5 sm:w-6" /><span className="text-slate-400 w-20 sm:w-24">Source:</span><span className={`${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'} font-medium truncate`}>{modalData.source}</span></li>
                      <li className="flex items-center text-[10px] sm:text-xs"><AlertTriangle size={12} className="text-slate-500 w-5 sm:w-6" /><span className="text-slate-400 w-20 sm:w-24">Breach Event:</span><span className={`${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'} font-medium truncate`}>{modalData.breachName}</span></li>
                    </ul>
                  </div>

                  {/* Compromised List */}
                  <div className="bg-slate-900/60 border border-slate-700/50 p-4 sm:p-5 rounded-xl shadow-inner flex flex-col">
                    <h3 className="text-[10px] sm:text-xs font-semibold text-slate-300 mb-3 sm:mb-4">Leak Contents:</h3>
                    <div className="space-y-2 sm:space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-32 md:max-h-none">
                      {modalData.compromisedList.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-2 sm:gap-3 bg-slate-800/50 border p-2 sm:p-3 rounded-lg transition-colors ${modalData.isSafe ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                          <LayoutTemplate size={12} className={`flex-shrink-0 sm:w-3.5 sm:h-3.5 ${modalData.isSafe ? "text-emerald-400" : "text-red-400"}`} />
                          <span className="text-slate-200 text-xs sm:text-sm font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className={`p-4 sm:p-5 rounded-xl shadow-inner border ${modalData.isSafe ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-red-950/20 border-red-500/20'}`}>
                  <h3 className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 tracking-wide uppercase ${modalData.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>Recommended Countermeasures</h3>
                  <div className="space-y-1.5 pl-1 sm:pl-2">
                    {preventionMethods[selectedRecord.type]?.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <span className={`${modalData.isSafe ? 'text-emerald-500' : 'text-red-500'} mt-0 sm:mt-0.5`}>•</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
