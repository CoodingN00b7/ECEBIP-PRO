# 🛡️ Cyber Attack Visualizer

<p align="center">
<img src="https://img.shields.io/badge/Cybersecurity-Threat%20Intelligence-red?style=for-the-badge">
<img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react">
<img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js">
<img src="https://img.shields.io/badge/Express.js-API-lightgrey?style=for-the-badge">
<img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite">
<img src="https://img.shields.io/badge/Cyber-Threat%20Detection-black?style=for-the-badge">
</p>

<p align="center">
A real-time cybersecurity intelligence dashboard for detecting exposed data, malicious IPs, and suspicious URLs using global threat intelligence APIs.
</p>

---

# 🌍 Overview

**Cyber Attack Visualizer** is a cybersecurity analysis platform that allows users to scan digital identifiers and determine whether they are associated with **data breaches, malicious activity, or security threats**.

The system integrates **multiple threat intelligence APIs** and also supports **local SQLite database scanning** for offline exposure detection.

---

# 🚀 Features

* 📧 **Email Breach Detection** using LeakData
* 📱 **Phone Number Intelligence** using NumVerify
* 🌐 **IP Reputation Analysis** using AbuseIPDB
* 🔗 **Malicious URL Detection** using VirusTotal
* 🪪 **Aadhaar Exposure Lookup** using SQLite local database
* 💳 **PAN Exposure Detection** using SQLite local database
* 🔁 **API / Local Database Toggle Mode**
* 📊 **Cyber Threat Intelligence Dashboard**

---

# 🧰 Tech Stack

**Frontend**

* React.js
* JavaScript
* TailwindCSS
* Framer Motion

**Backend**

* Node.js
* Express.js

**Database**

* SQLite

---

# 🔗 APIs Used

| API        | Purpose                 |
| ---------- | ----------------------- |
| LeakData   | Email breach detection  |
| AbuseIPDB  | Malicious IP analysis   |
| VirusTotal | URL malware scanning    |
| NumVerify  | Phone number validation |

---

# 🏗️ System Architecture

```
User (Browser)
      │
      ▼
React Frontend
      │
      ▼
Node.js + Express Backend
      │
 ┌────┼───────┬────────┐
 ▼    ▼       ▼        ▼
LeakData  AbuseIPDB  VirusTotal  NumVerify
   API        API        API        API
      │
      ▼
SQLite Database
(Local Exposure Records)
```

---

# ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/CoodingN00b7/ECIBP-PRO.git
cd cyber-attack-visualizer
```

### Install Dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd ../frontend
npm install
```

---

# 🔑 Environment Variables

Create `.env` inside **backend**

```
PORT=5000

LEAKDATA_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key
VIRUSTOTAL_API_KEY=your_key
NUMVERIFY_API_KEY=your_key
```

---

# ▶️ Run Project

Start backend

```
npm start
```

Start frontend

```
npm run dev
```

---

# ⚠️ Disclaimer

This project is built **for educational and research purposes only**.
Do not use it to analyze or scan data without authorization.

---

# 👨‍💻 Author

**Fardeen Akmal**
