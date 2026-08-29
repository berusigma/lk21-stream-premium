/*
 * LK21 STREAM PREMIUM - WHITE & BLUE STREAMING APP ENGINE
 * Author: berusigma / LK21 Team
 */

const TMDB_API_KEY = "82524e2faef91706a2d52d52496130ac";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";

const SERVERS = {
  vidsrc: { 
    name: "⚡ VidSrc (Sub Indo)",
    movie: "https://vidsrc.me/embed/movie?tmdb={id}", 
    tv: "https://vidsrc.me/embed/tv?tmdb={id}&season={s}&episode={e}" 
  },
  embedsu: { 
    name: "🌐 Embed.su (HD)",
    movie: "https://embed.su/embed/movie/{id}", 
    tv: "https://embed.su/embed/tv/{id}/{s}/{e}" 
  },
  vidsrcpro: { 
    name: "💎 VidSrc Pro (Fast)",
    movie: "https://vidsrc.pro/embed/movie/{id}", 
    tv: "https://vidsrc.pro/embed/tv/{id}/{s}/{e}" 
  },
  superembed: { 
    name: "🚀 SuperEmbed (1080p)",
    movie: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1", 
    tv: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1&s={s}&e={e}" 
  },
  autoembed: { 
    name: "🎬 AutoEmbed",
    movie: "https://player.autoembed.cc/embed/movie/{id}", 
    tv: "https://player.autoembed.cc/embed/tv/{id}/{s}/{e}" 
  },
  "2embed": { 
    name: "🔥 2Embed",
    movie: "https://www.2embed.cc/embed/{id}", 
    tv: "https://www.2embed.cc/embedtv/{id}&s={s}&e={e}" 
  }
};

