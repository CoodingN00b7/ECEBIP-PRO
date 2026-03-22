import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, User, ArrowRight, UserCircle, Sun, Moon, Building2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { findUser, findGovUser, setSession } from "../userStorage";

export default function LoginPage({ onLogin }) {
  const nav = useNavigate();
  const { dark, toggle } = useTheme();
  const [tab,     setTab]     = useState("user");
  const [loginId, setLoginId] = useState("");
  const [govId,   setGovId]   = useState("");
  const [pwd,     setPwd]     = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => setErr("");

  const submit = e => {
    e.preventDefault(); setLoading(true); reset();
    setTimeout(() => {
      const found = tab==="user" ? findUser(loginId,pwd) : findGovUser(govId,pwd);
      if (!found) { setErr(tab==="gov"?"Invalid Government ID or password.":"Invalid credentials."); setLoading(false); return; }
      setSession(found); onLogin?.(found);
      nav(found.role==="government"?"/gov-dashboard":"/home");
      setLoading(false);
    }, 800);
  };

  const guest = () => {
    const g={isGuest:true,name:"Guest User",role:"guest"};
    setSession(g); onLogin?.(g); nav("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{background:"var(--bg-base)",fontFamily:"'DM Sans',sans-serif"}}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60%",height:"60%",background:dark?"radial-gradient(ellipse,rgba(56,189,248,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(14,120,200,.12) 0%,transparent 70%)",filter:"blur(80px)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"60%",height:"60%",background:dark?"radial-gradient(ellipse,rgba(99,102,241,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(8,145,178,.1) 0%,transparent 70%)",filter:"blur(80px)"}}/>
      </div>

      {/* Theme btn */}
      <motion.button onClick={toggle} whileTap={{scale:.9}}
        className="fixed top-4 right-4 z-50 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{background:"var(--bg-glass)",border:"1px solid var(--border)",color:dark?"#fbbf24":"var(--text-3)"}}>
        {dark?<Sun size={16}/>:<Moon size={16}/>}
      </motion.button>

      <motion.div initial={{opacity:0,y:24,scale:.97}} animate={{opacity:1,y:0,scale:1}}
        transition={{type:"spring",stiffness:260,damping:24}}
        className="relative z-10 w-full" style={{maxWidth:380}}>

        <div className="glass-2 rounded-2xl p-6 sm:p-8" style={{border:"1px solid var(--border-glow)"}}>

          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="relative float-anim">
              <div style={{position:"absolute",inset:-6,background:"var(--accent-soft)",borderRadius:"50%",filter:"blur(12px)"}}/>
              <Shield className="relative z-10 w-12 h-12" style={{color:"var(--accent)",filter:"drop-shadow(0 0 16px var(--accent))"}}/>
            </div>
            <div className="text-center mt-1">
              <h1 className="font-black text-2xl tracking-widest" style={{color:"var(--text-1)"}}>
                ECEBIP <span style={{background:"linear-gradient(90deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>PRO</span>
              </h1>
              <p className="text-xs mt-0.5 font-medium tracking-wide uppercase" style={{color:"var(--text-3)"}}>Secure Access Portal</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex mb-5 gap-1 p-1 rounded-xl" style={{background:"var(--bg-inset)"}}>
            {[{id:"user",icon:User,label:"User Login"},{id:"gov",icon:Building2,label:"Government"}].map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);reset();setLoginId("");setPwd("");setGovId("");}}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all min-h-[40px]"
                style={{background:tab===t.id?(t.id==="gov"?"var(--gov-soft)":"var(--accent-soft)"):"transparent",color:tab===t.id?(t.id==="gov"?"var(--gov-color)":"var(--accent)"):"var(--text-3)",border:tab===t.id?`1px solid ${t.id==="gov"?"rgba(34,211,238,.3)":"var(--accent-border)"}`:"1px solid transparent",cursor:"pointer"}}>
                <t.icon size={13}/>{t.label}
              </button>
            ))}
          </div>

          {/* Gov banner */}
          <AnimatePresence>
            {tab==="gov"&&(
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
                <div className="rounded-xl px-3 py-2.5 flex items-start gap-2.5 gov-badge">
                  <Lock size={13} style={{color:"var(--gov-color)",flexShrink:0,marginTop:1}}/>
                  <div>
                    <p style={{fontSize:11,fontFamily:"IBM Plex Mono",fontWeight:600,color:"var(--gov-color)"}}>GOVERNMENT ACCESS ONLY</p>
                    <p style={{fontSize:10,color:"var(--text-3)",marginTop:2}}>Demo — ID: GOV-CERT-001 · PW: gov@secure123</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit} className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{opacity:0,x:tab==="gov"?16:-16}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:.2}} className="space-y-3">
                <div className="relative">
                  {tab==="user"
                    ? <><User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--text-4)"}}/><input value={loginId} onChange={e=>{setLoginId(e.target.value);reset();}} placeholder="Email or Username" required className="auth-input" style={{paddingLeft:42}}/></>
                    : <><Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--gov-color)"}}/><input value={govId} onChange={e=>{setGovId(e.target.value);reset();}} placeholder="Gov ID (e.g. GOV-CERT-001)" required className="auth-input" style={{paddingLeft:42}}/></>
                  }
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--text-4)"}}/>
                  <input type={showPwd?"text":"password"} value={pwd} onChange={e=>{setPwd(e.target.value);reset();}} placeholder="Password" required className="auth-input" style={{paddingLeft:42,paddingRight:46}}/>
                  <button type="button" onClick={()=>setShowPwd(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center" style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-4)"}}>
                    {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {err&&<motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-center py-2.5 rounded-xl text-sm" style={{color:"#f43f5e",background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.2)"}}>{err}</motion.div>}
            </AnimatePresence>

            <div className="flex flex-col gap-2.5 pt-1">
              <motion.button type="submit" disabled={loading} whileTap={!loading?{scale:.98}:{}} className="btn-primary" style={{borderRadius:13}}>
                {loading
                  ? <motion.span className="flex items-center gap-2"><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:"linear"}} style={{display:"inline-flex"}}><Shield size={16}/></motion.span>AUTHENTICATING…</motion.span>
                  : <>{tab==="gov"?<Building2 size={15}/>:<User size={15}/>}{tab==="gov"?"GOV LOGIN":"LOG IN"}<ArrowRight size={14}/></>}
              </motion.button>
              {tab==="user"&&(
                <motion.button type="button" onClick={guest} whileTap={{scale:.98}}
                  className="w-full flex items-center justify-center gap-2 rounded-xl font-bold text-xs tracking-widest min-h-[48px] transition-all"
                  style={{background:"var(--bg-inset)",border:"1px solid var(--border)",color:"var(--text-2)",fontFamily:"IBM Plex Mono",cursor:"pointer"}}>
                  SKIP LOGIN <UserCircle size={14}/>
                </motion.button>
              )}
            </div>
          </form>

          {tab==="user"&&(
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{background:"var(--divider)"}}/>
                <span style={{fontSize:10,letterSpacing:".12em",color:"var(--text-4)",textTransform:"uppercase",fontFamily:"IBM Plex Mono"}}>or</span>
                <div className="flex-1 h-px" style={{background:"var(--divider)"}}/>
              </div>
              <motion.button type="button" onClick={()=>alert("Google OAuth pending!")} whileTap={{scale:.98}}
                className="w-full py-3 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold min-h-[48px] transition-all"
                style={{background:"var(--bg-inset)",border:"1px solid var(--border)",color:"var(--text-1)",cursor:"pointer"}}>
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </motion.button>
              <p className="text-xs mt-5 text-center" style={{color:"var(--text-3)"}}>
                No account?{" "}<span onClick={()=>nav("/register")} className="font-semibold cursor-pointer" style={{color:"var(--accent)"}}>Sign up</span>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
