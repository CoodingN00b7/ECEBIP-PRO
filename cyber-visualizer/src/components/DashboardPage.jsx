import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Activity, User, Mail, Clock, Search, Trash2, Server, Fingerprint, Globe, Smartphone, CreditCard, Wifi, X, Filter, Calendar, LayoutTemplate, Lock, TrendingUp, Database, CheckCircle, Bell, MapPin, Eye } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RT, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useTheme } from "../ThemeContext";

const DUMMY = [
  {id:1,query:"user@example.com",     type:"EMAIL",  status:"Exposed",timestamp:"2025-03-20T09:12:00Z",breachName:"Collection #1 2019",   severityScore:82,source:"HaveIBeenPwned",compromisedData:"Email,Password,Username"},
  {id:2,query:"9876543210",           type:"PHONE",  status:"Exposed",timestamp:"2025-03-20T08:44:00Z",breachName:"Truecaller Scrape 2023",severityScore:55,source:"LeakCheck Pro", compromisedData:"Phone,Name,Location"},
  {id:3,query:"103.21.40.0",          type:"IP",     status:"Safe",   timestamp:"2025-03-19T22:15:00Z",breachName:"None",                 severityScore:0, source:"AbuseIPDB",    compromisedData:""},
  {id:4,query:"malware-cdn.xyz",      type:"URL",    status:"Exposed",timestamp:"2025-03-19T18:30:00Z",breachName:"VirusTotal 48/72",      severityScore:94,source:"VirusTotal",   compromisedData:"Malware,Phishing,Redirect"},
  {id:5,query:"ABCPQ1234Z",           type:"PAN",    status:"Safe",   timestamp:"2025-03-19T15:00:00Z",breachName:"None",                 severityScore:0, source:"System",       compromisedData:""},
  {id:6,query:"rohit.verma@hdfc.co.in",type:"EMAIL", status:"Exposed",timestamp:"2025-03-19T11:20:00Z",breachName:"LinkedIn 2023 Breach", severityScore:70,source:"BreachDirectory",compromisedData:"Email,Name,Employer,Phone"},
  {id:7,query:"123456789012",         type:"AADHAAR",status:"Safe",   timestamp:"2025-03-18T20:10:00Z",breachName:"None",                 severityScore:0, source:"System",       compromisedData:""},
  {id:8,query:"192.168.1.105",        type:"IP",     status:"Exposed",timestamp:"2025-03-18T14:55:00Z",breachName:"AbuseIPDB Flagged",    severityScore:63,source:"AbuseIPDB",    compromisedData:"IP,ISP,Country,ASN"},
];
const HOTSPOTS=[{city:"Mumbai",threats:24,color:"#0ea5e9"},{city:"Delhi",threats:18,color:"#f43f5e"},{city:"Bengaluru",threats:11,color:"#8b5cf6"},{city:"Hyderabad",threats:8,color:"#10b981"},{city:"Chennai",threats:14,color:"#f97316"},{city:"Pune",threats:6,color:"#ec4899"}];
const FEEDS=[{name:"VirusTotal",records:"900M",status:"Online",latency:"14ms",color:"#0ea5e9"},{name:"LeakCheck Pro",records:"9.2B",status:"Online",latency:"22ms",color:"#8b5cf6"},{name:"AbuseIPDB",records:"4.1B",status:"Degraded",latency:"88ms",color:"#f97316"},{name:"Numverify",records:"2.8B",status:"Online",latency:"18ms",color:"#10b981"}];
const ALERTS=[{msg:"New credential exposure detected for user@example.com",time:"5m ago",sev:"HIGH"},{msg:"IP 45.33.32.156 flagged in 3 new AbuseIPDB reports",time:"12m ago",sev:"MEDIUM"},{msg:"BreachDirectory updated — 840K new records ingested",time:"34m ago",sev:"INFO"},{msg:"Aadhaar pattern match on 3 monitored identifiers",time:"1h ago",sev:"CRITICAL"}];
const SEV_BARS=[{label:"Critical",value:4,color:"#f43f5e"},{label:"High",value:9,color:"#f97316"},{label:"Medium",value:6,color:"#eab308"},{label:"Low",value:2,color:"#22c55e"}];
const TL_MOCK=[{date:"Mar 15",scans:3},{date:"Mar 16",scans:7},{date:"Mar 17",scans:5},{date:"Mar 18",scans:9},{date:"Mar 19",scans:14},{date:"Mar 20",scans:11},{date:"Mar 21",scans:6}];
const PIE_COLORS=["#0ea5e9","#6366f1","#8b5cf6","#10b981","#eab308","#ec4899"];
const PREVENTION={EMAIL:["Monitor financial transactions linked to this email.","Enable Two-Factor Authentication (2FA) immediately.","Check connected OAuth apps for unauthorised access.","Avoid sending OTPs or sensitive data via email replies."],PHONE:["Never share OTPs or banking PINs over phone calls.","Beware of SMS phishing (Smishing) short links.","Register your number on the TRAI DND registry.","Contact your carrier to prevent SIM-swap attacks."],AADHAAR:["Lock Aadhaar biometrics via the mAadhaar app.","Use Virtual ID (VID) instead of your real Aadhaar number.","Review Aadhaar auth history for anomalies.","Never share unmasked photocopies of your Aadhaar."],PAN:["Monitor CIBIL/Experian report for unknown loans.","Check ITR filings for unauthorised returns.","Avoid sharing PAN on untrusted websites.","Report misuse to NSDL and IT Department."],IP:["Restart your router to get a fresh dynamic IP.","Use a reputable no-log VPN to mask all traffic.","Update router firmware and change default credentials.","Run a full malware scan on all devices."],URL:["Do not enter credentials on this domain.","Report URL to Google Safe Browsing and PhishTank.","Ensure browser phishing protection is on.","Clear browser cache, cookies, and site storage."]};
const ALERT_DOT={CRITICAL:"bg-rose-500",HIGH:"bg-orange-500",MEDIUM:"bg-amber-500",INFO:"bg-sky-500"};
const ALERT_TXT={CRITICAL:"text-rose-500",HIGH:"text-orange-500",MEDIUM:"text-amber-500",INFO:"text-sky-500"};
const fmtDate=iso=>new Date(iso).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const TypeIcon=({type,size=13})=>({EMAIL:<Mail size={size} style={{color:"#0ea5e9"}}/>,URL:<Globe size={size} style={{color:"#6366f1"}}/>,IP:<Wifi size={size} style={{color:"#22d3ee"}}/>,PHONE:<Smartphone size={size} style={{color:"#10b981"}}/>,AADHAAR:<Shield size={size} style={{color:"#f97316"}}/>,PAN:<CreditCard size={size} style={{color:"#eab308"}}/>}[type]||<Search size={size} style={{color:"var(--text-muted)"}}/>);

