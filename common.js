// ============= ПЕРЕМЕННЫЕ =============
let allFilms = [];
let currentRating = 0;
let allReviewsData = {};
let reviewsExpanded = {};
let currentCategory = null;
let currentSubcategory = null;
let bestPage = 0;
const BEST_PER_PAGE = 10;

// ↓↓↓ ТВОИ ССЫЛКИ ↓↓↓
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby86FMOsqBSKIP8qE_1T8W4G5mgINcSiV4z7TnIaVlHpvHR7YYROpSXrhMGO24yfT1C/exec";
const GOOGLE_RATINGS_URL = "https://script.google.com/macros/s/AKfycbyQjl03vdNZEjtyab3faMS-wD22urPYlWqb_mJjX0l0b8qsYwiZDuVmjPLs4-UQ8jj5/exec";

// ============= ВСПОМОГАТЕЛЬНЫЕ =============
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// ============= ВИДЕО-ПЛЕЕР =============
function getEmbedUrl(videoPath) {
    if (!videoPath) return '';
    if (videoPath.includes('youtube.com/watch') || videoPath.includes('youtu.be/')) {
        return convertToYouTubeEmbed(videoPath);
    }
    if (videoPath.includes('youtube.com/embed/')) return videoPath;
    if (videoPath.includes('dailymotion.com') || videoPath.includes('dai.ly')) {
        let videoId = null;
        let match = videoPath.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
        if (match) videoId = match[1];
        if (!videoId) {
            match = videoPath.match(/dai\.ly\/([a-zA-Z0-9]+)/);
            if (match) videoId = match[1];
        }
        if (videoId) return `https://www.dailymotion.com/embed/video/${videoId}`;
        return videoPath;
    }
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
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
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
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
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
    if (fileId) return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
    return drivePath;
}

// ============= ФИЛЬТРЫ =============
function searchFilms(query) {
    if (!query.trim()) return allFilms;
    const lower = query.toLowerCase().trim();
    return allFilms.filter(f => 
        f.title.toLowerCase().includes(lower) ||
        (f.searchTerms && f.searchTerms.some(t => t.toLowerCase().includes(lower)))
    );
}

function filterFilms(films) {
    let result = [...films];
    if (currentCategory) {
        result = result.filter(f => f.category === currentCategory);
        if (currentSubcategory) result = result.filter(f => f.subcategory === currentSubcategory);
    }
    return result;
}

// ============= ГЛАВНАЯ СТРАНИЦА =============

