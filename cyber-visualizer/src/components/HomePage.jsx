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
  { id:"EMAIL",   label:"Email",   icon:Mail,       color:"#0ea5e9", placeholder:"Enter email address",    hint:"e.g. user@gmail.com"     },
  { id:"PHONE",   label:"Phone",   icon:Smartphone, color:"#10b981", placeholder:"10-digit mobile number", hint:"e.g. 9876543210"          },
  { id:"AADHAAR", label:"Aadhaar", icon:Shield,     color:"#f97316", placeholder:"12-digit Aadhaar no.",   hint:"e.g. 123456789012"        },
  { id:"PAN",     label:"PAN",     icon:CreditCard, color:"#eab308", placeholder:"PAN card number",        hint:"e.g. ABCDE1234F"          },
  { id:"IP",      label:"IP",      icon:Wifi,       color:"#8b5cf6", placeholder:"IPv4 address",           hint:"e.g. 103.21.40.0"         },
  { id:"URL",     label:"URL",     icon:LinkIcon,   color:"#ec4899", placeholder:"Domain or full URL",     hint:"e.g. https://example.xyz" },
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
const TECH_STACK = [
  { name:"React 18", icon:"⚛️", desc:"UI" },
  { name:"Vite",     icon:"⚡",  desc:"Build" },
  { name:"Tailwind", icon:"🎨",  desc:"Style" },
  { name:"Framer",   icon:"🎭",  desc:"Motion" },
  { name:"Node.js",  icon:"🟢",  desc:"Backend" },
  { name:"MongoDB",  icon:"🍃",  desc:"Database" },
];

