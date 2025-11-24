let selectedFiles = [];
let currentBrowsePath = '';

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

// Path selection elements
const currentPathEl = document.getElementById('currentPath');
const changePathBtn = document.getElementById('changePathBtn');
const pathModal = document.getElementById('pathModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelPathBtn = document.getElementById('cancelPathBtn');
const selectPathBtn = document.getElementById('selectPathBtn');
const breadcrumbEl = document.getElementById('breadcrumb');
const directoryListEl = document.getElementById('directoryList');
const customPathInput = document.getElementById('customPath');

// Load current upload path
async function loadUploadPath() {
    try {
        const response = await fetch('/api/upload-path');
        const data = await response.json();
        currentPathEl.textContent = data.path;
        currentBrowsePath = data.path;
    } catch (error) {
        console.error('Failed to load upload path:', error);
        currentPathEl.textContent = 'Error loading path';
    }
}

// Open path selection modal
changePathBtn.addEventListener('click', () => {
    pathModal.style.display = 'flex';
    browseDirectory(currentBrowsePath);
});

// Close modal
function closeModal() {
    pathModal.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
cancelPathBtn.addEventListener('click', closeModal);

// Browse directory
async function browseDirectory(dirPath) {
    try {
        directoryListEl.innerHTML = '<p class="loading">Loading directories...</p>';
        
        const response = await fetch('/api/browse-directory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: dirPath })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to browse directory');
        }
        
        currentBrowsePath = data.currentPath;
        breadcrumbEl.textContent = data.currentPath;
        customPathInput.value = data.currentPath;
        
        // Build directory list
        let html = '';
        
        // Add parent directory option
        if (data.parentPath) {
            html += `
                <div class="directory-item parent" data-path="${data.parentPath}">
                    <span class="directory-icon">⬆️</span>
                    <span class="directory-name">..</span>
                </div>
            `;
        }
        
        // Add subdirectories
        data.directories.forEach(dir => {
            html += `
                <div class="directory-item" data-path="${dir.path}">
                    <span class="directory-icon">📁</span>
                    <span class="directory-name">${dir.name}</span>
                </div>
            `;
        });
        
        if (data.directories.length === 0 && !data.parentPath) {
            html = '<p class="loading">No subdirectories found</p>';
        }
        
        directoryListEl.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.directory-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path');
                browseDirectory(path);
            });
        });
    } catch (error) {
        console.error('Error browsing directory:', error);
        directoryListEl.innerHTML = `<p class="loading" style="color: #ff4757;">${error.message}</p>`;
    }
}

// Select path
selectPathBtn.addEventListener('click', async () => {
    const pathToSet = customPathInput.value.trim() || currentBrowsePath;
    
    if (!pathToSet) {
        showMessage('❌ Please select or enter a valid path', 'error');
        return;
    }
    
    try {
        selectPathBtn.disabled = true;
        selectPathBtn.textContent = 'Setting...';
        
        const response = await fetch('/api/upload-path', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: pathToSet })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to set path');
        }
        
        currentPathEl.textContent = data.path;
        showMessage('✅ ' + data.message, 'success');
        closeModal();
        
    } catch (error) {
        console.error('Error setting path:', error);
        showMessage('❌ Failed to set path: ' + error.message, 'error');
    } finally {
        selectPathBtn.disabled = false;
        selectPathBtn.textContent = 'Select This Folder';
    }
});

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
                
                let successMsg = `✅ Successfully uploaded ${response.filesProcessed} item(s)!`;
                if (response.livePhotosCount > 0) {
                    successMsg += ` (Including ${response.livePhotosCount} Live Photo${response.livePhotosCount > 1 ? 's' : ''})`;
                }
                
                showMessage(successMsg, 'success');
                
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

// Load upload path on page load
loadUploadPath();

// Refresh stats every 30 seconds
setInterval(loadStats, 30000);