// --- ЛУЧШИЕ ФИЛЬМЫ ---
function renderBestFilms() {
    const container = document.getElementById('bestFilmsContainer');
    if (!container) return;

    const bestFilms = allFilms.filter(f => f.isTop === true);
    if (bestFilms.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';

    const totalPages = Math.ceil(bestFilms.length / BEST_PER_PAGE);
    if (bestPage >= totalPages) bestPage = totalPages - 1;
    if (bestPage < 0) bestPage = 0;

    const start = bestPage * BEST_PER_PAGE;
    const end = Math.min(start + BEST_PER_PAGE, bestFilms.length);
    const pageFilms = bestFilms.slice(start, end);

    const wrapper = document.getElementById('bestFilmsWrapper');
    wrapper.innerHTML = pageFilms.map(film => `
        <div class="best-film-item" data-id="${film.id}">
            <img src="${film.poster}" alt="${film.title}" loading="lazy">
            <div class="best-film-title">${film.title}</div>
        </div>
    `).join('');

    wrapper.querySelectorAll('.best-film-item').forEach(el => {
        el.addEventListener('click', function() {
            showLoading();
            window.location.href = `player.html?id=${this.dataset.id}`;
        });
    });

    const prevBtn = document.getElementById('bestPrev');
    const nextBtn = document.getElementById('bestNext');
    const pageInfo = document.getElementById('bestPageInfo');
    if (prevBtn) {
        prevBtn.disabled = bestPage === 0;
        prevBtn.onclick = () => { if (bestPage > 0) { bestPage--; renderBestFilms(); } };
    }
    if (nextBtn) {
        nextBtn.disabled = bestPage >= totalPages - 1;
        nextBtn.onclick = () => { if (bestPage < totalPages - 1) { bestPage++; renderBestFilms(); } };
    }
    if (pageInfo) {
        pageInfo.textContent = `${bestPage + 1} / ${totalPages}`;
    }
}

// --- ОТОБРАЖЕНИЕ ФИЛЬТРОВ ---
function renderFiltersInfo() {
    const container = document.getElementById('filtersInfo');
    if (!container) return;
    let parts = [];
    if (currentCategory && CATEGORIES[currentCategory]) {
        let label = CATEGORIES[currentCategory].label;
        if (currentSubcategory && CATEGORIES[currentCategory].subcategories[currentSubcategory]) {
            label += ' → ' + CATEGORIES[currentCategory].subcategories[currentSubcategory];
        }
        parts.push(label);
    }
    const searchQuery = document.getElementById('searchInput')?.value?.trim();
    if (searchQuery) {
        parts.push(`Поиск: "${searchQuery}"`);
    }
    if (parts.length === 0) {
        container.innerHTML = '<span style="color:#666;">Все фильмы</span>';
    } else {
        container.innerHTML = parts.map(p => `<span>${p}</span>`).join(' ');
    }
}

// --- СЕТКА ФИЛЬМОВ ---
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
        if (film.comingSoon) {
            if (film.releaseDate) {
                const date = new Date(film.releaseDate);
                comingBadge = `<div class="coming-badge">📅 ${date.getDate()} ${date.toLocaleString('ru', { month: 'long' })}</div>`;
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
        card.addEventListener('click', function() {
            showLoading();
            window.location.href = `player.html?id=${this.dataset.id}`;
        });
    });

    renderFiltersInfo();
}

function updateCatalog() {
    const query = document.getElementById('searchInput')?.value || '';
    const searched = searchFilms(query);
    renderFilmsGrid(searched);
}

// --- КАТЕГОРИИ (модальное окно) ---
function renderCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (!modal) return;
    const mainKeys = Object.keys(CATEGORIES);
    let html = `<div class="category-main-list">`;
    html += `<button class="category-main-btn ${!currentCategory ? 'active' : ''}" data-category="">Все</button>`;
    mainKeys.forEach(key => {
        html += `<button class="category-main-btn ${currentCategory === key ? 'active' : ''}" data-category="${key}">${CATEGORIES[key].label}</button>`;
    });
    html += `</div>`;
    html += `<div class="category-divider"></div>`;
    if (currentCategory && CATEGORIES[currentCategory]) {
        const subs = CATEGORIES[currentCategory].subcategories;
        const subKeys = Object.keys(subs);
        html += `<div class="category-sub-list">`;
        html += `<button class="category-sub-btn ${!currentSubcategory ? 'active' : ''}" data-subcategory="">Все</button>`;
        subKeys.forEach(key => {
            html += `<button class="category-sub-btn ${currentSubcategory === key ? 'active' : ''}" data-subcategory="${key}">${subs[key]}</button>`;
        });
        html += `</div>`;
    } else {
        html += `<div class="category-sub-list" style="opacity:0.5;"><span style="color:#666; font-size:0.8rem;">Выберите категорию</span></div>`;
    }
    modal.querySelector('.modal-content').innerHTML = `
        <span class="modal-close" id="categoryModalClose">&times;</span>
        <h3>🎬 Выбор категорий</h3>
        ${html}
    `;
    modal.querySelectorAll('.category-main-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cat = this.dataset.category;
            if (currentCategory === cat) {
                currentCategory = null;
                currentSubcategory = null;
            } else {
                currentCategory = cat;
                currentSubcategory = null;
            }
            renderCategoryModal();
            updateCatalog();
        });
    });
    modal.querySelectorAll('.category-sub-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sub = this.dataset.subcategory;
            currentSubcategory = sub || null;
            renderCategoryModal();
            updateCatalog();
        });
    });
    document.getElementById('categoryModalClose').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

function openCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        renderCategoryModal();
        modal.style.display = 'flex';
    }
}

// ============= ПЛЕЕР =============
function initPlayer() {
    showLoading();
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) { window.location.href = 'index.html'; return; }
    const film = allFilms.find(f => f.id === filmId);
    if (!film) { window.location.href = 'index.html'; return; }

    // Загружаем данные фильма
    loadFilmPart(film);

    // Сиквелы
    if (film.sequelGroup) {
        const groupFilms = allFilms.filter(f => f.sequelGroup === film.sequelGroup)
                                   .sort((a,b) => (a.sequelOrder || 0) - (b.sequelOrder || 0));
        if (groupFilms.length > 1) {
            const desktopNav = document.getElementById('sequelNavDesktop');
            if (desktopNav) {
                desktopNav.style.display = 'flex';
                desktopNav.innerHTML = groupFilms.map(f => `
                    <button class="sequel-btn ${f.id === film.id ? 'active' : ''}" data-id="${f.id}">${f.title}</button>
                `).join('');
                desktopNav.querySelectorAll('.sequel-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        switchSequel(this.dataset.id);
                    });
                });
            }
            const mobileNav = document.getElementById('sequelNavMobile');
            if (mobileNav) {
                mobileNav.style.display = 'flex';
                mobileNav.innerHTML = groupFilms.map(f => `
                    <button class="sequel-btn ${f.id === film.id ? 'active' : ''}" data-id="${f.id}">${f.title}</button>
                `).join('');
                mobileNav.querySelectorAll('.sequel-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        switchSequel(this.dataset.id);
                    });
                });
            }
        } else {
            document.querySelectorAll('.sequel-nav').forEach(el => el.style.display = 'none');
        }
    } else {
        document.querySelectorAll('.sequel-nav').forEach(el => el.style.display = 'none');
    }

    // Кнопка "Следующая серия"
    const nextBtn = document.getElementById('nextEpisodeBtn');
    if (nextBtn) {
        if (film.seasons && typeof film.seasons === 'object' && Object.keys(film.seasons).length > 0) {
            nextBtn.style.display = 'inline-flex';
            window._currentFilm = film;
            window._currentSeason = null;
            window._currentSeries = null;
            const seasonParam = urlParams.get('season');
            const seriesParam = urlParams.get('series');
            if (seasonParam && seriesParam && film.seasons[seasonParam] && film.seasons[seasonParam].series[seriesParam]) {
                window._currentSeason = seasonParam;
                window._currentSeries = seriesParam;
            } else {
                const seasonsKeys = Object.keys(film.seasons).sort();
                if (seasonsKeys.length > 0) {
                    const firstSeason = seasonsKeys[0];
                    const seriesKeys = Object.keys(film.seasons[firstSeason].series).sort();
                    if (seriesKeys.length > 0) {
                        window._currentSeason = firstSeason;
                        window._currentSeries = seriesKeys[0];
                    }
                }
            }
            nextBtn.onclick = function() {
                goToNextEpisode(film);
            };
        } else {
            nextBtn.style.display = 'none';
        }
    }

    // Скрываем загрузку после того, как всё загружено
    setTimeout(() => hideLoading(), 500); // небольшая задержка для уверенности
}

