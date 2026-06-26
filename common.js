// ============= ПЕРЕМЕННЫЕ =============
let allFilms = [];
let currentRating = 0;
let allReviewsData = {};
let reviewsExpanded = {};
let currentCategory = null;
let currentSubcategory = null;
let currentFilm = null;
let currentSeasonKey = null;
let currentSeriesKey = null;

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

// ============= ВИДЕО-ПЛЕЕР (с поддержкой 1080p для Dailymotion) =============
function getEmbedUrl(videoPath) {
    if (!videoPath) return '';
    // YouTube
    if (videoPath.includes('youtube.com/watch') || videoPath.includes('youtu.be/')) {
        return convertToYouTubeEmbed(videoPath);
    }
    if (videoPath.includes('youtube.com/embed/')) return videoPath;
    // Dailymotion – преобразуем в geo-ссылку с качеством 1080
    if (videoPath.includes('dailymotion.com') || videoPath.includes('dai.ly')) {
        let videoId = null;
        let match = videoPath.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
        if (match) videoId = match[1];
        if (!videoId) {
            match = videoPath.match(/dai\.ly\/([a-zA-Z0-9]+)/);
            if (match) videoId = match[1];
        }
        if (!videoId) {
            match = videoPath.match(/[?&]video=([^&]+)/);
            if (match) videoId = match[1];
        }
        if (videoId) {
            return `https://geo.dailymotion.com/player.html?video=${videoId}&quality=1080`;
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

// ============= ФИЛЬТРЫ (с поддержкой массивов) =============
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
        result = result.filter(f => {
            // Если у фильма категория – массив, проверяем вхождение
            if (Array.isArray(f.category)) {
                return f.category.includes(currentCategory);
            } else {
                return f.category === currentCategory;
            }
        });
        if (currentSubcategory) {
            result = result.filter(f => {
                if (Array.isArray(f.subcategory)) {
                    return f.subcategory.includes(currentSubcategory);
                } else {
                    return f.subcategory === currentSubcategory;
                }
            });
        }
    }
    return result;
}

// ============= ГЛАВНАЯ СТРАНИЦА =============

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
    if (!filmId) { 
        window.location.href = 'index.html'; 
        return; 
    }
    const film = allFilms.find(f => f.id === filmId);
    if (!film) { 
        window.location.href = 'index.html'; 
        return; 
    }

    currentFilm = film;

    // Определяем начальные сезон и серию (если есть)
    if (film.seasons && typeof film.seasons === 'object') {
        const seasonsKeys = Object.keys(film.seasons).sort();
        if (seasonsKeys.length > 0) {
            currentSeasonKey = seasonsKeys[0];
            const seriesKeys = Object.keys(film.seasons[currentSeasonKey].series).sort();
            if (seriesKeys.length > 0) {
                currentSeriesKey = seriesKeys[0];
            }
        }
    } else {
        currentSeasonKey = null;
        currentSeriesKey = null;
    }

    // Загружаем информацию о фильме (постер, описание, заголовок)
    updateFilmInfo();

    // Создаём навигацию по сезонам/сериям (если есть)
    if (film.seasons) {
        renderSeasonSeriesNav();
    } else {
        const seasonNav = document.getElementById('seasonSeriesNav');
        if (!film.betterVersionReady && film.betterVersionDate && film.betterVersionDate !== 'null') {
            const formatted = formatDate(film.betterVersionDate);
            seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия выйдет ${formatted || 'скоро'}</div>`;
        } else if (!film.betterVersionReady && film.betterVersionDate === null) {
            seasonNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия скоро</div>`;
        } else {
            seasonNav.innerHTML = '';
        }
    }

    // Сиквелы (только один блок над плеером)
    const sequelNav = document.getElementById('sequelNav');
    if (sequelNav) {
        if (film.sequelGroup) {
            const groupFilms = allFilms.filter(f => f.sequelGroup === film.sequelGroup)
                                       .sort((a,b) => (a.sequelOrder || 0) - (b.sequelOrder || 0));
            if (groupFilms.length > 1) {
                sequelNav.style.display = 'flex';
                sequelNav.innerHTML = groupFilms.map(f => `
                    <button class="sequel-btn ${f.id === film.id ? 'active' : ''}" data-id="${f.id}">${f.title}</button>
                `).join('');
                sequelNav.querySelectorAll('.sequel-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        switchSequel(this.dataset.id);
                    });
                });
            } else {
                sequelNav.style.display = 'none';
            }
        } else {
            sequelNav.style.display = 'none';
        }
    }

    // Загружаем видео (только если нет сезонов, иначе оставляем iframe пустым)
    if (!film.seasons) {
        loadVideo();
    } else {
        // Для сериалов оставляем iframe пустым, видео запускается по кнопке "Смотреть"
        const iframe = document.getElementById('driveIframe');
        if (iframe) iframe.src = '';
        const watchBtn = document.getElementById('watchBtn');
        if (watchBtn) {
            watchBtn.onclick = function() {
                loadVideo();
            };
        }
    }

    // Кнопки "Предыдущая серия", "Следующая серия", "Выбрать серию"
    initNavigationButtons();

    // Загружаем отзывы и модалку оценки
    loadReviews(film.id);
    initRatingModal(film);

    // Закрытие модалки сезонов по крестику
    const seasonModalClose = document.getElementById('seasonModalClose');
    if (seasonModalClose) {
        seasonModalClose.onclick = function() {
            document.getElementById('seasonModal').style.display = 'none';
        };
    }
    // Закрытие по клику вне модалки
    const seasonModal = document.getElementById('seasonModal');
    if (seasonModal) {
        window.addEventListener('click', function(e) {
            if (e.target === seasonModal) {
                seasonModal.style.display = 'none';
            }
        });
    }

    // Убеждаемся, что загрузка скрывается
    setTimeout(() => hideLoading(), 1500);
}

