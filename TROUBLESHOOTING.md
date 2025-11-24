# 🔧 Troubleshooting Connection Issues

## Quick Checklist

When you can't connect to the server from your iPhone or another device, follow these steps:

### 1. ✅ Verify the Server is Running

On your Windows PC, check that you see:
```
=================================
📱 File Transfer Server Running
=================================
Local:   http://localhost:3000
Network: http://192.168.x.x:3000
```

If not, run `npm start` in the project directory.

### 2. 🌐 Check Both Devices Are on the Same WiFi Network

**On Windows PC:**
- Open Command Prompt (cmd)
- Type: `ipconfig`
- Look for "IPv4 Address" under your WiFi adapter (usually starts with 192.168.x.x or 10.x.x.x)

**On iPhone:**
- Settings → WiFi → Tap the (i) icon next to your connected network
- Check the IP address (should have the same first 3 numbers as your PC)
- Example: PC is 192.168.1.100, iPhone should be 192.168.1.xxx

### 3. 🔥 Windows Firewall (MOST COMMON ISSUE)

Windows Firewall often blocks Node.js by default.

**Option A: Allow Node.js through Firewall (Recommended)**

1. Open **Windows Defender Firewall with Advanced Security**
   - Press `Win + R`, type `wf.msc`, press Enter
   
2. Click **Inbound Rules** on the left

3. Click **New Rule** on the right

4. Select **Program** → Next

5. Select **This program path** → Browse to:
   ```
   C:\Program Files\nodejs\node.exe
   ```
   (Or wherever Node.js is installed)

6. Select **Allow the connection** → Next

7. Check all boxes (Domain, Private, Public) → Next

8. Give it a name: "Node.js File Transfer Server" → Finish

**Option B: Quick Test (Temporary)**

1. Press `Win + R`, type `firewall.cpl`, press Enter
2. Click **Turn Windows Defender Firewall on or off**
3. Select **Turn off** for Private networks (ONLY FOR TESTING!)
4. Try connecting from iPhone
5. **IMPORTANT:** Turn the firewall back on after testing!

**Option C: Add Port Exception**

1. Open Command Prompt as Administrator
2. Run:
   ```cmd
   netsh advfirewall firewall add rule name="File Transfer App" dir=in action=allow protocol=TCP localport=3000
   ```

### 4. 🔌 Test Network Connectivity

**From Windows PC:**
1. Open Command Prompt
2. Type: `ipconfig` and note your IPv4 address (e.g., 192.168.1.100)
3. Open browser and go to: `http://localhost:3000`
4. If this works, the server is fine. The issue is network/firewall.

**From iPhone:**
1. Open Safari
2. Try: `http://[PC-IP-ADDRESS]:3000` (e.g., `http://192.168.1.100:3000`)
3. Wait 10-30 seconds for timeout

### 5. 📱 Ping Test

**From Windows PC to iPhone:**
1. Find iPhone's IP: Settings → WiFi → (i) icon
2. In Command Prompt on PC: `ping [iPhone-IP]`
3. Should see replies. If "Request timed out", network issue exists.

**From iPhone to Windows PC:**
- Download "Network Ping Lite" or "Ping" app from App Store
- Ping your Windows PC's IP address
- Should see successful pings

### 6. 🔍 Check Antivirus Software

Some antivirus software blocks incoming connections:
- **Norton, McAfee, Kaspersky, etc.** may block Node.js
- Temporarily disable antivirus to test
- If it works, add an exception for Node.js or port 3000

### 7. 📡 VPN Issues

**On Windows PC:**
- If you're running a VPN, it may block local network access
- Try disconnecting VPN temporarily
- Or configure VPN to allow local network traffic

**On iPhone:**
- Disable any VPN apps
- Disable iCloud Private Relay: Settings → Apple ID → iCloud → Private Relay → Off

### 8. 🏠 Router Configuration

Some routers have "AP Isolation" or "Client Isolation" enabled:
- This prevents devices from talking to each other
- Common in guest WiFi networks
- Solution: Connect both devices to main WiFi network (not guest network)
- Or disable AP Isolation in router settings

### 9. 🖥️ Windows Network Profile

Ensure Windows is using "Private" network profile:
1. Settings → Network & Internet → WiFi
2. Click your connected network
3. Under "Network profile type", select **Private**
4. Public networks block most incoming connections!

### 10. 🔄 Alternative: Use Laptop's IP

