const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

let savedTheme = localStorage.getItem('portfolio-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

const colorOptions = document.querySelectorAll('.color-option');

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        const color = option.dataset.color;
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-dark', color);
        document.documentElement.style.setProperty('--primary-light', color + '80');
        localStorage.setItem('portfolio-primary-color', color);
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        showToast('Theme color updated!', 'success');
    });
});

const savedColor = localStorage.getItem('portfolio-primary-color');
if (savedColor) {
    document.documentElement.style.setProperty('--primary', savedColor);
    document.documentElement.style.setProperty('--primary-dark', savedColor);
    document.documentElement.style.setProperty('--primary-light', savedColor + '80');
    colorOptions.forEach(opt => {
        if (opt.dataset.color === savedColor) opt.classList.add('active');
    });
}

function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('portfolio-profile')) || {
        name: 'John Developer',
        title: 'Full Stack Developer',
        bio: 'Passionate about building beautiful web applications',
        avatar: 'https://via.placeholder.com/120/6c63ff/ffffff?text=Dev'
    };
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileTitle').textContent = profile.title;
    document.getElementById('profileBio').textContent = profile.bio;
    document.getElementById('profileAvatar').src = profile.avatar;
    return profile;
}

function saveProfile() {
    const profile = {
        name: document.getElementById('profileName').textContent.trim(),
        title: document.getElementById('profileTitle').textContent.trim(),
        bio: document.getElementById('profileBio').textContent.trim(),
        avatar: document.getElementById('profileAvatar').src
    };
    localStorage.setItem('portfolio-profile', JSON.stringify(profile));
    showToast('Profile saved!', 'success');
}

document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

document.getElementById('avatarUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const avatar = document.getElementById('profileAvatar');
            avatar.src = event.target.result;
            saveProfile();
            showToast('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
});

const resumeUploadArea = document.getElementById('resumeUploadArea');
const resumeInput = document.getElementById('resumeInput');
const resumeStatus = document.getElementById('resumeStatus');
const resumeName = document.getElementById('resumeName');
const resumeSize = document.getElementById('resumeSize');
const removeResumeBtn = document.getElementById('removeResume');
const uploadProgress = document.getElementById('resumeUploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function loadSavedResume() {
    const savedResume = localStorage.getItem('portfolio-resume');
    const savedResumeData = localStorage.getItem('portfolio-resume-data');
    
    if (savedResume && savedResumeData) {
        try {
            const data = JSON.parse(savedResumeData);
            resumeUploadArea.style.display = 'none';
            resumeStatus.style.display = 'flex';
            resumeName.textContent = savedResume;
            resumeSize.textContent = formatFileSize(data.size);
        } catch (e) {
            console.error('Error loading resume:', e);
        }
    }
}

loadSavedResume();

resumeUploadArea.addEventListener('click', () => resumeInput.click());
resumeUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    resumeUploadArea.style.borderColor = 'var(--primary)';
});
resumeUploadArea.addEventListener('dragleave', () => {
    resumeUploadArea.style.borderColor = 'var(--border-color)';
});
resumeUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleResumeUpload(file);
});

resumeInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleResumeUpload(file);
});

function handleResumeUpload(file) {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        showToast('Please upload PDF, DOC, or DOCX files only', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size should be less than 5MB', 'error');
        return;
    }

    uploadProgress.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Uploading... ${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const resumeData = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result
                };
                
                localStorage.setItem('portfolio-resume', file.name);
                localStorage.setItem('portfolio-resume-data', JSON.stringify(resumeData));
                
                uploadProgress.style.display = 'none';
                progressFill.style.width = '0%';
                
                resumeUploadArea.style.display = 'none';
                resumeStatus.style.display = 'flex';
                resumeName.textContent = file.name;
                resumeSize.textContent = formatFileSize(file.size);
                showToast('Resume uploaded successfully!', 'success');
            };
            reader.onerror = function() {
                showToast('Error reading file', 'error');
                uploadProgress.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }, 150);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