function goToNextEpisode(film) {
    if (!film.seasons) return;
    const seasonsKeys = Object.keys(film.seasons).sort();
    if (seasonsKeys.length === 0) return;

    let currentSeason = window._currentSeason;
    let currentSeries = window._currentSeries;

    if (!currentSeason || !currentSeries) {
        currentSeason = seasonsKeys[0];
        const seriesKeys = Object.keys(film.seasons[currentSeason].series).sort();
        if (seriesKeys.length === 0) return;
        currentSeries = seriesKeys[0];
    }

    const seasonObj = film.seasons[currentSeason];
    const seriesKeys = Object.keys(seasonObj.series).sort();
    const currentIndex = seriesKeys.indexOf(currentSeries);
    let nextSeries = null;
    let nextSeason = currentSeason;

    if (currentIndex < seriesKeys.length - 1) {
        nextSeries = seriesKeys[currentIndex + 1];
    } else {
        const currentSeasonIndex = seasonsKeys.indexOf(currentSeason);
        if (currentSeasonIndex < seasonsKeys.length - 1) {
            nextSeason = seasonsKeys[currentSeasonIndex + 1];
            const nextSeriesKeys = Object.keys(film.seasons[nextSeason].series).sort();
            if (nextSeriesKeys.length > 0) {
                nextSeries = nextSeriesKeys[0];
            }
        }
    }

    if (nextSeries) {
        window._currentSeason = nextSeason;
        window._currentSeries = nextSeries;
        const newVideoUrl = film.seasons[nextSeason].series[nextSeries].videoUrl;
        if (newVideoUrl) {
            const iframe = document.getElementById('driveIframe');
            if (iframe) {
                iframe.src = getEmbedUrl(newVideoUrl);
            }
            updateSeasonSeriesUI(film, nextSeason, nextSeries);
        }
    } else {
        alert('Это последняя серия!');
    }
}

function updateSeasonSeriesUI(film, seasonKey, seriesKey) {
    const seasonBtns = document.querySelectorAll('.season-btn');
    const seriesBtns = document.querySelectorAll('.series-btn');
    seasonBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.season === seasonKey);
    });
    seriesBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.series === seriesKey);
    });
}

