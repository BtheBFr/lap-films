// ============= ПЕРЕМЕННЫЕ =============
let currentFilmId = null;
let allFilms = [];
let currentRating = 0;
let allReviewsData = {};
let reviewsExpanded = {};
let currentCategory = null;   // выбранная главная категория (ключ)
let currentSubcategory = null; // выбранная подкатегория (ключ)
let currentLetter = null;     // выбранная буква

// ↓↓↓ ТВОИ ССЫЛКИ (ВСТАВЬ СВОИ) ↓↓↓
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby86FMOsqBSKIP8qE_1T8W4G5mgINcSiV4z7TnIaVlHpvHR7YYROpSXrhMGO24yfT1C/exec";
const GOOGLE_RATINGS_URL = "https://script.google.com/macros/s/AKfycbyQjl03vdNZEjtyab3faMS-wD22urPYlWqb_mJjX0l0b8qsYwiZDuVmjPLs4-UQ8jj5/exec";

// ============= ПОДДЕРЖКА DAILYMOTION, YOUTUBE, GOOGLE DRIVE =============
function getEmbedUrl(videoPath) {
    if (!videoPath) return '';
    
    // YouTube
    if (videoPath.includes('youtube.com/watch') || videoPath.includes('youtu.be/')) {
        return convertToYouTubeEmbed(videoPath);
    }
    if (videoPath.includes('youtube.com/embed/')) {
        return videoPath;
    }
    
    // Dailymotion
    if (videoPath.includes('dailymotion.com') || videoPath.includes('dai.ly')) {
        let videoId = null;
        let match = videoPath.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
        if (match) videoId = match[1];
        if (!videoId) {
            match = videoPath.match(/dai\.ly\/([a-zA-Z0-9]+)/);
            if (match) videoId = match[1];
        }
        if (videoId) {
            return `https://www.dailymotion.com/embed/video/${videoId}`;
        }
        return videoPath;
    }
    
    // Google Drive
    if (videoPath.includes('drive.google.com') || videoPath.includes('drive.usercontent.google.com')) {
        return convertToDriveEmbed(videoPath);
    }
    
    return '';
}

function convertToYouTubeEmbed(url) {
    let videoId = null;
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) videoId = match[1];
    if (!videoId) {
        match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) videoId = match[1];
    }
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

function convertToDriveEmbed(url) {
    let fileId = null;
    let match = url.match(/\/d\/([^\/]+)/);
    if (match) fileId = match[1];
    if (!fileId) {
        match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
    }
    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
}

function getFileIdFromPath(path) {
    if (!path) return null;
    let match = path.match(/[?&]id=([^&]+)/);
    if (match) return match[1];
    match = path.match(/\/d\/([^\/]+)/);
    if (match) return match[1];
    return null;
}

function getDownloadUrl(drivePath) {
    if (!drivePath) return null;
    const fileId = getFileIdFromPath(drivePath);
    if (fileId) {
        return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
    }
    return drivePath;
}

// ============= ПОИСК И ФИЛЬТРЫ =============
function searchFilms(query) {
    if (!query.trim()) return allFilms;
    const lowerQuery = query.toLowerCase().trim();
    return allFilms.filter(film => {
        if (film.title.toLowerCase().includes(lowerQuery)) return true;
        if (film.searchTerms && film.searchTerms.some(term => term.toLowerCase().includes(lowerQuery))) return true;
        return false;
    });
}

function filterFilms(films) {
    let result = [...films];
    if (currentCategory) {
        result = result.filter(f => f.category === currentCategory);
        if (currentSubcategory) {
            result = result.filter(f => f.subcategory === currentSubcategory);
        }
    }
    if (currentLetter) {
        result = result.filter(f => {
            const firstChar = f.title.charAt(0).toUpperCase();
            return firstChar === currentLetter;
        });
    }
    return result;
}

