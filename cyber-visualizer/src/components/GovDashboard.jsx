import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Shield, AlertTriangle, Globe, Lock, Database, TrendingUp, Activity, MapPin, FileText, ChevronRight, Server, Clock, Filter, Crosshair, Flag } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { getSession } from "../userStorage";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";

/* ── Gov data ── */
const N_STATS=[{l:"Active Threats",v:"4,821",d:"+127 today",c:"#f43f5e",icon:AlertTriangle},{l:"IPs Blacklisted",v:"2.3M+",d:"+8,440 24h",c:"#f97316",icon:Globe},{l:"Agencies Online",v:"38",d:"of 40 total",c:"#22c55e",icon:Building2},{l:"Critical Assets",v:"12,988",d:"monitored",c:"#0891b2",icon:Shield},{l:"Incidents Today",v:"247",d:"+34 vs yesterday",c:"#a78bfa",icon:Activity},{l:"Classified Intel",v:"1,204",d:"reports indexed",c:"#eab308",icon:FileText}];
const INCIDENTS=[{id:"INC-2025-4821",name:"APT41 Infrastructure Detected",sev:"CRITICAL",target:"Govt. Finance Portal",state:"Active",agency:"CERT-In",time:"03m ago"},{id:"INC-2025-4820",name:"UIDAI Database Probing",sev:"CRITICAL",target:"UIDAI Servers, Delhi",state:"Active",agency:"NCIIPC",time:"1h ago"},{id:"INC-2025-4819",name:"DDoS on NIC Infrastructure",sev:"HIGH",target:"NIC Backbone Nodes",state:"Mitigating",agency:"NIC-CERT",time:"2h ago"},{id:"INC-2025-4818",name:"Ransomware in State Health",sev:"HIGH",target:"Maharashtra Health",state:"Contained",agency:"MH-CERT",time:"4h ago"},{id:"INC-2025-4817",name:"BGP Hijack — Reliance JIO",sev:"MEDIUM",target:"AS55836",state:"Resolved",agency:"CERT-In",time:"6h ago"},{id:"INC-2025-4816",name:"Railway IRCTC Phishing",sev:"MEDIUM",target:"IRCTC Users (2.4M)",state:"Active",agency:"IRCTC-CERT",time:"8h ago"}];
const ACTORS=[{name:"APT41 (Winnti)",origin:"China",type:"Nation-State",activity:"HIGH",targets:"Finance, Defence",tracked:"18 mo"},{name:"Lazarus Group",origin:"N. Korea",type:"Nation-State",activity:"HIGH",targets:"Crypto, Banking",tracked:"24 mo"},{name:"Transparent Tribe",origin:"Pakistan",type:"Nation-State",activity:"CRITICAL",targets:"Govt, Military",tracked:"36 mo"},{name:"SideWinder",origin:"Unknown",type:"APT",activity:"MEDIUM",targets:"Maritime, Govt",tracked:"12 mo"},{name:"LockBit Affiliates",origin:"RU/CN",type:"Ransomware",activity:"HIGH",targets:"Health, Education",tracked:"8 mo"}];
const STATE_BARS=[{state:"Maharashtra",n:124,c:"#f43f5e"},{state:"Delhi",n:98,c:"#f97316"},{state:"Karnataka",n:76,c:"#eab308"},{state:"Tamil Nadu",n:61,c:"#22c55e"},{state:"Gujarat",n:54,c:"#0891b2"},{state:"Telangana",n:48,c:"#a78bfa"}];
const TIMELINE=[{t:"00:00",h:12},{t:"03:00",h:8},{t:"06:00",h:15},{t:"09:00",h:34},{t:"12:00",h:51},{t:"15:00",h:47},{t:"18:00",h:62},{t:"21:00",h:44},{t:"Now",h:38}];
const SECTOR_RISK=[{s:"Finance",r:87,c:"#f43f5e"},{s:"Defence",r:73,c:"#f97316"},{s:"Health",r:61,c:"#eab308"},{s:"Power Grid",r:79,c:"#a78bfa"},{s:"Telecom",r:55,c:"#38bdf8"},{s:"Transport",r:48,c:"#22c55e"}];
const SEV_C={CRITICAL:{badge:"bg-rose-500/10 text-rose-400 border border-rose-500/25",dot:"bg-rose-500"},HIGH:{badge:"bg-orange-500/10 text-orange-400 border border-orange-500/25",dot:"bg-orange-500"},MEDIUM:{badge:"bg-amber-500/10 text-amber-400 border border-amber-500/25",dot:"bg-amber-500"}};
const STA_C={Active:"text-rose-400",Mitigating:"text-amber-400",Contained:"text-sky-400",Resolved:"text-emerald-400"};