function switchSequel(id) {
    const newFilm = allFilms.find(f => f.id === id);
    if (newFilm) {
        history.pushState(null, '', `?id=${newFilm.id}`);
        loadFilmPart(newFilm);
        document.querySelectorAll('.sequel-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.sequel-btn[data-id="${newFilm.id}"]`).forEach(b => b.classList.add('active'));
        window._currentFilm = newFilm;
        window._currentSeason = null;
        window._currentSeries = null;
        const nextBtn = document.getElementById('nextEpisodeBtn');
        if (nextBtn) {
            if (newFilm.seasons && typeof newFilm.seasons === 'object' && Object.keys(newFilm.seasons).length > 0) {
                nextBtn.style.display = 'inline-flex';
                const seasonsKeys = Object.keys(newFilm.seasons).sort();
                if (seasonsKeys.length > 0) {
                    const firstSeason = seasonsKeys[0];
                    const seriesKeys = Object.keys(newFilm.seasons[firstSeason].series).sort();
                    if (seriesKeys.length > 0) {
                        window._currentSeason = firstSeason;
                        window._currentSeries = seriesKeys[0];
                    }
                }
                nextBtn.onclick = function() {
                    goToNextEpisode(newFilm);
                };
            } else {
                nextBtn.style.display = 'none';
            }
        }
    }
}

function loadFilmPart(film) {
    // Обновляем информацию на странице
    document.getElementById('filmTitle').textContent = film.title;
    document.getElementById('filmPoster').src = film.poster;
    document.getElementById('filmDescription').textContent = film.description || '';

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        if (film.downloadUrl && film.videoUrl && film.videoUrl.includes('drive.google.com')) {
            downloadBtn.href = getDownloadUrl(film.downloadUrl);
            downloadBtn.style.display = 'inline-flex';
        } else {
            downloadBtn.style.display = 'none';
        }
    }

    // Загружаем отзывы и модалку оценки (асинхронно)
    loadReviews(film.id);
    initRatingModal(film);

    // Навигация по сезонам
    const seasonNav = document.getElementById('seasonSeriesNav');
    if (film.seasons && typeof film.seasons === 'object' && Object.keys(film.seasons).length > 0) {
        const seasonsKeys = Object.keys(film.seasons).sort();
        let html = '<div class="season-nav">';
        seasonsKeys.forEach(sKey => {
            html += `<button class="season-btn ${sKey === window._currentSeason ? 'active' : ''}" data-season="${sKey}">${film.seasons[sKey].title || 'Сезон '+sKey}</button>`;
        });
        html += '</div>';
        if (window._currentSeason && film.seasons[window._currentSeason]) {
            const seriesKeys = Object.keys(film.seasons[window._currentSeason].series).sort();
            html += '<div class="series-nav">';
            seriesKeys.forEach(srKey => {
                html += `<button class="series-btn ${srKey === window._currentSeries ? 'active' : ''}" data-series="${srKey}">${film.seasons[window._currentSeason].series[srKey].title || 'Серия '+srKey}</button>`;
            });
            html += '</div>';
        }
        seasonNav.innerHTML = html;
        // Обработчики для сезонов
        seasonNav.querySelectorAll('.season-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sKey = this.dataset.season;
                if (film.seasons[sKey]) {
                    window._currentSeason = sKey;
                    const seriesKeys = Object.keys(film.seasons[sKey].series).sort();
                    if (seriesKeys.length > 0) {
                        window._currentSeries = seriesKeys[0];
                        const videoUrl = film.seasons[sKey].series[window._currentSeries].videoUrl;
                        if (videoUrl) {
                            const iframe = document.getElementById('driveIframe');
                            if (iframe) iframe.src = getEmbedUrl(videoUrl);
                        }
                        loadFilmPart(film);
                    }
                }
            });
        });
        seasonNav.querySelectorAll('.series-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const srKey = this.dataset.series;
                if (window._currentSeason && film.seasons[window._currentSeason] && film.seasons[window._currentSeason].series[srKey]) {
                    window._currentSeries = srKey;
                    const videoUrl = film.seasons[window._currentSeason].series[srKey].videoUrl;
                    if (videoUrl) {
                        const iframe = document.getElementById('driveIframe');
                        if (iframe) iframe.src = getEmbedUrl(videoUrl);
                    }
                    seasonNav.querySelectorAll('.series-btn').forEach(b => b.classList.toggle('active', b.dataset.series === srKey));
                }
            });
        });
    } else {
        // Если нет сезонов, показываем улучшенную версию
        if (!film.betterVersionReady && film.betterVersionDate && film.betterVersionDate !== 'null') {
            const formatted = formatDate(film.betterVersionDate);
            seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия выйдет ${formatted || 'скоро'}</div>`;
        } else if (!film.betterVersionReady && film.betterVersionDate === null) {
            seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия скоро</div>`;
        } else {
            seasonNav.innerHTML = '';
        }
    }

    // Видео
    const iframe = document.getElementById('driveIframe');
    const watchBtn = document.getElementById('watchBtn');
    if (iframe) {
        let videoUrl = null;
        if (film.seasons && window._currentSeason && window._currentSeries) {
            videoUrl = film.seasons[window._currentSeason]?.series[window._currentSeries]?.videoUrl;
        } else if (film.videoUrl) {
            videoUrl = film.videoUrl;
        }
        if (videoUrl) {
            const embedUrl = getEmbedUrl(videoUrl);
            iframe.src = embedUrl;
            watchBtn.onclick = function() {
                iframe.src = '';
                setTimeout(() => { iframe.src = embedUrl; }, 100);
            };
        } else {
            watchBtn.style.display = 'none';
        }
    }
}

function formatDate(dateString) {
    if (!dateString || dateString === 'null') return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return `${date.getDate()} ${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`;
    } catch(e) { return null; }
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
    container.querySelector('.toggle-reviews-btn')?.addEventListener('click', function() {
        reviewsExpanded[filmId] = !reviewsExpanded[filmId];
        displayReviews(filmId);
    });
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
function hasUserRated(filmId) { return localStorage.getItem(`rated_${filmId}`) === 'true'; }
function markAsRated(filmId) { localStorage.setItem(`rated_${filmId}`, 'true'); }