// ============= РЕНДЕР ГЛАВНОЙ СТРАНИЦЫ =============
function renderTopCarousel() {
    const container = document.getElementById('topCarousel');
    if (!container) return;
    
    const topFilms = TOP_FILMS_IDS.map(id => allFilms.find(f => f.id === id)).filter(Boolean);
    if (topFilms.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';
    const carousel = document.getElementById('topCarouselList');
    if (!carousel) return;
    
    carousel.innerHTML = topFilms.map(film => `
        <div class="top-film-item" data-id="${film.id}">
            <img src="${film.poster}" alt="${film.title}" loading="lazy">
            <div class="top-film-title">${film.title}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.top-film-item').forEach(item => {
        item.addEventListener('click', () => {
            window.location.href = `player.html?id=${item.dataset.id}`;
        });
    });
}

function renderFilmsGrid(filmsToRender) {
    const grid = document.getElementById('filmsGrid');
    if (!grid) return;
    
    const filtered = filterFilms(filmsToRender);
    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    
    if (sorted.length === 0) {
        grid.innerHTML = '';
        document.getElementById('noResults').style.display = 'block';
        return;
    }
    document.getElementById('noResults').style.display = 'none';
    
    grid.innerHTML = sorted.map(film => {
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

function updateCatalog() {
    const searchQuery = document.getElementById('searchInput')?.value || '';
    const searched = searchFilms(searchQuery);
    renderFilmsGrid(searched);
}

// ============= АЛФАВИТ =============
function renderAlphabet() {
    const container = document.getElementById('alphabetContainer');
    if (!container) return;
    const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
    container.innerHTML = letters.map(letter => `
        <span class="alphabet-letter ${currentLetter === letter ? 'active' : ''}" data-letter="${letter}">${letter}</span>
    `).join('');
    container.querySelectorAll('.alphabet-letter').forEach(el => {
        el.addEventListener('click', () => {
            const letter = el.dataset.letter;
            if (currentLetter === letter) currentLetter = null;
            else currentLetter = letter;
            updateCatalog();
            renderAlphabet();
        });
    });
}

// ============= КАТЕГОРИИ =============
function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    const mainCategories = Object.keys(CATEGORIES);
    let html = `<div class="category-main-list">`;
    html += `<button class="category-main-btn ${!currentCategory ? 'active' : ''}" data-category="">Все</button>`;
    mainCategories.forEach(key => {
        html += `<button class="category-main-btn ${currentCategory === key ? 'active' : ''}" data-category="${key}">${CATEGORIES[key].label}</button>`;
    });
    html += `</div>`;
    if (currentCategory && CATEGORIES[currentCategory]) {
        const subs = CATEGORIES[currentCategory].subcategories;
        const subKeys = Object.keys(subs);
        html += `<div class="category-sub-list">`;
        html += `<button class="category-sub-btn ${!currentSubcategory ? 'active' : ''}" data-subcategory="">Все</button>`;
        subKeys.forEach(key => {
            html += `<button class="category-sub-btn ${currentSubcategory === key ? 'active' : ''}" data-subcategory="${key}">${subs[key]}</button>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.category-main-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.category;
            if (currentCategory === cat) {
                currentCategory = null;
                currentSubcategory = null;
            } else {
                currentCategory = cat;
                currentSubcategory = null;
            }
            renderCategoryFilters();
            updateCatalog();
        });
    });
    container.querySelectorAll('.category-sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sub = btn.dataset.subcategory;
            currentSubcategory = sub || null;
            renderCategoryFilters();
            updateCatalog();
        });
    });
}

// ============= ОТЗЫВЫ =============
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

