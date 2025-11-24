# 🪟 Windows Quick Start Guide

## Starting the Server on Windows

### 1. Install Node.js (First Time Only)
1. Download from: https://nodejs.org/
2. Install the LTS version
3. Restart your computer

### 2. Get the Project
```cmd
# If you have git:
git clone https://github.com/dpei0287/file-transfer-app.git
cd file-transfer-app
npm install

# Or download ZIP from GitHub and extract
```

### 3. Start the Server
```cmd
cd file-transfer-app
npm start
```

You should see:
```
=================================
📱 File Transfer Server Running
=================================
Local:   http://localhost:3000
Network: http://192.168.x.x:3000
```

---

## ⚠️ Windows Firewall Setup (REQUIRED!)

**The #1 reason connections fail on Windows is the firewall!**

### Option 1: Quick Command (Easiest)

1. Right-click **Start Menu** → **Terminal (Admin)** or **Command Prompt (Admin)**
2. Copy and paste this command:
   ```cmd
   netsh advfirewall firewall add rule name="Node.js File Transfer" dir=in action=allow protocol=TCP localport=3000
   ```
3. Press Enter
4. You should see: "Ok."

### Option 2: GUI Method

1. Press `Win + R`, type `wf.msc`, press Enter
2. Click **Inbound Rules** (left sidebar)
3. Click **New Rule...** (right sidebar)
4. Select **Port** → Next
5. Select **TCP** and type `3000` in "Specific local ports" → Next
6. Select **Allow the connection** → Next
7. Check all boxes (Domain, Private, Public) → Next
8. Name it "File Transfer Server" → Finish

---

## 📱 Connecting from iPhone

### Step 1: Find Your Windows PC's IP
In Command Prompt:
```cmd
ipconfig
```

Look for this section:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . : 192.168.1.100
```

Your IP is the number after "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: On Your iPhone
1. Open **Safari**
2. Type: `http://192.168.1.100:3000` (use YOUR IP)
3. Press **Go**
4. You should see the file transfer page!

### Step 3: Bookmark It
- Tap the **Share** button
- Select **Add to Home Screen**
- Now you have an app icon!

---

## 🔧 If It Still Doesn't Work

### Test 1: Check Server Locally
On your Windows PC, open browser and go to:
- `http://localhost:3000`

If this works ✅ → Server is fine, firewall is the issue
If this fails ❌ → Server problem, try reinstalling Node.js

### Test 2: Check Firewall Status
```cmd
netsh advfirewall show allprofiles state
```

### Test 3: See All Possible URLs
On Windows PC, open browser:
- `http://localhost:3000/diagnostics.html`

This shows all available IPs to try!

### Test 4: Verify Same Network
Windows IP should start with same numbers as iPhone IP:
- Windows: `192.168.1.100` ← First 3 parts
- iPhone: `192.168.1.X` ← Should match!

**Check iPhone IP:**
Settings → WiFi → Tap (i) icon → See IP Address

### Test 5: Network Profile
Make sure Windows is on "Private" network (not Public):
1. Settings → Network & Internet → WiFi
2. Click your connected network
3. Select **Private** under "Network profile type"

---

## 🚫 Common Issues

### "Can't connect to server"
- ✅ Firewall rule added?
- ✅ Server running? (Look for the running message)
- ✅ Both on same WiFi?
- ✅ Network set to "Private"?

### "Connection timeout"
- Usually means firewall is blocking
- Double-check firewall steps above

### Port 3000 already in use?
Edit `server.js`:
```javascript
const PORT = 8080; // Change from 3000 to 8080
```
Then use `http://YOUR-IP:8080` instead

---

## 💡 Pro Tips

### Keep Server Running
Create a batch file `start-server.bat`:
```batch
@echo off
cd C:\path\to\file-transfer-app
npm start
pause
```
Double-click to start!

### Prevent PC from Sleeping
- Settings → System → Power & sleep
- Set "When plugged in, PC goes to sleep after" to **Never**

### Use Static IP (Advanced)
- Settings → Network & Internet → WiFi
- Click Properties → Edit IP assignment
- Set to Manual and assign a static IP
- Your URL will never change!

---

## ✅ Success Checklist

Before asking for help, verify:

- [ ] Node.js is installed (`node --version` shows a version)
- [ ] Dependencies installed (`npm install` completed)
- [ ] Server is running (shows the "Server Running" message)
- [ ] Firewall rule added (command completed successfully)
- [ ] Network profile is "Private" (not Public)
- [ ] Can access `http://localhost:3000` from Windows
- [ ] Found IP address with `ipconfig`
- [ ] iPhone is on same WiFi network
- [ ] iPhone IP matches Windows IP range (e.g., both 192.168.1.x)
- [ ] Tried accessing `http://YOUR-IP:3000` from iPhone Safari

If all checked ✅ and still not working, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🆘 Need More Help?

- **Full troubleshooting guide:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Diagnostics page:** Open `http://localhost:3000/diagnostics.html` on Windows
- **GitHub Issues:** https://github.com/dpei0287/file-transfer-app/issues

---

## 🎯 Quick Commands Reference

```cmd
# Find your IP
ipconfig

# Just WiFi IP
ipconfig | findstr "IPv4 Wireless"

# Check if port 3000 is in use
netstat -an | findstr :3000

# Add firewall rule
netsh advfirewall firewall add rule name="File Transfer" dir=in action=allow protocol=TCP localport=3000

# Remove firewall rule (if needed)
netsh advfirewall firewall delete rule name="File Transfer"

# Check Node.js version
node --version

# Check npm version
npm --version
```

---

**Good luck! 🎉 Once set up, it works great!**