async function sendRating(filmId, filmTitle, rating, review) {
    if (hasUserRated(filmId)) return { success: false, message: "Вы уже оценили этот фильм. Спасибо!" };
    try {
        await fetch(GOOGLE_RATINGS_URL, {
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filmId, filmTitle, rating, review, timestamp: new Date().toLocaleString('ru-RU') })
        });
        markAsRated(filmId);
        return { success: true, message: "Спасибо за оценку!" };
    } catch(e) { return { success: false, message: "Ошибка отправки" }; }
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
    } else {
        rateBtn.disabled = false;
        rateBtn.style.opacity = '1';
        rateBtn.style.cursor = 'pointer';
        rateBtn.title = '';
    }

    stars.forEach(star => {
        star.addEventListener('click', function() {
            if (hasUserRated(film.id)) {
                statusDiv.innerHTML = '<span style="color:#ffc107">Вы уже оценили этот фильм</span>';
                return;
            }
            currentRating = parseInt(this.dataset.rating);
            stars.forEach((s, i) => {
                s.innerHTML = i < currentRating ? '★' : '☆';
                s.style.color = i < currentRating ? '#ffc107' : '#555';
            });
        });
    });

    rateBtn.onclick = function() {
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

    submitBtn.onclick = async function() {
        if (hasUserRated(film.id)) {
            statusDiv.innerHTML = '<span style="color:#ffc107">Вы уже оценили этот фильм</span>';
            setTimeout(() => modal.style.display = 'none', 1500);
            return;
        }
        if (currentRating === 0) { statusDiv.innerHTML = '<span style="color:#e50914">Поставьте оценку</span>'; return; }
        statusDiv.innerHTML = '<span style="color:#ffaa00">Отправка...</span>';
        this.disabled = true;
        const result = await sendRating(film.id, film.title, currentRating, reviewText.value);
        this.disabled = false;
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
    } catch(e) { return { success: false, message: "Ошибка отправки" }; }
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
        btn.onclick = () => {
            modal.style.display = 'flex';
            filmInput.value = '';
            commentInput.value = '';
            statusDiv.innerHTML = '';
            if (suggestContainer) suggestContainer.style.display = 'none';
        };
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
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    submitBtn.onclick = async function() {
        const name = filmInput.value.trim();
        if (!name) { statusDiv.innerHTML = '<span style="color:#e50914">Введите название</span>'; return; }
        if (spinner) spinner.style.display = 'inline-block';
        statusDiv.innerHTML = '<span style="color:#ffaa00">Отправка...</span>';
        this.disabled = true;
        const result = await sendToGoogleSheets(name, commentInput.value);
        if (spinner) spinner.style.display = 'none';
        this.disabled = false;
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

// ============= ЗАПУСК =============
document.addEventListener('DOMContentLoaded', () => {
    // Показываем загрузку при старте
    showLoading();

    // Загружаем данные
    if (typeof FILMS_CATALOG !== 'undefined') {
        allFilms = [...FILMS_CATALOG];
    }

    // Если мы на главной странице
    if (document.getElementById('filmsGrid')) {
        renderBestFilms();
        const categoryBtn = document.getElementById('categoryToggleBtn');
        if (categoryBtn) categoryBtn.addEventListener('click', openCategoryModal);
        updateCatalog();

        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const val = this.value;
                if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
                updateCatalog();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (searchInput) searchInput.value = '';
                this.style.display = 'none';
                currentCategory = null;
                currentSubcategory = null;
                updateCatalog();
                if (searchInput) searchInput.focus();
            });
        }
        // Скрываем загрузку после рендера
        setTimeout(() => hideLoading(), 300);
    }

    // Если мы на странице плеера
    if (document.getElementById('driveIframe')) {
        document.getElementById('backLink')?.addEventListener('click', function(e) {
            showLoading();
        });
        initPlayer();
        // hideLoading будет вызван внутри initPlayer
    }

    document.querySelectorAll('#otherProjectsLink').forEach(link => link && (link.href = '#'));
    initModal();
});
