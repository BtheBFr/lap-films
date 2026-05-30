// ============= ПЕРЕМЕННЫЕ =============
let currentFilmId = null;
let allFilms = [];
let currentRating = 0;
let allReviewsData = {};
let reviewsExpanded = {};

// ↓↓↓ ТВОИ ССЫЛКИ (ВСТАВЬ СВОИ) ↓↓↓
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby86FMOsqBSKIP8qE_1T8W4G5mgINcSiV4z7TnIaVlHpvHR7YYROpSXrhMGO24yfT1C/exec";
const GOOGLE_RATINGS_URL = "https://script.google.com/macros/s/AKfycbyQjl03vdNZEjtyab3faMS-wD22urPYlWqb_mJjX0l0b8qsYwiZDuVmjPLs4-UQ8jj5/exec";

// ============= ФУНКЦИИ ДЛЯ ВИДЕО (VK VIDEO / RUTUBE / GOOGLE DRIVE) =============
function getFileIdFromPath(path) {
    if (!path) return null;
    // Для Google Drive
    let match = path.match(/[?&]id=([^&]+)/);
    if (match) return match[1];
    match = path.match(/\/d\/([^\/]+)/);
    if (match) return match[1];
    return null;
}

function getEmbedUrl(videoPath) {
    if (!videoPath) return '';
    
    // Если это VK Video — возвращаем как есть (уже embed-ссылка)
    if (videoPath.includes('vkvideo.ru/video_ext.php') || videoPath.includes('vk.com/video_ext.php')) {
        return videoPath;
    }
    
    // Если это Rutube — возвращаем как есть (уже embed-ссылка)
    if (videoPath.includes('rutube.ru/play/embed/')) {
        return videoPath;
    }
    
    // Если это Google Drive — конвертируем в preview
    const fileId = getFileIdFromPath(videoPath);
    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    return videoPath;
}

function getDownloadUrl(drivePath) {
    const fileId = getFileIdFromPath(drivePath);
    if (fileId) {
        return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
    }
    return drivePath;
}

// ============= ПОИСК =============
function searchFilms(query) {
    if (!query.trim()) return allFilms;
    const lowerQuery = query.toLowerCase().trim();
    return allFilms.filter(film => {
        if (film.title.toLowerCase().includes(lowerQuery)) return true;
        if (film.searchTerms && film.searchTerms.some(term => term.toLowerCase().includes(lowerQuery))) return true;
        return false;
    });
}

