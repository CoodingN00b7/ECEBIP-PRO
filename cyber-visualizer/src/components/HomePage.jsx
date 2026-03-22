import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Smartphone, Shield, CreditCard, Wifi, Link as LinkIcon, X, AlertTriangle, Globe, Calendar, LayoutTemplate, Activity, Database, Crosshair, Lock, Zap, CheckCircle, Filter, Clock, Radio, Eye } from "lucide-react";
import { useTheme } from "../ThemeContext";


const STATS=[{label:"Breaches",value:"4.2B+",delta:"+12k today",up:false,icon:Database,color:"#f43f5e"},{label:"Records",value:"18.7B",delta:"+890M/mo",up:true,icon:Eye,color:"#38bdf8"},{label:"Blocked",value:"983K",delta:"+2.1%",up:true,icon:Shield,color:"#22c55e"},{label:"Scanners",value:"247",delta:"6 regions",up:true,icon:Radio,color:"#a78bfa"}];
const THREATS=[{id:1,name:"MOVEit SQL Injection",target:"348 Orgs",sev:"CRITICAL",region:"Global",time:"Live",icon:"💀"},{id:2,name:"LinkedIn Data Dump",target:"87M Profiles",sev:"HIGH",region:"USA/EU",time:"4m",icon:"🔴"},{id:3,name:"AWS S3 Bucket Leak",target:"2.4 TB",sev:"HIGH",region:"US-East-1",time:"11m",icon:"🟠"},{id:4,name:"Aadhaar Portal Leak",target:"6.9M IDs",sev:"CRITICAL",region:"India",time:"22m",icon:"💀"},{id:5,name:"UPI Fraud Smishing",target:"120K Devices",sev:"MEDIUM",region:"IN/PK",time:"35m",icon:"🟡"},{id:6,name:"BreachForums Dump",target:"1.1B Passwords",sev:"CRITICAL",region:"Dark Web",time:"1h",icon:"💀"}];
const SCANS=[{q:"rohit@hdfc.co.in",t:"EMAIL",s:"Exposed",a:"3m"},{q:"192.168.42.11",t:"IP",s:"Safe",a:"7m"},{q:"9876543210",t:"PHONE",s:"Exposed",a:"12m"},{q:"ABCDE1234F",t:"PAN",s:"Safe",a:"18m"},{q:"malware-cdn.xyz",t:"URL",s:"Exposed",a:"24m"}];
const DBS=[{name:"HaveIBeenPwned",r:"13.8B",ok:true,ms:"12ms",c:"#38bdf8"},{name:"LeakCheck Pro",r:"9.2B",ok:true,ms:"18ms",c:"#a78bfa"},{name:"BreachDirectory",r:"7.6B",ok:true,ms:"24ms",c:"#22c55e"},{name:"VirusTotal",r:"900M",ok:true,ms:"31ms",c:"#eab308"},{name:"AbuseIPDB",r:"4.1B",ok:false,ms:"88ms",c:"#f97316"},{name:"Numverify",r:"2.8B",ok:true,ms:"14ms",c:"#f472b6"}];
const TYPES=[{id:"EMAIL",label:"Email",icon:Mail,color:"#0ea5e9",ph:"Enter email",hint:"e.g. user@gmail.com"},{id:"PHONE",label:"Phone",icon:Smartphone,color:"#10b981",ph:"10-digit mobile",hint:"e.g. 9876543210"},{id:"AADHAAR",label:"Aadhaar",icon:Shield,color:"#f97316",ph:"12-digit Aadhaar",hint:"e.g. 123412341234"},{id:"PAN",label:"PAN",icon:CreditCard,color:"#eab308",ph:"PAN card no.",hint:"e.g. ABCDE1234F"},{id:"IP",label:"IP",icon:Wifi,color:"#8b5cf6",ph:"IPv4 address",hint:"e.g. 103.21.40.0"},{id:"URL",label:"URL",icon:LinkIcon,color:"#ec4899",ph:"Domain / URL",hint:"e.g. https://xyz.com"}];
const PREV={EMAIL:["Monitor transactions linked to this email.","Enable 2FA immediately.","Check OAuth apps for unauthorised access.","Never share OTPs via email."],PHONE:["Never share OTPs over phone calls.","Beware Smishing links.","Register on TRAI DND registry.","Contact carrier to prevent SIM-swap."],AADHAAR:["Lock biometrics via mAadhaar app.","Use VID instead of real Aadhaar.","Review Aadhaar auth history.","Never share unmasked photocopies."],PAN:["Monitor CIBIL for unknown loans.","Check ITR for unauthorised returns.","Avoid sharing PAN on untrusted sites.","Report to NSDL immediately."],IP:["Restart router for fresh IP.","Use a no-log VPN.","Update router firmware.","Run a full malware scan."],URL:["Don't enter credentials here.","Report to Google Safe Browsing.","Enable browser phishing protection.","Clear cache, cookies and storage."]};
const SEV={CRITICAL:"bg-rose-500/10 text-rose-400 border border-rose-500/30",HIGH:"bg-orange-500/10 text-orange-400 border border-orange-500/30",MEDIUM:"bg-amber-500/10 text-amber-400 border border-amber-500/30"};
const PHASES=["Initialising engines…","Querying databases…","Cross-referencing intel…","Generating report…"];

