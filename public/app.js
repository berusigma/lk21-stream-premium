/*
 * RSTREAM PREMIUM - STREAM ENGINE & HP SYSTEM INFO
 * Author: berusigma / RSTREAM Team
 */

const TMDB_API_KEY = "82524e2faef91706a2d52d52496130ac";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";

/* SERVER SELECTION MAP - RENAMED STRICTLY TO SERVER 1..6 */
const SERVERS = {
  vidsrc: { 
    name: "SERVER 1",
    movie: "https://vidsrc.me/embed/movie?tmdb={id}", 
    tv: "https://vidsrc.me/embed/tv?tmdb={id}&season={s}&episode={e}" 
  },
  embedsu: { 
    name: "SERVER 2",
    movie: "https://embed.su/embed/movie/{id}", 
    tv: "https://embed.su/embed/tv/{id}/{s}/{e}" 
  },
  vidsrcpro: { 
    name: "SERVER 3",
    movie: "https://vidsrc.pro/embed/movie/{id}", 
    tv: "https://vidsrc.pro/embed/tv/{id}/{s}/{e}" 
  },
  superembed: { 
    name: "SERVER 4",
    movie: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1", 
    tv: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1&s={s}&e={e}" 
  },
  autoembed: { 
    name: "SERVER 5",
    movie: "https://player.autoembed.cc/embed/movie/{id}", 
    tv: "https://player.autoembed.cc/embed/tv/{id}/{s}/{e}" 
  },
  "2embed": { 
    name: "SERVER 6",
    movie: "https://www.2embed.cc/embed/{id}", 
    tv: "https://www.2embed.cc/embedtv/{id}&s={s}&e={e}" 
  }
};

class RstreamAPI {
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
        overview: r.overview || "Sinopsis film pilihan penonton.",
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
      country: countryCode === "ID" ? "Indonesia" : countryCode === "KR" ? "Korea" : countryCode === "JP" ? "Jepang" : "Barat",
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
const api = new RstreamAPI();

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
  searchHistory: JSON.parse(localStorage.getItem("rstream_search_history") || '["Avatar 3", "Squid Game 2", "Demon Slayer", "Siksa Kubur"]'),
  favorites: JSON.parse(localStorage.getItem("rstream_favorites") || "[]")
};