function formatDateForReview(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return `${date.getDate()} ${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()} в ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    } catch(e) { return dateString; }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

// ============= ОЦЕНКИ =============
function hasUserRated(filmId) {
    return localStorage.getItem(`rated_${filmId}`) === 'true';
}

function markAsRated(filmId) {
    localStorage.setItem(`rated_${filmId}`, 'true');
}

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
    // сброс состояния при смене фильма
    if (hasUserRated(film.id)) {
        rateBtn.disabled = true;
        rateBtn.style.opacity = '0.5';
        rateBtn.style.cursor = 'not-allowed';
        rateBtn.title = 'Вы уже оценили этот фильм';
    } else {
        rateBtn.disabled = false;
        rateBtn.style.opacity = '1';
        rateBtn.style.cursor = 'pointer';
        rateBtn.title = '';
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

// ============= ПЛЕЕР С ПОДДЕРЖКОЙ СИКВЕЛОВ =============
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
    
    // Загружаем информацию о фильме
    loadFilmPart(film);
    
    // Обработка сиквелов: если есть группа, показываем переключатель
    const sequelNav = document.getElementById('sequelNav');
    if (sequelNav && film.sequelGroup) {
        const groupFilms = allFilms.filter(f => f.sequelGroup === film.sequelGroup)
                                   .sort((a,b) => (a.sequelOrder || 0) - (b.sequelOrder || 0));
        if (groupFilms.length > 1) {
            sequelNav.style.display = 'flex';
            sequelNav.innerHTML = groupFilms.map(f => `
                <button class="sequel-btn ${f.id === film.id ? 'active' : ''}" data-id="${f.id}">${f.title}</button>
            `).join('');
            sequelNav.querySelectorAll('.sequel-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newFilm = allFilms.find(f => f.id === btn.dataset.id);
                    if (newFilm) {
                        // обновляем URL без перезагрузки (опционально)
                        history.pushState(null, '', `?id=${newFilm.id}`);
                        loadFilmPart(newFilm);
                        // обновляем активный класс
                        sequelNav.querySelectorAll('.sequel-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                });
            });
        } else {
            sequelNav.style.display = 'none';
        }
    } else if (sequelNav) {
        sequelNav.style.display = 'none';
    }
}

function loadFilmPart(film) {
    // Обновляем основные элементы
    document.getElementById('filmTitle').textContent = film.title;
    document.getElementById('filmPoster').src = film.poster;
    document.getElementById('filmDescription').textContent = film.description || '';
    
    // Кнопка скачивания
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        if (film.downloadUrl && film.videoUrl && film.videoUrl.includes('drive.google.com')) {
            downloadBtn.href = getDownloadUrl(film.downloadUrl);
            downloadBtn.style.display = 'inline-flex';
        } else {
            downloadBtn.style.display = 'none';
        }
    }
    
    // Загружаем отзывы для этого фильма
    loadReviews(film.id);
    
    // Инициализируем модалку оценки (сбрасываем состояние)
    initRatingModal(film);
    
    // Обновляем информацию об улучшенной версии
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
    
    // Видео
    const watchBtn = document.getElementById('watchBtn');
    const iframe = document.getElementById('driveIframe');
    if (watchBtn && iframe && film.videoUrl) {
        watchBtn.onclick = () => {
            const embedUrl = getEmbedUrl(film.videoUrl);
            iframe.src = embedUrl;
        };
        // Если хотите авто-загрузку при смене части, можно раскомментировать:
        // iframe.src = getEmbedUrl(film.videoUrl);
    }
}

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

// ============= ПРЕДЛОЖЕНИЯ (без изменений) =============
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

// ============= ЗАПУСК =============
document.addEventListener('DOMContentLoaded', () => {
    if (typeof FILMS_CATALOG !== 'undefined') allFilms = [...FILMS_CATALOG];
    
    if (document.getElementById('filmsGrid')) {
        renderTopCarousel();
        renderAlphabet();
        renderCategoryFilters();
        updateCatalog();
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        if (searchInput) {
            searchInput.addEventListener('input', e => {
                const val = e.target.value;
                if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
                updateCatalog();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                clearBtn.style.display = 'none';
                currentLetter = null;
                currentCategory = null;
                currentSubcategory = null;
                renderAlphabet();
                renderCategoryFilters();
                updateCatalog();
                if (searchInput) searchInput.focus();
            });
        }
    }
    
    if (document.getElementById('driveIframe')) initPlayer();
    
    document.querySelectorAll('#otherProjectsLink').forEach(link => link && (link.href = '#'));
    initModal();
});
