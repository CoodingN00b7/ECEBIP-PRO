import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Smartphone, Shield, CreditCard, Wifi, Link as LinkIcon,
  X, AlertTriangle, Globe, Calendar, LayoutTemplate, Activity,
  Database, Crosshair, Lock, Zap, CheckCircle, Filter, Radio,
  Eye, ChevronDown, Server, Code2
} from "lucide-react";
import { useTheme } from "../ThemeContext";

/* ─── Data ─── */
const GLOBAL_STATS = [
  { label:"Breaches Indexed",    value:"4.2B+", icon:Database, color:"#f43f5e" },
  { label:"Records Monitored",   value:"18.7B", icon:Eye,      color:"#38bdf8" },
  { label:"Threats Neutralised", value:"983K",  icon:Shield,   color:"#22c55e" },
  { label:"Active Scanners",     value:"247",   icon:Radio,    color:"#a78bfa" },
];
const LIVE_THREATS = [
  { id:1, name:"MOVEit SQL Injection Campaign",  target:"348 Enterprise Orgs", sev:"CRITICAL", region:"Global",    time:"Live",    icon:"💀" },
  { id:2, name:"LinkedIn Scrape — 2025 Q1 Dump", target:"87M Profiles",        sev:"HIGH",     region:"USA / EU",  time:"4m ago",  icon:"🔴" },
  { id:3, name:"AWS S3 Misconfiguration Wave",    target:"2.4 TB Exposed",      sev:"HIGH",     region:"US-East-1", time:"11m ago", icon:"🟠" },
  { id:4, name:"Aadhaar Syndicate Portal Leak",   target:"6.9M IDs",            sev:"CRITICAL", region:"India",     time:"22m ago", icon:"💀" },
  { id:5, name:"Smishing Kit — UPI Fraud Ring",   target:"120K Devices",        sev:"MEDIUM",   region:"IN / PK",   time:"35m ago", icon:"🟡" },
  { id:6, name:"BreachForums Credential Dump",    target:"1.1B Passwords",      sev:"CRITICAL", region:"Dark Web",  time:"1h ago",  icon:"💀" },
];
const DB_SOURCES = [
  { name:"LeakCheck Pro",   records:"9.2B",  status:"Online",   latency:"18ms", color:"#a78bfa" },
  { name:"BreachDirectory", records:"7.6B",  status:"Online",   latency:"24ms", color:"#22c55e" },
  { name:"VirusTotal",      records:"900M",  status:"Online",   latency:"31ms", color:"#eab308" },
  { name:"AbuseIPDB",       records:"4.1B",  status:"Degraded", latency:"88ms", color:"#f97316" },
  { name:"Numverify",       records:"2.8B",  status:"Online",   latency:"14ms", color:"#f472b6" },
];
const SCAN_TYPES = [
  { id:"EMAIL",   label:"Email",   icon:Mail,       color:"#0ea5e9", placeholder:"Enter email address",    hint:"e.g. user@domain.com"        },
  { id:"PHONE",   label:"Phone",   icon:Smartphone, color:"#10b981", placeholder:"10-digit mobile number", hint:"e.g. 98XXXXXXXX"             },
  { id:"AADHAAR", label:"Aadhaar", icon:Shield,     color:"#f97316", placeholder:"12-digit Aadhaar no.",   hint:"e.g. XXXX XXXX XXXX"         },
  { id:"PAN",     label:"PAN",     icon:CreditCard, color:"#eab308", placeholder:"PAN card number",        hint:"e.g. ABCDE1234F"             },
  { id:"IP",      label:"IP",      icon:Wifi,       color:"#8b5cf6", placeholder:"IPv4 address",           hint:"e.g. 192.0.2.0"              },
  { id:"URL",     label:"URL",     icon:LinkIcon,   color:"#ec4899", placeholder:"Domain or full URL",     hint:"e.g. https://example.xyz"    },
];
const PREVENTION = {
  EMAIL:   ["Monitor financial transactions linked to this email.", "Enable Two-Factor Authentication (2FA) immediately.", "Check connected OAuth apps for unauthorised access.", "Avoid sending OTPs or sensitive data via email replies."],
  PHONE:   ["Never share OTPs or banking PINs over phone calls.", "Beware of SMS phishing (Smishing) short links.", "Register your number on the TRAI DND registry.", "Contact your carrier to prevent SIM-swap attacks."],
  AADHAAR: ["Lock Aadhaar biometrics via the mAadhaar app.", "Use Virtual ID (VID) instead of your real Aadhaar number.", "Review Aadhaar auth history for anomalies.", "Never share unmasked photocopies of your Aadhaar."],
  PAN:     ["Monitor CIBIL/Experian report for unknown loans.", "Check ITR filings for unauthorised returns.", "Avoid sharing PAN on untrusted websites.", "Report misuse to NSDL and the IT Department."],
  IP:      ["Restart your router to obtain a fresh dynamic IP.", "Use a reputable no-log VPN to mask all traffic.", "Update router firmware and change default credentials.", "Run a full malware scan on all connected devices."],
  URL:     ["Do not enter credentials on this domain.", "Report the URL to Google Safe Browsing and PhishTank.", "Ensure browser phishing protection is on.", "Clear browser cache, cookies, and site storage."],
};
const SEV_BADGE = {
  CRITICAL:"bg-rose-500/10 text-rose-400 border border-rose-500/30",
  HIGH:    "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  MEDIUM:  "bg-amber-500/10 text-amber-400 border border-amber-500/30",
};
const PHASES = ["Initialising scan engines…","Querying breach databases…","Cross-referencing threat intel…","Generating risk report…"];
const THREAT_CATEGORIES = [
  { label:"Nation-State APTs",   count:"12 active",  color:"#f43f5e", icon:"🏴" },
  { label:"Ransomware Groups",   count:"8 tracked",  color:"#f97316", icon:"💰" },
  { label:"Data Brokers",        count:"340+ sites", color:"#eab308", icon:"📦" },
  { label:"Phishing Kits",       count:"2.1K live",  color:"#a78bfa", icon:"🎣" },
  { label:"Dark Web Markets",    count:"47 indexed", color:"#ec4899", icon:"🕸️" },
  { label:"Zero-Day Exploits",   count:"19 unpatched",color:"#38bdf8",icon:"💣" },
];
const BREACH_TIMELINE = [
  { year:"2017", event:"Aadhaar data of 1.1B citizens exposed",     scale:"1.1B" },
  { year:"2019", event:"Indian credit bureau breach — CIBIL records",scale:"6M"   },
  { year:"2021", event:"Air India PII leak — passport & card data",  scale:"4.5M" },
  { year:"2023", event:"ICMR COVID data sold on dark web forums",    scale:"815M" },
  { year:"2024", event:"BSNL subscriber database auctioned online",  scale:"2.9M" },
  { year:"2025", event:"UPI fraud ring — synthetic identity attack",  scale:"120K" },
];

