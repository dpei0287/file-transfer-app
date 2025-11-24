const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const exifParser = require('exif-parser');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Configuration file path
const configPath = path.join(__dirname, 'config.json');

// Load or create configuration
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  
  // Default configuration
  return {
    uploadsDir: path.join(__dirname, 'uploads')
  };
}

// Save configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

let config = loadConfig();
let uploadsDir = config.uploadsDir;

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Function to get creation date from EXIF data or file stats
function getCreationDate(file) {
  try {
    // Try to extract EXIF data for images
    if (file.mimetype.startsWith('image/')) {
      const buffer = fs.readFileSync(file.path);
      const parser = exifParser.create(buffer);
      const result = parser.parse();
      
      if (result.tags && result.tags.DateTimeOriginal) {
        return new Date(result.tags.DateTimeOriginal * 1000);
      }
    }
  } catch (error) {
    console.log('Could not extract EXIF data, using file stats');
  }
  
  // Fallback to file birth time
  const stats = fs.statSync(file.path);
  return stats.birthtime;
}

// Function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Configure multer for file uploads (temporary storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit per file
  }
});

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// API endpoint to get server info
app.get('/api/server-info', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    ip: localIp,
    port: PORT
  });
});

// API endpoint to generate QR code
app.get('/api/qrcode', async (req, res) => {
  try {
    const localIp = getLocalIpAddress();
    const url = `http://${localIp}:${PORT}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#667eea',
        light: '#ffffff'
      }
    });
    
    res.json({ qrCode: qrCodeDataUrl, url: url });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// API endpoint to get current upload path
app.get('/api/upload-path', (req, res) => {
  res.json({
    path: uploadsDir,
    exists: fs.existsSync(uploadsDir)
  });
});

// API endpoint to set upload path
app.post('/api/upload-path', (req, res) => {
  try {
    const newPath = req.body.path;
    
    if (!newPath) {
      return res.status(400).json({ error: 'Path is required' });
    }

    // Validate path exists
    if (!fs.existsSync(newPath)) {
      return res.status(400).json({ error: 'Path does not exist' });
    }

    // Validate it's a directory
    const stats = fs.statSync(newPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path must be a directory' });
    }

    // Update configuration
    config.uploadsDir = newPath;
    uploadsDir = newPath;
    
    if (saveConfig(config)) {
      res.json({ 
        success: true, 
        path: uploadsDir,
        message: 'Upload path updated successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  } catch (error) {
    console.error('Error setting upload path:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to browse directories
app.post('/api/browse-directory', (req, res) => {
  try {
    const requestedPath = req.body.path || os.homedir();
    
    // Security: Prevent accessing system files outside user directories
    const homedir = os.homedir();
    const absolutePath = path.resolve(requestedPath);
    
    if (!fs.existsSync(absolutePath)) {
      return res.status(400).json({ error: 'Path does not exist' });
    }

    const stats = fs.statSync(absolutePath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    // Read directory contents
    const items = fs.readdirSync(absolutePath)
      .filter(item => !item.startsWith('.')) // Hide hidden files
      .map(item => {
        const itemPath = path.join(absolutePath, item);
        try {
          const itemStats = fs.statSync(itemPath);
          return {
            name: item,
            path: itemPath,
            isDirectory: itemStats.isDirectory()
          };
        } catch (error) {
          return null;
        }
      })
      .filter(item => item !== null && item.isDirectory) // Only return directories
      .sort((a, b) => a.name.localeCompare(b.name));

    // Get parent directory
    const parentPath = path.dirname(absolutePath);
    
    res.json({
      currentPath: absolutePath,
      parentPath: parentPath !== absolutePath ? parentPath : null,
      directories: items
    });
  } catch (error) {
    console.error('Error browsing directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Diagnostic endpoint for troubleshooting
app.get('/api/diagnostics', (req, res) => {
  const localIp = getLocalIpAddress();
  const networkInterfaces = os.networkInterfaces();
  
  // Get all network interfaces
  const allIPs = [];
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        allIPs.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask
        });
      }
    }
  }
  
  res.json({
    serverStatus: 'running',
    platform: os.platform(),
    hostname: os.hostname(),
    primaryIP: localIp,
    port: PORT,
    allNetworkInterfaces: allIPs,
    nodeVersion: process.version,
    uploadsDirectory: uploadsDir,
    timestamp: new Date().toISOString(),
    urls: allIPs.map(ip => `http://${ip.address}:${PORT}`)
  });
});

// Upload endpoint
app.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get device name prefix from request body
    const devicePrefix = req.body.devicePrefix || '';

    const results = [];
    
    // Track Live Photos for reporting (but don't create subfolders)
    const livePhotoGroups = new Map();
    
    // Detect Live Photo pairs
    for (const file of req.files) {
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      const ext = path.extname(file.originalname).toLowerCase();
      
      // Check if this file has a matching pair (image + video with same name)
      const hasPair = req.files.some(f => {
        const fBaseName = path.basename(f.originalname, path.extname(f.originalname));
        const fExt = path.extname(f.originalname).toLowerCase();
        
        if (fBaseName !== baseName || f === file) return false;
        
        // Image has video pair or video has image pair
        const isImageWithVideo = ['.heic', '.heif', '.jpg', '.jpeg'].includes(ext) && 
                                  ['.mov', '.mp4'].includes(fExt);
        const isVideoWithImage = ['.mov', '.mp4'].includes(ext) && 
                                  ['.heic', '.heif', '.jpg', '.jpeg'].includes(fExt);
        
        return isImageWithVideo || isVideoWithImage;
      });
      
      if (hasPair) {
        if (!livePhotoGroups.has(baseName)) {
          livePhotoGroups.set(baseName, []);
        }
        livePhotoGroups.get(baseName).push(file.originalname);
      }
    }

    // Process all files (Live Photos and regular files together)
    for (const file of req.files) {
      try {
        // Get creation date
        const creationDate = getCreationDate(file);
        const dateFolder = formatDate(creationDate);
        
        // Create folder name with optional device prefix
        const folderName = devicePrefix ? `${dateFolder}-${devicePrefix}` : dateFolder;
        
        // Create date-based folder
        const dateFolderPath = path.join(uploadsDir, folderName);
        if (!fs.existsSync(dateFolderPath)) {
          fs.mkdirSync(dateFolderPath, { recursive: true });
        }

        // Move file directly to date folder (no subfolders)
        const newPath = path.join(dateFolderPath, file.filename);
        fs.renameSync(file.path, newPath);

        results.push({
          filename: file.originalname,
          date: folderName,
          size: file.size
        });

        console.log(`File saved: ${file.originalname} -> ${folderName}/`);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        results.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      filesProcessed: results.length,
      files: results,
      livePhotosCount: livePhotoGroups.size,
      regularFilesCount: results.length - (livePhotoGroups.size * 2)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Get upload statistics
app.get('/api/stats', (req, res) => {
  try {
    const folders = fs.readdirSync(uploadsDir).filter(item => {
      const itemPath = path.join(uploadsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    const stats = folders.map(folder => {
      const folderPath = path.join(uploadsDir, folder);
      const files = fs.readdirSync(folderPath);
      return {
        date: folder,
        fileCount: files.length
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log('\n=================================');
  console.log('📱 File Transfer Server Running');
  console.log('=================================');
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://${localIp}:${PORT}`);
  console.log('\nConnect from your iPhone using the Network URL');
  console.log('=================================\n');
});
