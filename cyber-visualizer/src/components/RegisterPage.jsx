import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Lock, User, Smartphone, AtSign, ArrowRight, Sun, Moon, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { saveUser, getAllUsers } from "../userStorage";

function InputField({ name, placeholder, type, icon: Icon, value, onChange, accent }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
        style={{ color: focused ? (accent||"var(--accent)") : "var(--text-faint)" }}/>
      <input
        type={type || "text"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete={type === "password" ? "new-password" : "off"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="auth-input w-full pl-10 pr-3 py-3"
        style={{ fontSize: 14 }}
      />
    </div>
  );
}

/* Password strength meter */
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ chars",      pass: password.length >= 8       },
    { label: "Uppercase",     pass: /[A-Z]/.test(password)     },
    { label: "Number",        pass: /\d/.test(password)        },
    { label: "Symbol",        pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["#f43f5e","#f97316","#eab308","#22c55e"];
  const labels = ["Weak","Fair","Good","Strong"];
  if (!password) return null;
  return (
    <div className="mt-1.5 px-0.5">
      <div className="flex gap-1 mb-1.5">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score-1] : "var(--border)" }}/>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize:10, fontFamily:"IBM Plex Mono", color: score > 0 ? colors[score-1] : "var(--text-faint)" }}>
          {score > 0 ? labels[score-1] : "Enter password"}
        </span>
        <div className="flex gap-2">
          {checks.map(c => (
            <span key={c.label} className="flex items-center gap-0.5" style={{ fontSize:9, fontFamily:"IBM Plex Mono", color: c.pass ? "#22c55e" : "var(--text-faint)" }}>
              <CheckCircle size={9} style={{ opacity: c.pass ? 1 : .35 }}/>{c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [name,            setName]            = useState("");
  const [username,        setUsername]        = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms,      setAgreeTerms]      = useState(false);
  const [showPwd,         setShowPwd]         = useState(false);
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);

  const hName    = useCallback(e => { setName(e.target.value);            setError(""); }, []);
  const hUser    = useCallback(e => { setUsername(e.target.value);        setError(""); }, []);
  const hEmail   = useCallback(e => { setEmail(e.target.value);           setError(""); }, []);
  const hPhone   = useCallback(e => { setPhone(e.target.value);           setError(""); }, []);
  const hPwd     = useCallback(e => { setPassword(e.target.value);        setError(""); }, []);
  const hConfirm = useCallback(e => { setConfirmPassword(e.target.value); setError(""); }, []);

  const handleRegister = e => {
    e.preventDefault();
    if (!agreeTerms)                        return setError("You must agree to the Terms & Privacy Policy.");
    if (password !== confirmPassword)       return setError("Passwords do not match.");
    if (password.length < 6)               return setError("Password must be at least 6 characters.");
    // Check duplicate email
    const existing = getAllUsers().find(u => u.email === email || u.username === username);
    if (existing)                           return setError("An account with this email or username already exists.");

    setLoading(true);
    setTimeout(() => {
      saveUser({
        name, username, email, phone, password,
        isGuest: false, role: "Analyst", department: "Cyber Security",
        clearance: "STANDARD", createdAt: new Date().toISOString(),
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 transition-colors duration-300"
      style={{ background:"var(--bg-base)", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position:"absolute", top:"-20%", right:"-10%", width:"55%", height:"55%", background: dark?"radial-gradient(ellipse,rgba(99,102,241,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(8,145,178,.1) 0%,transparent 70%)", filter:"blur(80px)" }}/>
        <div style={{ position:"absolute", bottom:"-20%", left:"-10%", width:"55%", height:"55%", background: dark?"radial-gradient(ellipse,rgba(56,189,248,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(14,120,200,.1) 0%,transparent 70%)", filter:"blur(80px)" }}/>
      </div>

      {/* Theme toggle */}
      <motion.button onClick={toggle} whileHover={{scale:1.1}} whileTap={{scale:.9}}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background:"var(--bg-glass)", border:"1px solid var(--border)", color: dark?"#fbbf24":"var(--text-muted)" }}>
        <AnimatePresence mode="wait">
          <motion.span key={dark?"s":"m"} initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:.18}}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <motion.div initial={{opacity:0,y:30,scale:.97}} animate={{opacity:1,y:0,scale:1}}
        transition={{type:"spring",stiffness:260,damping:24}}
        className="relative z-10 w-full max-w-md px-4">

        <div className="glass-2 rounded-2xl p-8 shadow-2xl" style={{ border:"1px solid var(--border-glow)" }}>

          {/* Logo */}
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:.1}}
            className="flex flex-col items-center gap-2 mb-6">
            <div className="relative float-anim">
              <div style={{ position:"absolute", inset:-4, background:"var(--accent-soft)", borderRadius:"50%", filter:"blur(10px)" }}/>
              <Shield className="relative z-10 w-11 h-11" style={{ color:"var(--accent)", filter:"drop-shadow(0 0 16px var(--accent))" }}/>
            </div>
            <div className="text-center mt-1">
              <h1 className="text-xl font-black tracking-widest" style={{ color:"var(--text-primary)" }}>CREATE ACCOUNT</h1>
              <p className="text-[11px] mt-0.5 font-medium tracking-wide uppercase" style={{ color:"var(--text-muted)" }}>
                Join the ECEBIP PRO network
              </p>
            </div>
          </motion.div>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} className="text-center py-6">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300,delay:.1}}>
                  <CheckCircle size={48} className="mx-auto mb-3" style={{color:"#22c55e"}}/>
                </motion.div>
                <p className="font-bold text-lg" style={{color:"var(--text-primary)"}}>Account Created!</p>
                <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>Redirecting to login…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleRegister}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField name="name"     placeholder="Full Name"  icon={User}       value={name}     onChange={hName}/>
                  <InputField name="username" placeholder="Username"   icon={AtSign}     value={username} onChange={hUser}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField name="email"    placeholder="Email"      icon={Mail}       value={email}    onChange={hEmail}  type="email"/>
                  <InputField name="phone"    placeholder="Phone"      icon={Smartphone} value={phone}    onChange={hPhone}  type="tel"/>
                </div>

                {/* Password with toggle */}
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--text-faint)"}}/>
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password" placeholder="Password"
                    value={password} onChange={hPwd} required autoComplete="new-password"
                    className="auth-input w-full pl-10 pr-10 py-3" style={{fontSize:14}}/>
                  <button type="button" onClick={()=>setShowPwd(v=>!v)}
                    style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-faint)"}}>
                    {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                <PasswordStrength password={password}/>

                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--text-faint)"}}/>
                  <input
                    type="password" name="confirmPassword" placeholder="Confirm Password"
                    value={confirmPassword} onChange={hConfirm} required autoComplete="new-password"
                    className="auth-input w-full pl-10 pr-3 py-3" style={{fontSize:14}}/>
                </div>

                {/* Terms */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
                  <input type="checkbox" checked={agreeTerms}
                    onChange={e=>{setAgreeTerms(e.target.checked);setError("");}}
                    className="w-4 h-4 rounded cursor-pointer" style={{accentColor:"var(--accent)"}}/>
                  <span style={{fontSize:11,color:"var(--text-muted)"}}>
                    I agree to{" "}
                    <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}} onClick={e=>{e.preventDefault();alert("Terms coming soon!");}}>Terms</span>
                    {" "}&amp;{" "}
                    <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}} onClick={e=>{e.preventDefault();alert("Privacy policy coming soon!");}}>Privacy Policy</span>
                  </span>
                </label>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    className="mt-3 text-[11px] text-center py-2 rounded-xl"
                    style={{color:"#f43f5e",background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.2)"}}>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4">
                <motion.button type="submit" disabled={loading}
                  whileHover={!loading?{scale:1.01}:{}} whileTap={!loading?{scale:.98}:{}}
                  className="btn-primary" style={{borderRadius:13,padding:"13px 0",fontSize:14}}>
                  {loading ? (
                    <motion.span className="flex items-center gap-2">
                      <motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:"linear"}} style={{display:"inline-flex"}}>
                        <Shield size={15}/>
                      </motion.span>
                      CREATING ACCOUNT…
                    </motion.span>
                  ) : (
                    <><span>CREATE ACCOUNT</span><ArrowRight size={14}/></>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          {/* Divider */}
          {!success && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{background:"var(--divider)"}}/>
                <span style={{fontSize:10,letterSpacing:".12em",color:"var(--text-faint)",textTransform:"uppercase",fontFamily:"IBM Plex Mono"}}>or</span>
                <div className="flex-1 h-px" style={{background:"var(--divider)"}}/>
              </div>
              <motion.button type="button" onClick={()=>alert("Google OAuth pending!")}
                whileHover={{scale:1.01}} whileTap={{scale:.98}}
                className="w-full py-3 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{background:"var(--bg-inset)",border:"1px solid var(--border)",color:"var(--text-primary)"}}>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </motion.button>

              <p className="text-[11px] mt-5 text-center" style={{color:"var(--text-muted)"}}>
                Already have an account?{" "}
                <span onClick={()=>navigate("/login")} className="font-semibold cursor-pointer transition-colors" style={{color:"var(--accent)"}}>Log in</span>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