export default function DashboardPage({setIsModalOpen}) {
  const {dark} = useTheme();
  const [user,setUser]=useState(null);
  const [history,setHistory]=useState([]);
  const [stats,setStats]=useState({total:0,exposed:0,safe:0,riskScore:100,typeData:[],timelineData:[]});
  const [sel,setSel]=useState(null);
  const [alertOpen,setAlertOpen]=useState(false);

  useEffect(()=>{if(setIsModalOpen)setIsModalOpen(!!sel);},[sel,setIsModalOpen]);
  useEffect(()=>{const fn=e=>{if(e.key==="Escape")setSel(null);};window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);},[]);

  useEffect(()=>{
    const u=JSON.parse(localStorage.getItem("user")||"null");
    if(u){setUser(u);const raw=JSON.parse(localStorage.getItem(`search_history_${u.email}`)||"[]");const merged=raw.length?raw:DUMMY;setHistory(merged);calc(merged);}
  },[]);

  const calc=data=>{
    const exp=data.filter(d=>d.status==="Exposed").length;
    const saf=data.filter(d=>d.status==="Safe").length;
    const risk=!data.length?100:Math.max(0,Math.round(100-(exp/data.length)*100));
    const tc={};data.forEach(d=>{tc[d.type]=(tc[d.type]||0)+1;});
    const typeData=Object.keys(tc).map(k=>({name:k,value:tc[k]}));
    const dc={};data.forEach(d=>{const l=new Date(d.timestamp).toLocaleDateString("en-IN",{month:"short",day:"numeric"});dc[l]=(dc[l]||0)+1;});
    const timelineData=Object.keys(dc).slice(-7).map(d=>({date:d,scans:dc[d]}));
    setStats({total:data.length,exposed:exp,safe:saf,riskScore:risk,typeData,timelineData});
  };

  const handleClear=()=>{if(!window.confirm("Purge entire intelligence ledger?"))return;localStorage.removeItem(`search_history_${user.email}`);setHistory(DUMMY);calc(DUMMY);};

  const modal=sel?(()=>{
    const safe=sel.status==="Safe";const score=safe?0:parseInt(sel.severityScore||85);
    const list=sel.compromisedData?sel.compromisedData.split(",").map(s=>s.trim()):safe?["None"]:["Archived Threat Data"];
    let level="SAFE",rc="#22c55e",gc="#22c55e";
    if(!safe){if(score<40){level="LOW";rc="#eab308";gc="#eab308";}else if(score<75){level="MEDIUM";rc="#f97316";gc="#f97316";}else{level="CRITICAL";rc="#f43f5e";gc="#f43f5e";}}
    return {safe,score,list,level,rc,gc,source:sel.source||(safe?"Clean":"Unknown"),breach:sel.breachName||(safe?"None":"Unknown"),scanDate:fmtDate(sel.timestamp)};
  })():null;

  if(!user) return null;

  const dn=user.name||user.email?.split("@")[0]||"Analyst";
  const gR=40,gC=2*Math.PI*gR,gOff=gC-(stats.riskScore/100)*gC;
  const gCol=stats.riskScore>80?"#22c55e":stats.riskScore>50?"#eab308":"#f43f5e";
  const tl=stats.timelineData.length>=3?stats.timelineData:TL_MOCK;
  const ax=dark?"#2a4a63":"#6a9aba";
  const tip={background:dark?"#060d1f":"#fff",border:"1px solid var(--border-glow)",borderRadius:10,fontFamily:"IBM Plex Mono",fontSize:11};
  const div="border-b" + (dark?" border-slate-800/40":" border-blue-100/80");
  const stagger={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.06}}};
  const fUp={hidden:{opacity:0,y:14},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:300,damping:24}}};

  return (
    <>
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="flex-1 w-full flex flex-col px-4 sm:px-6 md:px-10 py-5 overflow-y-auto relative z-10"
      style={{scrollbarWidth:"thin",fontFamily:"'DM Sans',sans-serif",color:"var(--text-primary)"}}>

      
      <motion.div variants={fUp} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 ${div}`}>
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <h1 className="text-2xl font-bold" style={{color:"var(--text-primary)"}}>
              {dn.charAt(0).toUpperCase()+dn.slice(1)}'s{" "}
              <span style={{background:"linear-gradient(90deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Dashboard</span>
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,letterSpacing:".12em",color:"#22c55e",background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.22)"}}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 blink inline-block"/> LIVE
            </span>
          </div>
          <p className="text-sm" style={{color:"var(--text-muted)"}}>Cyber-intelligence overview · Last synced just now</p>
        </div>
        <motion.button onClick={()=>setAlertOpen(a=>!a)} whileHover={{scale:1.03}} whileTap={{scale:.97}}
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0 glass"
          style={{color:"var(--text-primary)"}}>
          <Bell size={15} style={{color:"var(--accent)"}}/>Alerts
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold" style={{fontFamily:"IBM Plex Mono",fontSize:9}}>3</span>
        </motion.button>
      </motion.div>

      
      <AnimatePresence>
        {alertOpen&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
            <div className="glass overflow-hidden p-0">
              <div className={`flex items-center justify-between px-5 py-3 ${div}`}>
                <span className="font-semibold text-sm flex items-center gap-2" style={{color:"var(--text-primary)"}}><Bell size={14} style={{color:"var(--accent)"}}/>Recent Alerts</span>
                <button onClick={()=>setAlertOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}><X size={14}/></button>
              </div>
              {ALERTS.map((a,i)=>(
                <div key={i} className={`flex items-center gap-3 px-5 py-3 row-hover transition-colors ${i<ALERTS.length-1?div:""}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ALERT_DOT[a.sev]}`}/>
                  <p className="text-sm flex-1" style={{color:"var(--text-secondary)"}}>{a.msg}</p>
                  <span className={`text-[10px] font-bold shrink-0 ${ALERT_TXT[a.sev]}`} style={{fontFamily:"IBM Plex Mono"}}>{a.sev}</span>
                  <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}} className="shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

     
      <motion.div variants={fUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[{label:"Total Scans",value:stats.total,sub:"all time",icon:Search,color:"#0ea5e9"},{label:"Exposed",value:stats.exposed,sub:`${stats.total?Math.round(stats.exposed/stats.total*100):0}% rate`,icon:AlertTriangle,color:"#f43f5e"},{label:"Safe",value:stats.safe,sub:"no threats",icon:CheckCircle,color:"#22c55e"},{label:"Safety Index",value:stats.riskScore,sub:stats.riskScore>80?"Optimal":stats.riskScore>50?"Warning":"Critical",icon:Shield,color:gCol}].map(s=>{
          const Icon=s.icon;
          return(
            <motion.div key={s.label} whileHover={{y:-2,scale:1.02}} className="glass flex items-center gap-3.5 p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:`${s.color}12`,border:`1px solid ${s.color}28`}}>
                <Icon size={18} style={{color:s.color}}/>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xl leading-tight stat-val" style={{fontFamily:"IBM Plex Mono"}}>{s.value}</div>
                <div className="text-[11px] leading-tight truncate" style={{color:"var(--text-muted)"}}>{s.label}</div>
                <div className="text-[10px] leading-tight" style={{fontFamily:"IBM Plex Mono",color:"var(--text-faint)"}}>{s.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      
      <motion.div variants={fUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-4">
        <div className="lg:col-span-4 glass p-5 flex items-center gap-4 relative overflow-hidden">
          <div style={{position:"absolute",top:0,right:0,width:"45%",height:"100%",background:"radial-gradient(ellipse at top right,rgba(14,165,233,.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{background:"linear-gradient(135deg,rgba(14,165,233,.12),rgba(99,102,241,.12))",border:"1px solid rgba(14,165,233,.2)"}}>
            <User size={24} style={{color:"var(--accent)"}}/>
          </div>
          <div className="flex-1 min-w-0 z-10">
            <h2 className="text-base font-bold truncate" style={{color:"var(--text-primary)"}}>{user.name||"Analyst Profile"}</h2>
            <div className="flex items-center gap-1.5 mb-1.5" style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-muted)"}}>
              <Mail size={10} style={{color:"var(--accent)",flexShrink:0}}/><span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3" style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>
              <span className="flex items-center gap-1"><Fingerprint size={10} style={{color:"#8b5cf6"}}/>Lv.4</span>
              <span className="flex items-center gap-1"><MapPin size={10} style={{color:"#f43f5e"}}/>India</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 glass p-5 flex flex-col items-center justify-center">
          <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".12em",textTransform:"uppercase"}} className="mb-3">Safety Index</p>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r={gR} stroke={dark?"#1e293b":"#e2e8f0"} strokeWidth="7" fill="none"/>
              <circle cx="56" cy="56" r={gR} stroke={gCol} strokeWidth="7" fill="none" strokeDasharray={gC} strokeDashoffset={gOff} strokeLinecap="round" className="transition-all duration-1000 ease-out" style={{filter:`drop-shadow(0 0 8px ${gCol})`}}/>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-black text-3xl leading-none stat-val" style={{fontFamily:"IBM Plex Mono"}}>{stats.riskScore}</span>
            </div>
          </div>
          <span className="font-bold px-3 py-1 rounded-full border mt-2" style={{fontFamily:"IBM Plex Mono",fontSize:10,color:gCol,borderColor:gCol+"40",background:gCol+"0e"}}>
            {stats.riskScore>80?"Optimal":stats.riskScore>50?"Warning":"Critical"}
          </span>
        </div>

        <div className="lg:col-span-5 sm:col-span-2 glass p-5 flex flex-col">
          <div className={`flex items-center gap-2 mb-3 pb-3 ${div}`}>
            <TrendingUp size={13} style={{color:"#f97316"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:600,letterSpacing:".08em",color:"var(--text-secondary)",textTransform:"uppercase"}}>Severity Breakdown</span>
          </div>
          <div className="flex-1" style={{minHeight:90}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEV_BARS} margin={{top:4,right:0,left:-28,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(56,189,248,.05)":"rgba(3,105,161,.07)"} vertical={false}/>
                <XAxis dataKey="label" tick={{fill:ax,fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:ax,fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <RT contentStyle={tip}/>
                <Bar dataKey="value" radius={[4,4,0,0]}>{SEV_BARS.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      
      <motion.div variants={fUp} className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
        <div className="lg:col-span-5 glass p-5 flex flex-col" style={{minHeight:220}}>
          <div className={`flex items-center justify-between mb-3 pb-3 ${div}`}>
            <div className="flex items-center gap-2"><Activity size={13} style={{color:"var(--accent)"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:600,letterSpacing:".08em",color:"var(--text-secondary)",textTransform:"uppercase"}}>Scan Activity</span></div>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-faint)",border:"1px solid var(--border)",borderRadius:6,padding:"2px 8px"}}>7D</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tl} margin={{top:6,right:2,left:-28,bottom:0}}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity={dark?.22:.14}/><stop offset="100%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(56,189,248,.05)":"rgba(3,105,161,.07)"}/>
                <XAxis dataKey="date" tick={{fill:ax,fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:ax,fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <RT contentStyle={tip} itemStyle={{color:"#0ea5e9"}} labelStyle={{color:"var(--text-secondary)"}}/>
                <Area type="monotone" dataKey="scans" stroke="#0ea5e9" strokeWidth={2} fill="url(#sg)" dot={{fill:"#0ea5e9",r:3,strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 glass p-5 flex flex-col" style={{minHeight:220}}>
          <div className={`flex items-center gap-2 mb-3 pb-3 ${div}`}>
            <Filter size={13} style={{color:"#8b5cf6"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:600,letterSpacing:".08em",color:"var(--text-secondary)",textTransform:"uppercase"}}>By Type</span>
          </div>
          {stats.typeData.length>0?(
            <div className="flex-1 flex flex-col">
              <ResponsiveContainer width="100%" height={110}>
                <PieChart><Pie data={stats.typeData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" strokeWidth={0}>{stats.typeData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><RT contentStyle={tip}/></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {stats.typeData.map((d,i)=>(
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)"}}>{d.name}</span></div>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-secondary)"}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ):<div className="flex-1 flex items-center justify-center"><p style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-faint)",textTransform:"uppercase"}}>No data yet</p></div>}
        </div>

        <div className="lg:col-span-4 glass p-5 flex flex-col">
          <div className={`flex items-center justify-between mb-3 pb-3 ${div}`}>
            <div className="flex items-center gap-2"><Server size={13} style={{color:"#10b981"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:600,letterSpacing:".08em",color:"var(--text-secondary)",textTransform:"uppercase"}}>Intel Sources</span></div>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"#22c55e"}}>3/4 Online</span>
          </div>
          <div className="flex-1 space-y-2.5">
            {FEEDS.map((f,i)=>(
              <motion.div key={i} whileHover={{x:2}} className="flex items-center gap-3 px-3 py-2.5 rounded-xl row-hover transition-all" style={{background:"var(--bg-inset)",border:"1px solid var(--border-subtle)"}}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{background:f.color,boxShadow:`0 0 6px ${f.color}80`}}/>
                <span className="text-sm font-medium flex-1" style={{color:"var(--text-primary)"}}>{f.name}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}} className="hidden sm:block">{f.records}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:600,color:"var(--text-secondary)"}}>{f.latency}</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:9,padding:"2px 6px",borderRadius:6,color:f.status==="Online"?"#22c55e":"#f97316",border:`1px solid ${f.status==="Online"?"rgba(34,197,94,.25)":"rgba(249,115,22,.25)"}`}}>{f.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      
      <motion.div variants={fUp} className="glass p-0 overflow-hidden mb-4">
        <div className={`flex items-center justify-between px-5 py-3.5 ${div}`}>
          <div className="flex items-center gap-2.5"><MapPin size={14} style={{color:"#f43f5e"}}/><span className="font-semibold text-sm" style={{color:"var(--text-primary)"}}>Regional Threat Hotspots — India</span></div>
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-500 blink"/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>Live</span></div>
        </div>
        <div className="flex flex-wrap" style={{borderTop:"1px solid var(--divider)"}}>
          {HOTSPOTS.map((n,i)=>(
            <motion.div key={i} whileHover={{scale:1.05,backgroundColor:dark?"rgba(56,189,248,.03)":"rgba(3,105,161,.03)"}}
              className="flex-1 flex flex-col items-center py-4 px-3 cursor-default transition-colors" style={{minWidth:80,borderRight:i<HOTSPOTS.length-1?"1px solid var(--divider)":"none"}}>
              <div className="relative mb-2 w-3 h-3">
                <div className="absolute inset-0 rounded-full opacity-40 animate-ping" style={{background:n.color}}/>
                <div className="relative w-full h-full rounded-full" style={{background:n.color,boxShadow:`0 0 10px ${n.color}`}}/>
              </div>
              <span className="font-bold text-sm stat-val" style={{fontFamily:"IBM Plex Mono"}}>{n.threats}</span>
              <span className="text-[10px] text-center mt-0.5" style={{color:"var(--text-muted)"}}>{n.city}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      
      <motion.div variants={fUp} className="glass p-0 overflow-hidden flex flex-col flex-1" style={{minHeight:340}}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3 ${div}`}>
          <div>
            <div className="flex items-center gap-2 mb-0.5"><Clock size={13} style={{color:"#8b5cf6"}}/><span className="font-semibold text-sm" style={{color:"var(--text-primary)"}}>Intelligence Ledger</span></div>
            <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)",letterSpacing:".1em",textTransform:"uppercase"}}>{history.length} records · Local query history</p>
          </div>
          {history.length>0&&(
            <motion.button whileTap={{scale:.96}} onClick={handleClear}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl shrink-0 w-full sm:w-auto transition-colors"
              style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:700,color:"#f43f5e",letterSpacing:".1em",background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.2)"}}>
              <Trash2 size={12}/> PURGE RECORDS
            </motion.button>
          )}
        </div>

        {history.length>0?(
          <>
            {/* Mobile */}
            <div className="md:hidden flex flex-col">
              {history.map(r=>(
                <motion.div key={r.id} whileHover={{backgroundColor:dark?"rgba(56,189,248,.03)":"rgba(3,105,161,.03)"}}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${div} cursor-pointer`} onClick={()=>setSel(r)}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${r.status==="Exposed"?"bg-rose-500":"bg-emerald-500"}`}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{color:"var(--text-primary)"}}>{r.query}</p>
                    <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}}>{fmtDate(r.timestamp)}</p>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setSel(r);}} className="shrink-0 font-bold px-2.5 py-1.5 rounded-lg border" style={{fontFamily:"IBM Plex Mono",fontSize:9,letterSpacing:".08em",color:r.status==="Exposed"?"#f43f5e":"#22c55e",border:`1px solid ${r.status==="Exposed"?"rgba(244,63,94,.25)":"rgba(34,197,94,.25)"}`,background:r.status==="Exposed"?"rgba(244,63,94,.07)":"rgba(34,197,94,.07)"}}>
                    {r.status==="Exposed"?"THREAT":"SAFE"}
                  </button>
                </motion.div>
              ))}
            </div>
            
            <div className="hidden md:block overflow-x-auto flex-1" style={{scrollbarWidth:"thin"}}>
              <table className="w-full text-left border-collapse" style={{minWidth:620}}>
                <thead>
                  <tr className="tbl-head sticky top-0 z-10">
                    {["Timestamp","Target","Vector","Breach","Status"].map(h=>(
                      <th key={h} className={`px-5 py-3 border-b ${div.split(" ").slice(1).join(" ")}`} style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:"var(--text-faint)",letterSpacing:".12em",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {history.map((r,i)=>(
                      <motion.tr key={r.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.03}}
                        className="tbl-row transition-colors cursor-pointer border-b last:border-0" style={{borderColor:"var(--divider)"}} onClick={()=>setSel(r)}>
                        <td className="px-5 py-3"><span style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-muted)"}}>{fmtDate(r.timestamp)}</span></td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium block truncate max-w-[180px]" style={{color:"var(--text-primary)"}}>{r.query}</span>
                          {r.breachName&&r.status==="Exposed"&&<span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-faint)"}} className="block truncate max-w-[180px]">{r.breachName}</span>}
                        </td>
                        <td className="px-5 py-3">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{background:"var(--bg-inset)",border:"1px solid var(--border-subtle)"}}>
                            <TypeIcon type={r.type}/><span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:"var(--text-muted)",letterSpacing:".1em"}}>{r.type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-muted)"}} className="block truncate max-w-[160px]">{r.breachName||"—"}</span></td>
                        <td className="px-5 py-3">
                          <span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,letterSpacing:".08em",padding:"3px 10px",borderRadius:8,color:r.status==="Exposed"?"#f43f5e":"#22c55e",border:`1px solid ${r.status==="Exposed"?"rgba(244,63,94,.25)":"rgba(34,197,94,.25)"}`,background:r.status==="Exposed"?"rgba(244,63,94,.07)":"rgba(34,197,94,.07)"}}>
                            {r.status==="Exposed"?"THREAT":"CLEARED"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        ):(
          <div className="flex-1 flex flex-col items-center justify-center py-14" style={{color:"var(--text-faint)"}}>
            <Shield size={32} strokeWidth={1} className="mb-3 opacity-25"/><p style={{fontFamily:"IBM Plex Mono",fontSize:11,letterSpacing:".1em",textTransform:"uppercase",opacity:.4}}>Ledger is Empty</p>
          </div>
        )}
      </motion.div>
    </motion.div>

    
    <AnimatePresence>
      {sel&&modal&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.22}}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 modal-overlay"
          style={{backdropFilter:"blur(16px)"}} onClick={()=>setSel(null)}>
          <motion.div initial={{y:40,opacity:0,scale:.96}} animate={{y:0,opacity:1,scale:1}} exit={{y:20,opacity:0}} transition={{type:"spring",stiffness:340,damping:26}}
            onClick={e=>e.stopPropagation()}
            className="modal-card w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{border:`1px solid ${modal.safe?"rgba(34,197,94,.22)":"rgba(244,63,94,.28)"}`,boxShadow:"var(--shadow-modal)",fontFamily:"'DM Sans',sans-serif"}}>
            <div className="flex-none flex items-center justify-between px-5 py-4" style={{borderBottom:"1px solid var(--divider)",background:dark?"rgba(6,13,31,.8)":"rgba(240,248,255,.95)"}}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 blink ${modal.safe?"bg-emerald-500":"bg-rose-500"}`}/>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-muted)",letterSpacing:".1em",textTransform:"uppercase"}} className="shrink-0 hidden sm:block">Record —</span>
                <span style={{fontFamily:"IBM Plex Mono",fontSize:14,fontWeight:600,color:"var(--text-primary)"}} className="truncate">{sel.query}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`hidden sm:inline font-bold px-3 py-1 rounded-full border tracking-wider ${modal.safe?"text-emerald-500 border-emerald-500/30 bg-emerald-500/10":"text-rose-500 border-rose-500/30 bg-rose-500/10"}`} style={{fontFamily:"IBM Plex Mono",fontSize:10}}>
                  {modal.safe?"✓ CLEAN":"⚠ BREACH DETECTED"}
                </span>
                <motion.button onClick={()=>setSel(null)} whileHover={{scale:1.1}} whileTap={{scale:.9}}
                  className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-inset)",border:"1px solid var(--border)",color:"var(--text-muted)"}}>
                  <X size={14}/>
                </motion.button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6" style={{scrollbarWidth:"thin"}}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="glass-inset p-5 flex flex-col items-center">
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".12em",textTransform:"uppercase"}} className="mb-4">Risk Score</p>
                  <div className="relative w-32 h-[68px]">
                    <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="6" strokeLinecap="round"/>
                      <motion.path initial={{strokeDashoffset:125.6}} animate={{strokeDashoffset:125.6-(modal.score/100)*125.6}} transition={{duration:1.4,ease:"easeOut",delay:.3}} d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={modal.gc} strokeWidth="6" strokeLinecap="round" strokeDasharray={125.6} style={{filter:`drop-shadow(0 0 8px ${modal.gc})`}}/>
                    </svg>
                    <motion.div className="absolute bottom-0 rounded-t-full origin-bottom" style={{left:"calc(50% - 2.5px)",width:"5px",height:"44px",background:modal.gc}} initial={{rotate:-90}} animate={{rotate:-90+(modal.score/100)*180}} transition={{duration:1.4,ease:"easeOut",delay:.3}}/>
                    <div className="absolute w-2.5 h-2.5 rounded-full z-10" style={{bottom:-5,left:"calc(50% - 5px)",background:"var(--bg-glass-2)",border:`2px solid ${modal.gc}`}}/>
                  </div>
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:20,fontWeight:700,color:modal.rc}} className="mt-4">{modal.level}</p>
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:11,color:"var(--text-faint)"}} className="mt-1">{modal.score} / 100</p>
                </div>
                <div className="glass-inset p-5">
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".12em",textTransform:"uppercase"}} className="mb-4">Scan Details</p>
                  <ul className="space-y-3">
                    {[{icon:Filter,l:"Type",v:sel.type},{icon:Globe,l:"Source",v:modal.source,c:true},{icon:AlertTriangle,l:"Breach",v:modal.breach,c:true},{icon:Calendar,l:"Date",v:modal.scanDate}].map(({icon:Icon,l,v,c})=>(
                      <li key={l} className="flex items-center gap-2.5 text-xs">
                        <Icon size={12} style={{color:"var(--text-faint)",flexShrink:0}}/><span className="w-16 shrink-0" style={{color:"var(--text-muted)"}}>{l}</span>
                        <span style={{fontFamily:"IBM Plex Mono",fontWeight:500,color:c?(modal.safe?"#22c55e":"#f43f5e"):"var(--text-secondary)"}} className="truncate">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-inset p-5 flex flex-col">
                  <p style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-muted)",letterSpacing:".12em",textTransform:"uppercase"}} className="mb-4">Exposed Fields</p>
                  <div className="space-y-2 overflow-y-auto flex-1" style={{scrollbarWidth:"thin"}}>
                    {modal.list.map((item,i)=>(
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium" style={{background:modal.safe?"rgba(34,197,94,.06)":"rgba(244,63,94,.06)",border:`1px solid ${modal.safe?"rgba(34,197,94,.15)":"rgba(244,63,94,.15)"}`,color:"var(--text-secondary)"}}>
                        <LayoutTemplate size={11} style={{color:modal.safe?"#22c55e":"#f43f5e",flexShrink:0}}/>{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-5" style={{background:modal.safe?"rgba(34,197,94,.04)":"rgba(244,63,94,.04)",border:`1px solid ${modal.safe?"rgba(34,197,94,.12)":"rgba(244,63,94,.12)"}`}}>
                <div className="flex items-center gap-2 mb-4"><Lock size={13} style={{color:modal.safe?"#22c55e":"#f43f5e"}}/><h3 style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:modal.safe?"#22c55e":"#f43f5e"}}>Recommended Countermeasures</h3></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PREVENTION[sel.type]?.map((a,i)=>(
                    <div key={i} className="flex items-start gap-2.5 text-sm" style={{color:"var(--text-secondary)"}}>
                      <CheckCircle size={13} style={{color:modal.safe?"#22c55e":"#f43f5e",flexShrink:0,marginTop:2}}/>{a}
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