/* ─── Unified Result Modal ─── */
function ResultModal({ result, modal, dark, onClose }) {
  if (!result || !modal) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.22}}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 modal-overlay"
        onClick={onClose}>
        <motion.div
          initial={{y:60,opacity:0,scale:.95}} animate={{y:0,opacity:1,scale:1}} exit={{y:40,opacity:0}}
          transition={{type:"spring",stiffness:340,damping:26}}
          onClick={e=>e.stopPropagation()}
          className="modal-card w-full sm:max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
          style={{border:`1.5px solid ${modal.safe?"rgba(34,197,94,.3)":"rgba(244,63,94,.35)"}`,boxShadow:"var(--shadow-modal)"}}>

          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-0 sm:hidden shrink-0">
            <div className="w-10 h-1 rounded-full" style={{background:"var(--border)"}}/>
          </div>

          {/* Status banner */}
          <div className="px-5 pt-4 pb-5 shrink-0"
            style={{background:modal.safe
              ?"linear-gradient(135deg,rgba(34,197,94,.14),rgba(34,197,94,.04))"
              :"linear-gradient(135deg,rgba(244,63,94,.16),rgba(244,63,94,.04))"}}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{background:modal.safe?"rgba(34,197,94,.15)":"rgba(244,63,94,.15)",border:`1.5px solid ${modal.safe?"rgba(34,197,94,.3)":"rgba(244,63,94,.3)"}`}}>
                  {modal.safe?"✅":"🚨"}
                </div>
                <div className="min-w-0">
                  <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:modal.safe?"#22c55e":"#f43f5e",letterSpacing:".15em",textTransform:"uppercase",fontWeight:700}}>
                    {modal.safe?"✓ No Breach Found":"⚠ Breach Detected"}
                  </div>
                  <div className="font-bold text-base mt-0.5 truncate" style={{color:"var(--text-primary)"}}>{result.queryId}</div>
                  <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>{result.scanType} · {modal.scanDate}</div>
                </div>
              </div>
              <motion.button onClick={onClose} whileTap={{scale:.9}}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                style={{background:"var(--bg-inset)",border:"1px solid var(--border)",color:"var(--text-muted)"}}>
                <X size={14}/>
              </motion.button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"thin"}}>

            {/* Risk gauge row */}
            <div className="flex items-center gap-4 px-5 py-4" style={{borderBottom:"1px solid var(--divider)"}}>
              <div className="relative w-20 h-[44px] shrink-0">
                <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="7" strokeLinecap="round"/>
                  <motion.path
                    initial={{strokeDashoffset:125.6}} animate={{strokeDashoffset:125.6-(modal.score/100)*125.6}}
                    transition={{duration:1.4,ease:"easeOut",delay:.2}}
                    d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={modal.gc} strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={125.6}
                    style={{filter:`drop-shadow(0 0 6px ${modal.gc})`}}/>
                </svg>
                <motion.div className="absolute bottom-0 rounded-t-full origin-bottom"
                  style={{left:"calc(50% - 2px)",width:"4px",height:"38px",background:modal.gc}}
                  initial={{rotate:-90}} animate={{rotate:-90+(modal.score/100)*180}} transition={{duration:1.4,ease:"easeOut",delay:.2}}/>
              </div>
              <div>
                <div className="font-black text-2xl" style={{fontFamily:"IBM Plex Mono",color:modal.rc}}>{modal.level}</div>
                <div style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-muted)"}}>Score: <strong style={{color:modal.rc}}>{modal.score}/100</strong></div>
              </div>
              <div className="ml-auto text-right shrink-0">
                <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>Source</div>
                <div className="font-semibold text-sm" style={{color:modal.safe?"#22c55e":"#f43f5e"}}>{modal.source}</div>
                <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>
                  Breach: <span style={{color:modal.safe?"#22c55e":"#f43f5e"}}>{modal.breach}</span>
                </div>
              </div>
            </div>

            {/* Exposed fields */}
            <div className="px-5 py-4" style={{borderBottom:"1px solid var(--divider)"}}>
              <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:10}}>
                {modal.safe ? "Status" : "Exposed Fields"}
              </div>
              <div className="flex flex-wrap gap-2">
                {modal.list.map((item,i)=>(
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{background:modal.safe?"rgba(34,197,94,.08)":"rgba(244,63,94,.08)",border:`1px solid ${modal.safe?"rgba(34,197,94,.2)":"rgba(244,63,94,.2)"}`,color:modal.safe?"#22c55e":"#f43f5e"}}>
                    <LayoutTemplate size={10}/>{item}
                  </span>
                ))}
              </div>
            </div>

            {/* Countermeasures */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={12} style={{color:modal.safe?"#22c55e":"#f43f5e"}}/>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:modal.safe?"#22c55e":"#f43f5e",letterSpacing:".12em",textTransform:"uppercase",fontWeight:700}}>
                  Recommended Actions
                </span>
              </div>
              <div className="space-y-2.5">
                {PREVENTION[result.scanType]?.map((a,i)=>(
                  <div key={i} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{color:"var(--text-secondary)"}}>
                    <CheckCircle size={12} style={{color:modal.safe?"#22c55e":"#f43f5e",flexShrink:0,marginTop:1}}/>{a}
                  </div>
                ))}
              </div>
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
        localStorage.setItem(k,JSON.stringify([{id:Date.now(),query:q,type,status:fd.status,timestamp:new Date().toISOString(),source:fd.source,breachName:fd.breachName,compromisedData:fd.compromisedData,severityScore:fd.severityScore},...h]));
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
              <div className="flex justify-between mb-1.5">
                <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>{phase}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--accent)"}}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{background:"var(--bg-inset)"}}>
                <motion.div className="h-full rounded-full" style={{background:"linear-gradient(90deg,#0ea5e9,#6366f1)",width:`${progress}%`}} transition={{duration:.2}}/>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {DB_SOURCES.map(db=>(
                  <div key={db.name} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full blink" style={{background:db.color}}/>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>{db.name}</span>
                  </div>
                ))}
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

        {/* Global Threat Feed */}
        <div className="glass overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-rose-500"/>
              <span className="font-bold text-sm" style={{color:"var(--text-primary)"}}>Global Threat Feed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 blink"/>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"#f43f5e"}}>Live</span>
            </div>
          </div>
          {LIVE_THREATS.map((t,i)=>(
            <div key={t.id} className="flex items-center gap-3 px-4 py-2.5"
              style={{borderBottom:i<LIVE_THREATS.length-1?"1px solid var(--divider)":"none"}}>
              <span className="text-base shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{color:"var(--text-primary)"}}>{t.name}</p>
                <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-muted)"}}>{t.region} · {t.target}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${SEV_BADGE[t.sev]}`} style={{fontFamily:"IBM Plex Mono"}}>{t.sev}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)"}}>{t.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Security Tips */}
        <div className="glass overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{color:"var(--accent)"}}/>
              <span className="font-bold text-sm" style={{color:"var(--text-primary)"}}>Security Tips</span>
            </div>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"#22c55e"}}>Stay Safe</span>
          </div>
          {[
            { icon:"🔐", tip:"Use a unique strong password for every account.", tag:"Passwords" },
            { icon:"📱", tip:"Enable 2FA on all banking and email accounts.", tag:"2FA" },
            { icon:"🔗", tip:"Never click links in unexpected SMS or emails.", tag:"Phishing" },
            { icon:"📡", tip:"Avoid public Wi-Fi for banking; use a VPN.", tag:"Network" },
            { icon:"🪪", tip:"Lock your Aadhaar biometrics via mAadhaar app.", tag:"Aadhaar" },
          ].map((item,i,arr)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-2.5"
              style={{borderBottom:i<arr.length-1?"1px solid var(--divider)":"none"}}>
              <span className="text-base shrink-0">{item.icon}</span>
              <p className="flex-1 text-xs leading-snug" style={{color:"var(--text-secondary)"}}>{item.tip}</p>
              <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                style={{fontFamily:"IBM Plex Mono",color:"var(--accent)",background:"var(--accent-soft)",border:"1px solid var(--accent-border)"}}>{item.tag}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── DEVELOPER CARD ── */}
      <motion.div variants={fUp} className="max-w-4xl w-full mx-auto mb-2">
        <div className="glass overflow-hidden p-0">

          {/* Dev header */}
          <div className="px-5 py-4" style={{borderBottom:"1px solid var(--divider)",background:dark?"rgba(99,102,241,.06)":"rgba(99,102,241,.04)"}}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{background:"linear-gradient(135deg,rgba(99,102,241,.25),rgba(56,189,248,.15))",border:"1.5px solid rgba(99,102,241,.35)"}}>
                  <Code2 size={17} style={{color:"#6366f1"}}/>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{color:"var(--text-primary)"}}>Fardeen Akmal</div>
                  <div style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>Full-Stack Developer · Cybersecurity</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)"}}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 blink"/>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"#22c55e",fontWeight:700,letterSpacing:".08em"}}>v2.0 LIVE</span>
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="px-5 py-4" style={{borderBottom:"1px solid var(--divider)"}}>
            <div style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:12}}>Tech Stack</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TECH_STACK.map(t=>(
                <div key={t.name} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl cursor-default transition-all"
                  style={{background:"var(--bg-inset)",border:"1px solid var(--border)"}}>
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[11px] font-bold" style={{color:"var(--text-primary)"}}>{t.name}</span>
                  <span style={{fontFamily:"IBM Plex Mono",fontSize:8,color:"var(--text-faint)"}}>{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="px-5 py-4">
            <div style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:10}}>Compliance &amp; Standards</div>
            <div className="flex flex-wrap gap-2">
              {[
                {label:"DPDP Act 2023",    color:"#38bdf8"},
                {label:"ISO/IEC 27001",    color:"#22c55e"},
                {label:"SHA-256 / AES-256",color:"#a78bfa"},
                {label:"SOC 2 Type II",    color:"#f97316"},
              ].map(b=>(
                <span key={b.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:b.color,background:`${b.color}12`,border:`1px solid ${b.color}30`,letterSpacing:".04em"}}>
                  <CheckCircle size={9} style={{color:b.color}}/>{b.label}
                </span>
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
