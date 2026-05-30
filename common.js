// ============= ПЕРЕМЕННЫЕ =============
let currentFilmId = null;
let allFilms = [];

// ============= НАСТРОЙКА GOOGLE TABLES =============
// ЗАМЕНИ НА СВОЮ ССЫЛКУ ПОСЛЕ НАСТРОЙКИ
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/ВАШ_КОД/exec";

// ============= ПОИСК (по title И searchTerms) =============
function searchFilms(query) {
    if (!query.trim()) return allFilms;
    const lowerQuery = query.toLowerCase().trim();
    return allFilms.filter(film => {
        // Поиск по названию
        if (film.title.toLowerCase().includes(lowerQuery)) return true;
        // Поиск по searchTerms (ключевым словам)
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
    
    grid.innerHTML = filmsToRender.map(film => `
        <div class="film-card" data-id="${film.id}">
            <img src="${film.poster}" alt="${film.title}" loading="lazy">
            <div class="film-card-content">
                <h3>${film.title}</h3>
                <p class="film-description">${film.description || ''}</p>
                <a href="player.html?id=${film.id}" class="watch-btn">Смотреть</a>
            </div>
        </div>
    `).join('');
}

// ============= ПРЕДЛОЖЕНИЯ (БЕЗ ДУБЛЕЙ) =============
function getRandomSuggestions(excludeId, count = 4) {
    let others = allFilms.filter(f => f.id !== excludeId);
    for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
    }
    return others.slice(0, count);
}

function renderSuggestions(containerId, excludeId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const suggestions = getRandomSuggestions(excludeId, 4);
    container.innerHTML = suggestions.map(film => `
        <div class="suggestion-card" data-id="${film.id}">
            <img src="${film.poster}" alt="${film.title}">
            <h4>${film.title}</h4>
            <a href="player.html?id=${film.id}">Смотреть →</a>
        </div>
    `).join('');
}

// ============= ЛОГИКА ПЛЕЕРА =============
function initPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) {
        window.location.href = 'index.html';
        return;
    }
    currentFilmId = filmId;
    const film = allFilms.find(f => f.id === filmId);
    if (!film) {
        window.location.href = 'index.html';
        return;
    }

    const playerHeader = document.getElementById('playerHeader');
    const videoPlayer = document.getElementById('mainPlayer');

    if (film.seasons === "none") {
        playerHeader.innerHTML = `<h1>${film.title}</h1>`;
        videoPlayer.src = film.videoUrl;
        videoPlayer.poster = film.poster;
    } 
    else {
        let seasonNum = urlParams.get('season') || Object.keys(film.seasons)[0];
        let seriesNum = urlParams.get('series') || Object.keys(film.seasons[seasonNum].series)[0];
        
        function renderSeasonSeries() {
            const season = film.seasons[seasonNum];
            if (!season) return;
            const series = season.series[seriesNum];
            if (!series) return;
            
            videoPlayer.src = series.videoUrl;
            videoPlayer.poster = film.poster;
            
            playerHeader.innerHTML = `
                <h1>${film.title} — ${season.title} — Серия ${seriesNum}</h1>
                <div class="season-nav">
                    ${Object.keys(film.seasons).map(sn => `
                        <button class="season-btn ${sn == seasonNum ? 'active' : ''}" data-season="${sn}">
                            Сезон ${sn}
                        </button>
                    `).join('')}
                </div>
                <div class="series-nav">
                    ${Object.keys(film.seasons[seasonNum].series).map(srn => `
                        <button class="series-btn ${srn == seriesNum ? 'active' : ''}" data-series="${srn}">
                            Серия ${srn}
                        </button>
                    `).join('')}
                </div>
            `;
            
            document.querySelectorAll('.season-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    seasonNum = btn.dataset.season;
                    seriesNum = Object.keys(film.seasons[seasonNum].series)[0];
                    renderSeasonSeries();
                    updateUrlWithoutReload(filmId, seasonNum, seriesNum);
                });
            });
            document.querySelectorAll('.series-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    seriesNum = btn.dataset.series;
                    renderSeasonSeries();
                    updateUrlWithoutReload(filmId, seasonNum, seriesNum);
                });
            });
        }
        renderSeasonSeries();
    }

    renderSuggestions('suggestionsGrid', filmId);
}

function updateUrlWithoutReload(filmId, season, series) {
    const newUrl = `player.html?id=${filmId}&season=${season}&series=${series}`;
    window.history.pushState({}, '', newUrl);
}

// ============= ОТПРАВКА В GOOGLE TABLES =============
async function sendToGoogleSheets(filmName, comment) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "https://script.google.com/macros/s/ВАШ_КОД/exec") {
        return { success: false, message: "Форма временно недоступна" };
    }
    
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                filmName: filmName,
                comment: comment,
                timestamp: new Date().toLocaleString('ru-RU')
            })
        });
        return { success: true, message: "Спасибо! Предложение отправлено." };
    } catch (error) {
        return { success: false, message: "Ошибка отправки" };
    }
}

// ============= МОДАЛЬНОЕ ОКНО =============
function initModal() {
    const modal = document.getElementById('suggestModal');
    const openBtn = document.getElementById('suggestFilmBtn');
    const closeSpan = document.querySelector('.modal-close');
    const submitBtn = document.getElementById('submitSuggestionBtn');
    const filmInput = document.getElementById('suggestFilmInput');
    const commentInput = document.getElementById('suggestCommentInput');
    const statusDiv = document.getElementById('suggestStatus');
    
    if (!openBtn || !modal) return;
    
    openBtn.onclick = () => {
        modal.style.display = 'flex';
        if (filmInput) filmInput.value = '';
        if (commentInput) commentInput.value = '';
        if (statusDiv) statusDiv.innerHTML = '';
    }
    
    if (closeSpan) closeSpan.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    }
    
    if (submitBtn) {
        submitBtn.onclick = async () => {
            const filmName = filmInput.value.trim();
            if (!filmName) {
                if (statusDiv) statusDiv.innerHTML = '<span style="color:#e50914">Введите название</span>';
                return;
            }
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#ffaa00">Отправка...</span>';
            const result = await sendToGoogleSheets(filmName, commentInput.value);
            if (result.success) {
                if (statusDiv) statusDiv.innerHTML = `<span style="color:#4caf50">${result.message}</span>`;
                setTimeout(() => modal.style.display = 'none', 2000);
            } else {
                if (statusDiv) statusDiv.innerHTML = `<span style="color:#e50914">${result.message}</span>`;
            }
        };
    }
}

// ============= ЗАПУСК =============
document.addEventListener('DOMContentLoaded', () => {
    allFilms = [...FILMS_CATALOG];
    
    // Главная страница
    if (document.getElementById('filmsGrid')) {
        renderFilmsGrid(allFilms);
        renderSuggestions('suggestionsGrid', null);
        
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
                const filtered = searchFilms(query);
                renderFilmsGrid(filtered);
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
    
    // Страница плеера
    if (document.getElementById('mainPlayer')) {
        initPlayer();
    }
    
    // Ссылка на другие проекты (ЗАМЕНИ НА СВОЮ)
    const otherLink = document.getElementById('otherProjectsLink');
    if (otherLink) {
        otherLink.href = '#'; // СЮДА ТВОЮ ССЫЛКУ
    }
    
    initModal();
});
