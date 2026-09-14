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
            
            // Each content type has its own worksheet in publications.xlsx.
            loadPublicationsSheet(getSheetData(workbook, ['Publications', 'Sheet1']));
            loadPreprintsSheet(getSheetData(workbook, ['Preprints']));
            loadThesesSheet(getSheetData(workbook, ['Thesis', 'Theses']));
            loadTalksSheet(getSheetData(workbook, ['Talks', 'Presentations']));
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
                        <li>Open: <code>http://localhost:8001</code> in your browser</li>
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
            ['publications', 'preprints', 'theses', 'talks'].forEach(type => {
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

function getSheetData(workbook, acceptedNames) {
    const accepted = acceptedNames.map(name => name.toLowerCase());
    const sheetName = workbook.SheetNames.find(name => accepted.includes(name.trim().toLowerCase()));

    if (!sheetName) return null;

    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
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
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = '<p>No preprints found in the Excel file.</p>';
        }
        return;
    }
    
    // Render preprints
    renderPreprints(jsonData);
    
    // Hide loading, show container
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'block';
}

// ===== Load Thesis Sheet =====
function loadThesesSheet(jsonData) {
    const loadingEl = document.getElementById('theses-loading');
    const containerEl = document.getElementById('theses-container');
    const errorEl = document.getElementById('theses-error');

    if (!jsonData || jsonData.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = '<p>No theses found in the Excel file.</p>';
        }
        return;
    }

    renderTheses(jsonData);

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
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
    
    // Sort by year (descending), preserving spreadsheet order within each year.
    const sortedData = [...data].sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        return yearB - yearA;
    });

    // Clear container
    container.innerHTML = '';

    // Render publications in year groups.
    let publicationNumber = 1;

    groupByYear(sortedData).forEach(([year, publications]) => {
        const group = createYearGroup(year);

        publications.forEach(pub => {
            group.appendChild(createPublicationElement(pub, publicationNumber++));
        });

        container.appendChild(group);
    });
}

function groupByYear(data) {
    const groups = new Map();

    data.forEach(item => {
        const year = item.Year || 'Earlier';
        if (!groups.has(year)) groups.set(year, []);
        groups.get(year).push(item);
    });

    return Array.from(groups.entries());
}

function createYearGroup(year) {
    const group = document.createElement('div');
    group.className = 'publication-year-group';

    const heading = document.createElement('h3');
    heading.className = 'publication-year-heading';
    heading.textContent = year;
    group.appendChild(heading);

    return group;
}

// ===== Create Publication Element =====
function createPublicationElement(pub, number, options = {}) {
    const div = document.createElement('div');
    div.className = 'publication-item';

    const { showVenue = true, showYear = false } = options;
    const year = pub.Year || '';
    const venue = pub.Venue || '';
    const title = pub.Title || '';
    const titleLink = pub.Link || '#';
    const authors = pub.Authors || '';
    const note = pub.Note || '';
    const codeLink = pub.CodeLink || '';

    let authorsHtml = authors;
    if (authors.includes('Mingxun Zhou') && !authors.includes('<strong>Mingxun Zhou</strong>')) {
        authorsHtml = authors.replace(
            /(\*?)Mingxun Zhou(\*?)/g,
            '$1<strong>Mingxun Zhou</strong>$2'
        );
    }

    const citationParts = [
        title ? (titleLink === '#' ? title : `<a class="pub-title" href="${titleLink}">${title}</a>`) : '',
        authorsHtml ? `<span class="pub-authors">${authorsHtml}</span>` : '',
        showVenue && venue ? `<span class="pub-venue">${venue}</span>` : '',
        note ? `<span class="pub-note">${note}</span>` : '',
        showYear && year ? `<span class="pub-year">${year}</span>` : ''
    ].filter(Boolean);

    div.innerHTML = `
        <span class="publication-number">${number}.</span>
        <span class="publication-citation">${citationParts.join('. ')}${citationParts.length ? '.' : ''}${codeLink ? ` <span class="pub-links">[<a href="${codeLink}">code</a>]</span>` : ''}</span>
    `;

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
    
    let preprintNumber = 1;

    sortedData.forEach(item => {
        container.appendChild(createPublicationElement(item, preprintNumber++, {
            showVenue: false,
            showYear: true
        }));
    });
}

// ===== Render Thesis Sheet =====
function renderTheses(data) {
    const container = document.getElementById('theses-container');
    if (!container) return;

    const sortedData = [...data].sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
    const list = document.createElement('ul');
    list.className = 'compact-paper-list';

    sortedData.forEach(item => {
        list.appendChild(createCompactPaperItem(item, true));
    });

    container.innerHTML = '';
    container.appendChild(list);
}

function createCompactPaperItem(item, showYear = false) {
    const li = document.createElement('li');
    const parts = [];
    const title = item.Title || '';
    const link = item.Link || '';

    if (title) {
        parts.push(link && link.trim() ? `<a href="${link}">${title}</a>` : title);
    }

    if (item.Authors) {
        let authors = item.Authors;
        if (authors.includes('Mingxun Zhou') && !authors.includes('<strong>')) {
            authors = authors.replace(/(\*?)Mingxun Zhou(\*?)/g, '$1<strong>Mingxun Zhou</strong>$2');
        }
        parts.push(authors);
    }

    if (item.Note) {
        parts.push(`<strong>${item.Note}</strong>`);
    } else if (item.Type) {
        parts.push(`<strong>${item.Type}</strong>`);
    }

    if (showYear && item.Year) parts.push(item.Year);

    li.innerHTML = parts.join('. ') + (parts.length ? '.' : '');
    return li;
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
