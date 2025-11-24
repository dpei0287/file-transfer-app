const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const exifParser = require('exif-parser');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
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

// Upload endpoint
app.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get device name prefix from request body
    const devicePrefix = req.body.devicePrefix || '';

    const results = [];

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

        // Move file to date folder
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
      files: results
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