function renderFilmsGrid(filmsToRender) {
    const grid = document.getElementById('filmsGrid');
    if (!grid) return;
    
    if (filmsToRender.length === 0) {
        grid.innerHTML = '';
        const noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = 'none';
    
    grid.innerHTML = filmsToRender.map(film => {
        let comingBadge = '';
        if (film.comingSoon === true) {
            if (film.releaseDate) {
                const date = new Date(film.releaseDate);
                const day = date.getDate();
                const month = date.toLocaleString('ru', { month: 'long' });
                comingBadge = `<div class="coming-badge">📅 ${day} ${month}</div>`;
            } else {
                comingBadge = `<div class="coming-badge">⏳ Скоро</div>`;
            }
        }
        return `
            <div class="film-card" data-id="${film.id}">
                <img src="${film.poster}" alt="${film.title}" loading="lazy">
                <h3>${film.title}</h3>
                ${comingBadge}
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.film-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `player.html?id=${card.dataset.id}`;
        });
    });
}

// ============= ФОРМАТИРОВАНИЕ ДАТЫ =============
function formatDate(dateString) {
    if (!dateString || dateString === 'null') return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return `${date.getDate()} ${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`;
    } catch(e) {
        return null;
    }
}

function formatDateForReview(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return `${date.getDate()} ${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()} в ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    } catch(e) { 
        return dateString; 
    }
}

// ============= ПРОВЕРКА, ОЦЕНИВАЛ ЛИ ПОЛЬЗОВАТЕЛЬ =============
function hasUserRated(filmId) {
    const rated = localStorage.getItem(`rated_${filmId}`);
    return rated === 'true';
}

function markAsRated(filmId) {
    localStorage.setItem(`rated_${filmId}`, 'true');
}

// ============= ОТЗЫВЫ С КНОПКОЙ "БОЛЬШЕ" / "СВЕРНУТЬ" =============
async function loadReviews(filmId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-text">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`${GOOGLE_RATINGS_URL}?action=get&filmId=${filmId}`);
        const reviews = await response.json();
        allReviewsData[filmId] = reviews || [];
        reviewsExpanded[filmId] = false;
        displayReviews(filmId);
    } catch(e) {
        container.innerHTML = '<p class="empty-suggestions">Не удалось загрузить отзывы</p>';
    }
}

function displayReviews(filmId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    const reviews = allReviewsData[filmId];
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="empty-suggestions">Пока нет отзывов. Будьте первым!</p>';
        return;
    }
    
    let total = 0;
    reviews.forEach(r => total += parseInt(r.rating) || 0);
    const avg = (total / reviews.length).toFixed(1);
    
    let html = `<div class="average-rating">⭐ Средняя оценка: ${avg} / 5 (${reviews.length} ${reviews.length === 1 ? 'оценка' : 'оценок'})</div>`;
    
    const showAll = reviewsExpanded[filmId];
    const visibleReviews = showAll ? reviews : reviews.slice(0, 3);
    
    visibleReviews.forEach(r => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        html += `
            <div class="review-item">
                <div class="review-stars">${stars}</div>
                <div class="review-text">${escapeHtml(r.review || 'Без отзыва')}</div>
                <div class="review-date">${formatDateForReview(r.date)}</div>
            </div>
        `;
    });
    
    if (reviews.length > 3) {
        const buttonText = showAll ? '🔼 Свернуть' : '📖 Показать все (' + (reviews.length - 3) + ' ещё)';
        html += `<button class="toggle-reviews-btn" data-film-id="${filmId}">${buttonText}</button>`;
    }
    
    container.innerHTML = html;
    
    const toggleBtn = container.querySelector('.toggle-reviews-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            reviewsExpanded[filmId] = !reviewsExpanded[filmId];
            displayReviews(filmId);
        });
    }
}

// ============= ОТПРАВКА ОЦЕНКИ =============
async function sendRating(filmId, filmTitle, rating, review) {
    if (hasUserRated(filmId)) {
        return { success: false, message: "Вы уже оценили этот фильм. Спасибо!" };
    }
    
    try {
        await fetch(GOOGLE_RATINGS_URL, {
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filmId, filmTitle, rating, review, timestamp: new Date().toLocaleString('ru-RU') })
        });
        markAsRated(filmId);
        return { success: true, message: "Спасибо за оценку!" };
    } catch(e) { 
        return { success: false, message: "Ошибка отправки" };
    }
}

