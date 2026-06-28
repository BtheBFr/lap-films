// ================================================================
// КАТЕГОРИИ И ПОДКАТЕГОРИИ (глобальное определение сверху)
// ================================================================
const CATEGORIES = {
    film: {
        label: "🎬 Фильмы",
        subcategories: {
            //action: "Боевик",
            //comedy: "Комедия",
            drama: "Драма",
            //thriller: "Триллер",
            //horror: "Ужасы",
            //adventure: "Приключения",
            //fantasy: "Фэнтези",
            sciFi: "Фантастика",
            //romance: "Мелодрама",
            //detective: "Детектив",
            //documentary: "Документальный",
            //other: "Другое"
        }
    },
    serial: {
        label: "📺 Сериалы",
        subcategories: {
            //action: "Боевик",
            //comedy: "Комедия",
            drama: "Драма",
            //thriller: "Триллер",
            //horror: "Ужасы",
            //adventure: "Приключения",
            //fantasy: "Фэнтези",
            sciFi: "Фантастика",
            //romance: "Мелодрама",
            //detective: "Детектив",
            //documentary: "Документальный",
            //other: "Другое"
        }
    },
    cartoon: {
        label: "🐱 Мультфильмы",
        subcategories: {
            //animated: "Анимация",
            //anime: "Аниме",
            //family: "Семейный",
            //other: "Другое"
        }
    },
    sequel: {
        label: "📌 Сиквелы / Продолжения",
        subcategories: {
            //sequel: "Сиквел",
            //prequel: "Приквел",
            //spinOff: "Спин-офф",
            sciFi: "Фантастика",
            //other: "Другое"
        }
    },
    short: {
        label: "⏳ Короткометражки",
        subcategories: {
            //short: "Короткометражный",
            //other: "Другое"
        }
    },
    other: {
        label: "📂 Другое",
        subcategories: {
            //other: "Разное"
        }
    }
};