// --- Обновление информации о фильме (включая категории в описании) ---
function updateFilmInfo() {
    if (!currentFilm) return;
    document.getElementById('filmPoster').src = currentFilm.poster;

    // Формируем описание с категориями
    let descriptionText = currentFilm.description || '';
    let categoryInfo = '';
    if (currentFilm.category) {
        const cats = Array.isArray(currentFilm.category) ? currentFilm.category : [currentFilm.category];
        const subcats = Array.isArray(currentFilm.subcategory) ? currentFilm.subcategory : (currentFilm.subcategory ? [currentFilm.subcategory] : []);
        const catLabels = cats.map(c => CATEGORIES[c]?.label || c).join(', ');
        const subLabels = subcats.map(s => {
            // Ищем подкатегорию в каждой категории (для простоты возьмём первую)
            for (let c of cats) {
                if (CATEGORIES[c] && CATEGORIES[c].subcategories && CATEGORIES[c].subcategories[s]) {
                    return CATEGORIES[c].subcategories[s];
                }
            }
            return s;
        }).join(', ');
        categoryInfo = `\n\n📂 Категория: ${catLabels}`;
        if (subLabels) categoryInfo += `\n🏷️ Подкатегория: ${subLabels}`;
    }
    document.getElementById('filmDescription').textContent = descriptionText + categoryInfo;

    // Заголовок с сезоном/серией
    let title = currentFilm.title;
    if (currentSeasonKey && currentSeriesKey && currentFilm.seasons) {
        const seasonTitle = currentFilm.seasons[currentSeasonKey]?.title || `Сезон ${currentSeasonKey}`;
        const seriesTitle = currentFilm.seasons[currentSeasonKey]?.series[currentSeriesKey]?.title || `Серия ${currentSeriesKey}`;
        title += ` — ${seasonTitle}, ${seriesTitle}`;
    }
    document.getElementById('filmTitle').textContent = title;

    // Кнопка скачивания
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        if (currentFilm.downloadUrl && currentFilm.videoUrl && currentFilm.videoUrl.includes('drive.google.com')) {
            downloadBtn.href = getDownloadUrl(currentFilm.downloadUrl);
            downloadBtn.style.display = 'inline-flex';
        } else {
            downloadBtn.style.display = 'none';
        }
    }
}

// --- Загрузка видео в iframe ---
function loadVideo() {
    const iframe = document.getElementById('driveIframe');
    const watchBtn = document.getElementById('watchBtn');
    if (!iframe) return;

    let videoUrl = null;
    if (currentSeasonKey && currentSeriesKey && currentFilm.seasons) {
        videoUrl = currentFilm.seasons[currentSeasonKey]?.series[currentSeriesKey]?.videoUrl;
    } else if (currentFilm.videoUrl) {
        videoUrl = currentFilm.videoUrl;
    }

    if (videoUrl) {
        const embedUrl = getEmbedUrl(videoUrl);
        iframe.src = embedUrl;
        watchBtn.onclick = function() {
            iframe.src = '';
            setTimeout(() => { iframe.src = embedUrl; }, 100);
        };
        watchBtn.style.display = 'block';
    } else {
        watchBtn.style.display = 'none';
    }
}