export default function HomePage() {
  const { dark } = useTheme();
  const [type,    setType]    = useState("EMAIL");
  const [id,      setId]      = useState("");
  const [mode,    setMode]    = useState("API");
  const [loading, setLoading] = useState(false);
  const [prog,    setProg]    = useState(0);
  const [phase,   setPhase]   = useState("");
  const [result,  setResult]  = useState(null);
  const [focused, setFocused] = useState(false);
  const [tick,    setTick]    = useState(0);
  const inputRef = useRef(null);
  const API = import.meta?.env?.VITE_API_URL||"http://localhost:5000";

  useEffect(()=>{ const t=setInterval(()=>setTick(i=>(i+1)%THREATS.length),3500); return ()=>clearInterval(t); },[]);
  useEffect(()=>{ if(type==="AADHAAR"||type==="PAN") setMode("LOCAL"); },[type]);
  useEffect(()=>{
    window.dispatchEvent(new CustomEvent("modalStateChange",{detail:{isModalOpen:!!result}}));
    return ()=>window.dispatchEvent(new CustomEvent("modalStateChange",{detail:{isModalOpen:false}}));
  },[result]);
  useEffect(()=>{ const fn=e=>{if(e.key==="Escape")setResult(null);}; window.addEventListener("keydown",fn); return()=>window.removeEventListener("keydown",fn); },[]);

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

  const scan = async () => {
    if(!id){inputRef.current?.focus();return;}
    if(type==="PAN"&&!/^[A-Z]{5}\d{4}[A-Z]$/.test(id))return alert("Invalid PAN. Example: ABCDE1234F");
    if(type==="AADHAAR"&&!/^\d{12}$/.test(id))         return alert("Aadhaar must be 12 digits.");
    if(type==="PHONE"&&!/^\d{10}$/.test(id))           return alert("Phone must be 10 digits.");
    setLoading(true);setProg(0);setResult(null);
    let ph=0;setPhase(PHASES[0]);
    const pi=setInterval(()=>{setProg(p=>p>=90?p:p+Math.floor(Math.random()*12)+4);ph=Math.min(ph+1,PHASES.length-1);setPhase(PHASES[ph]);},500);
    const q=id; let fd=null;
    try {
      if(mode==="API"){const r=await fetch(`${API}/api/scan`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:q,type})});const d=await r.json();fd={...d,scanType:type,queryId:q};}
      else {const r=await fetch(`${API}/api/attacks/search?query=${q}`);const d=await r.json();if(!d?.length||d[0].status?.toLowerCase()==="safe")fd={status:"Safe",scanType:type,queryId:q};else{const rec=d[0];fd={status:"Exposed",scanType:type,queryId:q,source:rec.source,breachName:rec.breachName||rec.breachname,compromisedData:rec.compromisedData||rec.compromiseddata,severityScore:rec.severityScore||rec.severityscore,scanDate:rec.scanDate||new Date().toISOString().split("T")[0]};}}
      const u=JSON.parse(localStorage.getItem("user")||"null");
      if(u&&!u.isGuest&&u.email){const k=`search_history_${u.email}`;const h=JSON.parse(localStorage.getItem(k)||"[]");localStorage.setItem(k,JSON.stringify([{id:Date.now(),query:q,type,status:fd.status,timestamp:new Date().toISOString(),source:fd.source,breachName:fd.breachName,compromisedData:fd.compromisedData,severityScore:fd.severityScore},...h]));}
      clearInterval(pi);setProg(100);setPhase("Complete.");
      await new Promise(r=>setTimeout(r,400));
      setId("");setResult(fd);
    } catch(e){console.error(e);clearInterval(pi);}
    setLoading(false);
  };

  const modal=result?(()=>{
    const safe=result.status==="Safe";const score=safe?0:parseInt(result.severityScore||85);
    const list=result.compromisedData?result.compromisedData.split(",").map(s=>s.trim()):safe?["No data exposed"]:["Archived Threat Data"];
    let level="SAFE",rc="#22c55e",gc="#22c55e";
    if(!safe){if(score<40){level="LOW";rc="#eab308";gc="#eab308";}else if(score<75){level="MEDIUM";rc="#f97316";gc="#f97316";}else{level="CRITICAL";rc="#f43f5e";gc="#f43f5e";}}
    return{safe,score,list,level,rc,gc,source:result.source||(safe?"Clean":"Unknown"),breach:result.breachName||(safe?"None":"Unknown"),scanDate:result.scanDate||new Date().toISOString().split("T")[0]};
  })():null;

  const sel = TYPES.find(t=>t.id===type);
  const stagger={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.06,delayChildren:.03}}};
  const fUp={hidden:{opacity:0,y:12},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:300,damping:24}}};

  return (
    <>
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="flex-1 w-full flex flex-col px-3 sm:px-6 md:px-10 py-4 overflow-y-auto" style={{scrollbarWidth:"thin",fontFamily:"'DM Sans',sans-serif",color:"var(--text-1)"}}>

    
      <motion.div variants={fUp} className="mb-4 rounded-xl overflow-hidden" style={{background:dark?"rgba(12,22,50,.75)":"rgba(255,241,242,.88)",border:dark?"1px solid rgba(244,63,94,.22)":"1px solid rgba(244,63,94,.25)",backdropFilter:"blur(12px)"}}>
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-3 py-2.5 shrink-0" style={{background:dark?"rgba(244,63,94,.1)":"rgba(254,226,226,.6)",borderRight:dark?"1px solid rgba(244,63,94,.18)":"1px solid rgba(244,63,94,.2)"}}>
            <span className="w-2 h-2 rounded-full bg-rose-500 blink inline-block"/>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:"#f43f5e",letterSpacing:".15em",textTransform:"uppercase"}}>LIVE</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tick} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.25}}
              className="flex items-center gap-2 px-3 py-2.5 flex-1 min-w-0">
              <span className="text-sm shrink-0">{THREATS[tick].icon}</span>
              <span className="font-semibold truncate text-sm" style={{color:"var(--text-1)"}}>{THREATS[tick].name}</span>
              <span className="shrink-0 hidden xs:block text-xs" style={{color:"var(--text-4)"}}>· {THREATS[tick].target}</span>
            </motion.div>
          </AnimatePresence>
          <div className="px-2.5 py-2.5 shrink-0" style={{borderLeft:"1px solid var(--divider)"}}>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-4)"}}>{THREATS[tick].time}</span>
          </div>
        </div>
      </motion.div>

      
      <motion.div variants={fUp} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        {STATS.map(s=>{const Icon=s.icon; return(
          <motion.div key={s.label} whileTap={{scale:.97}} className="glass flex items-center gap-3 p-3.5 sm:p-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:`${s.color}14`,border:`1px solid ${s.color}30`}}>
              <Icon size={16} style={{color:s.color}}/>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-base sm:text-lg leading-tight stat-val mono">{s.value}</div>
              <div className="text-[10px] sm:text-xs leading-tight truncate" style={{color:"var(--text-3)"}}>{s.label}</div>
              <div className="text-[9px] leading-tight mono" style={{color:s.up?"#22c55e":"#f43f5e"}}>{s.delta}</div>
            </div>
          </motion.div>
        );})}
      </motion.div>

   
      <motion.div variants={fUp} className="scan-panel w-full mx-auto p-4 sm:p-6 lg:p-8 mb-5" style={{maxWidth:720}}>

        {
        <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold leading-tight mb-1" style={{color:"var(--text-1)"}}>Breach &amp; Exposure Scanner</h1>
            <p className="text-xs sm:text-sm" style={{color:"var(--text-3)"}}>
              Scan across <strong style={{color:"var(--accent)"}}>6 live sources</strong>
            </p>
          </div>
          <div className="mode-toggle shrink-0 self-start">
            {["API","LOCAL"].map(m=><button key={m} onClick={()=>setMode(m)} className={`mode-btn ${mode===m?"active":""}`}>{m}</button>)}
          </div>
        </div>

        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {TYPES.map(t=>{const Icon=t.icon;const on=type===t.id; return(
            <motion.button key={t.id} onClick={()=>setType(t.id)} whileTap={{scale:.93}}
              className={`type-btn ${on?"":"type-btn-off"}`}
              style={on?{background:`${t.color}11`,border:`1.5px solid ${t.color}50`,boxShadow:`0 0 18px -6px ${t.color}50`}:{}}>
              <Icon size={16} style={{color:on?t.color:"var(--text-3)"}}/>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:600,letterSpacing:".08em",color:on?(dark?"#e8f4fd":"#0c1f3a"):"var(--text-3)"}}>{t.label}</span>
            </motion.button>
          );})}
        </div>

        {/* Active type indicator */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-1 h-4 rounded-full" style={{background:sel?.color}}/>
          <span style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-2)"}}>
            Scanning: <strong style={{color:sel?.color}}>{sel?.label}</strong>
          </span>
          <div className="flex-1"/>
          {id&&<span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-4)"}}>{id.length} chars</span>}
        </div>

        {/* Input */}
        <div className="scan-input-wrap flex items-center gap-2 mb-2"
          style={focused?{borderColor:`${sel?.color||"var(--accent)"}60`,boxShadow:`0 0 24px -8px ${sel?.color||"var(--accent)"}30`}:{}}>
          {sel&&<sel.icon size={15} style={{color:focused?sel.color:"var(--text-4)",flexShrink:0,transition:"color .2s"}}/>}
          <input ref={inputRef} value={id} onChange={handleInput}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            onKeyDown={e=>e.key==="Enter"&&scan()}
            placeholder={sel?.ph||"Enter identifier…"}
            className="scan-input"/>
          <AnimatePresence>
            {id&&<motion.button initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.8}}
              onClick={()=>setId("")} className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-4)"}}>
              <X size={14}/>
            </motion.button>}
          </AnimatePresence>
        </div>
        <p style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-4)"}} className="mb-4 pl-1">{sel?.hint}</p>

        <motion.button onClick={scan} disabled={loading||!id} whileTap={!loading&&id?{scale:.98}:{}} className="btn-primary">
          {loading
            ? <><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:1.2,ease:"linear"}} style={{display:"inline-flex"}}><Crosshair size={16}/></motion.span><span style={{fontFamily:"IBM Plex Mono",fontSize:12}}>{phase}</span></>
            : <><Zap size={16}/> Start Threat Scan</>}
        </motion.button>

        <AnimatePresence>
          {loading&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mt-3">
            <div className="flex justify-between mb-1.5">
              <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-4)"}}>{phase}</span>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--accent)"}}>{prog}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{background:"var(--bg-inset)"}}>
              <motion.div className="h-full rounded-full" style={{background:"linear-gradient(90deg,#0ea5e9,#6366f1)",width:`${prog}%`}} transition={{duration:.2}}/>
            </div>
          </motion.div>}
        </AnimatePresence>

        <div className="mt-5 pt-4" style={{borderTop:"1px solid var(--divider)"}}>
          <div className="flex items-center justify-between mb-2.5">
            <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)",letterSpacing:".12em",textTransform:"uppercase"}}>Connected Sources</span>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"#22c55e"}}>5/6 Online</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {DBS.map(db=>(
              <div key={db.name} className="glass-inset flex items-center gap-2 px-2.5 py-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:db.c,boxShadow:`0 0 4px ${db.c}`}}/>
                <span className="text-xs font-medium truncate" style={{color:"var(--text-2)"}}>{db.name}</span>
                <span className="ml-auto shrink-0" style={{fontFamily:"IBM Plex Mono",fontSize:9,color:db.ok?"#22c55e":"#f97316"}}>{db.ms}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

     
      <motion.div variants={fUp} className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      
        <div className="glass overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-2"><Activity size={14} className="text-rose-500"/><span className="font-semibold text-sm" style={{color:"var(--text-1)"}}>Global Threat Feed</span></div>
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 blink"/><span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>Live</span></div>
          </div>
          {THREATS.map(t=>(
            <div key={t.id} className="flex items-center gap-2.5 px-4 py-2.5 row-hover transition-colors" style={{borderBottom:"1px solid var(--divider)"}}>
              <span className="text-sm shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{color:"var(--text-1)"}}>{t.name}</p>
                <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-3)"}}>{t.region} · {t.target}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md mono ${SEV[t.sev]}`}>{t.sev}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>{t.time}</span>
              </div>
            </div>
          ))}
        </div>

     
        <div className="glass overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-2"><Clock size={14} style={{color:"var(--accent)"}}/><span className="font-semibold text-sm" style={{color:"var(--text-1)"}}>Recent Scans</span></div>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>Anonymised</span>
          </div>
          {SCANS.map((r,i)=>(
            <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 row-hover transition-colors" style={{borderBottom:i<SCANS.length-1?"1px solid var(--divider)":"none"}}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.s==="Exposed"?"bg-rose-500":"bg-emerald-500"}`}/>
              <span className="flex-1 truncate" style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-2)"}}>{r.q}</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded border" style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)",borderColor:"var(--border)"}}>{r.t}</span>
              <span className={`shrink-0 font-semibold mono text-[11px] ${r.s==="Exposed"?"text-rose-500":"text-emerald-500"}`}>{r.s}</span>
            </div>
          ))}
        </div>
      </motion.div>

    
      <motion.div variants={fUp} className="pt-4" style={{borderTop:"1px solid var(--divider)"}}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)",letterSpacing:".08em"}}>Developer: Fardeen Akmal</p>
          <div className="flex flex-wrap gap-1.5">
            {["DPDP Act 2023","ISO 27001","SOC 2 Type II"].map(b=><span key={b} style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)",border:"1px solid var(--border)",borderRadius:6,padding:"2px 7px"}}>{b}</span>)}
          </div>
        </div>
      </motion.div>
    </motion.div>

 
    <AnimatePresence>
      {result&&modal&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 modal-overlay"
          onClick={()=>setResult(null)}>
          <motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:30,opacity:0}} transition={{type:"spring",stiffness:340,damping:28}}
            onClick={e=>e.stopPropagation()}
            className="modal-card w-full sm:max-w-4xl flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{maxHeight:"92vh",border:`1px solid ${modal.safe?"rgba(34,197,94,.22)":"rgba(244,63,94,.28)"}`,boxShadow:"var(--shadow-modal)",fontFamily:"'DM Sans',sans-serif"}}>

            {/* Header */}
            <div className="flex-none flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4" style={{borderBottom:"1px solid var(--divider)",background:dark?"rgba(6,13,31,.8)":"rgba(240,248,255,.95)"}}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 blink ${modal.safe?"bg-emerald-500":"bg-rose-500"}`}/>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:13,fontWeight:600,color:"var(--text-1)"}} className="truncate">{result.queryId}</span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-3">
                <span className={`hidden xs:inline text-[10px] font-bold px-3 py-1 rounded-full border mono ${modal.safe?"text-emerald-500 border-emerald-500/30 bg-emerald-500/10":"text-rose-500 border-rose-500/30 bg-rose-500/10"}`}>
                  {modal.safe?"✓ CLEAN":"⚠ BREACH"}
                </span>
                <motion.button onClick={()=>setResult(null)} whileTap={{scale:.9}}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{background:"var(--bg-inset)",border:"1px solid var(--border)",color:"var(--text-3)"}}>
                  <X size={14}/>
                </motion.button>
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{scrollbarWidth:"thin"}}>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

               
                <div className="glass-inset p-4 flex flex-col items-center">
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)",letterSpacing:".15em",textTransform:"uppercase"}} className="mb-3">Risk Score</p>
                  <div className="relative w-28 h-[60px] sm:w-32 sm:h-[68px]">
                    <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="6" strokeLinecap="round"/>
                      <motion.path initial={{strokeDashoffset:125.6}} animate={{strokeDashoffset:125.6-(modal.score/100)*125.6}} transition={{duration:1.3,ease:"easeOut",delay:.2}} d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={modal.gc} strokeWidth="6" strokeLinecap="round" strokeDasharray={125.6} style={{filter:`drop-shadow(0 0 7px ${modal.gc})`}}/>
                    </svg>
                    <motion.div className="absolute bottom-0 rounded-t-full origin-bottom" style={{left:"calc(50% - 2.5px)",width:"5px",height:"42px",background:modal.gc}} initial={{rotate:-90}} animate={{rotate:-90+(modal.score/100)*180}} transition={{duration:1.3,ease:"easeOut",delay:.2}}/>
                    <div className="absolute w-2.5 h-2.5 rounded-full z-10" style={{bottom:-4,left:"calc(50% - 5px)",background:"var(--bg-glass-2)",border:`2px solid ${modal.gc}`}}/>
                  </div>
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:18,fontWeight:700,color:modal.rc}} className="mt-3">{modal.level}</p>
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-4)"}} className="mt-0.5">{modal.score} / 100</p>
                </div>

               
                <div className="glass-inset p-4">
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)",letterSpacing:".15em",textTransform:"uppercase"}} className="mb-3">Details</p>
                  <ul className="space-y-2.5">
                    {[{icon:Filter,l:"Type",v:result.scanType},{icon:Globe,l:"Source",v:modal.source,c:true},{icon:AlertTriangle,l:"Breach",v:modal.breach,c:true},{icon:Calendar,l:"Date",v:modal.scanDate}].map(({icon:Icon,l,v,c})=>(
                      <li key={l} className="flex items-center gap-2 text-xs">
                        <Icon size={11} style={{color:"var(--text-4)",flexShrink:0}}/>
                        <span className="w-14 shrink-0" style={{color:"var(--text-3)"}}>{l}</span>
                        <span style={{fontFamily:"IBM Plex Mono",fontWeight:500,fontSize:11,color:c?(modal.safe?"#22c55e":"#f43f5e"):"var(--text-2)"}} className="truncate">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

             
                <div className="glass-inset p-4 flex flex-col">
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)",letterSpacing:".15em",textTransform:"uppercase"}} className="mb-3">Exposed Fields</p>
                  <div className="space-y-1.5 overflow-y-auto flex-1" style={{scrollbarWidth:"thin"}}>
                    {modal.list.map((item,i)=>(
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{background:modal.safe?"rgba(34,197,94,.06)":"rgba(244,63,94,.06)",border:`1px solid ${modal.safe?"rgba(34,197,94,.14)":"rgba(244,63,94,.14)"}`,color:"var(--text-2)"}}>
                        <LayoutTemplate size={10} style={{color:modal.safe?"#22c55e":"#f43f5e",flexShrink:0}}/>{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="rounded-xl p-4 sm:p-5" style={{background:modal.safe?"rgba(34,197,94,.04)":"rgba(244,63,94,.04)",border:`1px solid ${modal.safe?"rgba(34,197,94,.12)":"rgba(244,63,94,.12)"}`}}>
                <div className="flex items-center gap-2 mb-3"><Lock size={13} style={{color:modal.safe?"#22c55e":"#f43f5e"}}/><h3 style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:modal.safe?"#22c55e":"#f43f5e"}}>Countermeasures</h3></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREV[result.scanType]?.map((a,i)=>(
                    <div key={i} className="flex items-start gap-2 text-sm" style={{color:"var(--text-2)"}}>
                      <CheckCircle size={12} style={{color:modal.safe?"#22c55e":"#f43f5e",flexShrink:0,marginTop:2}}/>{a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
