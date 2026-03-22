import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Lock, User, Smartphone, AtSign, ArrowRight, Sun, Moon, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext.jsx";
import { saveUser, getAllUsers } from "../userStorage.js";

function Field({ name, placeholder, type="text", icon:Icon, value, onChange, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{color:focused?"var(--accent)":"var(--text-4)",transition:"color .2s",zIndex:1}}/>
      <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required
        autoComplete={type==="password"?"new-password":"off"}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        className="auth-input w-full"
        style={{paddingLeft:42,paddingRight:right?46:16}}/>
      {right}
    </div>
  );
}

function StrengthBar({ pwd }) {
  if (!pwd) return null;
  const checks = [pwd.length>=8, /[A-Z]/.test(pwd), /\d/.test(pwd), /[^A-Za-z0-9]/.test(pwd)];
  const score  = checks.filter(Boolean).length;
  const cols   = ["#f43f5e","#f97316","#eab308","#22c55e"];
  const labels = ["Weak","Fair","Good","Strong"];
  return (
    <div className="px-0.5 mt-1.5">
      <div className="flex gap-1 mb-1.5">
        {[0,1,2,3].map(i=><div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{background:i<score?cols[score-1]:"var(--border)"}}/>)}
      </div>
      <div className="flex justify-between">
        <span style={{fontSize:10,fontFamily:"IBM Plex Mono",color:score>0?cols[score-1]:"var(--text-4)"}}>{score>0?labels[score-1]:"Enter password"}</span>
        <div className="flex gap-2">
          {["8+","A-Z","0-9","@"].map((l,i)=>(
            <span key={l} style={{fontSize:9,fontFamily:"IBM Plex Mono",color:checks[i]?"#22c55e":"var(--text-4)"}}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const nav = useNavigate();
  const { dark, toggle } = useTheme();

  const [name, setName] = useState("");
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hName  = useCallback(e=>{setName(e.target.value);  setErr("");}, []);
  const hUname = useCallback(e=>{setUname(e.target.value); setErr("");}, []);
  const hEmail = useCallback(e=>{setEmail(e.target.value); setErr("");}, []);
  const hPhone = useCallback(e=>{setPhone(e.target.value); setErr("");}, []);
  const hPwd   = useCallback(e=>{setPwd(e.target.value);   setErr("");}, []);
  const hCpwd  = useCallback(e=>{setCpwd(e.target.value);  setErr("");}, []);

  const submit = e => {
    e.preventDefault();
    if (!terms)         return setErr("You must agree to the Terms & Privacy Policy.");
    if (pwd !== cpwd)   return setErr("Passwords do not match.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    const dup = getAllUsers().find(u=>u.email===email||u.username===uname);
    if (dup)            return setErr("Email or username already registered.");
    setLoading(true);
    setTimeout(()=>{
      saveUser({name,username:uname,email,phone,password:pwd,isGuest:false,role:"Analyst",department:"Cyber Security",clearance:"STANDARD",createdAt:new Date().toISOString()});
      setSuccess(true);
      setTimeout(()=>nav("/login"),1600);
      setLoading(false);
    },800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{background:"var(--bg-base)",fontFamily:"'DM Sans',sans-serif"}}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{position:"absolute",top:"-20%",right:"-10%",width:"55%",height:"55%",background:dark?"radial-gradient(ellipse,rgba(99,102,241,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(8,145,178,.1) 0%,transparent 70%)",filter:"blur(80px)"}}/>
        <div style={{position:"absolute",bottom:"-20%",left:"-10%",width:"55%",height:"55%",background:dark?"radial-gradient(ellipse,rgba(56,189,248,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(14,120,200,.1) 0%,transparent 70%)",filter:"blur(80px)"}}/>
      </div>

      <motion.button onClick={toggle} whileTap={{scale:.9}}
        className="fixed top-4 right-4 z-50 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{background:"var(--bg-glass)",border:"1px solid var(--border)",color:dark?"#fbbf24":"var(--text-3)"}}>
        {dark?<Sun size={16}/>:<Moon size={16}/>}
      </motion.button>

      <motion.div initial={{opacity:0,y:24,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{type:"spring",stiffness:260,damping:24}}
        className="relative z-10 w-full" style={{maxWidth:420}}>

        <div className="glass-2 rounded-2xl p-6 sm:p-8" style={{border:"1px solid var(--border-glow)"}}>

          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="relative float-anim">
              <div style={{position:"absolute",inset:-6,background:"var(--accent-soft)",borderRadius:"50%",filter:"blur(12px)"}}/>
              <Shield className="relative z-10 w-12 h-12" style={{color:"var(--accent)",filter:"drop-shadow(0 0 16px var(--accent))"}}/>
            </div>
            <div className="text-center mt-1">
              <h1 className="font-black text-xl tracking-widest" style={{color:"var(--text-1)"}}>CREATE ACCOUNT</h1>
              <p className="text-xs mt-0.5 font-medium tracking-wide uppercase" style={{color:"var(--text-3)"}}>Join the ECEBIP PRO network</p>
            </div>
          </div>

          <AnimatePresence>
            {success&&(
              <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} className="text-center py-8">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300,delay:.1}}>
                  <CheckCircle size={52} className="mx-auto mb-3" style={{color:"#22c55e"}}/>
                </motion.div>
                <p className="font-bold text-lg" style={{color:"var(--text-1)"}}>Account Created!</p>
                <p className="text-sm mt-1" style={{color:"var(--text-3)"}}>Redirecting to login…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success&&(
            <form onSubmit={submit}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Field name="name"  placeholder="Full Name" icon={User}       value={name}  onChange={hName}/>
                  <Field name="uname" placeholder="Username"  icon={AtSign}     value={uname} onChange={hUname}/>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field name="email" placeholder="Email" icon={Mail}       value={email} onChange={hEmail} type="email"/>
                  <Field name="phone" placeholder="Phone" icon={Smartphone} value={phone} onChange={hPhone} type="tel"/>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--text-4)"}}/>
                  <input type={showPwd?"text":"password"} name="pwd" placeholder="Password" value={pwd} onChange={hPwd} required autoComplete="new-password" className="auth-input w-full" style={{paddingLeft:42,paddingRight:46}}/>
                  <button type="button" onClick={()=>setShowPwd(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center" style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-4)"}}>
                    {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
                <StrengthBar pwd={pwd}/>
                <Field name="cpwd" placeholder="Confirm Password" icon={Lock} value={cpwd} onChange={hCpwd} type="password"/>

                <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                  <input type="checkbox" checked={terms} onChange={e=>{setTerms(e.target.checked);setErr("");}}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer" style={{accentColor:"var(--accent)",flexShrink:0}}/>
                  <span style={{fontSize:12,color:"var(--text-3)"}}>
                    I agree to{" "}
                    <span style={{color:"var(--accent)",fontWeight:600,cursor:"pointer"}} onClick={e=>{e.preventDefault();alert("Terms coming soon!");}}>Terms</span>
                    {" "}&amp;{" "}
                    <span style={{color:"var(--accent)",fontWeight:600,cursor:"pointer"}} onClick={e=>{e.preventDefault();alert("Privacy coming soon!");}}>Privacy</span>
                  </span>
                </label>
              </div>

              <AnimatePresence>
                {err&&<motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-3 text-sm text-center py-2.5 rounded-xl" style={{color:"#f43f5e",background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.2)"}}>{err}</motion.div>}
              </AnimatePresence>

              <div className="mt-4">
                <motion.button type="submit" disabled={loading} whileTap={!loading?{scale:.98}:{}} className="btn-primary" style={{borderRadius:13}}>
                  {loading
                    ? <motion.span className="flex items-center gap-2"><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:"linear"}} style={{display:"inline-flex"}}><Shield size={15}/></motion.span>CREATING…</motion.span>
                    : <><span>CREATE ACCOUNT</span><ArrowRight size={14}/></>}
                </motion.button>
              </div>
            </form>
          )}

          {!success&&(
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
                Sign up with Google
              </motion.button>
              <p className="text-xs mt-5 text-center" style={{color:"var(--text-3)"}}>
                Already registered?{" "}<span onClick={()=>nav("/login")} className="font-semibold cursor-pointer" style={{color:"var(--accent)"}}>Log in</span>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