// --- Отрисовка навигации по сезонам/сериям (в модалке) ---
function renderSeasonSeriesNav() {
    const modalContent = document.getElementById('seasonModalContent');
    if (!modalContent) return;

    if (!currentFilm.seasons) {
        modalContent.innerHTML = '<p>Нет сезонов</p>';
        return;
    }

    const seasonsKeys = Object.keys(currentFilm.seasons).sort();
    let html = '';
    seasonsKeys.forEach(sKey => {
        const season = currentFilm.seasons[sKey];
        html += `<div class="season-group">`;
        html += `<h4 class="season-title">${season.title || 'Сезон '+sKey}</h4>`;
        const seriesKeys = Object.keys(season.series).sort();
        html += `<div class="series-list">`;
        seriesKeys.forEach(srKey => {
            const isActive = (sKey === currentSeasonKey && srKey === currentSeriesKey);
            html += `<button class="series-select-btn ${isActive ? 'active' : ''}" data-season="${sKey}" data-series="${srKey}">${season.series[srKey].title || 'Серия '+srKey}</button>`;
        });
        html += `</div>`;
        html += `</div>`;
    });
    modalContent.innerHTML = html;

    modalContent.querySelectorAll('.series-select-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sKey = this.dataset.season;
            const srKey = this.dataset.series;
            if (sKey && srKey && currentFilm.seasons[sKey] && currentFilm.seasons[sKey].series[srKey]) {
                currentSeasonKey = sKey;
                currentSeriesKey = srKey;
                updateFilmInfo();
                loadVideo(); // при выборе серии сразу загружаем видео
                renderSeasonSeriesNav();
                updateNavButtonsState();
                document.getElementById('seasonModal').style.display = 'none';
            }
        });
    });
}

// --- Инициализация кнопок навигации ---
function initNavigationButtons() {
    const prevBtn = document.getElementById('prevEpisodeBtn');
    const nextBtn = document.getElementById('nextEpisodeBtn');
    const chooseBtn = document.getElementById('chooseSeriesBtn');

    if (prevBtn) {
        prevBtn.onclick = function() {
            goToPrevEpisode();
        };
    }
    if (nextBtn) {
        nextBtn.onclick = function() {
            goToNextEpisode();
        };
    }
    if (chooseBtn) {
        chooseBtn.onclick = function() {
            openSeasonModal();
        };
    }

    updateNavButtonsState();
}

// --- Переход на предыдущую серию ---
function goToPrevEpisode() {
    if (!currentFilm.seasons) return;
    const seasonsKeys = Object.keys(currentFilm.seasons).sort();
    if (seasonsKeys.length === 0) return;

    let currentSeason = currentSeasonKey;
    let currentSeries = currentSeriesKey;

    if (!currentSeason || !currentSeries) {
        currentSeason = seasonsKeys[0];
        const seriesKeys = Object.keys(currentFilm.seasons[currentSeason].series).sort();
        if (seriesKeys.length === 0) return;
        currentSeries = seriesKeys[0];
    }

    const seasonObj = currentFilm.seasons[currentSeason];
    const seriesKeys = Object.keys(seasonObj.series).sort();
    const currentIndex = seriesKeys.indexOf(currentSeries);
    let prevSeries = null;
    let prevSeason = currentSeason;

    if (currentIndex > 0) {
        prevSeries = seriesKeys[currentIndex - 1];
    } else {
        const currentSeasonIndex = seasonsKeys.indexOf(currentSeason);
        if (currentSeasonIndex > 0) {
            prevSeason = seasonsKeys[currentSeasonIndex - 1];
            const prevSeriesKeys = Object.keys(currentFilm.seasons[prevSeason].series).sort();
            if (prevSeriesKeys.length > 0) {
                prevSeries = prevSeriesKeys[prevSeriesKeys.length - 1];
            }
        }
    }

    if (prevSeries) {
        currentSeasonKey = prevSeason;
        currentSeriesKey = prevSeries;
        updateFilmInfo();
        loadVideo();
        renderSeasonSeriesNav();
        updateNavButtonsState();
    } else {
        alert('Это первая серия!');
    }
}

// --- Переход на следующую серию ---
function goToNextEpisode() {
    if (!currentFilm.seasons) return;
    const seasonsKeys = Object.keys(currentFilm.seasons).sort();
    if (seasonsKeys.length === 0) return;

    let currentSeason = currentSeasonKey;
    let currentSeries = currentSeriesKey;

    if (!currentSeason || !currentSeries) {
        currentSeason = seasonsKeys[0];
        const seriesKeys = Object.keys(currentFilm.seasons[currentSeason].series).sort();
        if (seriesKeys.length === 0) return;
        currentSeries = seriesKeys[0];
    }

    const seasonObj = currentFilm.seasons[currentSeason];
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
            const nextSeriesKeys = Object.keys(currentFilm.seasons[nextSeason].series).sort();
            if (nextSeriesKeys.length > 0) {
                nextSeries = nextSeriesKeys[0];
            }
        }
    }

    if (nextSeries) {
        currentSeasonKey = nextSeason;
        currentSeriesKey = nextSeries;
        updateFilmInfo();
        loadVideo();
        renderSeasonSeriesNav();
        updateNavButtonsState();
    } else {
        alert('Это последняя серия!');
    }
}

