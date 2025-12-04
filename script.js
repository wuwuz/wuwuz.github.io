// ===== Global variable to store publications data =====
let publicationsData = [];

// ===== Smooth Scrolling =====
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== Load All Content from Excel =====
    loadAllContentFromExcel();

    // ===== Scroll to Top Button =====
    initScrollToTop();

    // ===== Copy Email to Clipboard =====
    initEmailCopy();
});

// ===== Load All Content from Excel File =====
function loadAllContentFromExcel() {
    // Check if SheetJS library is loaded
    if (typeof XLSX === 'undefined') {
        console.error('SheetJS library not loaded');
        showError('SheetJS library failed to load. Please check your internet connection.');
        return;
    }

    // Fetch the Excel file with cache-busting
    fetch('publications.xlsx?' + new Date().getTime())
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            // Parse Excel file
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Load each sheet
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                // Route to appropriate renderer based on sheet name
                if (sheetName.toLowerCase() === 'publications' || sheetName === 'Sheet1') {
                    loadPublicationsSheet(jsonData);
                } else if (sheetName.toLowerCase() === 'preprints') {
                    loadPreprintsSheet(jsonData);
                } else if (sheetName.toLowerCase() === 'talks' || sheetName.toLowerCase() === 'presentations') {
                    loadTalksSheet(jsonData);
                }
            });
        })
        .catch(error => {
            console.error('Error loading Excel file:', error);
            
            // Check if it's a local file access issue
            const isLocalFile = window.location.protocol === 'file:';
            let errorMessage = '';
            
            if (isLocalFile) {
                errorMessage = `
                    <p><strong>CORS Error:</strong> Browsers block loading local files for security reasons.</p>
                    <p><strong>Solution:</strong> Use a local web server:</p>
                    <ol style="text-align: left; margin: 1rem 2rem;">
                        <li>Run: <code>python3 start_local_server.py</code></li>
                        <li>Open: <code>http://localhost:8000</code> in your browser</li>
                    </ol>
                    <p><small>Or use any HTTP server: <code>python3 -m http.server</code> or <code>npx serve</code></small></p>
                `;
            } else {
                errorMessage = `
                    <p>Failed to load content. Please ensure <code>publications.xlsx</code> exists in your repository.</p>
                    <p><small>Error: ${error.message}</small></p>
                `;
            }
            
            // Show error in all sections
            ['publications', 'preprints', 'talks'].forEach(type => {
                const loadingEl = document.getElementById(`${type}-loading`);
                const errorEl = document.getElementById(`${type}-error`);
                if (loadingEl) loadingEl.style.display = 'none';
                if (errorEl) {
                    errorEl.style.display = 'block';
                    errorEl.innerHTML = errorMessage;
                }
            });
        });
}

// ===== Load Publications Sheet =====
function loadPublicationsSheet(jsonData) {
    const loadingEl = document.getElementById('publications-loading');
    const containerEl = document.getElementById('publications-container');
    const errorEl = document.getElementById('publications-error');
    
    if (!jsonData || jsonData.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = '<p>No publications found in the Excel file.</p>';
        }
        return;
    }
    
    // Store publications data
    publicationsData = jsonData;
    
    // Render publications
    renderPublications(jsonData);
    
    // Hide loading, show container
    if (loadingEl) loadingEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'block';
}

// ===== Load Preprints Sheet =====
function loadPreprintsSheet(jsonData) {
    const loadingEl = document.getElementById('preprints-loading');
    const containerEl = document.getElementById('preprints-container');
    const errorEl = document.getElementById('preprints-error');
    
    if (!jsonData || jsonData.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'none';
        return;
    }
    
    // Render preprints
    renderPreprints(jsonData);
    
    // Hide loading, show container
    if (loadingEl) loadingEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'block';
}

// ===== Load Talks Sheet =====
function loadTalksSheet(jsonData) {
    const loadingEl = document.getElementById('talks-loading');
    const containerEl = document.getElementById('talks-container');
    const errorEl = document.getElementById('talks-error');
    
    if (!jsonData || jsonData.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'none';
        return;
    }
    
    // Render talks
    renderTalks(jsonData);
    
    // Hide loading, show container
    if (loadingEl) loadingEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'block';
}

// ===== Render Publications =====
function renderPublications(data) {
    const container = document.getElementById('publications-container');
    
    // Sort by year (descending), then by venue
    const sortedData = [...data].sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        if (yearB !== yearA) return yearB - yearA;
        return (a.Venue || '').localeCompare(b.Venue || '');
    });

    // Clear container
    container.innerHTML = '';

    // Render each publication
    sortedData.forEach(pub => {
        const pubItem = createPublicationElement(pub);
        container.appendChild(pubItem);
    });
}