function initRatingModal(film) {
    const modal = document.getElementById('rateModal');
    const rateBtn = document.getElementById('rateBtn');
    const closeSpan = document.querySelector('.rate-close');
    const stars = document.querySelectorAll('#starsContainer span');
    const submitBtn = document.getElementById('submitRatingBtn');
    const reviewText = document.getElementById('reviewText');
    const statusDiv = document.getElementById('ratingStatus');
    
    if (!rateBtn || !modal) return;
    
    if (hasUserRated(film.id)) {
        rateBtn.disabled = true;
        rateBtn.style.opacity = '0.5';
        rateBtn.style.cursor = 'not-allowed';
        rateBtn.title = 'Вы уже оценили этот фильм';
    }
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            if (hasUserRated(film.id)) {
                statusDiv.innerHTML = '<span style="color:#ffc107">Вы уже оценили этот фильм</span>';
                return;
            }
            currentRating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                s.innerHTML = i < currentRating ? '★' : '☆';
                s.style.color = i < currentRating ? '#ffc107' : '#555';
            });
        });
    });
    
    rateBtn.onclick = () => {
        if (hasUserRated(film.id)) {
            statusDiv.innerHTML = '<span style="color:#ffc107">Вы уже оценили этот фильм</span>';
            setTimeout(() => statusDiv.innerHTML = '', 2000);
            return;
        }
        modal.style.display = 'flex';
        currentRating = 0;
        stars.forEach(s => { s.innerHTML = '☆'; s.style.color = '#555'; });
        reviewText.value = '';
        statusDiv.innerHTML = '';
    };
    
    if (closeSpan) closeSpan.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    
    submitBtn.onclick = async () => {
        if (hasUserRated(film.id)) {
            statusDiv.innerHTML = '<span style="color:#ffc107">Вы уже оценили этот фильм</span>';
            setTimeout(() => modal.style.display = 'none', 1500);
            return;
        }
        if (currentRating === 0) { 
            statusDiv.innerHTML = '<span style="color:#e50914">Поставьте оценку</span>'; 
            return; 
        }
        
        statusDiv.innerHTML = '<span style="color:#ffaa00">Отправка...</span>';
        submitBtn.disabled = true;
        
        const result = await sendRating(film.id, film.title, currentRating, reviewText.value);
        
        submitBtn.disabled = false;
        
        if (result.success) {
            statusDiv.innerHTML = `<span style="color:#4caf50">${result.message}</span>`;
            rateBtn.disabled = true;
            rateBtn.style.opacity = '0.5';
            rateBtn.style.cursor = 'not-allowed';
            setTimeout(() => {
                modal.style.display = 'none';
                loadReviews(film.id);
            }, 1500);
        } else {
            statusDiv.innerHTML = `<span style="color:#e50914">${result.message}</span>`;
        }
    };
}

// ============= ПЛЕЕР =============
function initPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) { 
        window.location.href = 'index.html'; 
        return; 
    }
    
    const film = allFilms.find(f => f.id === filmId);
    if (!film) { 
        window.location.href = 'index.html'; 
        return; 
    }
    
    document.getElementById('filmTitle').textContent = film.title;
    document.getElementById('filmPoster').src = film.poster;
    document.getElementById('filmDescription').textContent = film.description || '';
    
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn && film.downloadUrl) {
        downloadBtn.href = getDownloadUrl(film.downloadUrl);
        downloadBtn.style.display = 'inline-flex';
    } else if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }
    
    loadReviews(filmId);
    initRatingModal(film);
    
    const seasonNav = document.getElementById('seasonSeriesNav');
    if (!film.betterVersionReady && film.betterVersionDate && film.betterVersionDate !== 'null') {
        const formattedDate = formatDate(film.betterVersionDate);
        if (formattedDate) {
            seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия выйдет ${formattedDate}</div>`;
        } else {
            seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия скоро</div>`;
        }
    } else if (!film.betterVersionReady && film.betterVersionDate === null) {
        seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия скоро</div>`;
    } else {
        seasonNav.innerHTML = '';
    }
    
    const watchBtn = document.getElementById('watchBtn');
    const iframe = document.getElementById('driveIframe');
    
    if (watchBtn && iframe && film.videoUrl) {
        watchBtn.onclick = () => {
            const embedUrl = getEmbedUrl(film.videoUrl);
            iframe.src = embedUrl;
        };
    }
}

// ============= ПРЕДЛОЖЕНИЯ =============
async function sendToGoogleSheets(filmName, comment) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filmName, comment, timestamp: new Date().toLocaleString('ru-RU') })
        });
        return { success: true, message: "Спасибо! Фильм предложен." };
    } catch(e) { 
        return { success: false, message: "Ошибка отправки" }; 
    }
}

async function loadSuggestedFilms() {
    const container = document.getElementById('suggestedFilmsList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-text">Загрузка...</div>';
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=get`);
        const films = await response.json();
        if (!films || films.length === 0) { 
            container.innerHTML = '<p class="empty-suggestions">Пока нет предложенных фильмов</p>'; 
            return; 
        }
        container.innerHTML = films.map(f => `<div class="suggested-film-item"><span class="suggested-film-name">🎬 ${escapeHtml(f.name)}</span><span class="suggested-film-date">${f.date ? new Date(f.date).toLocaleDateString() : ''}</span></div>`).join('');
    } catch(e) { 
        container.innerHTML = '<p class="empty-suggestions">Не удалось загрузить список</p>'; 
    }
}

