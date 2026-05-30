// ============= ПЕРЕМЕННЫЕ =============
let currentFilmId = null;
let allFilms = [];
let currentRating = 0;

// ↓↓↓ ВСТАВЬ СВОИ ССЫЛКИ ИЗ APPS SCRIPT ↓↓↓
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/ВАШ_КОД/exec";
const GOOGLE_RATINGS_URL = "https://script.google.com/macros/s/ВАШ_КОД_ДЛЯ_ОЦЕНОК/exec";

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
    
    grid.innerHTML = filmsToRender.map(film => `
        <div class="film-card" data-id="${film.id}">
            <img src="${film.poster}" alt="${film.title}" loading="lazy">
            <h3>${film.title}</h3>
        </div>
    `).join('');
    
    document.querySelectorAll('.film-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = card.dataset.id;
            window.location.href = `player.html?id=${id}`;
        });
    });
}

// ============= ФОРМАТИРОВАНИЕ ДАТЫ =============
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('ru', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// ============= ЗАГРУЗКА ОТЗЫВОВ =============
async function loadReviews(filmId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-text">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`${GOOGLE_RATINGS_URL}?action=get&filmId=${filmId}`);
        const reviews = await response.json();
        
        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="empty-suggestions">Пока нет отзывов. Будьте первым!</p>';
            return;
        }
        
        // Вычисляем среднюю оценку
        let totalRating = 0;
        reviews.forEach(r => { if (r.rating) totalRating += parseInt(r.rating); });
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
        
        let html = `<div class="average-rating">⭐ Средняя оценка: ${avgRating} / 5 (${reviews.length} оценок)</div>`;
        
        reviews.forEach(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            html += `
                <div class="review-item">
                    <div class="review-stars">${stars}</div>
                    <div class="review-text">${escapeHtml(review.review || 'Без отзыва')}</div>
                    <div class="review-date">${review.date || ''}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        container.innerHTML = '<p class="empty-suggestions">Не удалось загрузить отзывы</p>';
    }
}

// ============= ОТПРАВКА ОЦЕНКИ =============
async function sendRating(filmId, filmTitle, rating, review) {
    try {
        await fetch(GOOGLE_RATINGS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filmId: filmId,
                filmTitle: filmTitle,
                rating: rating,
                review: review,
                timestamp: new Date().toLocaleString('ru-RU')
            })
        });
        return { success: true, message: "Спасибо за оценку!" };
    } catch (error) {
        return { success: false, message: "Ошибка отправки" };
    }
}

// ============= ИНИЦИАЛИЗАЦИЯ МОДАЛКИ ОЦЕНКИ =============
function initRatingModal(film) {
    const modal = document.getElementById('rateModal');
    const rateBtn = document.getElementById('rateBtn');
    const closeSpan = document.querySelector('.rate-close');
    const stars = document.querySelectorAll('#starsContainer span');
    const submitBtn = document.getElementById('submitRatingBtn');
    const reviewText = document.getElementById('reviewText');
    const statusDiv = document.getElementById('ratingStatus');
    
    if (!rateBtn || !modal) return;
    
    // Обработка звезд
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                if (i < currentRating) {
                    s.innerHTML = '★';
                    s.style.color = '#ffc107';
                } else {
                    s.innerHTML = '☆';
                    s.style.color = '#555';
                }
            });
        });
    });
    
    rateBtn.onclick = () => {
        modal.style.display = 'flex';
        currentRating = 0;
        stars.forEach(s => {
            s.innerHTML = '☆';
            s.style.color = '#555';
        });
        reviewText.value = '';
        statusDiv.innerHTML = '';
    };
    
    if (closeSpan) closeSpan.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
    
    submitBtn.onclick = async () => {
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
            setTimeout(() => {
                modal.style.display = 'none';
                loadReviews(film.id);
            }, 1500);
        } else {
            statusDiv.innerHTML = `<span style="color:#e50914">${result.message}</span>`;
        }
    };
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

    const filmPoster = document.getElementById('filmPoster');
    const filmDescription = document.getElementById('filmDescription');
    const filmTitle = document.getElementById('filmTitle');
    const seasonSeriesNav = document.getElementById('seasonSeriesNav');
    const watchBtn = document.getElementById('watchBtn');
    const videoPlayer = document.getElementById('mainPlayer');
    const videoWrapper = document.querySelector('.video-wrapper');
    const downloadBtn = document.getElementById('downloadBtn');
    
    filmPoster.src = film.poster;
    filmDescription.textContent = film.description || 'Описание отсутствует';
    filmTitle.textContent = film.title;
    
    // Настройка кнопки скачивания
    if (downloadBtn && film.downloadUrl) {
        downloadBtn.href = film.downloadUrl;
        downloadBtn.style.display = 'inline-flex';
    } else if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }
    
    // Загружаем отзывы
    loadReviews(filmId);
    
    // Инициализируем модалку оценки
    initRatingModal(film);
    
    // ============= ЕСЛИ ВИДЕО ЕЩЁ НЕТ =============
    const hasVideo = film.videoUrl || (film.seasons !== "none" && Object.values(film.seasons).some(s => Object.values(s.series).some(ser => ser.videoUrl)));
    
    if (!hasVideo || film.comingSoon === true) {
        let message = '';
        if (film.releaseDate) {
            message = `🎬 Премьера состоится ${formatDate(film.releaseDate)}`;
        } else {
            message = `🎬 Скоро будет`;
        }
        
        if (videoWrapper) {
            videoWrapper.innerHTML = `
                <div class="coming-soon-message">
                    <div class="coming-icon">🎬</div>
                    <h2>${film.title}</h2>
                    <p class="coming-text">${message}</p>
                    <div class="coming-notify">🔔 Добавьте в закладки, чтобы не пропустить</div>
                </div>
            `;
        }
        if (seasonSeriesNav) seasonSeriesNav.innerHTML = '';
        if (watchBtn) watchBtn.style.display = 'none';
        return;
    }
    
    // Восстанавливаем плеер
    if (videoWrapper && videoWrapper.innerHTML.includes('coming-soon-message')) {
        videoWrapper.innerHTML = `<video id="mainPlayer" controls width="100%" poster=""></video>`;
    }
    if (watchBtn) watchBtn.style.display = 'block';
    
    // Надпись про улучшенную версию
    if (!film.betterVersionReady && film.betterVersionDate) {
        seasonSeriesNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия выйдет ${formatDate(film.betterVersionDate)}</div>`;
    } else if (!film.betterVersionReady && !film.betterVersionDate) {
        seasonSeriesNav.innerHTML = `<div class="better-version-notice">🎥 Улучшенная версия скоро</div>`;
    } else {
        seasonSeriesNav.innerHTML = '';
    }
    
    // Обычная логика плеера
    if (film.seasons === "none") {
        watchBtn.onclick = () => {
            videoPlayer.src = film.videoUrl;
            videoPlayer.poster = film.poster;
            videoPlayer.play();
        };
    } 
    else {
        let currentSeason = urlParams.get('season') || Object.keys(film.seasons)[0];
        let currentSeries = urlParams.get('series') || Object.keys(film.seasons[currentSeason].series)[0];
        
        function renderNav() {
            const season = film.seasons[currentSeason];
            if (!season) return;
            
            let html = `
                <div class="season-nav">
                    ${Object.keys(film.seasons).map(sn => `
                        <button class="season-btn ${sn == currentSeason ? 'active' : ''}" data-season="${sn}">Сезон ${sn}</button>
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
            seasonSeriesNav.innerHTML = html + (seasonSeriesNav.querySelector('.better-version-notice')?.outerHTML || '');
            
            document.querySelectorAll('.season-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentSeason = btn.dataset.season;
                    currentSeries = Object.keys(film.seasons[currentSeason].series)[0];
                    renderNav();
                    updateUrlWithoutReload(filmId, currentSeason, currentSeries);
                });
            });
            
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