export default function GovDashboard() {
  const {dark}=useTheme();
  const user=getSession();
  const [tab,setTab]=useState("overview");
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);

  const ax=dark?"#2a4a63":"#6a9aba";
  const tip={background:dark?"#060d1f":"#fff",border:"1px solid var(--border-glow)",borderRadius:10,fontFamily:"IBM Plex Mono",fontSize:11};
  const TABS=[{id:"overview",label:"Overview",icon:TrendingUp},{id:"incidents",label:"Incidents",icon:AlertTriangle},{id:"actors",label:"Actors",icon:Crosshair},{id:"reports",label:"Reports",icon:FileText}];
  const stagger={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.05}}};
  const fUp={hidden:{opacity:0,y:12},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:300,damping:24}}};

  return (
    <div className="flex-1 w-full flex flex-col" style={{fontFamily:"'DM Sans',sans-serif",color:"var(--text-1)"}}>
      {/* Classification banner */}
      <div className="flex items-center justify-center gap-2 py-2 px-4" style={{background:"linear-gradient(90deg,#0891b2,#0369a1,#0891b2)"}}>
        <Lock size={11} className="text-white"/><span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:700,color:"white",letterSpacing:".25em",textTransform:"uppercase"}}>TOP SECRET — CERT-IN GOV NETWORK</span><Lock size={11} className="text-white"/>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="flex-1 px-3 sm:px-6 md:px-10 py-4 overflow-y-auto" style={{scrollbarWidth:"thin"}}>

        {/* Header */}
        <motion.div variants={fUp} className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 pb-4" style={{borderBottom:"1px solid var(--divider)"}}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center gov-badge">
                <Building2 size={18} style={{color:"var(--gov-color)"}}/>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold" style={{color:"var(--text-1)"}}>
                  National Cyber Command <span style={{background:"linear-gradient(90deg,#0891b2,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Centre</span>
                </h1>
                <p className="text-xs" style={{color:"var(--text-3)"}}>{user?.department}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start xs:self-auto">
            <div className="glass-inset px-3 py-2 text-center">
              <div style={{fontFamily:"IBM Plex Mono",fontSize:15,fontWeight:700,color:"var(--gov-color)",lineHeight:1}}>{time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
              <div style={{fontFamily:"IBM Plex Mono",fontSize:8,color:"var(--text-4)",marginTop:2,letterSpacing:".1em"}}>{time.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})} IST</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 blink relative pulse-ring" style={{color:"#22c55e"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"#22c55e"}}>NOMINAL</span></div>
              <span style={{fontFamily:"IBM Plex Mono",fontSize:8,color:"var(--text-4)"}}>{user?.clearance||"TOP SECRET"}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats grid — 2 cols mobile, 6 desktop */}
        <motion.div variants={fUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {N_STATS.map(s=>{const Icon=s.icon; return(
            <motion.div key={s.l} whileTap={{scale:.97}} className="glass p-3 flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${s.c}14`,border:`1px solid ${s.c}28`}}>
                <Icon size={13} style={{color:s.c}}/>
              </div>
              <div className="font-bold text-base stat-val mono">{s.v}</div>
              <div style={{fontSize:10,color:"var(--text-3)"}}>{s.l}</div>
              <div style={{fontSize:9,fontFamily:"IBM Plex Mono",color:s.c}}>{s.d}</div>
            </motion.div>
          );})}
        </motion.div>

        {/* Tab nav — horizontal scroll on mobile */}
        <motion.div variants={fUp} className="flex gap-1 mb-4 overflow-x-auto" style={{scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          <div className="flex gap-1 p-1 rounded-xl shrink-0" style={{background:"var(--bg-inset)"}}>
            {TABS.map(t=>{const Icon=t.icon;const on=tab===t.id;return(
              <motion.button key={t.id} onClick={()=>setTab(t.id)} whileTap={{scale:.96}}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap"
                style={{background:on?"var(--gov-soft)":"transparent",color:on?"var(--gov-color)":"var(--text-3)",border:on?"1px solid rgba(34,211,238,.28)":"1px solid transparent",cursor:"pointer"}}>
                <Icon size={12}/>{t.label}
              </motion.button>
            );})}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* Overview */}
          {tab==="overview"&&(
            <motion.div key="ov" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                {/* Hourly */}
                <div className="glass p-4 flex flex-col" style={{minHeight:200}}>
                  <div className="flex items-center justify-between mb-3 pb-2" style={{borderBottom:"1px solid var(--divider)"}}>
                    <div className="flex items-center gap-1.5"><Activity size={12} style={{color:"var(--gov-color)"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-2)",letterSpacing:".08em",textTransform:"uppercase"}}>Hourly Incidents</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 blink"/><span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>Live</span></div>
                  </div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TIMELINE} margin={{top:4,right:4,left:-30,bottom:0}}>
                        <defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0891b2" stopOpacity={dark?.25:.15}/><stop offset="100%" stopColor="#0891b2" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(56,189,248,.05)":"rgba(3,105,161,.07)"}/>
                        <XAxis dataKey="t" tick={{fill:ax,fontSize:9,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:ax,fontSize:9,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={tip} labelStyle={{color:"var(--text-2)"}} itemStyle={{color:"#0891b2"}}/>
                        <Area type="monotone" dataKey="h" name="Incidents" stroke="#0891b2" strokeWidth={2.5} fill="url(#gg)" dot={{fill:"#0891b2",r:3,strokeWidth:0}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sector risk */}
                <div className="glass p-4">
                  <div className="flex items-center gap-1.5 mb-3 pb-2" style={{borderBottom:"1px solid var(--divider)"}}>
                    <Shield size={12} style={{color:"var(--gov-color)"}}/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-2)",letterSpacing:".08em",textTransform:"uppercase"}}>Sector Risk Index</span>
                  </div>
                  <div className="space-y-2.5">
                    {SECTOR_RISK.map(s=>(
                      <div key={s.s}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold" style={{color:"var(--text-1)"}}>{s.s}</span>
                          <span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:700,color:s.c}}>{s.r}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{background:"var(--border)"}}>
                          <motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${s.r}%`}} transition={{duration:.8,ease:"easeOut",delay:.1}} style={{background:s.c,boxShadow:`0 0 6px ${s.c}80`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top incidents preview */}
              <div className="glass p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid var(--divider)"}}>
                  <div className="flex items-center gap-1.5"><AlertTriangle size={13} className="text-rose-400"/><span style={{fontFamily:"IBM Plex Mono",fontSize:10,fontWeight:600,color:"var(--text-2)",letterSpacing:".08em",textTransform:"uppercase"}}>Top Active Incidents</span></div>
                  <button onClick={()=>setTab("incidents")} className="flex items-center gap-1 text-[10px] transition-colors" style={{fontFamily:"IBM Plex Mono",color:"var(--gov-color)",background:"none",border:"none",cursor:"pointer"}}>
                    All <ChevronRight size={10}/>
                  </button>
                </div>
                {INCIDENTS.slice(0,4).map(inc=>{const s=SEV_C[inc.sev];return(
                  <div key={inc.id} className="flex items-center gap-3 px-4 py-3 row-hover transition-colors" style={{borderBottom:"1px solid var(--divider)"}}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{color:"var(--text-1)"}}>{inc.name}</p>
                      <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)"}}>{inc.target}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded mono ${s.badge}`}>{inc.sev}</span>
                      <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>{inc.time}</span>
                    </div>
                  </div>
                );})}
              </div>
            </motion.div>
          )}

          {/* Incidents */}
          {tab==="incidents"&&(
            <motion.div key="inc" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}}>
              {/* Mobile cards */}
              <div className="lg:hidden flex flex-col gap-2">
                {INCIDENTS.map(inc=>{const s=SEV_C[inc.sev];return(
                  <div key={inc.id} className="glass p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--gov-color)"}}>{inc.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded mono ${s.badge}`}>{inc.sev}</span>
                    </div>
                    <p className="font-semibold text-sm mb-1.5" style={{color:"var(--text-1)"}}>{inc.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span style={{color:"var(--text-3)"}}><span style={{color:"var(--text-4)"}}>Target: </span>{inc.target}</span>
                      <span className={`font-semibold ${STA_C[inc.state]}`}>{inc.state}</span>
                      <span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-3)"}}>{inc.agency}</span>
                      <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>{inc.time}</span>
                    </div>
                  </div>
                );})}
              </div>
              {/* Desktop table */}
              <div className="hidden lg:block glass overflow-hidden p-0">
                <div className="px-5 py-4 border-b" style={{borderColor:"var(--divider)"}}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-rose-400"/>
                    <span style={{fontFamily:"IBM Plex Mono",fontSize:11,fontWeight:700,color:"var(--text-1)",letterSpacing:".08em"}}>NATIONAL INCIDENT REGISTRY</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold mono" style={{background:"rgba(244,63,94,.1)",color:"#f43f5e",border:"1px solid rgba(244,63,94,.25)"}}>{INCIDENTS.length} ACTIVE</span>
                  </div>
                </div>
                <div className="tbl-scroll">
                  <table className="w-full border-collapse" style={{minWidth:680}}>
                    <thead>
                      <tr className="tbl-head">
                        {["ID","Name","Severity","Target","Status","Agency","Time"].map(h=>(
                          <th key={h} className="px-4 py-3 text-left border-b" style={{borderColor:"var(--divider)",fontFamily:"IBM Plex Mono",fontSize:8,fontWeight:700,color:"var(--text-4)",letterSpacing:".12em",textTransform:"uppercase"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {INCIDENTS.map((inc,i)=>{const s=SEV_C[inc.sev];return(
                        <motion.tr key={inc.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*.04}}
                          className="tbl-row border-b last:border-0 cursor-pointer" style={{borderColor:"var(--divider)"}}>
                          <td className="px-4 py-3"><span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--gov-color)"}}>{inc.id}</span></td>
                          <td className="px-4 py-3"><span className="font-medium text-sm" style={{color:"var(--text-1)"}}>{inc.name}</span></td>
                          <td className="px-4 py-3"><span className={`text-[9px] font-bold px-2 py-0.5 rounded mono ${s.badge}`}>{inc.sev}</span></td>
                          <td className="px-4 py-3"><span className="text-xs" style={{color:"var(--text-2)"}}>{inc.target}</span></td>
                          <td className="px-4 py-3"><span className={`text-xs font-semibold ${STA_C[inc.state]}`}>{inc.state}</span></td>
                          <td className="px-4 py-3"><span style={{fontFamily:"IBM Plex Mono",fontSize:10,color:"var(--text-3)"}}>{inc.agency}</span></td>
                          <td className="px-4 py-3"><span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>{inc.time}</span></td>
                        </motion.tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actors */}
          {tab==="actors"&&(
            <motion.div key="act" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ACTORS.map((a,i)=>(
                  <motion.div key={a.name} initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{delay:i*.05}}
                    whileTap={{scale:.98}} className="glass p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:a.activity==="CRITICAL"?"rgba(244,63,94,.12)":a.activity==="HIGH"?"rgba(249,115,22,.12)":"rgba(234,179,8,.12)"}}>
                          <Crosshair size={14} style={{color:a.activity==="CRITICAL"?"#f43f5e":a.activity==="HIGH"?"#f97316":"#eab308"}}/>
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{color:"var(--text-1)"}}>{a.name}</p>
                          <p style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>{a.origin}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded mono ${SEV_C[a.activity]?.badge||""}`}>{a.activity}</span>
                    </div>
                    <div className="space-y-1.5">
                      {[{l:"Type",v:a.type},{l:"Targets",v:a.targets},{l:"Tracked",v:a.tracked}].map(({l,v})=>(
                        <div key={l} className="flex justify-between">
                          <span className="text-xs" style={{color:"var(--text-3)"}}>{l}</span>
                          <span className="text-xs font-semibold" style={{color:"var(--text-1)"}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reports */}
          {tab==="reports"&&(
            <motion.div key="rep" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {title:"APT41 Campaign Analysis — Q1 2025",cls:"TOP SECRET",  date:"22 Mar",pp:47, agency:"CERT-In"},
                  {title:"Critical Infrastructure Vulnerability Report",cls:"SECRET", date:"21 Mar",pp:23, agency:"NCIIPC"},
                  {title:"UPI Fraud Ecosystem — Deep Dive",cls:"CONFIDENTIAL",date:"20 Mar",pp:31, agency:"RBI-CISO"},
                  {title:"National Cyber Threat Landscape 2025",cls:"SECRET",date:"18 Mar",pp:88, agency:"NSA-IN"},
                  {title:"AI-Assisted Phishing Surge Advisory",cls:"RESTRICTED",date:"15 Mar",pp:12, agency:"CERT-In"},
                  {title:"Border Region Network Intrusion",cls:"TOP SECRET",date:"14 Mar",pp:56, agency:"DRDO-CERT"},
                ].map((r,i)=>{
                  const cc=r.cls==="TOP SECRET"?"#f43f5e":r.cls==="SECRET"?"#f97316":r.cls==="CONFIDENTIAL"?"#eab308":"#22c55e";
                  return(
                    <motion.div key={r.title} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*.04}}
                      whileTap={{scale:.98}} className="glass-inset p-4 cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:`${cc}12`,border:`1px solid ${cc}28`}}>
                          <FileText size={14} style={{color:cc}}/>
                        </div>
                        <span style={{fontFamily:"IBM Plex Mono",fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:5,color:cc,border:`1px solid ${cc}30`,background:`${cc}0e`,flexShrink:0}}>{r.cls}</span>
                      </div>
                      <h3 className="font-bold text-sm mb-2.5 leading-snug" style={{color:"var(--text-1)"}}>{r.title}</h3>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-3)"}}>{r.date}</span>
                          <span style={{fontFamily:"IBM Plex Mono",fontSize:9,color:"var(--text-4)"}}>{r.pp}pp</span>
                        </div>
                        <span style={{fontFamily:"IBM Plex Mono",fontSize:9,fontWeight:600,color:"var(--gov-color)"}}>{r.agency}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
