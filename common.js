// ============= ПЕРЕМЕННЫЕ =============
let currentFilmId = null;
let allFilms = [];
let currentRating = 0;
let reviewsCache = {};

// ↓↓↓ ТВОИ ССЫЛКИ (УЖЕ ВСТАВЛЕНЫ) ↓↓↓
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby86FMOsqBSKIP8qE_1T8W4G5mgINcSiV4z7TnIaVlHpvHR7YYROpSXrhMGO24yfT1C/exec";
const GOOGLE_RATINGS_URL = "https://script.google.com/macros/s/AKfycbyQjl03vdNZEjtyab3faMS-wD22urPYlWqb_mJjX0l0b8qsYwiZDuVmjPLs4-UQ8jj5/exec";

// ============= ФУНКЦИИ ДЛЯ GOOGLE DRIVE =============
function getFileIdFromPath(path) {
    if (!path) return null;
    let match = path.match(/[?&]id=([^&]+)/);
    if (match) return match[1];
    match = path.match(/\/d\/([^\/]+)/);
    if (match) return match[1];
    return null;
}

function getEmbedUrl(drivePath) {
    const fileId = getFileIdFromPath(drivePath);
    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return drivePath;
}

function getDownloadUrl(drivePath) {
    const fileId = getFileIdFromPath(drivePath);
    if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
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

function formatDateForReview(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('ru', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} в ${hours}:${minutes}`;
    } catch (e) {
        return dateString;
    }
}

// ============= ОТЗЫВЫ =============
async function loadReviews(filmId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    if (reviewsCache[filmId]) {
        displayReviews(reviewsCache[filmId], container);
        return;
    }
    
    container.innerHTML = '<div class="loading-text">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`${GOOGLE_RATINGS_URL}?action=get&filmId=${filmId}`);
        const reviews = await response.json();
        reviewsCache[filmId] = reviews;
        displayReviews(reviews, container);
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        container.innerHTML = '<p class="empty-suggestions">Не удалось загрузить отзывы</p>';
    }
}

function displayReviews(reviews, container) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="empty-suggestions">Пока нет отзывов. Будьте первым!</p>';
        return;
    }
    
    let totalRating = 0;
    reviews.forEach(r => { if (r.rating) totalRating += parseInt(r.rating); });
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    let html = `<div class="average-rating">⭐ Средняя оценка: ${avgRating} / 5 (${reviews.length} ${reviews.length === 1 ? 'оценка' : 'оценок'})</div>`;
    
    reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const formattedDate = formatDateForReview(review.date);
        html += `
            <div class="review-item">
                <div class="review-stars">${stars}</div>
                <div class="review-text">${escapeHtml(review.review || 'Без отзыва')}</div>
                <div class="review-date">${formattedDate}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
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

// ============= МОДАЛКА ОЦЕНКИ =============
function initRatingModal(film) {
    const modal = document.getElementById('rateModal');
    const rateBtn = document.getElementById('rateBtn');
    const closeSpan = document.querySelector('.rate-close');
    const stars = document.querySelectorAll('#starsContainer span');
    const submitBtn = document.getElementById('submitRatingBtn');
    const reviewText = document.getElementById('reviewText');
    const statusDiv = document.getElementById('ratingStatus');
    
    if (!rateBtn || !modal) return;
    
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
                delete reviewsCache[film.id];
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
    currentFilmId = filmId;
    const film = allFilms.find(f => f.id === filmId);
    if (!film) {
        window.location.href = 'index.html';
        return;
    }

    const episodeTitle = document.getElementById('episodeTitle');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const driveIframe = document.getElementById('driveIframe');
    
    episodeTitle.textContent = film.title;
    
    // Настройка скачивания
    if (downloadBtn && film.downloadUrl) {
        const newDownloadBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
        newDownloadBtn.addEventListener('click', () => {
            const downloadUrl = getDownloadUrl(film.downloadUrl);
            window.open(downloadUrl, '_blank');
        });
    }
    
    // Копирование ссылки
    if (copyLinkBtn) {
        const newCopyBtn = copyLinkBtn.cloneNode(true);
        copyLinkBtn.parentNode.replaceChild(newCopyBtn, copyLinkBtn);
        newCopyBtn.addEventListener('click', async () => {
            const url = window.location.href;
            try {
                await navigator.clipboard.writeText(url);
                showNotification('✅ Ссылка скопирована!');
            } catch (err) {
                showNotification('❌ Ошибка копирования');
            }
        });
    }
    
    // Загрузка видео в iframe
    if (film.videoUrl && driveIframe) {
        const embedUrl = getEmbedUrl(film.videoUrl);
        driveIframe.src = embedUrl;
    }
    
    // Загружаем отзывы
    loadReviews(filmId);
    
    // Инициализируем модалку оценки
    initRatingModal(film);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============= ПРЕДЛОЖЕНИЯ =============
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
                <span class="suggested-film-name">🎬 ${escapeHtml(film.name)}</span>
                <span class="suggested-film-date">${film.date ? new Date(film.date).toLocaleDateString() : ''}</span>
            </div>
        `).join('');
    } catch (error) {
        listContainer.innerHTML = '<p class="empty-suggestions">Не удалось загрузить список</p>';
    }
}

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
    
    if (document.getElementById('driveIframe')) {
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