// ================================================================
// КАТАЛОГ ФИЛЬМОВ
// ================================================================
const FILMS_CATALOG = [
    // ---------- ЧЕБУРАШКА (группа сиквелов) ----------
    {
        id: "cheburashka",
        title: "Чебурашка",
        searchTerms: ["чебурашка", "ушастый", "cheburashka", "чебурвашка"],
        description: "На небольшой приморский городок обрушивается дождь из апельсинов, а вместе с фруктами с неба падает неизвестный науке мохнатый непоседливый зверёк. Одержимое апельсинами животное оказывается в домике нелюдимого старика-садовника Геннадия, который из вредности решает оставить его жить у себя, так как местная богачка жаждет заполучить необычного зверя для своей избалованной внучки. Также эта коварная женщина, владелица кондитерской фабрики, пытается выведать секрет шоколада у хозяйки маленького магазинчика — дочери Геннадия, много лет обиженной на отца.",
        poster: "posters/чебурашка.png",
        seasons: "none",
        videoUrl: "https://drive.usercontent.google.com/download?id=11dKW3RGr1td0_P8HWp_O7F5mGyFQSEZR&export=download&authuser=0",
        downloadUrl: null,
        betterVersionReady: true,
        betterVersionDate: null,
        releaseDate: null,
        comingSoon: false,
        category: "film",
        subcategory: "comedy",
        sequelGroup: "cheburashka",
        sequelOrder: 1
    },
    {
        id: "cheburashka2",
        title: "Чебурашка 2",
        searchTerms: ["чебурашка два", "чебурашка", "чебурашка 2", "чебурвашка 2", "чебурвашка", "чебураха два", "ушастый", "cheburashka dwa", "cheburashka 2", "cheburashka two", "cheburashka"],
        description: "Уже год, как Чебурашка живет у Гены. Ушастик взрослеет, и у друзей часто случаются разногласия: Чебурашка начинает проявлять излишнюю самостоятельность и хулиганить, а Гена пытается его воспитывать. Героев приглашают на роскошный день рождения Сони, где ушастик случайно портит праздник. В надежде избежать очередной ссоры Чебурашка вместе с Соней и Гришей тайно сбегают в горы, где их ждут невероятные пейзажи и захватывающие, но опасные приключения!",
        poster: "posters/чебурашка2.png",
        seasons: "none",
        videoUrl: "https://www.youtube.com/embed/GP-iVuPGEXI",
        downloadUrl: null,
        betterVersionReady: true,
        betterVersionDate: null,
        releaseDate: null,
        comingSoon: false,
        category: "film",
        subcategory: "comedy",
        sequelGroup: "cheburashka",
        sequelOrder: 2
    },

    // ---------- ЖДУН ----------
    {
        id: "zhdun",
        title: "Ждун",
        searchTerms: ["ждун", "ждуненок", "zhdun"],
        description: "Корабль доброго инопланетянина Ждуна потерпел крушение во время метеоритного дождя и упал в лесу недалеко от Абрау-Дюрсо. Ждун отправляет сигнал бедствия и начинает ждать помощи, но вот незадача — до его планеты 5 световых лет и ждать пришлось бы долго. К счастью, на помощь Ждуну приходит любознательный мальчик Никита и вся его семья. Никите и семье Семеновых предстоит помочь пришельцу отремонтировать корабль, избежать козней местного афериста-бизнесмена, который страстно мечтает завладеть инопланетными технологиями, и вернуться домой.",
        poster: "posters/ждун.png",
        seasons: "none",
        videoUrl: null,
        downloadUrl: null,
        betterVersionReady: true,
        betterVersionDate: null,
        releaseDate: null,
        comingSoon: false,
        category: "film",
        subcategory: "comedy"
    },
    {
        id: "zhdun2",
        title: "Ждун 2",
        searchTerms: ["ждун", "ждун2", "zhdun"],
        description: "Продолжение приключений серого великана",
        poster: "posters/ждун2.png",
        seasons: "none",
        videoUrl: "https://www.dailymotion.com/video/k2FYq1Mfh8M7ZqH52Xs",
        downloadUrl: null,
        betterVersionReady: true,
        betterVersionDate: null,
        releaseDate: null,
        comingSoon: false,
        category: ["sequel", "film"], 
        subcategory: "sciFi"
    },

    // --------- САШАТАНЯ ---------
    {
    id: "sashatanya",
    title: "СашаТаня",
    searchTerms: ["сашатаня", "саша", "таня", "сашенька", "таненька", "сашка", "таньяка", "гена", "алешка", "алёшка", "sashtanya", "sasha", "tanya", "aleska", "Саша, Таня", "Саша Таня", "Саша,Таня"],
    description: "Сериал «СашаТаня» — это продолжение «Универа», в котором главные герои после свадьбы пытаются построить самостоятельную жизнь в съёмной квартире за МКАДом. У них рождается сын Алёша, появляются ипотечные долги и вечные бытовые проблемы. Главный конфликт — борьба Саши за независимость от своего богатого отца-олигарха Сильвестра, который постоянно вмешивается в их жизнь, предлагая лёгкие деньги, но Саша упрямо хочет всего добиться сам. Всё это подаётся через житейские комедийные ситуации, ссоры, примирения и попытки сохранить романтику в браке.",
    poster: "posters/сашатаня.jpg",
    seasons: {
        "1": {
            title: "Сезон 1",
            series: {
                "1": { title: "Серия 1 - Новоселье", videoUrl: "https://rumble.com/v7bx0mi" },
                "2": { title: "Серия 2 - Продолжение", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" },
                "3": { title: "Серия 3 - Финал", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" }
            }
        },
        "2": {
            title: "Сезон 2",
            series: {
                "1": { title: "Серия 1", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" },
                "2": { title: "Серия 2", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" }
            }
        }
    },
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: "2026-08-01",
    releaseDate: null,
    comingSoon: false,
    category: "serial",
    subcategory: "drama"
},
    
    // ---------- ДРУГИЕ ----------
    {
        id: "obsessiya",
        title: "Обсессия",
        searchTerms: ["обсессия", "obsessiya", "одержимость"],
        description: "Психологический триллер",
        poster: "posters/obsessiya.jpg",
        seasons: "none",
        videoUrl: "https://drive.google.com/uc?export=download&id=ВАШ_ID_2",
        downloadUrl: "https://drive.google.com/uc?export=download&id=ВАШ_ID_2",
        betterVersionReady: false,
        betterVersionDate: null,
        releaseDate: null,
        comingSoon: false,
        category: "film",
        subcategory: "thriller"
    }
];

// ================================================================
// ЗАКОММЕНТИРОВАННЫЕ ПРИМЕРЫ ВСЕХ ВОЗМОЖНЫХ ВАРИАНТОВ
// ================================================================

/*
// 1. ФИЛЬМ ТОЛЬКО С ПРОСМОТРОМ (VK VIDEO)
{
    id: "example1",
    title: "Пример 1",
    searchTerms: ["пример1", "example1"],
    description: "Только просмотр через VK Video, без скачивания",
    poster: "posters/example1.jpg",
    seasons: "none",
    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4",
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 2. ФИЛЬМ ТОЛЬКО С ПРОСМОТРОМ (RUTUBE)
{
    id: "example2",
    title: "Пример 2",
    searchTerms: ["пример2", "example2"],
    description: "Только просмотр через Rutube",
    poster: "posters/example2.jpg",
    seasons: "none",
    videoUrl: "https://rutube.ru/play/embed/XXXXXXXXXXXXXX/",
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 3. ФИЛЬМ ТОЛЬКО С ПРОСМОТРОМ (GOOGLE DRIVE)
{
    id: "example3",
    title: "Пример 3",
    searchTerms: ["пример3", "example3"],
    description: "Только просмотр через Google Drive",
    poster: "posters/example3.jpg",
    seasons: "none",
    videoUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID&export=download&authuser=0",
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 4. ФИЛЬМ С ПРОСМОТРОМ И СКАЧИВАНИЕМ (VK + GOOGLE)
{
    id: "example4",
    title: "Пример 4",
    searchTerms: ["пример4", "example4"],
    description: "Просмотр через VK, скачивание через Google Drive",
    poster: "posters/example4.jpg",
    seasons: "none",
    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4",
    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID&export=download&authuser=0",
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 5. ФИЛЬМ С УЛУЧШЕННОЙ ВЕРСИЕЙ (КОНКРЕТНАЯ ДАТА)
{
    id: "example5",
    title: "Пример 5",
    searchTerms: ["пример5", "example5"],
    description: "Сейчас плохая версия, улучшенная выйдет 15 июля",
    poster: "posters/example5.jpg",
    seasons: "none",
    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=3",
    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID&export=download&authuser=0",
    betterVersionReady: false,
    betterVersionDate: "2026-07-15",
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 6. ФИЛЬМ С УЛУЧШЕННОЙ ВЕРСИЕЙ (СКОРО, БЕЗ ДАТЫ)
{
    id: "example6",
    title: "Пример 6",
    searchTerms: ["пример6", "example6"],
    description: "Сейчас плохая версия, улучшенная скоро",
    poster: "posters/example6.jpg",
    seasons: "none",
    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=3",
    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID&export=download&authuser=0",
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 7. ФИЛЬМ, КОТОРЫЙ ВЫЙДЕТ ПОЗЖЕ (КОНКРЕТНАЯ ДАТА)
{
    id: "example7",
    title: "Пример 7",
    searchTerms: ["пример7", "example7"],
    description: "Премьера 1 сентября 2026",
    poster: "posters/example7.jpg",
    seasons: "none",
    videoUrl: null,
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: "2026-09-01",
    comingSoon: true,
    category: "film",
    subcategory: "action"
},

// 8. ФИЛЬМ, КОТОРЫЙ ВЫЙДЕТ СКОРО (ДАТЫ НЕТ)
{
    id: "example8",
    title: "Пример 8",
    searchTerms: ["пример8", "example8"],
    description: "Скоро будет",
    poster: "posters/example8.jpg",
    seasons: "none",
    videoUrl: null,
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: true,
    category: "film",
    subcategory: "action"
},

// 9. СЕРИАЛ С СЕЗОНАМИ И СЕРИЯМИ
{
    id: "example9",
    title: "Пример сериала",
    searchTerms: ["сериал", "example9"],
    description: "Сериал с несколькими сезонами",
    poster: "posters/example9.jpg",
    seasons: {
        "1": {
            title: "Сезон 1",
            series: {
                "1": { title: "Серия 1 - Начало", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" },
                "2": { title: "Серия 2 - Продолжение", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" },
                "3": { title: "Серия 3 - Финал", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" }
            }
        },
        "2": {
            title: "Сезон 2",
            series: {
                "1": { title: "Серия 1", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" },
                "2": { title: "Серия 2", videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4" }
            }
        }
    },
    downloadUrl: null,
    betterVersionReady: false,
    betterVersionDate: "2026-08-01",
    releaseDate: null,
    comingSoon: false,
    category: "serial",
    subcategory: "drama"
},

// 10. СЕРИАЛ С СЕЗОНАМИ + СКАЧИВАНИЕ
{
    id: "example10",
    title: "Сериал со скачиванием",
    searchTerms: ["сериалскачать", "example10"],
    description: "Сериал, где серии можно скачать",
    poster: "posters/example10.jpg",
    seasons: {
        "1": {
            title: "Сезон 1",
            series: {
                "1": { 
                    title: "Серия 1", 
                    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4",
                    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID_1&export=download&authuser=0"
                },
                "2": { 
                    title: "Серия 2", 
                    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4",
                    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID_2&export=download&authuser=0"
                }
            }
        }
    },
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "serial",
    subcategory: "drama"
},

// 11. ФИЛЬМ, ГДЕ УЖЕ ХОРОШАЯ ВЕРСИЯ (БЕЗ НАДПИСИ)
{
    id: "example11",
    title: "Хорошая версия",
    searchTerms: ["хорошая", "example11"],
    description: "Уже доступна хорошая версия",
    poster: "posters/example11.jpg",
    seasons: "none",
    videoUrl: "https://vkvideo.ru/video_ext.php?oid=-XXX&id=XXX&hash=XXX&hd=4",
    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID&export=download&authuser=0",
    betterVersionReady: true,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
},

// 12. ФИЛЬМ ТОЛЬКО ДЛЯ СКАЧИВАНИЯ (БЕЗ ПРОСМОТРА)
{
    id: "example12",
    title: "Только скачать",
    searchTerms: ["скачать", "download"],
    description: "Фильм только для скачивания",
    poster: "posters/example12.jpg",
    seasons: "none",
    videoUrl: null,
    downloadUrl: "https://drive.usercontent.google.com/download?id=ВАШ_ID&export=download&authuser=0",
    betterVersionReady: false,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "film",
    subcategory: "action"
}
*/
