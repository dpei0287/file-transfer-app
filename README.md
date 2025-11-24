# 📱 Local WiFi File Transfer App

Transfer photos and videos from your iPhone to your laptop over your local WiFi network - **no internet data usage!**

## ✨ Features

- 📤 Upload photos and videos from iPhone to laptop
- 📁 Automatic organization by creation date (YYYY-MM-DD folders)
- 📊 Real-time upload progress tracking
- 📈 Statistics showing uploaded files by date
- 🎨 Mobile-optimized interface
- 🚀 No internet required - works on local network only
- 💾 Supports large files (up to 500MB per file)
- 📷 Extracts EXIF data from photos for accurate dating

## 🚀 Quick Start

### 1. Install Dependencies

First, make sure you have Node.js installed on your laptop. Then run:

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

You'll see output like this:

```
=================================
📱 File Transfer Server Running
=================================
Local:   http://localhost:3000
Network: http://192.168.1.100:3000

Connect from your iPhone using the Network URL
=================================
```

### 3. Connect from iPhone

1. Make sure your iPhone and laptop are on the **same WiFi network**
2. Open Safari (or any browser) on your iPhone
3. Type the **Network URL** shown in your terminal (e.g., `http://192.168.1.100:3000`)
4. Bookmark the page for easy access!

### 4. Upload Files

1. Tap "Tap to Select Files" or use the camera button in Safari
2. Select photos/videos from your library or take new ones
3. Review selected files
4. Tap "Upload" button
5. Watch the progress bar
6. Files are automatically organized by date!

## 📂 File Organization

Files are saved in the `uploads` folder, organized by the date they were created:

```
uploads/
├── 2024-11-20/
│   ├── IMG_1234.jpg
│   └── VID_5678.mov
├── 2024-11-21/
│   ├── IMG_2345.jpg
│   └── IMG_2346.jpg
└── 2024-11-22/
    └── VID_6789.mov
```

## 🔧 Configuration

### Change Port

Edit `server.js` and change the `PORT` constant:

```javascript
const PORT = 3000; // Change to your preferred port
```

### Change Upload Limit

Edit `server.js` and modify the multer configuration:

```javascript
limits: {
  fileSize: 500 * 1024 * 1024 // 500MB limit per file
}
```

### Change Max Files per Upload

Edit `server.js` in the upload endpoint:

```javascript
app.post('/upload', upload.array('files', 50), // Change 50 to your limit
```

## 🛠️ Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

## 📱 iPhone Tips

1. **Add to Home Screen**: In Safari, tap the share button and select "Add to Home Screen" for quick access
2. **Camera Access**: When selecting files, tap "Photo Library" to access existing photos, or "Take Photo" to capture new ones
3. **Multiple Files**: You can select multiple files at once by tapping multiple photos in the selection screen
4. **Background Upload**: The upload will continue even if you switch apps (but don't close Safari completely)

## 🔒 Security Notes

- This server is designed for **local network use only**
- It binds to `0.0.0.0` to accept connections from other devices on your network
- **Do NOT** expose this server to the internet without adding authentication
- The server has no authentication - anyone on your local network can access it

## 🐛 Troubleshooting

### Can't connect from iPhone?

1. Verify both devices are on the same WiFi network
2. Check your laptop's firewall settings - it may be blocking port 3000
3. Try disabling VPN on either device
4. Make sure the server is running (`npm start`)

### Files not organizing by date?

- JPEGs with EXIF data will use the photo's creation date
- Videos and photos without EXIF data will use the file's creation timestamp
- The date is determined when the file is uploaded, not when it was originally created on your phone

### Upload fails?

- Check file size - must be under 500MB per file
- Ensure you're not uploading more than 50 files at once
- Check that your laptop has enough disk space

### Finding Your Local IP (if needed)

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for the IPv4 Address on your WiFi adapter (usually starts with 192.168.x.x or 10.x.x.x)

## 📝 Package Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart

## 🎯 Use Cases

- Transfer photos after a trip without using iCloud
- Quick backup of important photos/videos
- Send large video files without email size limits
- Organize photos by date automatically
- Save phone storage by moving files to laptop

## 📦 Dependencies

- **express** - Web server framework
- **multer** - Handle file uploads
- **exif-parser** - Extract EXIF data from photos

## 📄 License

MIT

## 🤝 Contributing

Feel free to customize this app for your needs! Common modifications:
- Add authentication
- Support for other file types
- Different folder organization schemes
- File preview/gallery view
- Duplicate detection

---

**Enjoy your data-free file transfers! 🎉**