// --- Обновление состояния кнопок (пред/след) ---
function updateNavButtonsState() {
    const prevBtn = document.getElementById('prevEpisodeBtn');
    const nextBtn = document.getElementById('nextEpisodeBtn');
    if (!prevBtn || !nextBtn) return;

    if (!currentFilm.seasons) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    prevBtn.style.display = 'inline-flex';
    nextBtn.style.display = 'inline-flex';

    const seasonsKeys = Object.keys(currentFilm.seasons).sort();
    if (seasonsKeys.length === 0) return;

    let currentSeason = currentSeasonKey;
    let currentSeries = currentSeriesKey;
    if (!currentSeason || !currentSeries) {
        prevBtn.disabled = true;
        nextBtn.disabled = false;
        return;
    }

    const seasonObj = currentFilm.seasons[currentSeason];
    const seriesKeys = Object.keys(seasonObj.series).sort();
    const currentIndex = seriesKeys.indexOf(currentSeries);

    if (currentIndex > 0) {
        prevBtn.disabled = false;
    } else {
        const currentSeasonIndex = seasonsKeys.indexOf(currentSeason);
        if (currentSeasonIndex > 0) {
            prevBtn.disabled = false;
        } else {
            prevBtn.disabled = true;
        }
    }

    if (currentIndex < seriesKeys.length - 1) {
        nextBtn.disabled = false;
    } else {
        const currentSeasonIndex = seasonsKeys.indexOf(currentSeason);
        if (currentSeasonIndex < seasonsKeys.length - 1) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    }
}

// --- Открытие модалки выбора сезона/серии ---
function openSeasonModal() {
    const modal = document.getElementById('seasonModal');
    if (!modal) return;
    renderSeasonSeriesNav();
    modal.style.display = 'flex';
}

// --- Переключение сиквела ---
function switchSequel(id) {
    const newFilm = allFilms.find(f => f.id === id);
    if (newFilm) {
        history.pushState(null, '', `?id=${newFilm.id}`);
        currentFilm = newFilm;
        if (newFilm.seasons) {
            const seasonsKeys = Object.keys(newFilm.seasons).sort();
            if (seasonsKeys.length > 0) {
                currentSeasonKey = seasonsKeys[0];
                const seriesKeys = Object.keys(newFilm.seasons[currentSeasonKey].series).sort();
                if (seriesKeys.length > 0) {
                    currentSeriesKey = seriesKeys[0];
                }
            }
        } else {
            currentSeasonKey = null;
            currentSeriesKey = null;
        }
        updateFilmInfo();
        if (newFilm.seasons) {
            renderSeasonSeriesNav();
        } else {
            document.getElementById('seasonSeriesNav').innerHTML = '';
        }
        // Для фильмов без сезонов загружаем видео, для сериалов – нет
        if (!newFilm.seasons) {
            loadVideo();
        } else {
            const iframe = document.getElementById('driveIframe');
            if (iframe) iframe.src = '';
            const watchBtn = document.getElementById('watchBtn');
            if (watchBtn) {
                watchBtn.onclick = function() {
                    loadVideo();
                };
            }
        }
        initNavigationButtons();
        const sequelNav = document.getElementById('sequelNav');
        if (sequelNav) {
            sequelNav.querySelectorAll('.sequel-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = sequelNav.querySelector(`.sequel-btn[data-id="${newFilm.id}"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
        loadReviews(newFilm.id);
        initRatingModal(newFilm);
        document.getElementById('seasonModal').style.display = 'none';
    }
}

// ============= ФОРМАТИРОВАНИЕ ДАТЫ =============
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
    showLoading();

    if (typeof FILMS_CATALOG !== 'undefined') {
        allFilms = [...FILMS_CATALOG];
    }

    if (document.getElementById('filmsGrid')) {
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
        setTimeout(() => hideLoading(), 1500);
    }

    if (document.getElementById('driveIframe')) {
        document.getElementById('backLink')?.addEventListener('click', function(e) {
            showLoading();
        });
        initPlayer();
    }

    document.querySelectorAll('#otherProjectsLink').forEach(link => link && (link.href = '#'));
    initModal();
});