// ============= ОТПРАВКА В GOOGLE TABLES (ПРЕДЛОЖЕНИЯ) =============
async function sendToGoogleSheets(filmName, comment) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filmName: filmName,
                comment: comment,
                timestamp: new Date().toLocaleString('ru-RU')
            })
        });
        return { success: true, message: "Спасибо! Фильм предложен." };
    } catch (error) {
        return { success: false, message: "Ошибка отправки" };
    }
}

async function loadSuggestedFilms() {
    const listContainer = document.getElementById('suggestedFilmsList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div class="loading-text">Загрузка...</div>';
    
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=get`);
        const films = await response.json();
        
        if (!films || films.length === 0) {
            listContainer.innerHTML = '<p class="empty-suggestions">Пока нет предложенных фильмов</p>';
            return;
        }
        
        listContainer.innerHTML = films.map(film => `
            <div class="suggested-film-item">
                <span class="suggested-film-name">🎬 ${film.name}</span>
                <span class="suggested-film-date">${film.date ? new Date(film.date).toLocaleDateString() : ''}</span>
            </div>
        `).join('');
    } catch (error) {
        listContainer.innerHTML = '<p class="empty-suggestions">Не удалось загрузить список</p>';
    }
}

// ============= МОДАЛЬНОЕ ОКНО ПРЕДЛОЖЕНИЙ =============
function initModal() {
    const modal = document.getElementById('suggestModal');
    const openBtns = document.querySelectorAll('#suggestFilmBtn');
    const closeSpan = document.querySelector('#suggestModal .modal-close');
    const showSuggestedBtn = document.getElementById('showSuggestedBtn');
    const suggestedContainer = document.getElementById('suggestedFilmsContainer');
    const submitBtn = document.getElementById('submitSuggestionBtn');
    const filmInput = document.getElementById('suggestFilmInput');
    const commentInput = document.getElementById('suggestCommentInput');
    const statusDiv = document.getElementById('suggestStatus');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!modal) return;
    
    openBtns.forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                modal.style.display = 'flex';
                if (filmInput) filmInput.value = '';
                if (commentInput) commentInput.value = '';
                if (statusDiv) statusDiv.innerHTML = '';
                if (suggestedContainer) suggestedContainer.style.display = 'none';
            };
        }
    });
    
    if (showSuggestedBtn) {
        showSuggestedBtn.onclick = async () => {
            if (suggestedContainer) {
                suggestedContainer.style.display = 'block';
                await loadSuggestedFilms();
            }
        };
    }
    
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
            
            if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#ffaa00">Отправка...</span>';
            if (submitBtn) submitBtn.disabled = true;
            
            const result = await sendToGoogleSheets(filmName, commentInput.value);
            
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            
            if (result.success) {
                if (statusDiv) statusDiv.innerHTML = `<span style="color:#4caf50">${result.message}</span>`;
                if (filmInput) filmInput.value = '';
                if (commentInput) commentInput.value = '';
                if (suggestedContainer && suggestedContainer.style.display === 'block') {
                    await loadSuggestedFilms();
                }
                setTimeout(() => {
                    if (statusDiv) statusDiv.innerHTML = '';
                }, 3000);
            } else {
                if (statusDiv) statusDiv.innerHTML = `<span style="color:#e50914">${result.message}</span>`;
            }
        };
    }
}

// ============= ЗАПУСК =============
document.addEventListener('DOMContentLoaded', () => {
    allFilms = [...FILMS_CATALOG];
    
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
    
    if (document.getElementById('mainPlayer')) {
        initPlayer();
    }
    
    const otherLinks = document.querySelectorAll('#otherProjectsLink');
    otherLinks.forEach(link => {
        if (link) link.href = '#';
    });
    
    initModal();
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
