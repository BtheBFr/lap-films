// ============= ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =============
let currentFilmId = null;

// ============= ФУНКЦИЯ ПОЛУЧЕНИЯ СЛУЧАЙНЫХ ПРЕДЛОЖЕНИЙ =============
function getRandomSuggestions(currentId, count = 3) {
    const others = FILMS_CATALOG.filter(f => f.id !== currentId);
    const shuffled = [...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

// ============= ОТРИСОВКА ГЛАВНОЙ СЕТКИ И ПРЕДЛОЖЕНИЙ =============
function renderMainPage() {
    const filmsGrid = document.getElementById('filmsGrid');
    if (filmsGrid) {
        filmsGrid.innerHTML = FILMS_CATALOG.map(film => `
            <div class="film-card" data-id="${film.id}">
                <img src="${film.poster}" alt="${film.title}" loading="lazy">
                <h3>${film.title}</h3>
                <p>${film.description}</p>
                <a href="player.html?id=${film.id}" class="watch-btn">Смотреть</a>
            </div>
        `).join('');
    }

    // Предложения на главной (исключая все?)
    renderSuggestions('suggestionsGrid', null);
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

// ============= ЛОГИКА ПЛЕЕРА (сериал/фильм) =============
function initPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) {
        window.location.href = 'index.html';
        return;
    }
    currentFilmId = filmId;
    const film = FILMS_CATALOG.find(f => f.id === filmId);
    if (!film) {
        window.location.href = 'index.html';
        return;
    }

    const playerHeader = document.getElementById('playerHeader');
    const videoPlayer = document.getElementById('mainPlayer');

    // Если фильм без сезонов
    if (film.seasons === "none") {
        playerHeader.innerHTML = `<h1>${film.title}</h1>`;
        videoPlayer.src = film.videoUrl;
        videoPlayer.poster = film.poster;
    } 
    // Если сериал с сезонами
    else {
        // Получаем сезоны из URL (если выбраны)
        let seasonNum = urlParams.get('season') || Object.keys(film.seasons)[0];
        let seriesNum = urlParams.get('series') || Object.keys(film.seasons[seasonNum].series)[0];
        
        function renderSeasonSeries() {
            const season = film.seasons[seasonNum];
            if (!season) return;
            const series = season.series[seriesNum];
            if (!series) return;
            
            videoPlayer.src = series.videoUrl;
            videoPlayer.poster = film.poster;
            
            // Строим навигацию
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
            
            // Добавляем обработчики
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

    // Предложения внизу плеера
    renderSuggestions('suggestionsGrid', filmId);
}

function updateUrlWithoutReload(filmId, season, series) {
    const newUrl = `player.html?id=${filmId}&season=${season}&series=${series}`;
    window.history.pushState({}, '', newUrl);
}

// ============= ЗАПУСК =============
document.addEventListener('DOMContentLoaded', () => {
    // Определяем, где мы находимся
    if (document.getElementById('filmsGrid')) {
        renderMainPage();
    }
    if (document.getElementById('mainPlayer')) {
        initPlayer();
    }
    
    // Ссылка на другие проекты (потом замените)
    const otherLink = document.getElementById('otherProjectsLink');
    if (otherLink) {
        otherLink.href = '#'; // СЮДА ВАША ССЫЛКА ПОТОМ
    }
});
