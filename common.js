// ============= ПЕРЕМЕННЫЕ =============
let currentFilmId = null;
let allFilms = [];

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/ВАШ_КОД/exec";

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
    
    // Маленькие карточки, кликабельны целиком
    grid.innerHTML = filmsToRender.map(film => `
        <div class="film-card" data-id="${film.id}">
            <img src="${film.poster}" alt="${film.title}" loading="lazy">
            <h3>${film.title}</h3>
        </div>
    `).join('');
    
    // Клик по всей карточке
    document.querySelectorAll('.film-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = card.dataset.id;
            window.location.href = `player.html?id=${id}`;
        });
    });
}

// ============= ЛОГИКА ПЛЕЕРА (КАРТОЧКА СЛЕВА, ПЛЕЕР СПРАВА) =============
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

    // Левая панель: постер и описание
    const filmPoster = document.getElementById('filmPoster');
    const filmDescription = document.getElementById('filmDescription');
    const filmTitle = document.getElementById('filmTitle');
    const seasonSeriesNav = document.getElementById('seasonSeriesNav');
    const watchBtn = document.getElementById('watchBtn');
    const videoPlayer = document.getElementById('mainPlayer');
    
    filmPoster.src = film.poster;
    filmDescription.textContent = film.description || 'Описание отсутствует';
    filmTitle.textContent = film.title;
    
    if (film.seasons === "none") {
        // Фильм без серий
        seasonSeriesNav.innerHTML = '';
        watchBtn.onclick = () => {
            videoPlayer.src = film.videoUrl;
            videoPlayer.poster = film.poster;
            videoPlayer.play();
        };
    } 
    else {
        // Сериал с сезонами
        let currentSeason = urlParams.get('season') || Object.keys(film.seasons)[0];
        let currentSeries = urlParams.get('series') || Object.keys(film.seasons[currentSeason].series)[0];
        
        function renderNav() {
            const season = film.seasons[currentSeason];
            if (!season) return;
            
            let html = `
                <div class="season-nav">
                    ${Object.keys(film.seasons).map(sn => `
                        <button class="season-btn ${sn == currentSeason ? 'active' : ''}" data-season="${sn}">
                            Сезон ${sn}
                        </button>
                    `).join('')}
                </div>
                <div class="series-nav">
                    ${Object.keys(film.seasons[currentSeason].series).map(srn => `
                        <button class="series-btn ${srn == currentSeries ? 'active' : ''}" data-series="${srn}">
                            Серия ${srn}: ${film.seasons[currentSeason].series[srn].title}
                        </button>
                    `).join('')}
                </div>
            `;
            seasonSeriesNav.innerHTML = html;
            
            // Обработчики сезонов
            document.querySelectorAll('.season-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentSeason = btn.dataset.season;
                    currentSeries = Object.keys(film.seasons[currentSeason].series)[0];
                    renderNav();
                    updateUrlWithoutReload(filmId, currentSeason, currentSeries);
                });
            });
            
            // Обработчики серий
            document.querySelectorAll('.series-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentSeries = btn.dataset.series;
                    renderNav();
                    updateUrlWithoutReload(filmId, currentSeason, currentSeries);
                });
            });
        }
        
        renderNav();
        
        watchBtn.onclick = () => {
            const series = film.seasons[currentSeason].series[currentSeries];
            if (series) {
                videoPlayer.src = series.videoUrl;
                videoPlayer.poster = film.poster;
                videoPlayer.play();
            }
        };
    }
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
    const openBtns = document.querySelectorAll('#suggestFilmBtn');
    const closeSpan = document.querySelector('.modal-close');
    const submitBtn = document.getElementById('submitSuggestionBtn');
    const filmInput = document.getElementById('suggestFilmInput');
    const commentInput = document.getElementById('suggestCommentInput');
    const statusDiv = document.getElementById('suggestStatus');
    
    if (!modal) return;
    
    openBtns.forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                modal.style.display = 'flex';
                if (filmInput) filmInput.value = '';
                if (commentInput) commentInput.value = '';
                if (statusDiv) statusDiv.innerHTML = '';
            };
        }
    });
    
    if (closeSpan) closeSpan.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
    
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
    
    // Ссылка на другие проекты (замени на свою)
    const otherLinks = document.querySelectorAll('#otherProjectsLink');
    otherLinks.forEach(link => {
        if (link) link.href = '#'; // СЮДА ТВОЮ ССЫЛКУ
    });
    
    initModal();
});