/* DOM ELEMENTS */
const el = {
  topSearchInput: document.getElementById("topSearchInput"),
  btnTopSearchSubmit: document.getElementById("btnTopSearchSubmit"),
  btnClearTopSearch: document.getElementById("btnClearTopSearch"),
  topSearchDropdown: document.getElementById("topSearchDropdown"),
  categoryNavContainer: document.getElementById("categoryNavContainer"),

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

  recommendedScrollList: document.getElementById("recommendedScrollList"),
  rankingTabs: document.getElementById("rankingTabs"),
  rankingScrollList: document.getElementById("rankingScrollList"),
  categoryCardsGrid: document.getElementById("categoryCardsGrid"),
  actionMoviesList: document.getElementById("actionMoviesList"),
  tvSeriesList: document.getElementById("tvSeriesList"),

  bottomNavBar: document.getElementById("bottomNavBar"),
  navTabBtns: document.querySelectorAll(".nav-tab-btn"),
  views: document.querySelectorAll(".app-view"),

  pageSearchInput: document.getElementById("pageSearchInput"),
  btnPageSearchSubmit: document.getElementById("btnPageSearchSubmit"),
  searchHistoryChips: document.getElementById("searchHistoryChips"),
  btnClearHistory: document.getElementById("btnClearHistory"),
  verticalSearchResultsList: document.getElementById("verticalSearchResultsList"),

  detailModal: document.getElementById("detailModal"),
  btnDetailBack: document.getElementById("btnDetailBack"),
  btnDetailFav: document.getElementById("btnDetailFav"),
  detailBackdropImg: document.getElementById("detailBackdropImg"),
  btnDetailPlayCover: document.getElementById("btnDetailPlayCover"),
  detailInlinePlayer: document.getElementById("detailInlinePlayer"),
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
  btnAddToList: document.getElementById("btnAddToList"),
  btnPostComment: document.getElementById("btnPostComment"),
  commentInput: document.getElementById("commentInput"),
  commentsList: document.getElementById("commentsList"),

  // Specs Elements
  specIpAddress: document.getElementById("specIpAddress"),
  specDeviceBrand: document.getElementById("specDeviceBrand"),
  specOsVersion: document.getElementById("specOsVersion"),
  specScreenRes: document.getElementById("specScreenRes"),
  specConnectionType: document.getElementById("specConnectionType"),
  specRam: document.getElementById("specRam"),
  specCpuCores: document.getElementById("specCpuCores"),
  specBattery: document.getElementById("specBattery"),
  specTimezone: document.getElementById("specTimezone"),
  specUserAgent: document.getElementById("specUserAgent"),

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

  try {
    const [trending, movies, tv] = await Promise.all([
      api.trending(),
      api.popularMovies(),
      api.popularTV()
    ]);

    state.trending = trending;
    state.popularMovies = movies;
    state.popularTV = tv;

    renderPosterCards(el.recommendedScrollList, state.trending.slice(0, 10));
    renderRankingCards(state.trending.slice(0, 10));
    renderPosterCards(el.actionMoviesList, state.popularMovies.slice(0, 10));
    renderPosterCards(el.tvSeriesList, state.popularTV.slice(0, 10));

    if (trending.length > 0) {
      state.heroItems = trending.slice(0, 5);
      renderHeroBanner(0);
      startHeroCarousel();
    }

    // RESTORE MOVIE DETAIL & PLAYER IF RETURNED FROM EXTERNAL AD REDIRECT OR BACK BUTTON
    restoreActivePlayerSession();

  } catch (err) {
    console.error("App init error:", err);
  }
}

/* RESTORE ACTIVE STREAM SESSION AFTER RETURN FROM AD REDIRECT */
function restoreActivePlayerSession() {
  const savedSession = sessionStorage.getItem("rstream_active_detail");
  const hash = window.location.hash;
  
  let targetId = null;
  let targetType = "movie";
  let autoPlay = true;

  if (savedSession) {
    try {
      const data = JSON.parse(savedSession);
      targetId = data.id;
      targetType = data.type || "movie";
      autoPlay = data.autoPlay !== undefined ? data.autoPlay : true;
      if (data.server) state.activeServer = data.server;
      if (data.season) state.activeSeason = data.season;
      if (data.episode) state.activeEpisode = data.episode;
    } catch (e) {
      console.warn("Invalid session data:", e);
    }
  } else if (hash.startsWith("#detail-")) {
    targetId = parseInt(hash.replace("#detail-", ""));
  }

  if (targetId) {
    openDetailModal(targetId, targetType, autoPlay);
  }
}