removeResumeBtn.addEventListener('click', () => {
    localStorage.removeItem('portfolio-resume');
    localStorage.removeItem('portfolio-resume-data');
    resumeUploadArea.style.display = 'block';
    resumeStatus.style.display = 'none';
    resumeInput.value = '';
    showToast('Resume removed', 'info');
});

let skills = JSON.parse(localStorage.getItem('portfolio-skills')) || [];

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    if (skills.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">No skills added yet. Click "Add Skill" to get started.</p>';
        return;
    }
    container.innerHTML = skills.map((skill, index) => `
        <div class="skill-tag">
            ${skill.name}
            <span class="skill-level">${skill.level}</span>
            <button class="remove-skill" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    document.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            skills.splice(index, 1);
            saveSkills();
            renderSkills();
            showToast('Skill removed', 'info');
        });
    });
}

function saveSkills() {
    localStorage.setItem('portfolio-skills', JSON.stringify(skills));
}

const skillModal = document.getElementById('skillModal');
const skillForm = document.getElementById('skillForm');
const skillEditId = document.getElementById('skillEditId');
const skillModalTitle = document.getElementById('skillModalTitle');

document.getElementById('addSkillBtn').addEventListener('click', () => {
    skillModalTitle.textContent = 'Add Skill';
    skillForm.reset();
    skillEditId.value = '';
    skillModal.classList.add('active');
});

skillForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('skillName').value.trim();
    const level = document.getElementById('skillLevel').value;
    
    if (skillEditId.value) {
        skills[parseInt(skillEditId.value)] = { name, level };
        showToast('Skill updated!', 'success');
    } else {
        skills.push({ name, level });
        showToast('Skill added!', 'success');
    }
    saveSkills();
    renderSkills();
    skillModal.classList.remove('active');
    skillForm.reset();
});

let projects = JSON.parse(localStorage.getItem('portfolio-projects')) || [];

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (projects.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-style:italic;grid-column:1/-1;">No projects added yet. Click "Add Project" to get started.</p>';
        return;
    }
    container.innerHTML = projects.map((project, index) => `
        <div class="project-card">
            <h4>${project.name}</h4>
            <div class="project-tech">${project.tech}</div>
            <p class="project-desc">${project.description}</p>
            <div class="project-actions">
                ${project.link ? `<a href="${project.link}" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                <button onclick="editProject(${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProject(${index})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function saveProjects() {
    localStorage.setItem('portfolio-projects', JSON.stringify(projects));
}

window.deleteProject = function(index) {
    if (confirm('Delete this project?')) {
        projects.splice(index, 1);
        saveProjects();
        renderProjects();
        showToast('Project deleted', 'info');
    }
};

window.editProject = function(index) {
    const project = projects[index];
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectEditId').value = index;
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectTech').value = project.tech;
    document.getElementById('projectLink').value = project.link || '';
    document.getElementById('projectModal').classList.add('active');
};

const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const projectEditId = document.getElementById('projectEditId');

document.getElementById('addProjectBtn').addEventListener('click', () => {
    document.getElementById('projectModalTitle').textContent = 'Add Project';
    projectForm.reset();
    projectEditId.value = '';
    projectModal.classList.add('active');
});

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = {
        name: document.getElementById('projectName').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        tech: document.getElementById('projectTech').value.trim(),
        link: document.getElementById('projectLink').value.trim()
    };
    
    if (projectEditId.value) {
        projects[parseInt(projectEditId.value)] = project;
        showToast('Project updated!', 'success');
    } else {
        projects.push(project);
        showToast('Project added!', 'success');
    }
    saveProjects();
    renderProjects();
    projectModal.classList.remove('active');
    projectForm.reset();
});

let experiences = JSON.parse(localStorage.getItem('portfolio-experiences')) || [];

function renderExperiences() {
    const container = document.getElementById('experienceContainer');
    if (experiences.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">No experience added yet. Click "Add Experience" to get started.</p>';
        return;
    }
    container.innerHTML = experiences.map((exp, index) => `
        <div class="experience-item">
            <div class="exp-header">
                <div>
                    <h4>${exp.role}</h4>
                    <div class="exp-company">${exp.company}</div>
                </div>
                <div class="exp-duration">${exp.duration}</div>
            </div>
            <p class="exp-desc">${exp.description}</p>
            <div class="exp-actions">
                <button onclick="editExperience(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteExperience(${index})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function saveExperiences() {
    localStorage.setItem('portfolio-experiences', JSON.stringify(experiences));
}

window.deleteExperience = function(index) {
    if (confirm('Delete this experience?')) {
        experiences.splice(index, 1);
        saveExperiences();
        renderExperiences();
        showToast('Experience deleted', 'info');
    }
};

window.editExperience = function(index) {
    const exp = experiences[index];
    document.getElementById('experienceModalTitle').textContent = 'Edit Experience';
    document.getElementById('experienceEditId').value = index;
    document.getElementById('expCompany').value = exp.company;
    document.getElementById('expRole').value = exp.role;
    document.getElementById('expDuration').value = exp.duration;
    document.getElementById('expDescription').value = exp.description;
    document.getElementById('experienceModal').classList.add('active');
};

const experienceModal = document.getElementById('experienceModal');
const experienceForm = document.getElementById('experienceForm');
const expEditId = document.getElementById('experienceEditId');

document.getElementById('addExperienceBtn').addEventListener('click', () => {
    document.getElementById('experienceModalTitle').textContent = 'Add Experience';
    experienceForm.reset();
    expEditId.value = '';
    experienceModal.classList.add('active');
});

experienceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const experience = {
        company: document.getElementById('expCompany').value.trim(),
        role: document.getElementById('expRole').value.trim(),
        duration: document.getElementById('expDuration').value.trim(),
        description: document.getElementById('expDescription').value.trim()
    };
    
    if (expEditId.value) {
        experiences[parseInt(expEditId.value)] = experience;
        showToast('Experience updated!', 'success');
    } else {
        experiences.push(experience);
        showToast('Experience added!', 'success');
    }
    saveExperiences();
    renderExperiences();
    experienceModal.classList.remove('active');
    experienceForm.reset();
});