// ===== Create Publication Element =====
function createPublicationElement(pub) {
    const div = document.createElement('div');
    div.className = 'publication-item';

    const year = pub.Year || '';
    const venue = pub.Venue || '';
    const title = pub.Title || '';
    const titleLink = pub.Link || '#';
    const authors = pub.Authors || '';
    const note = pub.Note || '';
    const codeLink = pub.CodeLink || '';

    // Build HTML structure
    let html = `
        <div class="publication-header">
            ${year ? `<span class="pub-year">${year}</span>` : ''}
            ${venue ? `<span class="pub-venue">${venue}</span>` : ''}
        </div>
        <h3 class="pub-title">
            <a href="${titleLink}" ${titleLink === '#' ? 'onclick="return false;"' : ''}>${title}</a>
        </h3>
        <div class="pub-authors">
            ${authors}
            ${note ? ` <span class="pub-note">${note}</span>` : ''}
            ${codeLink ? ` <span class="pub-links">[<a href="${codeLink}">code</a>]</span>` : ''}
        </div>
    `;

    div.innerHTML = html;

    // Highlight author's name - wrap "Mingxun Zhou" in <strong> tags if not already
    const authorsDiv = div.querySelector('.pub-authors');
    if (authorsDiv && authors) {
        let authorsHtml = authorsDiv.innerHTML;
        // Only wrap if not already wrapped in strong tags (check both plain and HTML)
        if (!authorsHtml.includes('<strong>Mingxun Zhou</strong>') && authors.includes('Mingxun Zhou')) {
            // Handle cases with asterisks - replace plain text "Mingxun Zhou" with bold version
            // Use a regex that matches "Mingxun Zhou" possibly with asterisks, but not already in HTML tags
            authorsHtml = authors.replace(
                /(\*?)Mingxun Zhou(\*?)/g,
                (match, prefix, suffix) => {
                    return prefix + '<strong>Mingxun Zhou</strong>' + suffix;
                }
            );
            // Rebuild the authors div with the highlighted name, preserving note and links
            authorsDiv.innerHTML = authorsHtml + 
                (note ? ` <span class="pub-note">${note}</span>` : '') +
                (codeLink ? ` <span class="pub-links">[<a href="${codeLink}">code</a>]</span>` : '');
        }
    }

    return div;
}

// ===== Render Preprints =====
function renderPreprints(data) {
    const container = document.getElementById('preprints-container');
    if (!container) return;
    
    // Sort by year (descending)
    const sortedData = [...data].sort((a, b) => {
        const yearA = parseInt(a.Year || 0) || 0;
        const yearB = parseInt(b.Year || 0) || 0;
        return yearB - yearA;
    });
    
    container.innerHTML = '';
    
    sortedData.forEach(item => {
        const li = document.createElement('li');
        const parts = [];
        
        // Title with link
        const title = item.Title || '';
        const link = item.Link || '';
        if (title) {
            if (link && link.trim()) {
                parts.push(`<a href="${link}">${title}</a>`);
            } else {
                parts.push(title);
            }
        }
        
        // Authors (auto-bold name)
        if (item.Authors) {
            let authors = item.Authors;
            if (authors.includes('Mingxun Zhou') && !authors.includes('<strong>')) {
                authors = authors.replace(
                    /(\*?)Mingxun Zhou(\*?)/g,
                    '$1<strong>Mingxun Zhou</strong>$2'
                );
            }
            parts.push(authors);
        }
        
        // Note/Type
        if (item.Note) {
            parts.push(`<strong>${item.Note}</strong>`);
        } else if (item.Type) {
            parts.push(`<strong>${item.Type}</strong>`);
        }
        
        // Year
        if (item.Year) {
            parts.push(item.Year);
        }
        
        li.innerHTML = parts.join(', ') + '.';
        container.appendChild(li);
    });
}

// ===== Render Talks =====
function renderTalks(data) {
    const container = document.getElementById('talks-container');
    if (!container) return;
    
    // Sort by date (descending)
    const sortedData = [...data].sort((a, b) => {
        const dateA = parseDate(a.Date || '');
        const dateB = parseDate(b.Date || '');
        return dateB - dateA;
    });
    
    container.innerHTML = '';
    
    sortedData.forEach(talk => {
        const li = document.createElement('li');
        const parts = [];
        
        // Title
        if (talk.Title) {
            parts.push(`"${talk.Title}"`);
        }
        
        // Venue
        if (talk.Venue) {
            parts.push(`at ${talk.Venue}`);
        }
        
        // Date
        if (talk.Date) {
            parts.push(talk.Date);
        }
        
        // Video link
        const videoLink = talk.VideoLink || '';
        if (videoLink && videoLink.trim()) {
            const linkText = videoLink.includes('bilibili') ? 'video(中文视频)' : 'video';
            parts.push(`[<a href="${videoLink}">${linkText}</a>]`);
        }
        
        li.innerHTML = parts.join(' ');
        container.appendChild(li);
    });
}

// ===== Helper: Parse Date =====
function parseDate(dateStr) {
    if (!dateStr) return 0;
    
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.getTime();
    }
    
    // Try to extract year
    const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        return new Date(yearMatch[0], 0, 1).getTime();
    }
    
    // Try month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < monthNames.length; i++) {
        if (dateStr.includes(monthNames[i])) {
            const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                return new Date(yearMatch[0], i, 1).getTime();
            }
        }
    }
    
    return 0;
}

// ===== Show Error Message =====
function showError(message) {
    const errorEl = document.getElementById('publications-error');
    if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.innerHTML = `<p>${message}</p>`;
    }
}

// ===== Scroll to Top Button =====
function initScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '↑';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollButton);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    // Scroll to top on click
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Copy Email to Clipboard =====
function initEmailCopy() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // On Ctrl/Cmd + Click, copy to clipboard instead of opening email client
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const email = this.getAttribute('href').replace('mailto:', '');
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(email).then(() => {
                        showNotification('Email copied to clipboard!');
                    });
                } else {
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = email;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    showNotification('Email copied to clipboard!');
                }
            }
        });

        // Add title hint
        link.setAttribute('title', 'Click: Open email | Ctrl/Cmd+Click: Copy email');
    });
}

// ===== Notification Toast =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