function initModal() {
    const modal = document.getElementById('suggestModal');
    const openBtns = document.querySelectorAll('#suggestFilmBtn');
    const closeSpan = document.querySelector('#suggestModal .modal-close');
    const showBtn = document.getElementById('showSuggestedBtn');
    const suggestContainer = document.getElementById('suggestedFilmsContainer');
    const submitBtn = document.getElementById('submitSuggestionBtn');
    const filmInput = document.getElementById('suggestFilmInput');
    const commentInput = document.getElementById('suggestCommentInput');
    const statusDiv = document.getElementById('suggestStatus');
    const spinner = document.getElementById('loadingSpinner');
    
    if (!modal) return;
    
    openBtns.forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                modal.style.display = 'flex';
                if (filmInput) filmInput.value = '';
                if (commentInput) commentInput.value = '';
                if (statusDiv) statusDiv.innerHTML = '';
                if (suggestContainer) suggestContainer.style.display = 'none';
            };
        }
    });
    
    if (showBtn) {
        showBtn.onclick = async () => { 
            if (suggestContainer) { 
                suggestContainer.style.display = 'block'; 
                await loadSuggestedFilms(); 
            } 
        };
    }
    
    if (closeSpan) closeSpan.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
    
    if (submitBtn) {
        submitBtn.onclick = async () => {
            const name = filmInput.value.trim();
            if (!name) { 
                statusDiv.innerHTML = '<span style="color:#e50914">Введите название</span>'; 
                return; 
            }
            if (spinner) spinner.style.display = 'inline-block';
            statusDiv.innerHTML = '<span style="color:#ffaa00">Отправка...</span>';
            submitBtn.disabled = true;
            const result = await sendToGoogleSheets(name, commentInput.value);
            if (spinner) spinner.style.display = 'none';
            submitBtn.disabled = false;
            if (result.success) {
                statusDiv.innerHTML = `<span style="color:#4caf50">${result.message}</span>`;
                filmInput.value = '';
                commentInput.value = '';
                if (suggestContainer && suggestContainer.style.display === 'block') await loadSuggestedFilms();
                setTimeout(() => statusDiv.innerHTML = '', 3000);
            } else {
                statusDiv.innerHTML = `<span style="color:#e50914">${result.message}</span>`;
            }
        };
    }
}

function escapeHtml(str) { 
    if (!str) return ''; 
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); 
}

// ============= ЗАПУСК =============
document.addEventListener('DOMContentLoaded', () => {
    if (typeof FILMS_CATALOG !== 'undefined') allFilms = [...FILMS_CATALOG];
    
    if (document.getElementById('filmsGrid')) {
        renderFilmsGrid(allFilms);
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.addEventListener('input', e => {
                const val = e.target.value;
                if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
                renderFilmsGrid(searchFilms(val));
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                clearBtn.style.display = 'none';
                renderFilmsGrid(allFilms);
                if (searchInput) searchInput.focus();
            });
        }
    }
    
    if (document.getElementById('driveIframe')) initPlayer();
    
    const otherLinks = document.querySelectorAll('#otherProjectsLink');
    otherLinks.forEach(link => link && (link.href = '#'));
    
    initModal();
});
