const USERS_KEY   = "ecebip_users_db";
const SESSION_KEY = "ecebip_session";

export const getAllUsers  = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)||"[]"); } catch { return []; } };
export const getSession   = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); } catch { return null; } };

export function saveUser(data) {
  const users = getAllUsers();
  const idx   = users.findIndex(u => u.email === data.email);
  if (idx >= 0) users[idx] = { ...users[idx], ...data };
  else users.push(data);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(loginId, password) {
  return getAllUsers().find(u =>
    !u.isGuest && (u.email === loginId || u.username === loginId) && u.password === password
  ) || null;
}

export function findGovUser(govId, password) {
  return getAllUsers().find(u => u.govId === govId && u.password === password && u.role === "government") || null;
}

export function setSession(user) {
  if (user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); localStorage.setItem("user", JSON.stringify(user)); }
  else       { localStorage.removeItem(SESSION_KEY); localStorage.removeItem("user"); }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("user");
}

export function seedGovAccount() {
  const exists = getAllUsers().some(u => u.role === "government");
  if (!exists) saveUser({ name:"Ministry of Cyber Security", email:"gov.admin@cert-in.gov.in", username:"gov_admin",
    govId:"GOV-CERT-001", password:"gov@secure123", role:"government", department:"CERT-In, MeitY",
    clearance:"TOP SECRET", isGuest:false, createdAt:new Date().toISOString() });
}