/* EVENT LISTENERS SETUP */
function setupEventListeners() {
  // Handle Browser PopState / Hardware Back Button
  window.addEventListener("popstate", (e) => {
    const savedSession = sessionStorage.getItem("rstream_active_detail");
    if (savedSession) {
      // User pressed BACK from an external redirect / ad page back into app:
      restoreActivePlayerSession();
    } else if (!el.detailModal.classList.contains("hidden")) {
      closeDetailModal();
    }
  });

  // Native Capacitor App Hardware Back Button Listener
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
      if (!el.detailModal.classList.contains("hidden")) {
        closeDetailModal();
      } else if (state.activeView !== "viewBeranda") {
        switchView("viewBeranda");
      } else {
        window.Capacitor.Plugins.App.exitApp();
      }
    });
  }

  // Bottom Navigation
  el.navTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.dataset.view;
      switchView(targetView);
    });
  });

  // Top Search Input Focus -> Direct redirect to Search Page
  el.topSearchInput.addEventListener("focus", () => {
    switchView("viewSearch");
    if (el.pageSearchInput) el.pageSearchInput.focus();
  });

  el.btnTopSearchSubmit.addEventListener("click", () => {
    const q = el.topSearchInput.value.trim();
    performSearch(q || "Trending");
  });

  el.topSearchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const q = el.topSearchInput.value.trim();
      performSearch(q || "Trending");
    }
  });

  if (el.btnPageSearchSubmit) {
    el.btnPageSearchSubmit.addEventListener("click", () => {
      const q = el.pageSearchInput.value.trim();
      if (q) performSearch(q);
    });
  }

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

  el.categoryCardsGrid.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("click", () => {
      const genre = card.dataset.genre;
      showToast(`Membuka Kategori ${genre.toUpperCase()}`);
      performSearch(genre === "kdrama" ? "Korean" : genre === "indo" ? "Indonesia" : "Action");
    });
  });

  el.rankingTabs.querySelectorAll(".rank-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      el.rankingTabs.querySelectorAll(".rank-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.dataset.rank;
      showToast(`Filter Ranking: ${tab.textContent}`);
      renderRankingCards(state.trending, filter);
    });
  });

  if (el.btnClearHistory) {
    el.btnClearHistory.addEventListener("click", () => {
      state.searchHistory = [];
      localStorage.setItem("rstream_search_history", JSON.stringify([]));
      renderSearchHistory();
      showToast("Riwayat pencarian dihapus.");
    });
  }

  document.querySelectorAll("#trendingSearchChips .chip-item").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query;
      performSearch(q);
    });
  });

  el.btnDetailBack.addEventListener("click", closeDetailModal);
  el.btnDetailPlayCover.addEventListener("click", startInlinePlayer);

  el.btnAddToList.addEventListener("click", () => {
    if (!state.currentDetail) return;
    const isFav = toggleFavorite(state.currentDetail);
    showToast(isFav ? "Ditambahkan ke Daftar Saya" : "Dihapus dari Daftar Saya");
  });

  el.btnPostComment.addEventListener("click", () => {
    const text = el.commentInput.value.trim();
    if (!text) return;
    const newComment = document.createElement("div");
    newComment.className = "comment-item";
    newComment.innerHTML = `
      <div class="comment-content">
        <div class="comment-author">Anda <span class="comment-time">• Baru saja</span></div>
        <p class="comment-text">${escapeHtml(text)}</p>
      </div>
    `;
    el.commentsList.prepend(newComment);
    el.commentInput.value = "";
    showToast("Komentar terposting!");
  });

  // Server selection (SERVER 1, SERVER 2...)
  el.sourcePillsWrap.querySelectorAll(".source-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      el.sourcePillsWrap.querySelectorAll(".source-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeServer = pill.dataset.server;
      saveActivePlayerSession();
      showToast(`Server diganti ke ${pill.textContent}`);
      if (!el.detailInlinePlayer.classList.contains("hidden")) {
        startInlinePlayer();
      }
    });
  });
}

