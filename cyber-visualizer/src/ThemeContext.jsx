import React, { createContext, useContext, useState, useEffect } from "react";
const Ctx = createContext();
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => (localStorage.getItem("ecebip-theme")||"dark") === "dark");
  useEffect(() => {
    localStorage.setItem("ecebip-theme", dark?"dark":"light");
    document.documentElement.setAttribute("data-theme", dark?"dark":"light");
    document.body.style.backgroundColor = dark?"#060d1f":"#dde8f5";
  }, [dark]);
  return <Ctx.Provider value={{ dark, toggle: () => setDark(d=>!d) }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
