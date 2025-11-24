let selectedFiles = [];

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadControls = document.getElementById('uploadControls');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const fileCount = document.getElementById('fileCount');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const message = document.getElementById('message');
const statsDiv = document.getElementById('stats');
const ipAddressEl = document.getElementById('ipAddress');
const devicePrefixInput = document.getElementById('devicePrefix');
const qrCodeImg = document.getElementById('qrCode');
const qrLoadingText = document.getElementById('qrLoading');

// Load server info
async function loadServerInfo() {
    try {
        const response = await fetch('/api/server-info');
        const data = await response.json();
        ipAddressEl.textContent = `http://${data.ip}:${data.port}`;
    } catch (error) {
        console.error('Failed to load server info:', error);
        ipAddressEl.textContent = 'Unable to load';
    }
}

// Load QR code
async function loadQRCode() {
    try {
        const response = await fetch('/api/qrcode');
        const data = await response.json();
        
        qrCodeImg.src = data.qrCode;
        qrCodeImg.style.display = 'block';
        qrLoadingText.style.display = 'none';
    } catch (error) {
        console.error('Failed to load QR code:', error);
        qrLoadingText.textContent = 'QR code unavailable';
    }
}

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// Handle selected files
function handleFiles(files) {
    const newFiles = Array.from(files);
    selectedFiles = [...selectedFiles, ...newFiles];
    updateFileList();
    updateControls();
}

// Update file list display
function updateFileList() {
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removeFile(index);
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        fileList.appendChild(fileItem);
    });
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateControls();
}

// Clear all files
clearBtn.addEventListener('click', () => {
    selectedFiles = [];
    fileInput.value = '';
    updateFileList();
    updateControls();
    hideMessage();
});

// Update controls visibility
function updateControls() {
    if (selectedFiles.length > 0) {
        uploadControls.style.display = 'flex';
        fileCount.textContent = selectedFiles.length;
    } else {
        uploadControls.style.display = 'none';
    }
}

// Upload files
uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    
    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    // Add device prefix to form data
    const devicePrefix = devicePrefixInput.value.trim();
    formData.append('devicePrefix', devicePrefix);
    
    // Show progress
    progressContainer.style.display = 'block';
    uploadBtn.disabled = true;
    clearBtn.disabled = true;
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading...';
    hideMessage();
    
    try {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
            }
        });
        
        // Response handling
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showMessage(`✅ Successfully uploaded ${response.filesProcessed} file(s)!`, 'success');
                
                // Reset
                selectedFiles = [];
                fileInput.value = '';
                updateFileList();
                updateControls();
                
                // Refresh stats
                loadStats();
            } else {
                const error = JSON.parse(xhr.responseText);
                showMessage(`❌ Upload failed: ${error.error}`, 'error');
            }
            
            progressContainer.style.display = 'none';
            uploadBtn.disabled = false;
            clearBtn.disabled = false;
        });
        
        xhr.addEventListener('error', () => {
            showMessage('❌ Upload failed. Please check your connection.', 'error');
            progressContainer.style.display = 'none';
            uploadBtn.disabled = false;
            clearBtn.disabled = false;
        });
        
        xhr.open('POST', '/upload');
        xhr.send(formData);
        
    } catch (error) {
        showMessage(`❌ Upload failed: ${error.message}`, 'error');
        progressContainer.style.display = 'none';
        uploadBtn.disabled = false;
        clearBtn.disabled = false;
    }
});

// Show message
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// Hide message
function hideMessage() {
    message.style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        if (stats.length > 0) {
            let html = '<h3>📊 Upload Statistics</h3>';
            
            // Sort by date (newest first)
            stats.sort((a, b) => b.date.localeCompare(a.date));
            
            stats.forEach(stat => {
                html += `
                    <div class="stat-item">
                        <span class="stat-date">${stat.date}</span>
                        <span class="stat-count">${stat.fileCount} file(s)</span>
                    </div>
                `;
            });
            
            statsDiv.innerHTML = html;
        } else {
            statsDiv.innerHTML = '<h3>📊 Upload Statistics</h3><p style="color: #666; text-align: center; padding: 20px 0;">No files uploaded yet</p>';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Load stats on page load
loadStats();

// Load server info on page load
loadServerInfo();

// Load QR code on page load
loadQRCode();

// Refresh stats every 30 seconds
setInterval(loadStats, 30000);
