# 🚨 IMMEDIATE HELP - Can't Connect from iPhone

## Your Windows PC is running the server but iPhone can't connect?

### ⚡ FASTEST FIX - Windows Firewall (90% of issues)

**Open Command Prompt as Administrator:**
1. Press `Win + X`
2. Click "Terminal (Admin)" or "Command Prompt (Admin)"
3. Copy and paste this:
   ```cmd
   netsh advfirewall firewall add rule name="FileTransferPort3000" dir=in action=allow protocol=TCP localport=3000
   ```
4. Press Enter
5. Try connecting from iPhone again!

---

## 🔍 Find Your Windows PC's IP Address

**Method 1 - Command Prompt:**
```cmd
ipconfig
```
Look for: **Wireless LAN adapter Wi-Fi → IPv4 Address**
Example: `192.168.1.100`

**Method 2 - Quick:**
```cmd
ipconfig | findstr "IPv4 Wireless"
```

---

## 📱 Connect from iPhone

1. **Make sure iPhone is on the SAME WiFi** as Windows PC
2. Open **Safari** (not Chrome!)
3. Type your Windows PC's IP with :3000
   - Example: `http://192.168.1.100:3000`
4. Press **Go**

---

## ✅ Quick Checklist

Run through these 5 things:

### 1. Server Running?
On Windows, you should see:
```
=================================
📱 File Transfer Server Running
=================================
Network: http://192.168.x.x:3000
```

❌ Not seeing this? Run: `npm start`

### 2. Test Locally First
On Windows PC, open browser:
- Go to: `http://localhost:3000`
- Does it load? ✅ Server works, issue is network/firewall
- Doesn't load? ❌ Server issue, reinstall Node.js

### 3. Firewall Rule Added?
Run the command above in Admin Command Prompt

### 4. Same Network?
- Windows IP: `192.168.1.100` (example)
- iPhone IP should be: `192.168.1.X` (first 3 parts match!)
- Check iPhone: Settings → WiFi → (i) icon → IP Address

### 5. Network Type?
- Settings → Network & Internet → WiFi
- Click your network → Select **"Private"** (not Public!)

---

## 🔧 Still Not Working?

### Try ALL these URLs from iPhone:

On Windows PC, open browser:
```
http://localhost:3000/diagnostics.html
```

This page shows ALL possible URLs to try!

### Common Problems:

**"This site can't be reached"**
- → Firewall is blocking
- → Not on same network
- → Wrong IP address

**"Connection timeout"**
- → Firewall issue (run the command above)
- → VPN is running (disable it)

**"Connection refused"**
- → Server not running (check Windows terminal)
- → Wrong port (make sure :3000 is in URL)

---

## 🆘 Nuclear Option - Temporarily Disable Firewall

**ONLY FOR TESTING! Turn it back on after!**

1. Press `Win + R`
2. Type: `firewall.cpl`
3. Click "Turn Windows Defender Firewall on or off"
4. Select "Turn off" for **Private networks ONLY**
5. Try connecting from iPhone
6. If it works → Firewall was the issue
7. **TURN FIREWALL BACK ON!**
8. Use the proper firewall rule command above instead

---

## 📞 More Help

- **Full Windows Guide:** See `WINDOWS_SETUP.md`
- **Complete Troubleshooting:** See `TROUBLESHOOTING.md`
- **Diagnostics Tool:** `http://localhost:3000/diagnostics.html`

---

## 💡 Pro Tip

Once it works, bookmark the URL in Safari and add to Home Screen!
Then it's one tap to transfer files! 🚀
