import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Activity, User, Mail, Clock, Search, Trash2, Server, Fingerprint, Globe, Smartphone, CreditCard, Wifi, X, Filter, Calendar, LayoutTemplate, Lock, TrendingUp, CheckCircle, Bell, MapPin } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RT, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useTheme } from "../ThemeContext.jsx";

const DUMMY=[{id:1,query:"user@example.com",type:"EMAIL",status:"Exposed",timestamp:"2025-03-20T09:12:00Z",breachName:"Collection #1",severityScore:82,source:"HaveIBeenPwned",compromisedData:"Email,Password,Username"},{id:2,query:"9876543210",type:"PHONE",status:"Exposed",timestamp:"2025-03-20T08:44:00Z",breachName:"Truecaller 2023",severityScore:55,source:"LeakCheck",compromisedData:"Phone,Name,Location"},{id:3,query:"103.21.40.0",type:"IP",status:"Safe",timestamp:"2025-03-19T22:15:00Z",breachName:"None",severityScore:0,source:"AbuseIPDB",compromisedData:""},{id:4,query:"malware-cdn.xyz",type:"URL",status:"Exposed",timestamp:"2025-03-19T18:30:00Z",breachName:"VirusTotal 48/72",severityScore:94,source:"VirusTotal",compromisedData:"Malware,Phishing"},{id:5,query:"ABCPQ1234Z",type:"PAN",status:"Safe",timestamp:"2025-03-19T15:00:00Z",breachName:"None",severityScore:0,source:"System",compromisedData:""},{id:6,query:"rohit@hdfc.co.in",type:"EMAIL",status:"Exposed",timestamp:"2025-03-19T11:20:00Z",breachName:"LinkedIn 2023",severityScore:70,source:"BreachDirectory",compromisedData:"Email,Name,Phone"},{id:7,query:"123456789012",type:"AADHAAR",status:"Safe",timestamp:"2025-03-18T20:10:00Z",breachName:"None",severityScore:0,source:"System",compromisedData:""},{id:8,query:"192.168.1.105",type:"IP",status:"Exposed",timestamp:"2025-03-18T14:55:00Z",breachName:"AbuseIPDB",severityScore:63,source:"AbuseIPDB",compromisedData:"IP,ISP,ASN"}];
const HOTSPOTS=[{city:"Mumbai",n:24,c:"#0ea5e9"},{city:"Delhi",n:18,c:"#f43f5e"},{city:"Bengaluru",n:11,c:"#8b5cf6"},{city:"Hyderabad",n:8,c:"#10b981"},{city:"Chennai",n:14,c:"#f97316"},{city:"Pune",n:6,c:"#ec4899"}];
const FEEDS=[{name:"VirusTotal",r:"900M",ok:true,ms:"14ms",c:"#0ea5e9"},{name:"LeakCheck",r:"9.2B",ok:true,ms:"22ms",c:"#8b5cf6"},{name:"AbuseIPDB",r:"4.1B",ok:false,ms:"88ms",c:"#f97316"},{name:"Numverify",r:"2.8B",ok:true,ms:"18ms",c:"#10b981"}];
const ALERTS=[{m:"New exposure: user@example.com",t:"5m",s:"HIGH"},{m:"IP 45.33.32.156 flagged in AbuseIPDB",t:"12m",s:"MEDIUM"},{m:"BreachDirectory: 840K new records",t:"34m",s:"INFO"},{m:"Aadhaar pattern match (3 identifiers)",t:"1h",s:"CRITICAL"}];
const SEV_B=[{l:"Critical",v:4,c:"#f43f5e"},{l:"High",v:9,c:"#f97316"},{l:"Medium",v:6,c:"#eab308"},{l:"Low",v:2,c:"#22c55e"}];
const TL=[{d:"Mar 15",s:3},{d:"Mar 16",s:7},{d:"Mar 17",s:5},{d:"Mar 18",s:9},{d:"Mar 19",s:14},{d:"Mar 20",s:11},{d:"Mar 21",s:6}];
const PIE_C=["#0ea5e9","#6366f1","#8b5cf6","#10b981","#eab308","#ec4899"];
const PREV={EMAIL:["Monitor transactions linked to this email.","Enable 2FA immediately.","Check OAuth apps for unauthorised access.","Never share OTPs via email."],PHONE:["Never share OTPs over phone calls.","Beware Smishing links.","Register on TRAI DND registry.","Contact carrier to prevent SIM-swap."],AADHAAR:["Lock biometrics via mAadhaar app.","Use VID instead of real Aadhaar.","Review auth history for anomalies.","Never share unmasked photocopies."],PAN:["Monitor CIBIL for unknown loans.","Check ITR for unauthorised returns.","Avoid sharing PAN on untrusted sites.","Report to NSDL immediately."],IP:["Restart router for fresh IP.","Use a no-log VPN.","Update router firmware.","Run a full malware scan."],URL:["Don't enter credentials here.","Report to Google Safe Browsing.","Enable browser phishing protection.","Clear cache, cookies and storage."]};
const AD={CRITICAL:"bg-rose-500",HIGH:"bg-orange-500",MEDIUM:"bg-amber-500",INFO:"bg-sky-500"};
const AT={CRITICAL:"text-rose-500",HIGH:"text-orange-500",MEDIUM:"text-amber-500",INFO:"text-sky-500"};
const fmtD=iso=>new Date(iso).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const TIcon=({type,size=13})=>({EMAIL:<Mail size={size} style={{color:"#0ea5e9"}}/>,URL:<Globe size={size} style={{color:"#6366f1"}}/>,IP:<Wifi size={size} style={{color:"#22d3ee"}}/>,PHONE:<Smartphone size={size} style={{color:"#10b981"}}/>,AADHAAR:<Shield size={size} style={{color:"#f97316"}}/>,PAN:<CreditCard size={size} style={{color:"#eab308"}}/>}[type]||<Search size={size} style={{color:"var(--text-3)"}}/>);