/* MOCK FOOTBALL MATCHES DATA */
const MOCK_FOOTBALL_MATCHES = [
  {
    id: "match-1",
    league: "Premier League",
    status: "LIVE",
    time: "78'",
    isLive: true,
    team1: { name: "Arsenal", logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg" },
    team2: { name: "Chelsea", logo: "https://upload.wikimedia.org/wikipedia/en/cc/Chelsea_FC.svg" }
  },
  {
    id: "match-2",
    league: "UEFA Champions League",
    status: "HARI INI",
    time: "21:00 WIB",
    isLive: false,
    team1: { name: "Real Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" },
    team2: { name: "Barcelona", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona.svg" }
  },
  {
    id: "match-3",
    league: "Serie A",
    status: "BESOK",
    time: "02:45 WIB",
    isLive: false,
    team1: { name: "Juventus", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg" },
    team2: { name: "AC Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg" }
  },
  {
    id: "match-4",
    league: "La Liga",
    status: "HARI INI",
    time: "23:30 WIB",
    isLive: false,
    team1: { name: "Atletico", logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg" },
    team2: { name: "Sevilla", logo: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg" }
  }
];

/* MOCK UPCOMING MOVIES DATA */
const MOCK_UPCOMING_MOVIES = [
  {
    id: 1022789,
    title: "Inside Out 2",
    date: "14 JUN 2026",
    genre: "Animasi • Komedi",
    poster: "https://image.tmdb.org/t/p/w500/vpnP19zLqVGlOx1VoY8YeeOi9W5.jpg",
    reminded: false
  },
  {
    id: 573435,
    title: "Bad Boys: Ride or Die",
    date: "20 JUL 2026",
    genre: "Action • Komedi",
    poster: "https://image.tmdb.org/t/p/w500/nP6RliHjxH2uUjYqMZioHovLgvu.jpg",
    reminded: false
  },
  {
    id: 823464,
    title: "Godzilla x Kong: The New Empire",
    date: "12 AGU 2026",
    genre: "Action • Sci-Fi",
    poster: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cfOiBZaOfHQfeK.jpg",
    reminded: false
  },
  {
    id: 653346,
    title: "Kingdom of the Planet of the Apes",
    date: "05 SEP 2026",
    genre: "Sci-Fi • Petualangan",
    poster: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    reminded: false
  }
];

class LK21API {
  async _fetch(endpoint, params = {}) {
    try {
      const url = new URL(`${TMDB_BASE}${endpoint}`);
      url.searchParams.append("api_key", TMDB_API_KEY);
      url.searchParams.append("language", "id-ID");
      for (const [key, val] of Object.entries(params)) {
        url.searchParams.append(key, val);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`TMDB HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("TMDB fetch error:", err.message);
      return null;
    }
  }

  async search(query) {
    const data = await this._fetch("/search/multi", { query, page: 1 });
    if (!data?.results) return [];
    return data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => ({
        id: r.id,
        title: r.title || r.name,
        type: r.media_type,
        year: (r.release_date || r.first_air_date || "").split("-")[0] || "2026",
        rating: r.vote_average ? r.vote_average.toFixed(1) : "8.5",
        poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
        backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
        overview: r.overview || "Sinopsis menarik film pilihan penonton.",
        country: r.origin_country?.[0] || (r.original_language === "ko" ? "KR" : r.original_language === "ja" ? "JP" : "US")
      }));
  }

  async detail(id, type = "movie") {
    const data = await this._fetch(`/${type}/${id}`);
    const title = data?.title || data?.name || "Film Populer";
    const releaseDate = data?.release_date || data?.first_air_date || "2026";
    const year = releaseDate.split("-")[0] || "2026";
    const runtime = type === "movie" ? (data?.runtime ? `${data.runtime} min` : "120 min") : "45 min/eps";
    const genres = data?.genres?.map((g) => g.name) || ["Action", "Drama", "Petualangan"];
    const countryCode = data?.production_countries?.[0]?.iso_3166_1 || "US";

    let seasonsDetail = [];
    if (type === "tv" && data?.seasons) {
      seasonsDetail = data.seasons.filter(s => s.season_number > 0).map(s => ({
        seasonNumber: s.season_number,
        episodeCount: s.episode_count || 10
      }));
    }

    return {
      id,
      title,
      type,
      year,
      rating: data?.vote_average ? data.vote_average.toFixed(1) : "8.7",
      runtime,
      genres,
      country: countryCode === "ID" ? "🇮🇩 Indonesia" : countryCode === "KR" ? "🇰🇷 Korea" : countryCode === "JP" ? "🎌 Jepang" : "🇺🇸 Barat",
      overview: data?.overview || "Film spektakuler dengan alur cerita mendalam dan efek visual mengagumkan yang siap menghibur waktu santai Anda.",
      poster: data?.poster_path ? `${TMDB_IMG}${data.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
      backdrop: data?.backdrop_path ? `${TMDB_IMG_ORIGINAL}${data.backdrop_path}` : "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1000&q=80",
      seasons: type === "tv" ? (data?.number_of_seasons || 1) : 1,
      seasonsDetail
    };
  }

  async trending() {
    const data = await this._fetch("/trending/all/week");
    if (!data?.results) return this._fallbackList();
    return data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => ({
        id: r.id,
        title: r.title || r.name,
        type: r.media_type,
        year: (r.release_date || r.first_air_date || "").split("-")[0] || "2026",
        rating: r.vote_average ? r.vote_average.toFixed(1) : "8.8",
        poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
        backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
        overview: r.overview || "Trending film pilihan terpopuler minggu ini.",
      }));
  }

  async popularMovies() {
    const data = await this._fetch("/movie/popular");
    if (!data?.results) return this._fallbackList();
    return data.results.map((r) => ({
      id: r.id,
      title: r.title,
      type: "movie",
      year: (r.release_date || "").split("-")[0] || "2026",
      rating: r.vote_average ? r.vote_average.toFixed(1) : "8.5",
      poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
      backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
      overview: r.overview || "",
    }));
  }

  async popularTV() {
    const data = await this._fetch("/tv/popular");
    if (!data?.results) return this._fallbackList("tv");
    return data.results.map((r) => ({
      id: r.id,
      title: r.name,
      type: "tv",
      year: (r.first_air_date || "").split("-")[0] || "2026",
      rating: r.vote_average ? r.vote_average.toFixed(1) : "8.6",
      poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
      backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
      overview: r.overview || "",
    }));
  }

  _fallbackList(type = "movie") {
    return [
      { id: 653346, title: "Kingdom of Planet Apes", type, year: "2026", rating: "8.7", poster: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg" },
      { id: 823464, title: "Godzilla x Kong", type, year: "2026", rating: "8.9", poster: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cfOiBZaOfHQfeK.jpg" },
      { id: 573435, title: "Bad Boys: Ride or Die", type, year: "2026", rating: "8.4", poster: "https://image.tmdb.org/t/p/w500/nP6RliHjxH2uUjYqMZioHovLgvu.jpg" },
      { id: 1022789, title: "Inside Out 2", type, year: "2026", rating: "9.0", poster: "https://image.tmdb.org/t/p/w500/vpnP19zLqVGlOx1VoY8YeeOi9W5.jpg" }
    ];
  }
}

/* APP STATE CONTROLLER */
const api = new LK21API();

let state = {
  trending: [],
  popularMovies: [],
  popularTV: [],
  heroItems: [],
  heroIndex: 0,
  heroTimer: null,
  activeView: "viewBeranda",
  currentDetail: null,
  activeServer: "vidsrc",
  activeSeason: 1,
  activeEpisode: 1,
  searchHistory: JSON.parse(localStorage.getItem("lk21_search_history") || '["Avatar 3", "Squid Game 2", "Demon Slayer", "Siksa Kubur"]'),
  favorites: JSON.parse(localStorage.getItem("lk21_favorites") || "[]"),
  upcomingList: MOCK_UPCOMING_MOVIES,
  isPlaying: true,
  videoSpeed: 1.0,
  videoQuality: "1080p"
};

/* DOM ELEMENTS */
const el = {
  // Top header search
  topSearchInput: document.getElementById("topSearchInput"),
  btnTopSearchSubmit: document.getElementById("btnTopSearchSubmit"),
  btnClearTopSearch: document.getElementById("btnClearTopSearch"),
  topSearchDropdown: document.getElementById("topSearchDropdown"),
  categoryNavContainer: document.getElementById("categoryNavContainer"),

  // Hero Banner
  heroBackdrop: document.getElementById("heroBackdrop"),
  heroTitle: document.getElementById("heroTitle"),
  heroRating: document.getElementById("heroRating"),
  heroYear: document.getElementById("heroYear"),
  heroType: document.getElementById("heroType"),
  heroGenres: document.getElementById("heroGenres"),
  heroOverview: document.getElementById("heroOverview"),
  btnHeroPlay: document.getElementById("btnHeroPlay"),
  btnHeroDetail: document.getElementById("btnHeroDetail"),
  heroIndicators: document.getElementById("heroIndicators"),

  // Horizontal lists
  recommendedScrollList: document.getElementById("recommendedScrollList"),
  footballMatchList: document.getElementById("footballMatchList"),
  rankingTabs: document.getElementById("rankingTabs"),
  rankingScrollList: document.getElementById("rankingScrollList"),
  upcomingScrollList: document.getElementById("upcomingScrollList"),
  categoryCardsGrid: document.getElementById("categoryCardsGrid"),
  actionMoviesList: document.getElementById("actionMoviesList"),
  tvSeriesList: document.getElementById("tvSeriesList"),

  // Sub Views & Bottom Nav
  bottomNavBar: document.getElementById("bottomNavBar"),
  navTabBtns: document.querySelectorAll(".nav-tab-btn"),
  views: document.querySelectorAll(".app-view"),

  // Search View
  pageSearchInput: document.getElementById("pageSearchInput"),
  btnPageSearchSubmit: document.getElementById("btnPageSearchSubmit"),
  searchHistoryChips: document.getElementById("searchHistoryChips"),
  btnClearHistory: document.getElementById("btnClearHistory"),
  verticalSearchResultsList: document.getElementById("verticalSearchResultsList"),

  // Detail Modal
  detailModal: document.getElementById("detailModal"),
  btnDetailBack: document.getElementById("btnDetailBack"),
  btnDetailFav: document.getElementById("btnDetailFav"),
  btnDetailShare: document.getElementById("btnDetailShare"),
  detailBackdropImg: document.getElementById("detailBackdropImg"),
  btnDetailPlayCover: document.getElementById("btnDetailPlayCover"),
  detailTitle: document.getElementById("detailTitle"),
  detailRating: document.getElementById("detailRating"),
  detailYear: document.getElementById("detailYear"),
  detailCountry: document.getElementById("detailCountry"),
  detailRuntime: document.getElementById("detailRuntime"),
  detailTypeBadge: document.getElementById("detailTypeBadge"),
  detailGenresList: document.getElementById("detailGenresList"),
  detailOverviewText: document.getElementById("detailOverviewText"),
  sourcePillsWrap: document.getElementById("sourcePillsWrap"),
  detailTvControls: document.getElementById("detailTvControls"),
  detailSeasonSelect: document.getElementById("detailSeasonSelect"),
  detailEpisodeList: document.getElementById("detailEpisodeList"),
  detailRecommendationsList: document.getElementById("detailRecommendationsList"),
  btnFloatingDownload: document.getElementById("btnFloatingDownload"),
  btnAddToList: document.getElementById("btnAddToList"),
  btnShareDetail: document.getElementById("btnShareDetail"),
  btnDownloadDetail: document.getElementById("btnDownloadDetail"),
  btnPostComment: document.getElementById("btnPostComment"),
  commentInput: document.getElementById("commentInput"),
  commentsList: document.getElementById("commentsList"),

  // Player Modal
  playerModal: document.getElementById("playerModal"),
  btnPlayerBack: document.getElementById("btnPlayerBack"),
  playerVideoTitle: document.getElementById("playerVideoTitle"),
  playerServerBadge: document.getElementById("playerServerBadge"),
  mainIframePlayer: document.getElementById("mainIframePlayer"),
  btnRewind10: document.getElementById("btnRewind10"),
  btnPlayPause: document.getElementById("btnPlayPause"),
  btnForward10: document.getElementById("btnForward10"),
  iconPlayPause: document.getElementById("iconPlayPause"),
  playerProgress: document.getElementById("playerProgress"),
  currentTime: document.getElementById("currentTime"),
  totalTime: document.getElementById("totalTime"),
  btnSpeed: document.getElementById("btnSpeed"),
  btnQuality: document.getElementById("btnQuality"),
  btnFullscreen: document.getElementById("btnFullscreen"),

  // Sub-pages lists
  freeMoviesList: document.getElementById("freeMoviesList"),
  btnMenuFavorites: document.getElementById("btnMenuFavorites"),

  // Toast
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage")
};

/* INITIALIZATION */
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  renderSearchHistory();
  renderFootballMatches();
  renderUpcomingMovies();

  try {
    const [trending, movies, tv] = await Promise.all([
      api.trending(),
      api.popularMovies(),
      api.popularTV()
    ]);

    state.trending = trending;
    state.popularMovies = movies;
    state.popularTV = tv;

    // Render Home Sections
    renderPosterCards(el.recommendedScrollList, state.trending.slice(0, 10));
    renderRankingCards(state.trending.slice(0, 10));
    renderPosterCards(el.actionMoviesList, state.popularMovies.slice(0, 10));
    renderPosterCards(el.tvSeriesList, state.popularTV.slice(0, 10));
    renderPosterCards(el.freeMoviesList, state.popularMovies.slice(5, 12));

    // Hero setup
    if (trending.length > 0) {
      state.heroItems = trending.slice(0, 5);
      renderHeroBanner(0);
      startHeroCarousel();
    }
  } catch (err) {
    console.error("App init error:", err);
  }
}

/* EVENT LISTENERS SETUP */
function setupEventListeners() {
  // Navigation Tabs switching
  el.navTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.dataset.view;
      switchView(targetView);
    });
  });

  // Top Search Submit
  el.btnTopSearchSubmit.addEventListener("click", () => {
    const q = el.topSearchInput.value.trim();
    if (q) performSearch(q);
  });

  el.topSearchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const q = el.topSearchInput.value.trim();
      if (q) performSearch(q);
    }
  });

  // Page Search Submit
  if (el.btnPageSearchSubmit) {
    el.btnPageSearchSubmit.addEventListener("click", () => {
      const q = el.pageSearchInput.value.trim();
      if (q) performSearch(q);
    });
  }

  // Category Nav Pills
  el.categoryNavContainer.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      el.categoryNavContainer.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const cat = pill.dataset.cat;
      showToast(`Kategori: ${pill.textContent}`);
      if (cat === "movie") renderPosterCards(el.recommendedScrollList, state.popularMovies);
      else if (cat === "series" || cat === "tv") renderPosterCards(el.recommendedScrollList, state.popularTV);
      else renderPosterCards(el.recommendedScrollList, state.trending);
    });
  });

  // Category Cards Grid
  el.categoryCardsGrid.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("click", () => {
      const genre = card.dataset.genre;
      showToast(`Membuka Kategori ${genre.toUpperCase()}`);
      switchView("viewSearch");
      performSearch(genre === "kdrama" ? "Korean" : genre === "indo" ? "Indonesia" : "Action");
    });
  });

  // Ranking Filter Tabs
  el.rankingTabs.querySelectorAll(".rank-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      el.rankingTabs.querySelectorAll(".rank-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.dataset.rank;
      showToast(`Filter Ranking: ${tab.textContent}`);
      renderRankingCards(state.trending, filter);
    });
  });

  // Clear Search History
  if (el.btnClearHistory) {
    el.btnClearHistory.addEventListener("click", () => {
      state.searchHistory = [];
      localStorage.setItem("lk21_search_history", JSON.stringify([]));
      renderSearchHistory();
      showToast("Riwayat pencarian dihapus.");
    });
  }

  // Trending Keyword Chips
  document.querySelectorAll("#trendingSearchChips .chip-item").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query;
      performSearch(q);
    });
  });

  // Detail Modal Events
  el.btnDetailBack.addEventListener("click", closeDetailModal);
  el.btnDetailPlayCover.addEventListener("click", () => openPlayerModal());
  el.btnFloatingDownload.addEventListener("click", handleDownloadAction);
  el.btnDownloadDetail.addEventListener("click", handleDownloadAction);

  el.btnAddToList.addEventListener("click", () => {
    if (!state.currentDetail) return;
    const isFav = toggleFavorite(state.currentDetail);
    showToast(isFav ? "Ditambahkan ke Daftar Favorit ❤️" : "Dihapus dari Daftar Favorit");
  });

  el.btnShareDetail.addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({
        title: state.currentDetail?.title || "LK21 Stream",
        text: `Nonton film ${state.currentDetail?.title} gratis sub Indo di LK21 Stream!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      showToast("Link film berhasil disalin ke clipboard 🔗");
    }
  });

  // Comments Posting
  el.btnPostComment.addEventListener("click", () => {
    const text = el.commentInput.value.trim();
    if (!text) return;
    const newComment = document.createElement("div");
    newComment.className = "comment-item";
    newComment.innerHTML = `
      <div class="comment-avatar">😎</div>
      <div class="comment-content">
        <div class="comment-author">Anda <span class="comment-time">• Baru saja</span></div>
        <p class="comment-text">${escapeHtml(text)}</p>
      </div>
    `;
    el.commentsList.prepend(newComment);
    el.commentInput.value = "";
    showToast("Komentar terposting! 💬");
  });

  // Source / Server selector
  el.sourcePillsWrap.querySelectorAll(".source-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      el.sourcePillsWrap.querySelectorAll(".source-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeServer = pill.dataset.server;
      showToast(`Server diganti ke ${pill.textContent}`);
    });
  });

  // Player Modal Events
  el.btnPlayerBack.addEventListener("click", closePlayerModal);
  el.btnRewind10.addEventListener("click", () => {
    showToast("-10 Detik ⏪");
    if (el.playerProgress) el.playerProgress.value = Math.max(0, parseInt(el.playerProgress.value) - 10);
  });
  el.btnForward10.addEventListener("click", () => {
    showToast("+10 Detik ⏩");
    if (el.playerProgress) el.playerProgress.value = Math.min(100, parseInt(el.playerProgress.value) + 10);
  });
  el.btnPlayPause.addEventListener("click", () => {
    state.isPlaying = !state.isPlaying;
    showToast(state.isPlaying ? "Diputar ▶" : "Dipaused ⏸");
  });
  el.btnSpeed.addEventListener("click", () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currIdx = speeds.indexOf(state.videoSpeed);
    state.videoSpeed = speeds[(currIdx + 1) % speeds.length];
    el.btnSpeed.textContent = `⏩ ${state.videoSpeed}x`;
    showToast(`Kecepatan: ${state.videoSpeed}x`);
  });
  el.btnQuality.addEventListener("click", () => {
    const qualities = ["1080p", "720p", "480p"];
    const currIdx = qualities.indexOf(state.videoQuality);
    state.videoQuality = qualities[(currIdx + 1) % qualities.length];
    el.btnQuality.textContent = `⚙️ ${state.videoQuality}`;
    showToast(`Kualitas Video: ${state.videoQuality}`);
  });
  el.btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      el.playerModal.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Account view menu links
  if (el.btnMenuFavorites) {
    el.btnMenuFavorites.addEventListener("click", () => {
      showToast(`Total Favorit: ${state.favorites.length} Film`);
    });
  }
}

/* VIEW SWITCHING LOGIC */
function switchView(viewId) {
  state.activeView = viewId;
  el.views.forEach(v => v.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  el.navTabBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
}

/* HERO BANNER CAROUSEL */
function renderHeroBanner(index) {
  const item = state.heroItems[index];
  if (!item) return;

  state.heroIndex = index;
  el.heroBackdrop.style.backgroundImage = `url('${item.backdrop || item.poster}')`;
  el.heroTitle.textContent = item.title;
  el.heroRating.textContent = `⭐ ${item.rating}`;
  el.heroYear.textContent = item.year;
  el.heroType.textContent = (item.type || 'movie').toUpperCase();
  el.heroOverview.textContent = item.overview || "Sinopsis tidak tersedia.";

  // Indicators
  el.heroIndicators.innerHTML = state.heroItems
    .map((_, i) => `<div class="indicator-dot ${i === index ? "active" : ""}" data-index="${i}"></div>`)
    .join("");

  el.btnHeroPlay.onclick = () => openDetailModal(item.id, item.type, true);
  el.btnHeroDetail.onclick = () => openDetailModal(item.id, item.type, false);
}

function startHeroCarousel() {
  if (state.heroTimer) clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    const nextIdx = (state.heroIndex + 1) % state.heroItems.length;
    renderHeroBanner(nextIdx);
  }, 5000);

  el.heroIndicators.addEventListener("click", (e) => {
    const dot = e.target.closest(".indicator-dot");
    if (dot) {
      const idx = parseInt(dot.dataset.index);
      renderHeroBanner(idx);
      startHeroCarousel();
    }
  });
}

/* RENDER POSTER CARDS WITH CIRCULAR BLUE PLAY BUTTON */
function renderPosterCards(container, items) {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Tidak ada konten.</p></div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="media-poster-card" data-id="${item.id}" data-type="${item.type || 'movie'}">
      <div class="poster-box">
        <img class="poster-img" src="${item.poster}" alt="${escapeHtml(item.title)}" loading="lazy" />
        <span class="poster-rating">⭐ ${item.rating}</span>
        <div class="play-blue-circle">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="poster-card-body">
        <h4 class="poster-card-title">${escapeHtml(item.title)}</h4>
        <div class="poster-card-sub">
          <span>${item.year}</span>
          <span>• ${(item.type || 'movie').toUpperCase()}</span>
        </div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".media-poster-card").forEach(card => {
    card.addEventListener("click", () => {
      openDetailModal(parseInt(card.dataset.id), card.dataset.type);
    });
  });
}

/* RENDER SEPAK BOLA LANGSUNG (LIVE MATCHES) */
function renderFootballMatches() {
  if (!el.footballMatchList) return;
  el.footballMatchList.innerHTML = MOCK_FOOTBALL_MATCHES.map(m => `
    <div class="match-card">
      <div class="match-status-row">
        <span class="match-status-badge ${m.isLive ? 'live' : 'upcoming'}">
          ${m.isLive ? '<span class="pulse-red"></span> ' : ''}${m.status} ${m.time}
        </span>
        <span class="match-league">${m.league}</span>
      </div>
      <div class="match-teams-vs">
        <div class="team-box">
          <img class="team-logo" src="${m.team1.logo}" alt="${m.team1.name}" />
          <span class="team-name">${m.team1.name}</span>
        </div>
        <div class="vs-badge">VS</div>
        <div class="team-box">
          <img class="team-logo" src="${m.team2.logo}" alt="${m.team2.name}" />
          <span class="team-name">${m.team2.name}</span>
        </div>
      </div>
      <button class="btn-watch-match" onclick="showToast('Streaming ${m.team1.name} vs ${m.team2.name} Siap!')">
        <span>▶ Nonton Live</span>
      </button>
    </div>
  `).join("");
}

/* RENDER PERINGKAT FILM (RANKING POSTER CARDS WITH BADGES 1, 2, 3...) */
function renderRankingCards(items, filter = "all") {
  if (!el.rankingScrollList) return;
  let filtered = items;
  if (filter === "kdrama") filtered = items.filter(i => i.title.toLowerCase().includes("korea") || i.id % 2 === 0);
  else if (filter === "indonesia") filtered = items.filter(i => i.title.toLowerCase().includes("indo") || i.id % 3 === 0);

  el.rankingScrollList.innerHTML = filtered.slice(0, 10).map((item, idx) => `
    <div class="ranking-card" data-id="${item.id}" data-type="${item.type || 'movie'}">
      <span class="ranking-badge-num">${idx + 1}</span>
      <div class="poster-box">
        <img class="poster-img" src="${item.poster}" alt="${escapeHtml(item.title)}" loading="lazy" />
        <span class="poster-rating">⭐ ${item.rating}</span>
        <div class="play-blue-circle">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="poster-card-body">
        <h4 class="poster-card-title">${escapeHtml(item.title)}</h4>
        <div class="poster-card-sub">
          <span>Peringkat #${idx + 1}</span>
        </div>
      </div>
    </div>
  `).join("");

  el.rankingScrollList.querySelectorAll(".ranking-card").forEach(card => {
    card.addEventListener("click", () => {
      openDetailModal(parseInt(card.dataset.id), card.dataset.type);
    });
  });
}

/* RENDER MENDATANG (UPCOMING MOVIE CARDS WITH INGAT SAYA BUTTON) */
function renderUpcomingMovies() {
  if (!el.upcomingScrollList) return;
  el.upcomingScrollList.innerHTML = state.upcomingList.map(item => `
    <div class="upcoming-card">
      <div class="upcoming-poster-box">
        <img src="${item.poster}" alt="${escapeHtml(item.title)}" />
        <span class="date-tag">📅 ${item.date}</span>
      </div>
      <div class="upcoming-info">
        <h4 class="upcoming-title">${escapeHtml(item.title)}</h4>
        <span class="upcoming-desc">${item.genre}</span>
      </div>
      <button class="btn-ingat-saya ${item.reminded ? 'active' : ''}" data-id="${item.id}">
        <span>${item.reminded ? '✓ Pengingat Diset' : '🔔 Ingat saya'}</span>
      </button>
    </div>
  `).join("");

  el.upcomingScrollList.querySelectorAll(".btn-ingat-saya").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const target = state.upcomingList.find(u => u.id === id);
      if (target) {
        target.reminded = !target.reminded;
        renderUpcomingMovies();
        showToast(target.reminded ? `Pengingat diset untuk ${target.title} 🔔` : "Pengingat dibatalkan.");
      }
    });
  });
}

/* SEARCH HISTORY CHIPS */
function renderSearchHistory() {
  if (!el.searchHistoryChips) return;
  el.searchHistoryChips.innerHTML = state.searchHistory.map(q => `
    <button class="chip-item" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>
  `).join("");

  el.searchHistoryChips.querySelectorAll(".chip-item").forEach(chip => {
    chip.addEventListener("click", () => performSearch(chip.dataset.query));
  });
}

async function performSearch(query) {
  if (!query) return;
  switchView("viewSearch");
  el.pageSearchInput.value = query;

  if (!state.searchHistory.includes(query)) {
    state.searchHistory.unshift(query);
    if (state.searchHistory.length > 8) state.searchHistory.pop();
    localStorage.setItem("lk21_search_history", JSON.stringify(state.searchHistory));
    renderSearchHistory();
  }

  showToast(`Mencari "${query}"...`);
  const results = await api.search(query);
  renderVerticalSearchResults(results);
}

/* VERTICAL SEARCH RESULTS LIST WITH RANKING BADGES */
function renderVerticalSearchResults(items) {
  if (!el.verticalSearchResultsList) return;
  if (!items || items.length === 0) {
    el.verticalSearchResultsList.innerHTML = `<div class="empty-state"><p>Tidak ada hasil ditemukan.</p></div>`;
    return;
  }

  el.verticalSearchResultsList.innerHTML = items.map((item, idx) => `
    <div class="search-result-item" data-id="${item.id}" data-type="${item.type || 'movie'}">
      <div class="result-poster">
        <span class="result-rank-badge">#${idx + 1}</span>
        <img src="${item.poster}" alt="${escapeHtml(item.title)}" />
      </div>
      <div class="result-info">
        <h4 class="result-title">${escapeHtml(item.title)}</h4>
        <div class="result-meta-row">
          <span class="badge-rating">⭐ ${item.rating}</span>
          <span class="badge-meta">${item.year}</span>
          <span class="result-country">${item.country || 'US'}</span>
          <span class="badge-type">${(item.type || 'movie').toUpperCase()}</span>
        </div>
        <p class="result-overview">${escapeHtml(item.overview)}</p>
      </div>
    </div>
  `).join("");

  el.verticalSearchResultsList.querySelectorAll(".search-result-item").forEach(card => {
    card.addEventListener("click", () => {
      openDetailModal(parseInt(card.dataset.id), card.dataset.type);
    });
  });
}

/* MOVIE DETAIL MODAL */
async function openDetailModal(id, type = "movie", autoPlay = false) {
  showToast("Memuat detail film...");
  const detail = await api.detail(id, type);
  state.currentDetail = detail;

  el.detailBackdropImg.style.backgroundImage = `url('${detail.backdrop || detail.poster}')`;
  el.detailTitle.textContent = detail.title;
  el.detailRating.textContent = `⭐ ${detail.rating}`;
  el.detailYear.textContent = detail.year;
  el.detailCountry.textContent = detail.country;
  el.detailRuntime.textContent = detail.runtime;
  el.detailTypeBadge.textContent = detail.type.toUpperCase();
  el.detailOverviewText.textContent = detail.overview;

  el.detailGenresList.innerHTML = detail.genres.map(g => `<span class="genre-pill">${g}</span>`).join("");

  // TV Controls
  if (type === "tv") {
    el.detailTvControls.classList.remove("hidden");
    setupTvEpisodeControls(detail);
  } else {
    el.detailTvControls.classList.add("hidden");
  }

  // Recommendations "Untukmu"
  renderPosterCards(el.detailRecommendationsList, state.trending.slice(2, 8));

  el.detailModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (autoPlay) {
    openPlayerModal();
  }
}

function closeDetailModal() {
  el.detailModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function setupTvEpisodeControls(detail) {
  const seasonsCount = detail.seasons || 1;
  el.detailSeasonSelect.innerHTML = Array.from({ length: seasonsCount }, (_, i) => i + 1)
    .map(s => `<option value="${s}">Season ${s}</option>`)
    .join("");

  renderTvEpisodes(10);

  el.detailSeasonSelect.onchange = (e) => {
    state.activeSeason = parseInt(e.target.value);
    state.activeEpisode = 1;
    renderTvEpisodes(10);
  };
}

function renderTvEpisodes(count) {
  el.detailEpisodeList.innerHTML = Array.from({ length: count }, (_, i) => i + 1)
    .map(ep => `<button class="ep-btn ${ep === state.activeEpisode ? 'active' : ''}" data-ep="${ep}">Eps ${ep}</button>`)
    .join("");

  el.detailEpisodeList.querySelectorAll(".ep-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeEpisode = parseInt(btn.dataset.ep);
      el.detailEpisodeList.querySelectorAll(".ep-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showToast(`Memutar Season ${state.activeSeason} Episode ${state.activeEpisode}`);
    });
  });
}

/* CINEMATIC FULLSCREEN VIDEO PLAYER MODAL */
function openPlayerModal() {
  if (!state.currentDetail) return;
  const { id, type, title } = state.currentDetail;

  const serverInfo = SERVERS[state.activeServer] || SERVERS.vidsrc;
  const streamUrl = type === "movie" 
    ? serverInfo.movie.replace("{id}", id) 
    : serverInfo.tv.replace("{id}", id).replace("{s}", state.activeSeason).replace("{e}", state.activeEpisode);

  el.playerVideoTitle.textContent = title;
  el.playerServerBadge.textContent = serverInfo.name;
  el.mainIframePlayer.src = streamUrl;

  el.playerModal.classList.remove("hidden");
  showToast(`Memutar: ${title}`);
}

function closePlayerModal() {
  el.playerModal.classList.add("hidden");
  el.mainIframePlayer.src = "";
}

/* FAVORITES & DOWNLOAD HELPERS */
function toggleFavorite(item) {
  const idx = state.favorites.findIndex(f => f.id === item.id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    localStorage.setItem("lk21_favorites", JSON.stringify(state.favorites));
    return false;
  } else {
    state.favorites.push(item);
    localStorage.setItem("lk21_favorites", JSON.stringify(state.favorites));
    return true;
  }
}

function handleDownloadAction() {
  showToast("Unduhan dimulai! File akan disimpan secara offline. 📥");
}

/* TOAST NOTIFICATION UTILITY */
function showToast(msg) {
  el.toastMessage.textContent = msg;
  el.toast.classList.remove("hidden");
  setTimeout(() => {
    el.toast.classList.add("hidden");
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
