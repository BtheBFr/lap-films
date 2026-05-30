// ============= ВСЕ ВАШИ ФИЛЬМЫ И СЕРИАЛЫ =============
const FILMS_CATALOG = [
    {
        id: "zhdun2",
        title: "Ждун 2",
        searchTerms: ["ждун", "ждун2", "ждун 2", "zhdun", "zhdun2", "ждуг", "ждуний", "серый", "великан"],
        description: "Продолжение приключений серого великана",
        poster: "https://via.placeholder.com/300x450?text=Zhdun2",
        seasons: "none",
        videoUrl: "https://example.com/video/zhdun2.mp4"
    },
    {
        id: "obsessiya",
        title: "Обсессия",
        searchTerms: ["обсессия", "obsessiya", "obsessia", "одержимость", "триллер", "психологический"],
        description: "Психологический триллер о навязчивой идее",
        poster: "https://via.placeholder.com/300x450?text=Obsessiya",
        seasons: "none",
        videoUrl: "https://example.com/video/obsessiya.mp4"
    }
    // ===== ДОБАВЛЯЙ НОВЫЕ ФИЛЬМЫ СЮДА =====
    // {
    //     id: "nazvanie",
    //     title: "Название фильма",
    //     searchTerms: ["ключ1", "ключ2", "ключ3"],
    //     description: "Описание",
    //     poster: "ссылка_на_постер",
    //     seasons: "none",
    //     videoUrl: "ссылка_на_видео"
    // },
    // 
    // ===== ПРИМЕР СЕРИАЛА С СЕЗОНАМИ =====
    // {
    //     id: "serial",
    //     title: "Название сериала",
    //     searchTerms: ["сериал", "ключ1"],
    //     description: "Описание сериала",
    //     poster: "ссылка_на_постер",
    //     seasons: {
    //         "1": {
    //             title: "Сезон 1",
    //             series: {
    //                 "1": { title: "Серия 1", videoUrl: "ссылка_1" },
    //                 "2": { title: "Серия 2", videoUrl: "ссылка_2" }
    //             }
    //         },
    //         "2": {
    //             title: "Сезон 2",
    //             series: {
    //                 "1": { title: "Серия 1", videoUrl: "ссылка_3" }
    //             }
    //         }
    //     }
    // }
];
