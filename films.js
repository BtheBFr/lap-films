// ============= ВСЕ ВАШИ ФИЛЬМЫ И СЕРИАЛЫ =============
const FILMS_CATALOG = [
    {
        id: "zhdun2",
        title: "Ждун 2",
        searchTerms: ["ждун", "ждун2", "ждун 2", "zhdun", "zhdun2", "ждуг", "ждуний", "серый", "великан"],
        description: "Продолжение приключений серого великана. Ждун возвращается в новом захватывающем приключении!",
        poster: "posters/ждун2.png",
        seasons: "none",
        videoUrl: "https://example.com/video/zhdun2.mp4"
    },
    {
        id: "obsessiya",
        title: "Обсессия",
        searchTerms: ["обсессия", "obsessiya", "obsessia", "одержимость", "триллер", "психологический"],
        description: "Психологический триллер о навязчивой идее, которая меняет всё.",
        poster: "posters/obsessiya.jpg",
        seasons: "none",
        videoUrl: "https://example.com/video/obsessiya.mp4"
    },
    {
        id: "test-serial",
        title: "Тестовый сериал",
        searchTerms: ["тест", "сериал", "test", "serial"],
        description: "Пример сериала с несколькими сезонами и сериями",
        poster: "posters/test-serial.jpg",
        seasons: {
            "1": {
                title: "Сезон 1",
                series: {
                    "1": { title: "Серия 1 - Начало", videoUrl: "https://example.com/s1e1.mp4" },
                    "2": { title: "Серия 2 - Продолжение", videoUrl: "https://example.com/s1e2.mp4" },
                    "3": { title: "Серия 3 - Финал", videoUrl: "https://example.com/s1e3.mp4" }
                }
            },
            "2": {
                title: "Сезон 2",
                series: {
                    "1": { title: "Серия 1 - Новый поворот", videoUrl: "https://example.com/s2e1.mp4" },
                    "2": { title: "Серия 2 - Развязка", videoUrl: "https://example.com/s2e2.mp4" }
                }
            }
        }
    }
];