If Windows PC has multiple network adapters:
1. Run `ipconfig` in Command Prompt
2. You might see multiple IPv4 addresses
3. Try each one from your iPhone
4. Look for:
   - Wireless LAN adapter Wi-Fi
   - Ethernet adapter (if wired)

---

## 🚀 Quick Commands Reference

### Windows Command Prompt Commands:

```cmd
# Find your IP address
ipconfig

# Find just the WiFi IP
ipconfig | findstr /i "IPv4 Wireless"

# Test if server is listening
netstat -an | findstr :3000

# Check firewall status
netsh advfirewall show allprofiles

# Allow port 3000 through firewall
netsh advfirewall firewall add rule name="File Transfer Port" dir=in action=allow protocol=TCP localport=3000

# Remove firewall rule
netsh advfirewall firewall delete rule name="File Transfer Port"
```

### Test Server Locally:

```cmd
# On Windows, open browser to:
http://localhost:3000
http://127.0.0.1:3000
```

---

## 🎯 Step-by-Step Debugging

### Step 1: Confirm Server is Running
```cmd
cd path\to\file-transfer-app
npm start
```
Should see the server running message.

### Step 2: Test Locally
Open browser on Windows PC: `http://localhost:3000`
- ✅ Works → Server is good, issue is network
- ❌ Fails → Server issue, check Node.js installation

### Step 3: Find Your IP
```cmd
ipconfig
```
Look for "Wireless LAN adapter Wi-Fi" → "IPv4 Address"

### Step 4: Test from PC Browser
On Windows PC, open browser: `http://192.168.1.xxx:3000` (use your IP)
- ✅ Works → Server and network good, likely firewall
- ❌ Fails → Server not binding to network interface

### Step 5: Check Firewall
See section 3 above - Allow Node.js through firewall

### Step 6: Test from iPhone
Safari → `http://192.168.1.xxx:3000`
- ✅ Works → Success! 🎉
- ❌ Fails → Check same network, router settings

---

## 🆘 Still Not Working?

### Check Server is Binding to All Interfaces

The server should be listening on `0.0.0.0:3000`, not `127.0.0.1:3000`.

In Command Prompt:
```cmd
netstat -an | findstr :3000
```

Should show:
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING
```

If you see `127.0.0.1:3000` instead, the server is only listening locally.

### Verify Node.js Installation

```cmd
node --version
npm --version
```

Both should show version numbers.

### Try Different Port

If port 3000 is blocked, try another port:
1. Edit `server.js`
2. Change `const PORT = 3000;` to `const PORT = 8080;`
3. Restart server
4. Try: `http://[PC-IP]:8080`

---

## 📞 Common Error Messages

### "This site can't be reached" / "Safari cannot connect"
- **Cause:** Firewall blocking, wrong IP, or not on same network
- **Fix:** Check firewall (section 3), verify IPs match network range

### "Connection timeout"
- **Cause:** Server not running, wrong port, or firewall
- **Fix:** Verify server is running, check port 3000 is correct

### "Connection refused"
- **Cause:** Server stopped or wrong port
- **Fix:** Restart server with `npm start`

### "Network error" / ERR_CONNECTION_REFUSED
- **Cause:** Server not accessible on network
- **Fix:** Check firewall and network profile (Private vs Public)

---

## ✅ Success Checklist

- [ ] Server running on Windows PC (`npm start` shows running message)
- [ ] Both devices on same WiFi network
- [ ] IP addresses in same range (e.g., both 192.168.1.x)
- [ ] Windows Firewall allows Node.js or port 3000
- [ ] Antivirus not blocking connections
- [ ] No VPN running (or VPN allows local network)
- [ ] Windows network profile set to "Private"
- [ ] Can access `http://localhost:3000` from Windows PC
- [ ] Can access `http://[PC-IP]:3000` from Windows PC
- [ ] Can ping Windows PC from iPhone
- [ ] Can access `http://[PC-IP]:3000` from iPhone

If all checked ✅, it should work! 🎉

---

## 💡 Pro Tips

1. **Bookmark the URL** on your iPhone for quick access
2. **Add to Home Screen** in Safari for app-like experience
3. **Keep Windows PC plugged in** and prevent sleep mode
4. **Use static IP** on Windows for consistent address
5. **Create Windows shortcut** to start server quickly

---

## 🔒 Security Reminder

When allowing Node.js through the firewall:
- Only enable on "Private" networks
- Don't enable on "Public" networks
- Your local network is relatively safe
- No authentication is implemented
- Anyone on your WiFi can access the server
