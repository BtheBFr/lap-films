// ============= ВСЕ ВАШИ ФИЛЬМЫ И СЕРИАЛЫ =============
const FILMS_CATALOG = [
    {
        id: "zhdun2",
        title: "Ждун 2",
        description: "Продолжение приключений серого великана",
        poster: "https://via.placeholder.com/300x450?text=Zhdun2",
        seasons: "none",   // <--- фильм без серий
        videoUrl: "https://example.com/video/zhdun2.mp4"  // ПРЯМАЯ ССЫЛКА
    },
    {
        id: "obsessiya",
        title: "Обсессия",
        description: "Психологический триллер",
        poster: "https://via.placeholder.com/300x450?text=Obsessiya",
        seasons: "none",
        videoUrl: "https://example.com/video/obsessiya.mp4"
    },
    {
        id: "super-сериал",
        title: "Супер сериал",
        description: "Крутой сериал с сезонами",
        poster: "https://via.placeholder.com/300x450?text=SuperSerial",
        seasons: {            // <--- сериал с несколькими сезонами
            "1": {
                title: "Сезон 1",
                series: {
                    "1": { title: "Серия 1", videoUrl: "https://example.com/s1e1.mp4" },
                    "2": { title: "Серия 2", videoUrl: "https://example.com/s1e2.mp4" },
                    "3": { title: "Серия 3", videoUrl: "https://example.com/s1e3.mp4" }
                }
            },
            "2": {
                title: "Сезон 2",
                series: {
                    "1": { title: "Серия 1", videoUrl: "https://example.com/s2e1.mp4" },
                    "2": { title: "Серия 2", videoUrl: "https://example.com/s2e2.mp4" }
                }
            }
        }
    },
    // ДОБАВЛЯЙТЕ НОВЫЕ ФИЛЬМЫ/СЕРИАЛЫ СЮДА
];