document.getElementById('exportDataBtn').addEventListener('click', () => {
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
    showToast('Data exported successfully!', 'success');
});

document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importInput').click();
});

document.getElementById('importInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                Object.keys(data).forEach(key => {
                    if (data[key]) {
                        localStorage.setItem(`portfolio-${key}`, data[key]);
                    }
                });
                showToast('Data imported successfully! Refreshing...', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }
});

document.querySelectorAll('.modal-close, .modal').forEach(el => {
    el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('modal-close')) {
            el.classList.remove('active');
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
    }
});

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

const hamburger = document.getElementById('hamburger');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.style.display === 'flex' && window.innerWidth <= 768) {
        sidebar.style.display = '';
        sidebar.style.position = '';
        sidebar.style.top = '';
        sidebar.style.left = '';
        sidebar.style.right = '';
        sidebar.style.bottom = '';
        sidebar.style.zIndex = '';
        sidebar.style.overflowY = '';
        sidebar.style.padding = '';
        sidebar.style.background = '';
        hamburger.classList.remove('active');
    } else if (window.innerWidth <= 768) {
        sidebar.style.display = 'flex';
        sidebar.style.position = 'fixed';
        sidebar.style.top = '72px';
        sidebar.style.left = '0';
        sidebar.style.right = '0';
        sidebar.style.bottom = '0';
        sidebar.style.zIndex = '999';
        sidebar.style.overflowY = 'auto';
        sidebar.style.padding = '20px';
        sidebar.style.background = 'var(--bg-primary)';
    }
});

function init() {
    loadProfile();
    renderSkills();
    renderProjects();
    renderExperiences();
}

document.addEventListener('DOMContentLoaded', init);