/* VIEW SWITCHING & DEVICE SPECIFICATION LOADING */
function switchView(viewId) {
  state.activeView = viewId;
  el.views.forEach(v => v.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  el.navTabBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  if (viewId === "viewAkun") {
    loadDeviceSpecifications();
  }
}

/* DETECT HP DEVICE SPECIFICATIONS */
async function loadDeviceSpecifications() {
  const ua = navigator.userAgent;
  el.specUserAgent.textContent = ua;

  let brand = "Android Smartphone";
  if (ua.includes("Samsung") || ua.includes("SM-")) brand = "Samsung Galaxy";
  else if (ua.includes("Xiaomi") || ua.includes("Redmi") || ua.includes("POCO")) brand = "Xiaomi / POCO";
  else if (ua.includes("OPPO") || ua.includes("CPH")) brand = "OPPO Mobile";
  else if (ua.includes("Vivo") || ua.includes("V2")) brand = "Vivo Mobile";
  else if (ua.includes("Realme") || ua.includes("RMX")) brand = "Realme Mobile";
  else if (ua.includes("iPhone")) brand = "Apple iPhone";
  else if (ua.includes("Pixel")) brand = "Google Pixel";
  el.specDeviceBrand.textContent = brand;

  let os = "Android OS";
  if (ua.includes("Android")) {
    const match = ua.match(/Android\s([0-9\.]+)/);
    os = match ? `Android ${match[1]}` : "Android Linux";
  } else if (ua.includes("iPhone OS")) {
    const match = ua.match(/OS\s([0-9\_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : "Apple iOS";
  }
  el.specOsVersion.textContent = os;

  const w = window.screen.width;
  const h = window.screen.height;
  const dpr = window.devicePixelRatio || 1.0;
  el.specScreenRes.textContent = `${w} x ${h} (${dpr}x DPR)`;

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const connType = conn ? (conn.effectiveType ? conn.effectiveType.toUpperCase() : "Online") : (navigator.onLine ? "Online" : "Offline");
  el.specConnectionType.textContent = `${connType} ${navigator.onLine ? '(Connected)' : '(Offline)'}`;

  el.specRam.textContent = navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM` : "4 - 8 GB RAM";
  el.specCpuCores.textContent = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Core CPU` : "Octa-Core CPU";

  const lang = navigator.language || "id-ID";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta";
  el.specTimezone.textContent = `${lang} (${tz})`;

  if (navigator.getBattery) {
    try {
      const b = await navigator.getBattery();
      const pct = Math.round(b.level * 100);
      el.specBattery.textContent = `${pct}% ${b.charging ? '(Mengisi Daya)' : '(Baterai)'}`;
    } catch (e) {
      el.specBattery.textContent = "95% (Normal)";
    }
  } else {
    el.specBattery.textContent = "Terhubung";
  }

  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    el.specIpAddress.textContent = data.ip || "180.252.88.10";
  } catch (e) {
    el.specIpAddress.textContent = "180.252.88.10 (Public IP)";
  }
}

/* HERO BANNER CAROUSEL */
function renderHeroBanner(index) {
  const item = state.heroItems[index];
  if (!item) return;

  state.heroIndex = index;
  el.heroBackdrop.style.backgroundImage = `url('${item.backdrop || item.poster}')`;
  el.heroTitle.textContent = item.title;
  el.heroRating.textContent = item.rating;
  el.heroYear.textContent = item.year;
  el.heroType.textContent = (item.type || 'movie').toUpperCase();
  el.heroOverview.textContent = item.overview || "Sinopsis tidak tersedia.";

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
        <span class="poster-rating">${item.rating}</span>
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

/* RENDER PERINGKAT FILM */
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
        <span class="poster-rating">${item.rating}</span>
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
  if (el.pageSearchInput) el.pageSearchInput.value = query;

  if (!state.searchHistory.includes(query)) {
    state.searchHistory.unshift(query);
    if (state.searchHistory.length > 8) state.searchHistory.pop();
    localStorage.setItem("rstream_search_history", JSON.stringify(state.searchHistory));
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
          <span class="badge-rating">${item.rating}</span>
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

/* SAVE & PERSIST ACTIVE PLAYER SESSION STATE */
function saveActivePlayerSession() {
  if (!state.currentDetail) return;
  const sessionData = {
    id: state.currentDetail.id,
    type: state.currentDetail.type,
    autoPlay: !el.detailInlinePlayer.classList.contains("hidden"),
    server: state.activeServer,
    season: state.activeSeason,
    episode: state.activeEpisode
  };
  sessionStorage.setItem("rstream_active_detail", JSON.stringify(sessionData));
  history.replaceState({ modal: "detail", id: state.currentDetail.id }, "", `#detail-${state.currentDetail.id}`);
}

/* MOVIE DETAIL MODAL & INLINE STREAM PLAYER */
async function openDetailModal(id, type = "movie", autoPlay = false) {
  showToast("Memuat detail film...");
  const detail = await api.detail(id, type);
  state.currentDetail = detail;

  el.detailBackdropImg.style.backgroundImage = `url('${detail.backdrop || detail.poster}')`;
  el.detailTitle.textContent = detail.title;
  el.detailRating.textContent = detail.rating;
  el.detailYear.textContent = detail.year;
  el.detailCountry.textContent = detail.country;
  el.detailRuntime.textContent = detail.runtime;
  el.detailTypeBadge.textContent = detail.type.toUpperCase();
  el.detailOverviewText.textContent = detail.overview;

  el.detailGenresList.innerHTML = detail.genres.map(g => `<span class="genre-pill">${g}</span>`).join("");

  // Reset Inline Player
  el.detailInlinePlayer.classList.add("hidden");
  el.detailInlinePlayer.src = "";
  el.btnDetailPlayCover.classList.remove("hidden");

  if (type === "tv") {
    el.detailTvControls.classList.remove("hidden");
    setupTvEpisodeControls(detail);
  } else {
    el.detailTvControls.classList.add("hidden");
  }

  renderPosterCards(el.detailRecommendationsList, state.trending.slice(2, 8));

  el.detailModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  saveActivePlayerSession();

  if (autoPlay) {
    startInlinePlayer();
  }
}

function closeDetailModal() {
  sessionStorage.removeItem("rstream_active_detail");
  if (window.location.hash.startsWith("#detail-")) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }

  el.detailModal.classList.add("hidden");
  document.body.style.overflow = "";
  el.detailInlinePlayer.src = "";
  state.currentDetail = null;
}

function startInlinePlayer() {
  if (!state.currentDetail) return;
  const { id, type, title } = state.currentDetail;
  const serverInfo = SERVERS[state.activeServer] || SERVERS.vidsrc;
  const streamUrl = type === "movie" 
    ? serverInfo.movie.replace("{id}", id) 
    : serverInfo.tv.replace("{id}", id).replace("{s}", state.activeSeason).replace("{e}", state.activeEpisode);

  el.detailInlinePlayer.src = streamUrl;
  el.detailInlinePlayer.classList.remove("hidden");
  el.btnDetailPlayCover.classList.add("hidden");
  saveActivePlayerSession();
  showToast(`Memutar stream: ${title}`);
}

function setupTvEpisodeControls(detail) {
  const seasonsCount = detail.seasons || 1;
  el.detailSeasonSelect.innerHTML = Array.from({ length: seasonsCount }, (_, i) => i + 1)
    .map(s => `<option value="${s}">Season ${s}</option>`)
    .join("");

  if (state.activeSeason) {
    el.detailSeasonSelect.value = state.activeSeason;
  }

  renderTvEpisodes(10);

  el.detailSeasonSelect.onchange = (e) => {
    state.activeSeason = parseInt(e.target.value);
    state.activeEpisode = 1;
    saveActivePlayerSession();
    renderTvEpisodes(10);
  };
}

/* LARGE TOUCH EPISODE BUTTONS */
function renderTvEpisodes(count) {
  el.detailEpisodeList.innerHTML = Array.from({ length: count }, (_, i) => i + 1)
    .map(ep => `<button class="ep-btn ${ep === state.activeEpisode ? 'active' : ''}" data-ep="${ep}">Eps ${ep}</button>`)
    .join("");

  el.detailEpisodeList.querySelectorAll(".ep-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeEpisode = parseInt(btn.dataset.ep);
      el.detailEpisodeList.querySelectorAll(".ep-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      saveActivePlayerSession();
      showToast(`Memutar Season ${state.activeSeason} Episode ${state.activeEpisode}`);
      if (!el.detailInlinePlayer.classList.contains("hidden")) {
        startInlinePlayer();
      }
    });
  });
}

function toggleFavorite(item) {
  const idx = state.favorites.findIndex(f => f.id === item.id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    localStorage.setItem("rstream_favorites", JSON.stringify(state.favorites));
    return false;
  } else {
    state.favorites.push(item);
    localStorage.setItem("rstream_favorites", JSON.stringify(state.favorites));
    return true;
  }
}

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
