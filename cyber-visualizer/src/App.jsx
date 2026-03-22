import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LayoutDashboard, Home, User, LogOut, ChevronDown, BadgeCheck, Sun, Moon, Building2, X, Menu } from "lucide-react";

import LoginPage     from "./components/LoginPage.jsx";
import RegisterPage  from "./components/RegisterPage.jsx";
import HomePage      from "./components/HomePage.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import GovDashboard  from "./components/GovDashboard.jsx";
import { useTheme }  from "./ThemeContext.jsx";
import { getSession, clearSession } from "./userStorage.js";

/* ── Guards ── */
const Guard = ({ children, check }) => { const u = getSession(); return check(u) ? children : <Navigate to="/login" replace/>; };
const AuthGuard  = ({ children }) => <Guard check={u=>!!u} children={children}/>;
const UserGuard  = ({ children }) => <Guard check={u=>u&&!u.isGuest} children={children}/>;
const GovGuard   = ({ children }) => <Guard check={u=>u?.role==="government"} children={children}/>;

export default function App() {
  const loc      = useLocation();
  const nav      = useNavigate();
  const { dark, toggle } = useTheme();
  const [user,    setUser]    = useState(getSession);
  const [drop,    setDrop]    = useState(false);
  const [modal,   setModal]   = useState(false);
  const [menuOpen,setMenuOpen]= useState(false);
  const dropRef = useRef(null);

  useEffect(() => { setUser(getSession()); setDrop(false); setMenuOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const fn = e => setModal(e.detail.isModalOpen);
    window.addEventListener("modalStateChange", fn);
    return () => window.removeEventListener("modalStateChange", fn);
  }, []);
  useEffect(() => {
    if (!drop) return;
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false); };
    document.addEventListener("mousedown", fn); document.addEventListener("touchstart", fn);
    return () => { document.removeEventListener("mousedown", fn); document.removeEventListener("touchstart", fn); };
  }, [drop]);

  const logout = () => { clearSession(); setUser(null); nav("/login"); };
  const hideAll = ["/login","/register"].includes(loc.pathname) || modal;
  const isGov   = user?.role === "government";
  const isGuest = user?.isGuest;
  const at = p => loc.pathname === p;

  const nl = (active, gov=false) => {
    const base = "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200";
    if (active) return `${base} ${gov?"text-cyan-400 bg-cyan-400/10 border border-cyan-400/20":"text-sky-400 bg-sky-400/10 border border-sky-400/20"}`;
    return `${base} ${dark?"text-slate-400 hover:text-white hover:bg-white/5 border border-transparent":"text-slate-500 hover:text-slate-900 hover:bg-black/5 border border-transparent"}`;
  };

  const navItems = [
    { path:"/home",          label:"Scanner",   icon:Home,          show:true },
    { path:"/dashboard",     label:"Dashboard", icon:LayoutDashboard,show:!isGuest && !isGov },
    { path:"/gov-dashboard", label:"Gov Intel",  icon:Building2,     show:isGov },
  ].filter(i=>i.show);

  return (
    <div className="min-h-screen flex flex-col" style={{fontFamily:"'DM Sans',sans-serif",background:"var(--bg-base)",color:"var(--text-1)"}}>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:"55%",height:"55%",background:dark?"radial-gradient(ellipse,rgba(56,189,248,.05) 0%,transparent 68%)":"radial-gradient(ellipse,rgba(14,120,200,.07) 0%,transparent 68%)",filter:"blur(60px)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"55%",height:"55%",background:dark?"radial-gradient(ellipse,rgba(99,102,241,.05) 0%,transparent 68%)":"radial-gradient(ellipse,rgba(8,145,178,.06) 0%,transparent 68%)",filter:"blur(60px)"}}/>
        <div style={{position:"absolute",inset:0,opacity:dark?0.015:0.025,backgroundImage:"linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      </div>

      <AnimatePresence>
        {!hideAll && (
          <motion.nav initial={{y:-56,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-56,opacity:0}}
            transition={{type:"spring",stiffness:300,damping:28}}
            className="nav-glass relative z-30 px-4 sm:px-6 flex justify-between items-center sticky top-0"
            style={{paddingBottom:12}}>

            <motion.div className="flex items-center gap-2.5 cursor-pointer" onClick={()=>nav("/home")} whileTap={{scale:.97}}>
              <Shield className="text-sky-400 w-6 h-6 sm:w-7 sm:h-7" style={{filter:"drop-shadow(0 0 8px rgba(56,189,248,.55))"}}/>
              <div className="font-black text-base sm:text-[17px] tracking-widest flex items-center gap-1.5" style={{color:"var(--text-1)"}}>
                ECEBIP
                <span style={{fontSize:9,fontFamily:"IBM Plex Mono",color:"var(--accent)",border:"1px solid var(--accent-border)",padding:"1px 5px",borderRadius:5,background:"var(--accent-soft)"}}>PRO</span>
                {isGov&&<span style={{fontSize:9,fontFamily:"IBM Plex Mono",color:"var(--gov-color)",border:"1px solid rgba(34,211,238,.3)",padding:"1px 5px",borderRadius:5,background:"var(--gov-soft)"}}>GOV</span>}
              </div>
            </motion.div>

            <div className="hidden sm:flex items-center gap-1">
              <motion.button onClick={toggle} whileHover={{scale:1.08}} whileTap={{scale:.92}}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{background:"var(--bg-glass)",border:"1px solid var(--border)",color:dark?"#fbbf24":"var(--text-3)"}}>
                <AnimatePresence mode="wait">
                  <motion.span key={dark?"s":"m"} initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:.18}}>
                    {dark?<Sun size={14}/>:<Moon size={14}/>}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              <Link to="/home" className={nl(at("/home"))}><Home size={14}/><span className="hidden md:inline">Scanner</span></Link>
              {!isGuest&&!isGov&&<Link to="/dashboard" className={nl(at("/dashboard"))}><LayoutDashboard size={14}/><span className="hidden md:inline">Dashboard</span></Link>}
              {isGov&&<Link to="/gov-dashboard" className={nl(at("/gov-dashboard"),true)}><Building2 size={14}/><span className="hidden md:inline">Gov Intel</span></Link>}

              {user && (
                <div ref={dropRef} className="relative ml-1 pl-2 border-l" style={{borderColor:"var(--divider)"}}>
                  <motion.button onClick={()=>setDrop(v=>!v)} whileHover={{scale:1.04}} whileTap={{scale:.96}}
                    className="flex items-center gap-1.5 focus:outline-none">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{background:isGov?"var(--gov-soft)":"var(--accent-soft)",border:`1.5px solid ${isGov?"rgba(34,211,238,.35)":"var(--accent-border)"}`,color:isGov?"var(--gov-color)":"var(--accent)"}}>
                      {isGov?<Building2 size={13}/>:<User size={13}/>}
                    </div>
                    <motion.span animate={{rotate:drop?180:0}} transition={{duration:.2}}>
                      <ChevronDown size={12} style={{color:"var(--text-3)"}}/>
                    </motion.span>
                  </motion.button>
                  <AnimatePresence>
                    {drop&&(
                      <motion.div initial={{opacity:0,y:-8,scale:.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:.95}}
                        transition={{type:"spring",stiffness:350,damping:28}}
                        className="absolute right-0 mt-3 w-60 glass-2 rounded-2xl shadow-2xl overflow-hidden z-50"
                        style={{border:"1px solid var(--border-glow)"}}>
                        <div className="px-4 py-4 border-b" style={{borderColor:"var(--divider)",background:isGov?"var(--gov-soft)":"var(--accent-soft)"}}>
                          {isGuest?(
                            <><p style={{fontSize:9,fontFamily:"IBM Plex Mono",color:"var(--text-3)",letterSpacing:".1em",textTransform:"uppercase"}}>Access Level</p><p className="font-bold mt-0.5" style={{color:"var(--text-1)"}}>Guest User</p></>
                          ):(
                            <><p style={{fontSize:9,fontFamily:"IBM Plex Mono",color:"var(--text-3)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Signed in as</p>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold truncate" style={{color:"var(--text-1)"}}>{user.name}</span>
                              <BadgeCheck size={12} style={{color:isGov?"var(--gov-color)":"var(--accent)",flexShrink:0}}/>
                            </div>
                            <span className="block truncate mb-2 text-xs" style={{color:"var(--text-3)"}}>{user.email}</span>
                            <span style={{fontSize:9,fontFamily:"IBM Plex Mono",fontWeight:700,padding:"2px 8px",borderRadius:6,letterSpacing:".1em",textTransform:"uppercase",color:isGov?"var(--gov-color)":"var(--accent)",background:isGov?"var(--gov-soft)":"var(--accent-soft)",border:`1px solid ${isGov?"rgba(34,211,238,.3)":"var(--accent-border)"}`}}>
                              {user.role}
                            </span></>
                          )}
                        </div>
                        <div className="p-1.5" style={{background:"var(--bg-glass)"}}>
                          <button onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold row-hover transition-all"
                            style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-2)"}}>
                            <LogOut size={14}/>{isGuest?"Login / Register":"Sign out"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <motion.button onClick={toggle} whileTap={{scale:.9}}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{background:"var(--bg-glass)",border:"1px solid var(--border)",color:dark?"#fbbf24":"var(--text-3)"}}>
                {dark?<Sun size={14}/>:<Moon size={14}/>}
              </motion.button>
              {user&&(
                <motion.button onClick={()=>setMenuOpen(v=>!v)} whileTap={{scale:.9}}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{background:isGov?"var(--gov-soft)":"var(--accent-soft)",border:`1px solid ${isGov?"rgba(34,211,238,.3)":"var(--accent-border)"}`,color:isGov?"var(--gov-color)":"var(--accent)"}}>
                  {menuOpen?<X size={15}/>:<User size={15}/>}
                </motion.button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen&&!hideAll&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
            transition={{type:"spring",stiffness:300,damping:28}}
            className="relative z-20 overflow-hidden sm:hidden glass-2"
            style={{borderBottom:"1px solid var(--border)"}}>
            <div className="px-4 py-3">
              {!isGuest&&<>
                <p style={{fontSize:10,fontFamily:"IBM Plex Mono",color:"var(--text-3)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Signed in as</p>
                <p className="font-bold" style={{color:"var(--text-1)"}}>{user?.name}</p>
                <p className="text-xs mb-3" style={{color:"var(--text-3)"}}>{user?.email}</p>
              </>}
              <button onClick={()=>{logout();setMenuOpen(false);}}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold w-full row-hover"
                style={{background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.2)",color:"#f43f5e",cursor:"pointer"}}>
                <LogOut size={14}/>{isGuest?"Login / Register":"Sign out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-grow relative z-10 ${!hideAll?"has-bottom-nav sm:pb-0":""}`}>
        <AnimatePresence mode="wait">
          <Routes location={loc} key={loc.pathname}>
            <Route path="/"             element={<Navigate to="/login" replace/>}/>
            <Route path="/login"        element={<LoginPage    onLogin={u=>{setUser(u);}}/>}/>
            <Route path="/register"     element={<RegisterPage/>}/>
            <Route path="/home"         element={<AuthGuard><HomePage/></AuthGuard>}/>
            <Route path="/dashboard"    element={<UserGuard><DashboardPage setIsModalOpen={setModal}/></UserGuard>}/>
            <Route path="/gov-dashboard"element={<GovGuard><GovDashboard/></GovGuard>}/>
            <Route path="*"             element={<Navigate to="/login" replace/>}/>
          </Routes>
        </AnimatePresence>
      </div>

      {!hideAll && user && (
        <nav className="bottom-nav sm:hidden z-30 flex items-end">
          <div className="flex w-full px-2 pt-2">
            {navItems.map(item=>{
              const Icon = item.icon;
              const active = at(item.path);
              const govItem = item.path==="/gov-dashboard";
              return (
                <Link key={item.path} to={item.path}
                  className="bottom-nav-item"
                  style={{color:active?(govItem?"var(--gov-color)":"var(--accent)"):"var(--text-3)"}}>
                  <div className="relative">
                    {active&&(
                      <motion.div layoutId="bottom-active-pill"
                        className="absolute inset-[-6px] rounded-xl"
                        style={{background:govItem?"var(--gov-soft)":"var(--accent-soft)"}}
                        transition={{type:"spring",stiffness:400,damping:32}}/>
                    )}
                    <Icon size={20} className="relative z-10"/>
                  </div>
                  <span style={{fontSize:10,fontFamily:"IBM Plex Mono",fontWeight:600,letterSpacing:".06em"}}>{item.label}</span>
                </Link>
              );
            })}
            <button onClick={toggle} className="bottom-nav-item" style={{color:"var(--text-3)"}}>
              {dark?<Sun size={20}/>:<Moon size={20}/>}
              <span style={{fontSize:10,fontFamily:"IBM Plex Mono",fontWeight:600,letterSpacing:".06em"}}>{dark?"Light":"Dark"}</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
