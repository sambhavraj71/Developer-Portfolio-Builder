// ============================================
// Portfolio Display - Public View (FIXED)
// ============================================

function loadPortfolioData() {
    // Load Profile
    const profile = JSON.parse(localStorage.getItem('portfolio-profile')) || {
        name: 'John Developer',
        title: 'Full Stack Developer',
        bio: 'Passionate about building beautiful web applications',
        avatar: 'https://via.placeholder.com/150/6c63ff/ffffff?text=Dev'
    };
    
    document.getElementById('portfolioName').textContent = profile.name;
    document.getElementById('portfolioTitle').textContent = profile.title;
    document.getElementById('portfolioBio').textContent = profile.bio;
    document.getElementById('portfolioAvatar').src = profile.avatar;
    document.getElementById('footerName').textContent = profile.name;
    document.title = `Portfolio - ${profile.name}`;

    // Load Skills
    const skills = JSON.parse(localStorage.getItem('portfolio-skills')) || [];
    const skillsContainer = document.getElementById('portfolioSkills');
    if (skills.length === 0) {
        skillsContainer.innerHTML = `<div class="empty-state"><i class="fas fa-plus-circle"></i><p>No skills added yet</p></div>`;
    } else {
        skillsContainer.innerHTML = skills.map(skill => `
            <div class="portfolio-skill">
                ${skill.name}
                <span class="level">${skill.level}</span>
            </div>
        `).join('');
    }

    // Load Projects
    const projects = JSON.parse(localStorage.getItem('portfolio-projects')) || [];
    const projectsContainer = document.getElementById('portfolioProjects');
    if (projects.length === 0) {
        projectsContainer.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-plus-circle"></i><p>No projects added yet</p></div>`;
    } else {
        projectsContainer.innerHTML = projects.map(project => `
            <div class="portfolio-project">
                <h3>${project.name}</h3>
                <div class="tech">${project.tech}</div>
                <p class="desc">${project.description}</p>
                ${project.link ? `<a href="${project.link}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
            </div>
        `).join('');
    }

    // Load Experience
    const experiences = JSON.parse(localStorage.getItem('portfolio-experiences')) || [];
    const experienceContainer = document.getElementById('portfolioExperience');
    if (experiences.length === 0) {
        experienceContainer.innerHTML = `<div class="empty-state"><i class="fas fa-plus-circle"></i><p>No experience added yet</p></div>`;
    } else {
        experienceContainer.innerHTML = experiences.map(exp => `
            <div class="portfolio-experience">
                <h3>${exp.role}</h3>
                <div class="company">${exp.company}</div>
                <div class="duration">${exp.duration}</div>
                <p class="desc">${exp.description}</p>
            </div>
        `).join('');
    }

    // Load Resume - FIXED
    const resumeName = localStorage.getItem('portfolio-resume');
    const resumeDataStr = localStorage.getItem('portfolio-resume-data');
    const resumeContainer = document.getElementById('portfolioResume');
    
    if (resumeName && resumeDataStr) {
        try {
            const resumeData = JSON.parse(resumeDataStr);
            let fileSize = '';
            if (resumeData.size) {
                fileSize = formatFileSize(resumeData.size);
            }
            resumeContainer.innerHTML = `
                <a href="#" class="resume-download" onclick="downloadResume(); return false;">
                    <i class="fas fa-file-pdf"></i>
                    <div class="info">
                        <div class="name">${resumeName}</div>
                        <div class="hint">${fileSize} • Click to download</div>
                    </div>
                </a>
            `;
        } catch (e) {
            console.error('Error parsing resume data:', e);
            resumeContainer.innerHTML = `<div class="empty-state"><i class="fas fa-file-alt"></i><p>Resume data is corrupted. Please re-upload.</p></div>`;
        }
    } else {
        resumeContainer.innerHTML = `<div class="empty-state"><i class="fas fa-file-alt"></i><p>No resume uploaded yet</p></div>`;
    }

    // Apply Theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Apply Color
    const savedColor = localStorage.getItem('portfolio-primary-color');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary', savedColor);
        document.documentElement.style.setProperty('--primary-dark', savedColor);
        document.documentElement.style.setProperty('--primary-light', savedColor + '80');
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// RESUME DOWNLOAD - FIXED
// ============================================

function downloadResume() {
    const resumeDataStr = localStorage.getItem('portfolio-resume-data');
    const resumeName = localStorage.getItem('portfolio-resume');
    
    if (!resumeDataStr) {
        showToast('No resume found to download', 'error');
        return;
    }
    
    try {
        const resumeData = JSON.parse(resumeDataStr);
        
        if (!resumeData.data) {
            showToast('Resume data is corrupted. Please re-upload.', 'error');
            localStorage.removeItem('portfolio-resume');
            localStorage.removeItem('portfolio-resume-data');
            loadPortfolioData();
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = resumeData.data;
        link.download = resumeData.name || 'resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('📄 Downloading resume...', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Error downloading resume. Please re-upload the file.', 'error');
        
        // Clear corrupted data
        localStorage.removeItem('portfolio-resume');
        localStorage.removeItem('portfolio-resume-data');
        loadPortfolioData();
    }
}

// ============================================
// SHARE FUNCTIONS
// ============================================

function sharePortfolio() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: `Check out my portfolio! I'm ${document.getElementById('portfolioName').textContent}`,
            url: window.location.href
        }).catch(() => {});
    } else {
        copyLink();
    }
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('📋 Portfolio link copied! Share it with others.', 'success');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('📋 Portfolio link copied!', 'success');
    });
}

function downloadPortfolio() {
    const data = {
        profile: localStorage.getItem('portfolio-profile'),
        skills: localStorage.getItem('portfolio-skills'),
        projects: localStorage.getItem('portfolio-projects'),
        experience: localStorage.getItem('portfolio-experiences'),
        resume: localStorage.getItem('portfolio-resume'),
        resumeData: localStorage.getItem('portfolio-resume-data'),
        theme: localStorage.getItem('portfolio-theme'),
        color: localStorage.getItem('portfolio-primary-color'),
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📦 Portfolio backup downloaded!', 'success');
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ============================================
// URL PARAMETER SUPPORT
// ============================================

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    if (dataParam) {
        try {
            const data = JSON.parse(atob(decodeURIComponent(dataParam)));
            Object.keys(data).forEach(key => {
                if (data[key]) {
                    localStorage.setItem(`portfolio-${key}`, data[key]);
                }
            });
            showToast('📥 Portfolio loaded from shared link!', 'success');
            loadPortfolioData();
        } catch (e) {
            console.error('Failed to load from URL', e);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromURL();
    loadPortfolioData();
    
    console.log('%c👤 Portfolio View Loaded!', 'font-size:16px;font-weight:bold;color:#6c63ff;');
    console.log('%c📊 Data loaded from Local Storage', 'font-size:14px;color:#888;');
    console.log('%c🖨️ Use Print (Ctrl+P) for beautiful PDF', 'font-size:14px;color:#888;');
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadPortfolio();
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyLink();
    }
});