/* ─── PII Masking Utility ─── */
function maskValue(type, val) {
  if (!val) return val;
  switch (type) {
    case "AADHAAR": return "XXXX XXXX " + String(val).slice(-4);
    case "PHONE":   return String(val).slice(0, 2) + "XXXXXX" + String(val).slice(-2);
    case "PAN":     return String(val).slice(0, 2) + "XXXXXXX" + String(val).slice(-1);
    case "EMAIL": {
      const [local, domain] = String(val).split("@");
      if (!domain) return val;
      return local.slice(0, 2) + "****@" + domain;
    }
    default: return val;
  }
}

/* ─── Quick Action Buttons (used inside ResultModal) ─── */
function CopyResultButton({ result, ac, acSoft }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    const text = [
      `Scan Type : ${result.scanType}`,
      `Status    : ${result.status}`,
      `Severity  : ${result.severityScore ?? "N/A"}`,
      `Source    : ${result.source ?? "N/A"}`,
      `Breach    : ${result.breachName ?? "N/A"}`,
      `Fields    : ${result.compromisedData ?? "None"}`,
      `Date      : ${result.scanDate ?? new Date().toISOString().split("T")[0]}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <motion.button onClick={handleCopy} whileTap={{scale:.93}}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
      style={{background:acSoft+".08)",border:`1px solid ${acSoft+".2)"}`,color:ac,fontFamily:"IBM Plex Mono",fontSize:11}}>
      {copied ? <CheckCircle size={12}/> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
      {copied ? "Copied!" : "Copy Report"}
    </motion.button>
  );
}

function ReportFalsePositiveButton({ ac, acSoft }) {
  const [reported, setReported] = React.useState(false);
  const handleReport = () => { setReported(true); setTimeout(() => setReported(false), 3000); };
  return (
    <motion.button onClick={handleReport} whileTap={{scale:.93}}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
      style={{background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.2)",color:reported?"#22c55e":"#818cf8",fontFamily:"IBM Plex Mono",fontSize:11}}>
      {reported ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
      {reported ? "Reported — Thank you" : "Report False Positive"}
    </motion.button>
  );
}

/* ─── Unified Result Modal ─── */
function ResultModal({ result, modal, dark, onClose }) {
  if (!result || !modal) return null;
  const ac = modal.safe ? "#22c55e" : "#f43f5e";
  const acSoft = modal.safe ? "rgba(34,197,94," : "rgba(244,63,94,";

  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.3}}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6"
        style={{backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",background:"rgba(0,0,0,.55)"}}
        onClick={onClose}>

        <motion.div
          initial={{y:80,opacity:0,scale:.93}} animate={{y:0,opacity:1,scale:1}} exit={{y:50,opacity:0,scale:.96}}
          transition={{type:"spring",stiffness:320,damping:28}}
          onClick={e=>e.stopPropagation()}
          className="w-full sm:max-w-md max-h-[88vh] flex flex-col overflow-hidden"
          style={{
            borderRadius:"28px 28px 0 0",
            background:dark?"rgba(6,13,31,.97)":"rgba(245,250,255,.98)",
            border:`1.5px solid ${acSoft}.25)`,
            boxShadow:`0 -8px 60px -10px ${acSoft}.2), 0 0 0 1px ${acSoft}.08)`,
          }}>

          {/* Drag pill */}
          <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden">
            <div className="w-12 h-1.5 rounded-full" style={{background:acSoft+".3)"}}/>
          </div>

          {/* ── TOP HERO ── */}
          <div className="relative overflow-hidden px-5 pt-4 pb-6 shrink-0"
            style={{background:`linear-gradient(160deg,${acSoft}.12) 0%,${acSoft}.03) 60%,transparent 100%)`}}>
            {/* ambient glow blob */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{background:`radial-gradient(circle,${acSoft}.15) 0%,transparent 70%)`,transform:"translate(30%,-30%)",filter:"blur(20px)"}}/>

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5">
                {/* Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{background:`linear-gradient(135deg,${acSoft}.2),${acSoft}.08))`,border:`1.5px solid ${acSoft}.3)`}}>
                    {modal.safe ? "🛡️" : "⚠️"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{background:ac,border:"2px solid var(--bg-base)"}}>
                    {modal.safe
                      ? <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 3l4 4M7 3l-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full blink" style={{background:ac}}/>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:800,color:ac,letterSpacing:".18em",textTransform:"uppercase"}}>
                      {modal.safe ? "No Breach Found" : "Breach Detected"}
                    </span>
                  </div>
                  <div className="font-black text-base truncate max-w-[200px]" style={{color:"var(--text-primary)",letterSpacing:"-.01em"}}>{maskValue(result.scanType, result.queryId)}</div>
                  <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",marginTop:2}}>{result.scanType} · {modal.scanDate}</div>
                </div>
              </div>
              <motion.button onClick={onClose} whileTap={{scale:.88}}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{background:acSoft+".1)",border:`1px solid ${acSoft}.2)`,color:ac}}>
                <X size={13}/>
              </motion.button>
            </div>
          </div>

          {/* ── RISK SCORE BAND ── */}
          <div className="shrink-0 px-5 py-4" style={{borderBottom:`1px solid ${acSoft}.12)`}}>
            <div className="flex items-center gap-4">
              {/* Circular gauge */}
              <div className="relative shrink-0" style={{width:72,height:72}}>
                <svg viewBox="0 0 72 72" width="72" height="72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke={acSoft+".12)"} strokeWidth="6"/>
                  <motion.circle cx="36" cy="36" r="28" fill="none" stroke={ac} strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={175.9}
                    initial={{strokeDashoffset:175.9}}
                    animate={{strokeDashoffset:175.9-((modal.score/100)*175.9)}}
                    transition={{duration:1.5,ease:"easeOut",delay:.15}}
                    transform="rotate(-90 36 36)"
                    style={{filter:`drop-shadow(0 0 8px ${ac})`}}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-sm leading-none" style={{fontFamily:"IBM Plex Mono",color:ac}}>{modal.score}</span>
                  <span style={{fontFamily:"IBM Plex Mono",fontSize:8,color:"var(--text-faint)"}}>/ 100</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-black text-3xl tracking-tight leading-none mb-1" style={{color:ac}}>{modal.level}</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Globe size={11} style={{color:"var(--text-faint)"}}/>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>Source: <strong style={{color:ac}}>{modal.source}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={11} style={{color:"var(--text-faint)"}}/>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>Breach: <strong style={{color:ac}}>{modal.breach}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"none"}}>

            {/* ── EXPOSED FIELDS ── */}
            <div className="px-5 pt-4 pb-4" style={{borderBottom:`1px solid ${acSoft}.1)`}}>
              <div style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)",letterSpacing:".15em",textTransform:"uppercase",marginBottom:10,fontWeight:700}}>
                {modal.safe ? "Scan Status" : "Exposed Fields"}
              </div>
              <div className="flex flex-wrap gap-2">
                {modal.list.map((item,i)=>(
                  <motion.span key={i} initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}} transition={{delay:i*.06}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{background:`linear-gradient(135deg,${acSoft}.12),${acSoft}.06))`,border:`1px solid ${acSoft}.25)`,color:ac,letterSpacing:".03em"}}>
                    <LayoutTemplate size={10}/>{item}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* ── RECOMMENDED ACTIONS ── */}
            <div className="px-5 pt-4 pb-4" style={{borderBottom:`1px solid ${acSoft}.1)`}}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{background:acSoft+".15)"}}>
                  <Lock size={11} style={{color:ac}}/>
                </div>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:ac,letterSpacing:".15em",textTransform:"uppercase",fontWeight:800}}>
                  Recommended Actions
                </span>
              </div>
              <div className="space-y-3">
                {PREVENTION[result.scanType]?.map((a,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:.1+i*.07}}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{background:acSoft+".05)",border:`1px solid ${acSoft}.1)`}}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{background:acSoft+".15)"}}>
                      <CheckCircle size={11} style={{color:ac}}/>
                    </div>
                    <p className="text-xs leading-relaxed" style={{color:"var(--text-secondary)"}}>{a}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="px-5 pt-4 pb-6 flex gap-2 flex-wrap">
              <CopyResultButton result={result} ac={ac} acSoft={acSoft}/>
              <ReportFalsePositiveButton ac={ac} acSoft={acSoft}/>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Main Component ─── */
export default function HomePage() {
  const { dark } = useTheme();
  const [mode, setMode]         = useState("API");
  const [identifier, setId]     = useState("");
  const [type, setType]         = useState("EMAIL");
  const [loading, setLoading]   = useState(false);
  const [progress, setProg]     = useState(0);
  const [phase, setPhase]       = useState("");
  const [result, setResult]     = useState(null);
  const [focused, setFocused]   = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [tickIdx, setTickIdx]   = useState(0);
  const inputRef = useRef(null);
  const API = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

  useEffect(()=>{ const t=setInterval(()=>setTickIdx(i=>(i+1)%LIVE_THREATS.length),3500); return()=>clearInterval(t); },[]);
  useEffect(()=>{ if(type==="AADHAAR"||type==="PAN") setMode("LOCAL"); },[type]);
  useEffect(()=>{
    window.dispatchEvent(new CustomEvent("modalStateChange",{detail:{isModalOpen:!!result}}));
    return()=>window.dispatchEvent(new CustomEvent("modalStateChange",{detail:{isModalOpen:false}}));
  },[result]);
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape"){setResult(null);setTypeOpen(false);}};
    window.addEventListener("keydown",fn); return()=>window.removeEventListener("keydown",fn);
  },[]);
  useEffect(()=>{
    if(!typeOpen) return;
    const fn=()=>setTypeOpen(false);
    document.addEventListener("click",fn,true);
    return()=>document.removeEventListener("click",fn,true);
  },[typeOpen]);

  const handleInput = e => {
    let v=e.target.value;
    if(type==="PHONE")   v=v.replace(/\D/g,"").slice(0,10);
    if(type==="AADHAAR") v=v.replace(/\D/g,"").slice(0,12);
    if(type==="PAN")     v=v.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,10);
    setId(v);
    if(/^[A-Z]{5}\d{4}[A-Z]$/.test(v))           setType("PAN");
    else if(/^\d{12}$/.test(v))                   setType("AADHAAR");
    else if(/^\d{10}$/.test(v)&&type!=="AADHAAR") setType("PHONE");
    else if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setType("EMAIL");
    else if(/^(https?:\/\/|www\.)/i.test(v))       setType("URL");
    else if(/^(\d{1,3}\.){3}\d{1,3}$/.test(v))    setType("IP");
  };

  const handleScan = async () => {
    if(!identifier){inputRef.current?.focus();return;}
    if(type==="PAN"&&!/^[A-Z]{5}\d{4}[A-Z]$/.test(identifier)) return alert("Invalid PAN. Example: ABCDE1234F");
    if(type==="AADHAAR"&&!/^\d{12}$/.test(identifier))          return alert("Aadhaar must be 12 digits.");
    if(type==="PHONE"&&!/^\d{10}$/.test(identifier))            return alert("Phone must be 10 digits.");
    setLoading(true);setProg(0);setResult(null);
    let ph=0; setPhase(PHASES[0]);
    const pi=setInterval(()=>{setProg(p=>p>=90?p:p+Math.floor(Math.random()*12)+4);ph=Math.min(ph+1,PHASES.length-1);setPhase(PHASES[ph]);},500);
    const q=identifier; let fd=null;
    try {
      if(mode==="API"){
        const r=await fetch(`${API}/api/scan`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:q,type})});
        const d=await r.json(); fd={...d,scanType:type,queryId:q};
      } else {
        const r=await fetch(`${API}/api/attacks/search?query=${q}`); const d=await r.json();
        if(!d?.length||d[0].status?.toLowerCase()==="safe") fd={status:"Safe",scanType:type,queryId:q};
        else {
          const rec=d[0];
          fd={status:"Exposed",scanType:type,queryId:q,source:rec.source,breachName:rec.breachName||rec.breachname,compromisedData:rec.compromisedData||rec.compromiseddata,severityScore:rec.severityScore||rec.severityscore,scanDate:rec.scanDate||new Date().toISOString().split("T")[0]};
        }
      }
      const u=JSON.parse(localStorage.getItem("user")||"null");
      if(u&&!u.isGuest&&u.email){
        const k=`search_history_${u.email}`;
        const h=JSON.parse(localStorage.getItem(k)||"[]");
        localStorage.setItem(k,JSON.stringify([{id:Date.now(),query:maskValue(type,q),type,status:fd.status,timestamp:new Date().toISOString(),source:fd.source,breachName:fd.breachName,compromisedData:fd.compromisedData,severityScore:fd.severityScore},...h]));
      }
      clearInterval(pi);setProg(100);setPhase("Scan complete.");
      await new Promise(r=>setTimeout(r,500));
      setId("");setResult(fd);
    } catch(err){console.error(err);clearInterval(pi);}
    setLoading(false);
  };

  const modal = (() => {
    if(!result) return null;
    const safe=result.status==="Safe";
    const score=safe?0:parseInt(result.severityScore||85);
    const list=result.compromisedData?result.compromisedData.split(",").map(s=>s.trim()):safe?["No data exposed"]:["Archived Threat Data"];
    let level="SAFE",rc="#22c55e",gc="#22c55e";
    if(!safe){if(score<40){level="LOW";rc="#eab308";gc="#eab308";}else if(score<75){level="MEDIUM";rc="#f97316";gc="#f97316";}else{level="CRITICAL";rc="#f43f5e";gc="#f43f5e";}}
    return {safe,score,list,level,rc,gc,source:result.source||(safe?"Clean":"BreachForums"),breach:result.breachName||(safe?"None":"Unknown Breach"),scanDate:result.scanDate||new Date().toISOString().split("T")[0]};
  })();

  const selType = SCAN_TYPES.find(t=>t.id===type);
  const stagger = {hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.08,delayChildren:.04}}};
  const fUp     = {hidden:{opacity:0,y:18},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:280,damping:24}}};

  return (
    <>
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="flex-1 w-full flex flex-col px-3 sm:px-6 md:px-10 lg:px-14 pb-10 overflow-y-auto"
      style={{scrollbarWidth:"thin",fontFamily:"'DM Sans',sans-serif",color:"var(--text-primary)"}}>

      {/* ── HERO ── */}
      <motion.div variants={fUp} className="text-center pt-8 pb-5 px-2">
        <motion.div
          initial={{scale:.85,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:260,damping:20,delay:.05}}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{background:dark?"rgba(244,63,94,.1)":"rgba(254,226,226,.7)",border:"1px solid rgba(244,63,94,.25)"}}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 blink"/>
          <span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:700,color:"#f43f5e",letterSpacing:".15em",textTransform:"uppercase"}}>Live Threat Intelligence</span>
        </motion.div>
        <h1 className="font-black leading-none tracking-tight mb-3"
          style={{fontSize:"clamp(2.6rem,11vw,4.2rem)",background:"linear-gradient(135deg,#e8f4fd 0%,#38bdf8 40%,#6366f1 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
          Breach<br/>Detector
        </h1>
        <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{color:"var(--text-muted)"}}>
          Check if your digital identity is exposed across{" "}
          <strong style={{color:"var(--accent)"}}>5 live intelligence sources</strong>
        </p>
        <div className="mt-4 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={tickIdx} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:.25}}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full max-w-[280px]"
              style={{background:dark?"rgba(15,23,42,.7)":"rgba(240,249,255,.9)",border:"1px solid var(--border)"}}>
              <span className="text-sm shrink-0">{LIVE_THREATS[tickIdx].icon}</span>
              <span className="truncate" style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-secondary)"}}>{LIVE_THREATS[tickIdx].name}</span>
              <span className="shrink-0" style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)"}}>{LIVE_THREATS[tickIdx].time}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div variants={fUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {GLOBAL_STATS.map(s=>{ const Icon=s.icon; return(
          <div key={s.label} className="glass flex items-center gap-2.5 p-3 cursor-default">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:`${s.color}18`,border:`1px solid ${s.color}30`}}>
              <Icon size={14} style={{color:s.color}}/>
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm leading-tight" style={{fontFamily:"IBM Plex Mono",color:"var(--text-primary)"}}>{s.value}</div>
              <div className="text-[10px] leading-tight truncate" style={{color:"var(--text-muted)"}}>{s.label}</div>
            </div>
          </div>
        );})}
      </motion.div>

      {/* ── SCAN PANEL ── */}
      <motion.div variants={fUp} className="scan-panel w-full max-w-2xl mx-auto p-5 sm:p-7 mb-5">

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-bold text-base" style={{color:"var(--text-primary)"}}>Identity Scanner</div>
            <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>Powered by {DB_SOURCES.length} threat databases</div>
          </div>
          <div className="mode-toggle shrink-0">
            {["API","LOCAL"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={`mode-btn ${mode===m?"active":""}`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Scan Type Dropdown */}
        <div className="mb-4">
          <label style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".1em",textTransform:"uppercase",display:"block",marginBottom:8}}>Scan Type</label>
          <div className="relative" onClick={e=>e.stopPropagation()}>
            <motion.button
              onClick={()=>setTypeOpen(v=>!v)} whileTap={{scale:.98}}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
              style={{background:"var(--bg-inset)",border:`1.5px solid ${selType?.color}55`,boxShadow:`0 0 22px -10px ${selType?.color}50`,transition:"border-color .2s,box-shadow .2s"}}>
              {selType&&<selType.icon size={18} style={{color:selType.color,flexShrink:0}}/>}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{color:"var(--text-primary)"}}>{selType?.label}</div>
                <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>{selType?.hint}</div>
              </div>
              <motion.span animate={{rotate:typeOpen?180:0}} transition={{duration:.2}}>
                <ChevronDown size={16} style={{color:"var(--text-muted)",flexShrink:0}}/>
              </motion.span>
            </motion.button>
            <AnimatePresence>
              {typeOpen&&(
                <motion.div
                  initial={{opacity:0,y:-6,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-6,scale:.97}}
                  transition={{type:"spring",stiffness:400,damping:28}}
                  className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
                  style={{background:"var(--bg-glass-2)",border:"1px solid var(--border-glow)",boxShadow:"0 20px 60px -10px rgba(0,0,0,.5)",backdropFilter:"blur(24px)"}}>
                  {SCAN_TYPES.map((t,i)=>{ const Icon=t.icon; const on=type===t.id; return(
                    <motion.button key={t.id}
                      onClick={()=>{setType(t.id);setTypeOpen(false);setId("");}}
                      whileHover={{backgroundColor:dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)"}}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      style={{borderBottom:i<SCAN_TYPES.length-1?"1px solid var(--divider)":"none",background:on?`${t.color}0d`:"transparent"}}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{background:`${t.color}18`,border:`1.5px solid ${t.color}35`}}>
                        <Icon size={15} style={{color:t.color}}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{color:on?t.color:"var(--text-primary)"}}>{t.label}</div>
                        <div style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)"}}>{t.hint}</div>
                      </div>
                      {on&&<CheckCircle size={14} style={{color:t.color,flexShrink:0}}/>}
                    </motion.button>
                  );})}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input */}
        <div className="scan-input-wrap flex items-center gap-2 px-4 mb-2"
          style={focused?{borderColor:`${selType?.color||"var(--accent)"}60`,boxShadow:`0 0 24px -8px ${selType?.color||"var(--accent)"}35`}:{}}>
          {selType&&<selType.icon size={15} style={{color:focused?selType.color:"var(--text-faint)",flexShrink:0,transition:"color .2s"}}/>}
          <input ref={inputRef} value={identifier} onChange={handleInput}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            onKeyDown={e=>e.key==="Enter"&&handleScan()}
            placeholder={selType?.placeholder||"Enter identifier…"}
            className="scan-input"/>
          <AnimatePresence>
            {identifier&&(
              <motion.button initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.8}}
                onClick={()=>setId("")} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-faint)",flexShrink:0}}>
                <X size={13}/>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <p style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-faint)"}} className="mb-5 pl-1">{selType?.hint}</p>

        <motion.button onClick={handleScan} disabled={loading||!identifier}
          whileHover={!loading&&identifier?{scale:1.01,y:-1}:{}} whileTap={!loading&&identifier?{scale:.98}:{}}
          className="btn-primary">
          {loading?(
            <><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:1.2,ease:"linear"}} style={{display:"inline-flex"}}><Crosshair size={17}/></motion.span>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:13}}>{phase}</span></>
          ):(<><Zap size={17}/> Start Threat Scan</>)}
        </motion.button>

        <AnimatePresence>
          {loading&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mt-4">
              {/* Cyber scan bar */}
              <div className="rounded-2xl p-4" style={{background:"var(--bg-inset)",border:"1px solid var(--border)"}}>
                {/* Phase + % header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 rounded-full bg-sky-400"
                      animate={{opacity:[1,.3,1],scale:[1,1.3,1]}} transition={{repeat:Infinity,duration:1,ease:"easeInOut"}}/>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--accent)",letterSpacing:".06em"}}>{phase}</span>
                  </div>
                  <span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:700,color:"var(--accent)"}}>{progress}<span style={{fontSize:8,opacity:.6}}>%</span></span>
                </div>

                {/* Segmented progress bar */}
                <div className="relative h-3 rounded-full overflow-hidden mb-3" style={{background:"rgba(56,189,248,.08)",border:"1px solid rgba(56,189,248,.15)"}}>
                  <motion.div className="absolute inset-y-0 left-0 rounded-full"
                    style={{width:`${progress}%`,background:"linear-gradient(90deg,#0ea5e9,#6366f1,#a855f7)",boxShadow:"0 0 12px rgba(99,102,241,.6)"}}
                    transition={{duration:.25}}/>
                  {/* scan shimmer */}
                  <motion.div className="absolute inset-y-0 w-8 rounded-full"
                    style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)",left:`${Math.max(0,progress-8)}%`}}
                    transition={{duration:.25}}/>
                  {/* tick marks */}
                  {[25,50,75].map(t=>(
                    <div key={t} className="absolute top-0 bottom-0 w-px" style={{left:`${t}%`,background:"rgba(56,189,248,.2)"}}/>
                  ))}
                </div>

                {/* DB source pills */}
                <div className="flex flex-wrap gap-1.5">
                  {DB_SOURCES.map((db,i)=>{
                    const active = progress > i*(100/DB_SOURCES.length);
                    return(
                      <div key={db.name} className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                        style={{background:active?`${db.color}15`:"transparent",border:`1px solid ${active?db.color+"40":"var(--border)"}`,transition:"all .4s"}}>
                        <motion.span className="w-1.5 h-1.5 rounded-full"
                          style={{background:db.color}}
                          animate={active?{opacity:[1,.4,1]}:{opacity:.3}}
                          transition={{repeat:active?Infinity:0,duration:.8,delay:i*.15}}/>
                        <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:active?"var(--text-secondary)":"var(--text-faint)",fontWeight:active?600:400}}>{db.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected sources — full card list */}
        <div className="mt-5 pt-5" style={{borderTop:"1px solid var(--divider)"}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Server size={11} style={{color:"var(--text-muted)"}}/>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".1em",textTransform:"uppercase"}}>Connected Sources</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 blink"/>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"#22c55e"}}>4 / 5 Online</span>
            </div>
          </div>
          <div className="space-y-2">
            {DB_SOURCES.map(db=>(
              <div key={db.name} className="glass-inset flex items-center gap-3 px-3 py-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{background:db.color,boxShadow:`0 0 6px ${db.color}`}}/>
                <span className="flex-1 text-xs font-semibold" style={{color:"var(--text-secondary)"}}>{db.name}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>{db.records} records</span>
                <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold"
                  style={{fontFamily:"IBM Plex Mono",color:db.status==="Online"?"#22c55e":"#f97316",background:db.status==="Online"?"rgba(34,197,94,.1)":"rgba(249,115,22,.1)",border:`1px solid ${db.status==="Online"?"rgba(34,197,94,.25)":"rgba(249,115,22,.25)"}`}}>
                  {db.latency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── BOTTOM CARDS ── */}
      <motion.div variants={fUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 max-w-4xl w-full mx-auto">

        {/* Threat Categories — cool hexagonal/grid style */}
        <div className="glass overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-rose-500"/>
              <span className="font-bold text-sm" style={{color:"var(--text-primary)"}}>Active Threat Matrix</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 blink"/>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"#f43f5e"}}>Live</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {THREAT_CATEGORIES.map((cat,i)=>(
              <motion.div key={i} whileTap={{scale:.97}}
                className="relative overflow-hidden rounded-xl p-3 cursor-default"
                style={{background:`linear-gradient(135deg,${cat.color}10,${cat.color}05)`,border:`1px solid ${cat.color}25`}}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                    style={{fontFamily:"IBM Plex Mono",color:cat.color,background:`${cat.color}18`,border:`1px solid ${cat.color}30`}}>{cat.count}</span>
                </div>
                <div className="text-xs font-bold leading-tight" style={{color:"var(--text-primary)"}}>{cat.label}</div>
                <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full opacity-[0.06]"
                  style={{background:cat.color,transform:"translate(30%,30%)"}}/>
              </motion.div>
            ))}
          </div>
        </div>

        {/* India Breach Timeline */}
        <div className="glass overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-2">
              <Globe size={14} style={{color:"#f97316"}}/>
              <span className="font-bold text-sm" style={{color:"var(--text-primary)"}}>India Breach Timeline</span>
            </div>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"#f97316"}}>2017–2025</span>
          </div>
          <div className="px-4 py-3 space-y-0">
            {BREACH_TIMELINE.map((b,i)=>(
              <div key={i} className="flex gap-3 relative">
                {/* vertical line */}
                {i < BREACH_TIMELINE.length-1 && (
                  <div className="absolute left-[19px] top-7 w-px" style={{height:"calc(100% - 4px)",background:"var(--divider)"}}/>
                )}
                {/* dot */}
                <div className="shrink-0 w-10 flex flex-col items-center pt-1">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{background:i===BREACH_TIMELINE.length-1?"rgba(244,63,94,.2)":"var(--bg-inset)",border:`1.5px solid ${i===BREACH_TIMELINE.length-1?"#f43f5e":"var(--border)"}`}}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{background:i===BREACH_TIMELINE.length-1?"#f43f5e":"var(--text-faint)"}}/>
                  </div>
                </div>
                <div className="flex-1 pb-3 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:700,color:"var(--accent)"}}>{b.year}</span>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"#f43f5e",fontWeight:700}}>{b.scale} records</span>
                  </div>
                  <p className="text-xs leading-snug" style={{color:"var(--text-secondary)"}}>{b.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── DEVELOPER CARD — minimal ── */}
      <motion.div variants={fUp} className="max-w-4xl w-full mx-auto mb-2">
        <div className="glass p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{background:"linear-gradient(135deg,rgba(99,102,241,.2),rgba(56,189,248,.15))",border:"1px solid rgba(99,102,241,.3)"}}>
                <Code2 size={14} style={{color:"#6366f1"}}/>
              </div>
              <div>
                <span className="text-sm font-bold" style={{color:"var(--text-primary)"}}>Fardeen Akmal</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)",marginLeft:8}}>Developer · ECEBIP PRO v2.0</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                {label:"DPDP Act",  color:"#38bdf8"},
                {label:"ISO 27001", color:"#22c55e"},
                {label:"AES-256",   color:"#a78bfa"},
                {label:"SOC 2",     color:"#f97316"},
              ].map(b=>(
                <span key={b.label} style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:b.color,background:`${b.color}10`,border:`1px solid ${b.color}25`,padding:"3px 8px",borderRadius:6,letterSpacing:".04em"}}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>

    {/* ── RESULT MODAL ── */}
    <ResultModal result={result} modal={modal} dark={dark} onClose={()=>setResult(null)}/>
    </>
  );
}