export default function DashboardPage({setIsModalOpen}) {
  const {dark}=useTheme();
  const [user,setUser]=useState(null);
  const [hist,setHist]=useState([]);
  const [stats,setStats]=useState({total:0,exposed:0,safe:0,risk:100,typeData:[],tl:[]});
  const [sel,setSel]=useState(null);
  const [alertOpen,setAlertOpen]=useState(false);

  useEffect(()=>{if(setIsModalOpen)setIsModalOpen(!!sel);},[sel,setIsModalOpen]);
  useEffect(()=>{const fn=e=>{if(e.key==="Escape")setSel(null);};window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);},[]);
  useEffect(()=>{
    const u=JSON.parse(localStorage.getItem("user")||"null");
    if(u){setUser(u);const raw=JSON.parse(localStorage.getItem(`search_history_${u.email}`)||"[]");const d=raw.length?raw:DUMMY;setHist(d);calc(d);}
  },[]);

  const calc=d=>{
    const exp=d.filter(x=>x.status==="Exposed").length,saf=d.filter(x=>x.status==="Safe").length;
    const risk=!d.length?100:Math.max(0,Math.round(100-(exp/d.length)*100));
    const tc={};d.forEach(x=>{tc[x.type]=(tc[x.type]||0)+1;});
    const typeData=Object.keys(tc).map(k=>({name:k,value:tc[k]}));
    const dc={};d.forEach(x=>{const l=new Date(x.timestamp).toLocaleDateString("en-IN",{month:"short",day:"numeric"});dc[l]=(dc[l]||0)+1;});
    const tl=Object.keys(dc).slice(-7).map(k=>({d:k,s:dc[k]}));
    setStats({total:d.length,exposed:exp,safe:saf,risk,typeData,tl});
  };

  const clear=()=>{if(!window.confirm("Purge ledger?"))return;localStorage.removeItem(`search_history_${user.email}`);setHist(DUMMY);calc(DUMMY);};

  const modal=sel?(()=>{
    const safe=sel.status==="Safe",score=safe?0:parseInt(sel.severityScore||85);
    const list=sel.compromisedData?sel.compromisedData.split(",").map(s=>s.trim()):safe?["None"]:["Archived Threat Data"];
    let level="SAFE",rc="#22c55e",gc="#22c55e";
    if(!safe){if(score<40){level="LOW";rc="#eab308";gc="#eab308";}else if(score<75){level="MEDIUM";rc="#f97316";gc="#f97316";}else{level="CRITICAL";rc="#f43f5e";gc="#f43f5e";}}
    return{safe,score,list,level,rc,gc,source:sel.source||(safe?"Clean":"Unknown"),breach:sel.breachName||(safe?"None":"Unknown"),date:fmtD(sel.timestamp)};
  })():null;

  if(!user) return null;
  const dn=user.name||user.email?.split("@")[0]||"Analyst";
  const gR=40,gC=2*Math.PI*gR,gOff=gC-(stats.risk/100)*gC;
  const gCol=stats.risk>80?"#22c55e":stats.risk>50?"#eab308":"#f43f5e";
  const tl=stats.tl.length>=3?stats.tl:TL;
  const ax=dark?"#2a4a63":"#6a9aba";
  const tip={background:dark?"#060d1f":"#fff",border:"1px solid var(--border-glow)",borderRadius:10,fontFamily:"IBM Plex Mono",fontSize:11};
  const stagger={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.05}}};
  const fUp={hidden:{opacity:0,y:12},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:300,damping:24}}};

  return (
    <>
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="flex-1 w-full flex flex-col px-3 sm:px-6 md:px-10 py-4 overflow-y-auto relative z-10"
      style={{scrollbarWidth:"thin",fontFamily:"'DM Sans',sans-serif",color:"var(--text-1)"}}>

      {/* Header */}
      <motion.div variants={fUp} className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 pb-4" style={{borderBottom:"1px solid var(--divider)"}}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl sm:text-2xl font-bold" style={{color:"var(--text-1)"}}>
              {dn.charAt(0).toUpperCase()+dn.slice(1)}'s{" "}
              <span style={{background:"linear-gradient(90deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Dashboard</span>
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:"#22c55e",background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)"}}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 blink inline-block"/>LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm" style={{color:"var(--text-3)"}}>Synced just now</p>
        </div>
        <motion.button onClick={()=>setAlertOpen(a=>!a)} whileTap={{scale:.96}}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass self-start xs:self-auto"
          style={{color:"var(--text-1)"}}>
          <Bell size={14} style={{color:"var(--accent)"}}/>Alerts
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold mono" style={{fontSize:9}}>3</span>
        </motion.button>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {alertOpen&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-3">
            <div className="glass overflow-hidden p-0">
              <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
                <span className="font-semibold text-sm flex items-center gap-2" style={{color:"var(--text-1)"}}><Bell size={13} style={{color:"var(--accent)"}}/>Alerts</span>
                <button onClick={()=>setAlertOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-3)"}}><X size={14}/></button>
              </div>
              {ALERTS.map((a,i)=>(
                <div key={i} className="flex items-center gap-3 px-4 py-3 row-hover transition-colors" style={{borderBottom:i<ALERTS.length-1?"1px solid var(--divider)":"none"}}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${AD[a.s]}`}/>
                  <p className="text-sm flex-1 min-w-0 truncate" style={{color:"var(--text-2)"}}>{a.m}</p>
                  <span className={`text-[10px] font-bold shrink-0 mono ${AT[a.s]}`}>{a.s}</span>
                  <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}} className="shrink-0">{a.t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 stat cards */}
      <motion.div variants={fUp} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
        {[{l:"Scans",v:stats.total,sub:"total",icon:Search,c:"#0ea5e9"},{l:"Exposed",v:stats.exposed,sub:`${stats.total?Math.round(stats.exposed/stats.total*100):0}%`,icon:AlertTriangle,c:"#f43f5e"},{l:"Safe",v:stats.safe,sub:"clean",icon:CheckCircle,c:"#22c55e"},{l:"Safety",v:stats.risk,sub:stats.risk>80?"Optimal":stats.risk>50?"Warning":"Critical",icon:Shield,c:gCol}].map(s=>{
          const Icon=s.icon;
          return(
            <motion.div key={s.l} whileTap={{scale:.97}} className="glass flex items-center gap-3 p-3.5 sm:p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:`${s.c}12`,border:`1px solid ${s.c}28`}}>
                <Icon size={16} style={{color:s.c}}/>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-lg leading-tight stat-val mono">{s.v}</div>
                <div className="text-[10px] leading-tight" style={{color:"var(--text-3)"}}>{s.l}</div>
                <div className="text-[9px] leading-tight mono" style={{color:"var(--text-4)"}}>{s.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Profile + gauge — stacked on mobile */}
      <motion.div variants={fUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 mb-3">
        <div className="sm:col-span-1 lg:col-span-4 glass p-4 flex items-center gap-3.5 relative overflow-hidden">
          <div style={{position:"absolute",top:0,right:0,width:"45%",height:"100%",background:"radial-gradient(ellipse at top right,rgba(14,165,233,.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{background:"linear-gradient(135deg,rgba(14,165,233,.12),rgba(99,102,241,.12))",border:"1px solid rgba(14,165,233,.2)"}}>
            <User size={22} style={{color:"var(--accent)"}}/>
          </div>
          <div className="flex-1 min-w-0 z-10">
            <h2 className="text-sm font-bold truncate" style={{color:"var(--text-1)"}}>{user.name||"Analyst"}</h2>
            <div className="flex items-center gap-1.5 mb-1" style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-3)"}}>
              <Mail size={9} style={{color:"var(--accent)",flexShrink:0}}/><span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3" style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>
              <span className="flex items-center gap-1"><Fingerprint size={9} style={{color:"#8b5cf6"}}/>Lv.4</span>
              <span className="flex items-center gap-1"><MapPin size={9} style={{color:"#f43f5e"}}/>India</span>
            </div>
          </div>
        </div>

        <div className="sm:col-span-1 lg:col-span-3 glass p-4 flex flex-col items-center justify-center">
          <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)",letterSpacing:".12em",textTransform:"uppercase"}} className="mb-2">Safety Index</p>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r={gR} stroke={dark?"#1e293b":"#e2e8f0"} strokeWidth="7" fill="none"/>
              <circle cx="56" cy="56" r={gR} stroke={gCol} strokeWidth="7" fill="none" strokeDasharray={gC} strokeDashoffset={gOff} strokeLinecap="round" className="transition-all duration-1000 ease-out" style={{filter:`drop-shadow(0 0 6px ${gCol})`}}/>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-black text-2xl sm:text-3xl leading-none stat-val mono">{stats.risk}</span>
            </div>
          </div>
          <span className="font-bold px-3 py-1 rounded-full border mt-2" style={{fontFamily:"IBM Plex Mono",fontSize:9,color:gCol,borderColor:gCol+"40",background:gCol+"0e"}}>
            {stats.risk>80?"Optimal":stats.risk>50?"Warning":"Critical"}
          </span>
        </div>

        {/* Severity bar — full width on mobile */}
        <div className="sm:col-span-2 lg:col-span-5 glass p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-2" style={{borderBottom:"1px solid var(--divider)"}}>
            <TrendingUp size={12} style={{color:"#f97316"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-2)",letterSpacing:".08em",textTransform:"uppercase"}}>Severity Breakdown</span>
          </div>
          <div className="flex-1" style={{minHeight:80}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEV_B} margin={{top:4,right:0,left:-30,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(56,189,248,.05)":"rgba(3,105,161,.07)"} vertical={false}/>
                <XAxis dataKey="l" tick={{fill:ax,fontSize:9,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:ax,fontSize:9,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <RT contentStyle={tip}/>
                <Bar dataKey="v" radius={[3,3,0,0]}>{SEV_B.map((e,i)=><Cell key={i} fill={e.c}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Charts row — stacked on mobile */}
      <motion.div variants={fUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 mb-3">
        <div className="sm:col-span-1 lg:col-span-5 glass p-4 flex flex-col" style={{minHeight:200}}>
          <div className="flex items-center justify-between mb-2 pb-2" style={{borderBottom:"1px solid var(--divider)"}}>
            <div className="flex items-center gap-1.5"><Activity size={12} style={{color:"var(--accent)"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-2)",letterSpacing:".08em",textTransform:"uppercase"}}>Scan Activity</span></div>
            <span style={{fontFamily:"IBM Plex Mono",fontSize:8,color:"var(--text-4)",border:"1px solid var(--border)",borderRadius:5,padding:"1px 6px"}}>7D</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tl} margin={{top:4,right:2,left:-30,bottom:0}}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity={dark?.2:.12}/><stop offset="100%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(56,189,248,.05)":"rgba(3,105,161,.07)"}/>
                <XAxis dataKey="d" tick={{fill:ax,fontSize:9,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:ax,fontSize:9,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                <RT contentStyle={tip} itemStyle={{color:"#0ea5e9"}} labelStyle={{color:"var(--text-2)"}}/>
                <Area type="monotone" dataKey="s" name="Scans" stroke="#0ea5e9" strokeWidth={2} fill="url(#sg)" dot={{fill:"#0ea5e9",r:3,strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sm:col-span-1 lg:col-span-3 glass p-4 flex flex-col" style={{minHeight:200}}>
          <div className="flex items-center gap-1.5 mb-2 pb-2" style={{borderBottom:"1px solid var(--divider)"}}>
            <Filter size={12} style={{color:"#8b5cf6"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-2)",letterSpacing:".08em",textTransform:"uppercase"}}>By Type</span>
          </div>
          {stats.typeData.length>0?(
            <div className="flex-1 flex flex-col">
              <ResponsiveContainer width="100%" height={100}>
                <PieChart><Pie data={stats.typeData} cx="50%" cy="50%" innerRadius={24} outerRadius={42} dataKey="value" strokeWidth={0}>{stats.typeData.map((_,i)=><Cell key={i} fill={PIE_C[i%PIE_C.length]}/>)}</Pie><RT contentStyle={tip}/></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-1">
                {stats.typeData.map((d,i)=>(
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:PIE_C[i%PIE_C.length]}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)"}}>{d.name}</span></div>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:600,color:"var(--text-2)"}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ):<div className="flex-1 flex items-center justify-center"><p style={{fontFamily:"IBM Plex Mono",fon