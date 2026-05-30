// Общая логика для всех страниц
document.addEventListener('DOMContentLoaded', () => {
    // 1. Настройка ссылки "Другие проекты" (вы потом вставите свой URL)
    const otherLink = document.getElementById('otherProjectsLink');
    if (otherLink) {
        otherLink.href = '#';  // СЮДА ВСТАВИТЕ ВАШУ ССЫЛКУ ПОТОМ
        // otherLink.href = 'https://ваш-сайт.ru'; 
    }

    // 2. Логика плеера (если мы на странице player.html)
    const urlParams = new URLSearchParams(window.location.search);
    const filmParam = urlParams.get('film');
    const filmTitleElem = document.getElementById('filmTitle');
    const videoPlayer = document.getElementById('filmPlayer');

    if (filmTitleElem && videoPlayer) {
        // Настройка названия и видео в зависимости от параметра film
        if (filmParam === 'zhdun2') {
            filmTitleElem.textContent = 'Ждун 2';
            videoPlayer.src = 'video/zhdun2.mp4';   // ПУТЬ К ВАШЕМУ ВИДЕОФАЙЛУ
            videoPlayer.poster = 'posters/zhdun2.jpg';
        } 
        else if (filmParam === 'obsessiya') {
            filmTitleElem.textContent = 'Обсессия';
            videoPlayer.src = 'video/obsessiya.mp4'; // ПУТЬ К ВАШЕМУ ВИДЕОФАЙЛУ
            videoPlayer.poster = 'posters/obsessiya.jpg';
        }
        else {
            // Если фильм не найден — вернуться на главную
            window.location.href = 'index.html';
        }
    }
});
