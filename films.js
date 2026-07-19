// ================================================================
// КАТЕГОРИИ И ПОДКАТЕГОРИИ (глобальное определение сверху)
// ================================================================
const CATEGORIES = {
    film: {
        label: "🎬 Фильмы",
        subcategories: {
            //action: "Боевик",
            family: "Семейный",
            //comedy: "Комедия",
            drama: "Драма",
            //thriller: "Триллер",
            //horror: "Ужасы",
            //adventure: "Приключения",
            fantasy: "Фэнтези",
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
            comedy: "Комедия",
            family: "Семейный",
            drama: "Драма",
            sitcom: "Ситком",
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
    // КОРОЛЕВА ДВОРА
    {
    id: "korolevadvora",
    title: "Королева Двора",
    searchTerms: ["королевадвора", "королева двора", "королевадвор", "королева двор", "кролева двора", "королевка двора", "дворовая королева", "королева нашего двора", "королева", "двор", "королевна двора", "кролевадвора", "королева дв.", "королева во дворе"],
    description: "Аминка бросает вызов хулигану Руслану и проходит серию состязаний, чтобы стать «королевой двора» и помирить всех детей.",
    poster: "posters/королевадвора.jpg",
    seasons: {
        "1": {
            title: "Сезон 1",
            series: {
                "1": { title: "Серия 1", videoUrl: "https://nuno.ru/embed/jDT1JnSxW2a?autoplay=1" },
                "2": { title: "Серия 2", videoUrl: "https://nuno.ru/embed/a7soHoBYHKg?autoplay=1" },
                "3": { title: "Серия 3", videoUrl: "https://nuno.ru/embed/wYMtpBpk5KL?autoplay=1" },
                "4": { title: "Серия 4", videoUrl: "https://nuno.ru/embed/d025n5xUgnY?autoplay=1" },
                "5": { title: "Серия 5", videoUrl: "https://nuno.ru/embed/AmOrAMbr7Ne?autoplay=1" },
                "6": { title: "Серия 6", videoUrl: "https://nuno.ru/embed/CkyOCkFZO97?autoplay=1" },
                "7": { title: "Серия 7", videoUrl: "https://nuno.ru/embed/rgOXDdkGT7Q?autoplay=1" },
                "8": { title: "Серия 8", videoUrl: "https://nuno.ru/embed/bBMsOg5HgIi?autoplay=1" },
                "9": { title: "Серия 9", videoUrl: "https://nuno.ru/embed/0HQOpLimmjg?autoplay=1" },
                "10": { title: "Серия 10", videoUrl: "https://nuno.ru/embed/bhIkE07gxHo?autoplay=1" }
            }
        }
    },
    downloadUrl: null,
    betterVersionReady: true,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "serial",
    subcategory: ["family", "comedy"],
},
    
    // - ЗДРАВСТВУЙТЕ, ВАМ ПОРА -
    {
    id: "zdravstvuytevampora",
    title: "Здравствуйте, вам пора!",
    searchTerms: ["здравствуйте вам пора", "здравствуйте, вам пора", "здравствуйте , вам пора", "здравствуйте,вам пора", "здравствуйте. вам пора", "здравствуйте! вам пора", "здравствуйте — вам пора", "здравствуйте: вам пора", "здравствуйте... вам пора", "вам пора здравствуйте", "пора вам здравствуйте", "пора здравствуйте вам", "вам здравствуйте пора", "здравствуйте пора вам", "пора здравствуйте, вам", "здраствуйте вам пора", "здраствуйте, вам пора", "здрасте вам пора", "здрасьте вам пора", "здравствуйте вам пара", "здравствуйте вам порá", "здраавствуйте вам пора", "здравствууйте вам пора", "здравствуйтее вам пора", "здравствуйте вамм пора", "здравствуйте вам поора", "здраавствуйтек вам пора", "здравствуйте к вам пора", "здравствуйте вам к пора", "ну здравствуйте вам пора", "ой здравствуйте вам пора", "вот здравствуйте вам пора", "здравствуйте вот вам пора", "здравствуйте вам вот пора", "еще здравствуйте вам пора", "здравствуйте еще вам пора", "здравствуйте вам еще пора", "уже здравствуйте вам пора", "здравствуйте уже вам пора", "здравствуйте вам уже пора", "же здравствуйте вам пора", "здравствуйте же вам пора", "здравствуйте вам же пора", "так здравствуйте вам пора", "здравствуйте так вам пора", "а здравствуйте вам пора", "здравствуйте а вам пора", "здравствуйте, пора вам", "пора, здравствуйте, вам", "вам, пора, здравствуйте", "здравствуйте, вам, пора", "вам, здравствуйте, пора", "пора, вам, здравствуйте", "здравствуйте. Пора вам", "здравствуйте! Пора вам", "здравствуйте — пора вам", "здравствуйте: пора вам", "здравствуйте... пора вам", "здравствуйте,вам,пора", "здравствуйте.вам пора", "здравствуйте!вам пора", "здравствуйте-вам пора", "здравствуйте - вам пора", "здравствуйте -- вам пора", "здравствуйте, вам - пора", "здравствуйте, вам — пора", "здравствуйте, вам, пора", "здравствуйте, вам, пора!", "здравствуйте, вам пора?", "здравствуйте, вам пора...", "здравствуйтевампора", "вампораздравствуйте", "пораздравствуйтевам", "здравствуйтевам пора", "здравствуйте вампора", "здраствуйтевампора", "здрастевампора", "здравствуйте, вам пора и все", "здравствуйте, вам пора, да", "здравствуйте, вам пора, ну", "здравствуйте, вам пора, так", "здравствуйте, вам пора, вот", "здравствуйте, вам пора, уже", "здравствуйте, вам пора, еще", "еще", "еще, здравствуйте, вам пора", "здравствуйте, еще, вам пора", "здравствуйте, вам, еще, пора", "ну, здравствуйте, вам пора", "ой, здравствуйте, вам пора", "вот, здравствуйте, вам пора", "так, здравствуйте, вам пора", "а, здравствуйте, вам пора", "здравствуйте, а, вам пора", "здравствуйте, ну, вам пора", "здравствуйте, вот, вам пора", "здравствуйте, так, вам пора", "здравствуйте, уже, вам пора", "здравствуйте, еще, вам пора"],
    description: "Вестник смерти оказывается на Земле и под именем Павел приходит к людям с предупреждением. Смерть ни для кого не делает исключений, и благодаря Паше, они могут исправить ошибки жизни перед своим последним вздохом. Конечно, если поверят, что смерть близка. С каждой новой миссией вестник всё больше симпатизирует этим странным людям, и всё меньше ценит свою работу. Он не знает, что такое любовь, но влюбляется. Он не знает, что такое юмор, но всё чаще смеётся. Он не знает, что такое жизнь, но каждый раз оттягивает момент ухода своих подопечных.",
    poster: "posters/здравствуйтевампора.jpg",
    seasons: {
        "1": {
            title: "Сезон 1",
            series: {
                "1": { title: "Серия 1", videoUrl: "https://scarlet.host.cinemap.cc/54b8b6969fe745d97c87e8e5ed6fc446:2026063015/tvseries/23be54ce574342b342093fce2b81712e12e11ba8/1080.mp4" },
                "2": { title: "Серия 2", videoUrl: "https://nailium.host.cinemap.cc/ba62603a181950cb59dbdd477b0ebd08:2026063015/tvseries/f9098e72790a0bf1b093096a7df2aebbabb4dfae/1080.mp4" },
                "3": { title: "Серия 3", videoUrl: "https://milanium.host.cinemap.cc/a3a8777819327367627869b0210ae474:2026063015/tvseries/8c549d1c3033f41bd2f2393203b60319cb8880e9/1080.mp4" },
                "4": { title: "Серия 4", videoUrl: "https://limbo.host.cinemap.cc/b319f92463d89f763ae001e35a7fcfe4:2026063015/tvseries/abcdeeba14bda6d9b68c263b061dcc0bbe22ac3c/1080.mp4" },
                "5": { title: "Серия 5", videoUrl: "https://noise.host.cinemap.cc/7967826b3797d2c214dff6fe9ce3df94:2026063015/tvseries/6a8ee58c3160c372f39000348a916078af631c0e/1080.mp4" },
                "6": { title: "Серия 6", videoUrl: "https://red.host.cinemap.cc/a4d727d659baecdccec2e4b39a2dd31c:2026063015/tvseries/492f65bf507b4833546ed1d6268c0dd9269efd51/1080.mp4" },
                "7": { title: "Серия 7", videoUrl: "https://scarlet.host.cinemap.cc/2d0300872e252107e85c5ccc8a41f1ae:2026063015/tvseries/c756f32c97bbc5d36febe1a6b0f67fadce08bd5c/1080.mp4" },
                "8": { title: "Серия 8", videoUrl: "https://broadway.host.cinemap.cc/0a81752e8e3cc59fa789258d048f477f:2026063015/tvseries/1b6e0e67b75dd19e96534bc760a3945967666869/1080.mp4" },
                "9": { title: "Серия 9", videoUrl: "https://scarlet.host.cinemap.cc/cfca053cbb1b7ac039f3081321ac5428:2026063015/tvseries/2ddc9ef351ed638e451365cf1df484be5114b71f/1080.mp4" },
                "10": { title: "Серия 10", videoUrl: "https://noise.host.cinemap.cc/ac6422710cb9ec2dafa3cd093272cd00:2026063015/tvseries/9a03eed9751da101de4913649f670149f9a2e0c0/1080.mp4" },
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
    betterVersionReady: true,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "serial",
    subcategory: ["sciFi", "comedy"],
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
                "1": { title: "Серия 1 - Новоселье", videoUrl: "https://nuno.ru/embed/GlUZZSoKTaE?autoplay=1" },
                "2": { title: "Серия 2 - Голодовка", videoUrl: "https://nuno.ru/embed/pjtr45ezWnr?autoplay=1" },
                "3": { title: "Серия 3 - Алёшка Микаэлян", videoUrl: "https://nuno.ru/embed/BuEcIrT7Iek?autoplay=1" },
                "4": { title: "Серия 4 - Диета", videoUrl: "https://nuno.ru/embed/YAdnGd3V2L4?autoplay=1" },
                "5": { title: "Серия 5 - День рождения Тани", videoUrl: "https://nuno.ru/embed/SB97In2zKlQ?autoplay=1" },
                "6": { title: "Серия 6 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "7": { title: "Серия 7 - Юбилей Алёшки", videoUrl: "https://gallium.host.cinemap.cc/fed156dfe6c1da8b1ebb0f95225bdbcb:2026063014/tvseries/27ef43d742bd38b8e358d893d7fe58ec8bf05b78/1080.mp4" },
                "8": { title: "Серия 8 - Рублёвка", videoUrl: "https://gallium.host.cinemap.cc/fed156dfe6c1da8b1ebb0f95225bdbcb:2026063014/tvseries/27ef43d742bd38b8e358d893d7fe58ec8bf05b78/1080.mp4" },
                "9": { title: "Серия 9 - Квартирный вопрос", videoUrl: "https://gallium.host.cinemap.cc/fed156dfe6c1da8b1ebb0f95225bdbcb:2026063014/tvseries/27ef43d742bd38b8e358d893d7fe58ec8bf05b78/1080.mp4" },
                "10": { title: "Серия 10 - Соседка", videoUrl: "https://gallium.host.cinemap.cc/fed156dfe6c1da8b1ebb0f95225bdbcb:2026063014/tvseries/27ef43d742bd38b8e358d893d7fe58ec8bf05b78/1080.mp4" },
                "11": { title: "Серия 11 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "12": { title: "Серия 12 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "13": { title: "Серия 13 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "14": { title: "Серия 14 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "15": { title: "Серия 15 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "16": { title: "Серия 16 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "17": { title: "Серия 17 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "18": { title: "Серия 18 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "19": { title: "Серия 19 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
                "20": { title: "Серия 20 - Шантаж", videoUrl: "https://nuno.ru/embed/o3zVAgmm9iY?autoplay=1" },
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
    betterVersionReady: true,
    betterVersionDate: null,
    releaseDate: null,
    comingSoon: false,
    category: "serial",
    subcategory: ["sitcom", "comedy"],
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
