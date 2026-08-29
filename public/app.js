/*
 * Created by : febry.is-a.dev
 * GitHub     : vandebry10-star
 * Date       : 19-07-2026
 * * Do not remove the creator's watermark, please respect the creator.
 */

const TMDB_API_KEY = "82524e2faef91706a2d52d52496130ac";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";

const SERVERS = {
  vidsrc: { 
    name: "⚡ VidSrc",
    movie: "https://vidsrc.me/embed/movie?tmdb={id}", 
    tv: "https://vidsrc.me/embed/tv?tmdb={id}&season={s}&episode={e}" 
  },
  embedsu: { 
    name: "🌐 Embed.su",
    movie: "https://embed.su/embed/movie/{id}", 
    tv: "https://embed.su/embed/tv/{id}/{s}/{e}" 
  },
  vidsrcpro: { 
    name: "💎 VidSrc Pro",
    movie: "https://vidsrc.pro/embed/movie/{id}", 
    tv: "https://vidsrc.pro/embed/tv/{id}/{s}/{e}" 
  },
  superembed: { 
    name: "🚀 SuperEmbed",
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

/**
 * LK21 Scraper - Nonton Film & TV Series Gratis Sub Indo
 * Menggunakan TMDB API untuk data + embed streaming
 */
class LK21 {
  constructor() {}

  async _tmdb(endpoint, params = {}) {
    try {
      const url = new URL(`${TMDB_BASE}${endpoint}`);
      url.searchParams.append("api_key", TMDB_API_KEY);
      url.searchParams.append("language", "id-ID");
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error(`TMDB error: ${e.message}`);
      return null;
    }
  }

  async search(query) {
    const data = await this._tmdb("/search/multi", { query, page: 1 });
    if (!data?.results) return [];
    return data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => {
        const title = r.title || r.name;
        const year = (r.release_date || r.first_air_date || "").split("-")[0] || "N/A";
        return {
          id: r.id,
          title,
          year,
          type: r.media_type,
          rating: r.vote_average ? r.vote_average.toFixed(1) : "N/A",
          poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
          backdrop: r.backdrop_path ? `${TMDB_IMG}${r.backdrop_path}` : null,
          overview: r.overview || "Sinopsis belum tersedia.",
        };
      });
  }

  async detail(id, type = "movie") {
    const data = await this._tmdb(`/${type}/${id}`);
    if (!data) return null;
    
    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date;
    const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
    const runtime = type === "movie" ? data.runtime : data.episode_run_time?.[0];
    const genres = data.genres?.map((g) => g.name) || [];
    
    // Cast
    const credits = await this._tmdb(`/${type}/${id}/credits`);
    const cast = credits?.cast?.slice(0, 10).map((a) => ({
      name: a.name,
      character: a.character,
      photo: a.profile_path ? `${TMDB_IMG}${a.profile_path}` : null,
    })) || [];
    
    // Generate server embed URLs
    const servers = {};
    for (const [name, tmpl] of Object.entries(SERVERS)) {
      if (type === "movie") {
        servers[name] = tmpl.movie.replace("{id}", id);
      } else {
        servers[name] = tmpl.tv.replace("{id}", id).replace("{s}", 1).replace("{e}", 1);
      }
    }

    // Detail Seasons & Episodes for TV Shows
    let seasonsDetail = [];
    if (type === "tv" && data.seasons) {
      seasonsDetail = data.seasons.filter(s => s.season_number > 0).map(s => ({
        seasonNumber: s.season_number,
        episodeCount: s.episode_count || 10,
        name: s.name || `Season ${s.season_number}`
      }));
    }

    return {
      id,
      title,
      type,
      year,
      rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
      runtime: runtime ? `${runtime} min` : "N/A",
      genres,
      overview: data.overview || "Sinopsis belum tersedia.",
      poster: data.poster_path ? `${TMDB_IMG}${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG_ORIGINAL}${data.backdrop_path}` : null,
      seasons: type === "tv" ? (data.number_of_seasons || 1) : undefined,
      episodes: type === "tv" ? (data.number_of_episodes || 1) : undefined,
      seasonsDetail,
      cast,
      servers,
      streamUrl: servers.vidsrc,
    };
  }

  async streamingUrl(id, type = "movie", server = "vidsrc", season = 1, episode = 1) {
    const tmpl = SERVERS[server] || SERVERS.vidsrc;
    if (type === "movie") return tmpl.movie.replace("{id}", id);
    return tmpl.tv.replace("{id}", id).replace("{s}", season).replace("{e}", episode);
  }

  async trending() {
    const data = await this._tmdb("/trending/all/week");
    if (!data?.results) return [];
    return data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => ({
        id: r.id,
        title: r.title || r.name,
        type: r.media_type,
        year: (r.release_date || r.first_air_date || "").split("-")[0] || "N/A",
        rating: r.vote_average ? r.vote_average.toFixed(1) : "N/A",
        poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
        backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
        overview: r.overview || "",
      }));
  }

  async popularMovies() {
    const data = await this._tmdb("/movie/popular");
    if (!data?.results) return [];
    return data.results.map((r) => ({
      id: r.id,
      title: r.title,
      type: "movie",
      year: (r.release_date || "").split("-")[0] || "N/A",
      rating: r.vote_average ? r.vote_average.toFixed(1) : "N/A",
      poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
      backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
      overview: r.overview || "",
    }));
  }

  async popularTV() {
    const data = await this._tmdb("/tv/popular");
    if (!data?.results) return [];
    return data.results.map((r) => ({
      id: r.id,
      title: r.name,
      type: "tv",
      year: (r.first_air_date || "").split("-")[0] || "N/A",
      rating: r.vote_average ? r.vote_average.toFixed(1) : "N/A",
      poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
      backdrop: r.backdrop_path ? `${TMDB_IMG_ORIGINAL}${r.backdrop_path}` : null,
      overview: r.overview || "",
    }));
  }

  async byGenre(genreId, type = "movie") {
    const data = await this._tmdb(`/discover/${type}`, { with_genres: genreId });
    if (!data?.results) return [];
    return data.results.map((r) => ({
      id: r.id,
      title: r.title || r.name,
      type: type,
      year: (r.release_date || r.first_air_date || "").split("-")[0] || "N/A",
      rating: r.vote_average ? r.vote_average.toFixed(1) : "N/A",
      poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
      backdrop: r.backdrop_path ? `${TMDB_IMG}${r.backdrop_path}` : null,
      overview: r.overview || "",
    }));
  }

  async recommendations(id, type = "movie") {
    const data = await this._tmdb(`/${type}/${id}/recommendations`);
    if (!data?.results) return [];
    return data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        title: r.title || r.name,
        type: r.media_type || type,
        year: (r.release_date || r.first_air_date || "").split("-")[0] || "N/A",
        rating: r.vote_average ? r.vote_average.toFixed(1) : "N/A",
        poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
      }));
  }
}

/* ==========================================================================
   APP STATE & CONTROLLER
   ========================================================================== */

const api = new LK21();

let state = {
  trending: [],
  popularMovies: [],
  popularTV: [],
  heroItems: [],
  heroIndex: 0,
  favorites: JSON.parse(localStorage.getItem("lk21_favorites") || "[]"),
  currentDetail: null,
  activeServer: "vidsrc",
  activeSeason: 1,
  activeEpisode: 1,
  heroTimer: null,
  searchDebounce: null,
};

// UI Elements
const elements = {
  heroSection: document.getElementById("heroSection"),
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
  
  trendingGrid: document.getElementById("trendingGrid"),
  popularMoviesGrid: document.getElementById("popularMoviesGrid"),
  popularTVGrid: document.getElementById("popularTVGrid"),
  
  genreFilterBar: document.getElementById("genreFilterBar"),
  searchResultsSection: document.getElementById("searchResultsSection"),
  searchResultsTitle: document.getElementById("searchResultsTitle"),
  searchResultsCount: document.getElementById("searchResultsCount"),
  searchResultsGrid: document.getElementById("searchResultsGrid"),
  btnCloseSearchSection: document.getElementById("btnCloseSearchSection"),
  
  favoritesSection: document.getElementById("favoritesSection"),
  favoritesGrid: document.getElementById("favoritesGrid"),
  favoritesCount: document.getElementById("favoritesCount"),
  favoritesEmpty: document.getElementById("favoritesEmpty"),
  favBadge: document.getElementById("favBadge"),
  
  searchInput: document.getElementById("searchInput"),
  btnClearSearch: document.getElementById("btnClearSearch"),
  searchDropdown: document.getElementById("searchDropdown"),
  
  navBtnTrending: document.getElementById("navBtnTrending"),
  navBtnMovies: document.getElementById("navBtnMovies"),
  navBtnTV: document.getElementById("navBtnTV"),
  navBtnFav: document.getElementById("navBtnFav"),
  brandLogo: document.getElementById("brandLogo"),
  
  // Modal Elements
  detailModal: document.getElementById("detailModal"),
  btnModalClose: document.getElementById("btnModalClose"),
  btnModalFav: document.getElementById("btnModalFav"),
  btnModalShare: document.getElementById("btnModalShare"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalPoster: document.getElementById("modalPoster"),
  modalTypeBadge: document.getElementById("modalTypeBadge"),
  modalYearBadge: document.getElementById("modalYearBadge"),
  modalRuntimeBadge: document.getElementById("modalRuntimeBadge"),
  modalRatingBadge: document.getElementById("modalRatingBadge"),
  modalTitle: document.getElementById("modalTitle"),
  modalGenres: document.getElementById("modalGenres"),
  modalOverview: document.getElementById("modalOverview"),
  btnScrollToPlayer: document.getElementById("btnScrollToPlayer"),
  
  // Player Elements
  tvShowControls: document.getElementById("tvShowControls"),
  seasonSelect: document.getElementById("seasonSelect"),
  episodeGrid: document.getElementById("episodeGrid"),
  tvTotalInfo: document.getElementById("tvTotalInfo"),
  
  serverPills: document.querySelectorAll(".server-pill"),
  iframePlayer: document.getElementById("iframePlayer"),
  adShieldOverlay: document.getElementById("adShieldOverlay"),
  btnStartPlayer: document.getElementById("btnStartPlayer"),
  
  modalCastGrid: document.getElementById("modalCastGrid"),
  modalRecommendationsGrid: document.getElementById("modalRecommendationsGrid"),
  
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage"),
};

/* ==========================================================================
   INITIALIZATION & DATA LOADING
   ========================================================================== */

async function initApp() {
  updateFavBadge();
  setupEventListeners();

  try {
    // Load initial home data concurrently
    const [trending, movies, tv] = await Promise.all([
      api.trending(),
      api.popularMovies(),
      api.popularTV(),
    ]);

    state.trending = trending;
    state.popularMovies = movies;
    state.popularTV = tv;

    // Render home sections
    renderMediaGrid(elements.trendingGrid, state.trending.slice(0, 12));
    renderMediaGrid(elements.popularMoviesGrid, state.popularMovies.slice(0, 12));
    renderMediaGrid(elements.popularTVGrid, state.popularTV.slice(0, 12));

    // Hero banner setup
    if (trending.length > 0) {
      state.heroItems = trending.slice(0, 5);
      renderHeroItem(0);
      setupHeroCarousel();
    }
  } catch (err) {
    console.error("Initialization error:", err);
    showToast("Gagal memuat data awal. Silakan muat ulang halaman.");
  }
}

/* ==========================================================================
   HERO CAROUSEL
   ========================================================================== */

function renderHeroItem(index) {
  const item = state.heroItems[index];
  if (!item) return;

  state.heroIndex = index;
  elements.heroBackdrop.style.backgroundImage = `url('${item.backdrop || item.poster}')`;
  elements.heroTitle.textContent = item.title;
  elements.heroRating.textContent = `⭐ ${item.rating}`;
  elements.heroYear.textContent = item.year;
  elements.heroType.textContent = item.type.toUpperCase();
  elements.heroOverview.textContent = item.overview || "Sinopsis tidak tersedia.";

  // Indicators
  elements.heroIndicators.innerHTML = state.heroItems
    .map(
      (_, i) =>
        `<div class="indicator-dot ${i === index ? "active" : ""}" data-index="${i}"></div>`
    )
    .join("");

  // Hero Actions
  elements.btnHeroPlay.onclick = () => openDetail(item.id, item.type, true);
  elements.btnHeroDetail.onclick = () => openDetail(item.id, item.type, false);
}

function setupHeroCarousel() {
  if (state.heroTimer) clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    const nextIndex = (state.heroIndex + 1) % state.heroItems.length;
    renderHeroItem(nextIndex);
  }, 6000);

  elements.heroIndicators.addEventListener("click", (e) => {
    const dot = e.target.closest(".indicator-dot");
    if (dot) {
      const index = parseInt(dot.dataset.index);
      renderHeroItem(index);
      setupHeroCarousel(); // Reset timer
    }
  });
}

/* ==========================================================================
   MEDIA CARD RENDERING
   ========================================================================== */

function renderMediaGrid(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>Tidak ada konten ditemukan.</p>
      </div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
    <div class="media-card" data-id="${item.id}" data-type="${item.type || 'movie'}">
      <div class="poster-wrapper">
        <img class="poster-img" src="${item.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${escapeHtml(item.title)}" loading="lazy" />
        <span class="card-type-badge">${(item.type || 'movie').toUpperCase()}</span>
        <span class="card-rating-badge">⭐ ${item.rating}</span>
        <div class="card-overlay">
          <div class="play-circle-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(item.title)}</h4>
        <div class="card-meta">
          <span>${item.year}</span>
          <span>Rating ${item.rating}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Add click handlers to cards
  container.querySelectorAll(".media-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      const type = card.dataset.type;
      openDetail(id, type);
    });
  });
}

/* ==========================================================================
   DETAIL & PLAYER MODAL
   ========================================================================== */

async function openDetail(id, type = "movie", autoPlay = false) {
  showToast("Memuat detail film...");
  
  const detail = await api.detail(id, type);
  if (!detail) {
    showToast("Gagal mengambil detail film.");
    return;
  }

  state.currentDetail = detail;
  state.activeServer = "vidsrc";
  state.activeSeason = 1;
  state.activeEpisode = 1;

  // Populate Modal Info
  elements.modalBackdrop.style.backgroundImage = `url('${detail.backdrop || detail.poster}')`;
  elements.modalPoster.src = detail.poster || 'https://via.placeholder.com/300x450?text=No+Poster';
  elements.modalTitle.textContent = detail.title;
  elements.modalTypeBadge.textContent = detail.type.toUpperCase();
  elements.modalYearBadge.textContent = detail.year;
  elements.modalRuntimeBadge.textContent = detail.runtime;
  elements.modalRatingBadge.textContent = `⭐ ${detail.rating}`;
  elements.modalOverview.textContent = detail.overview;

  // Genres
  elements.modalGenres.innerHTML = detail.genres
    .map((g) => `<span class="genre-pill">${g}</span>`)
    .join("");

  // Bookmark active state
  updateModalFavButton();

  // Handle TV Show controls if TV
  if (detail.type === "tv") {
    elements.tvShowControls.classList.remove("hidden");
    setupTVControls(detail);
  } else {
    elements.tvShowControls.classList.add("hidden");
  }

  // Active Server Pills reset
  elements.serverPills.forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.server === state.activeServer);
  });

  // Render Cast
  renderCast(detail.cast);

  // Render Recommendations
  loadRecommendations(id, type);

  // Load Video Player Source
  updateVideoPlayer();

  // Show Modal
  elements.detailModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent background scroll

  if (autoPlay) {
    setTimeout(() => {
      document.getElementById("playerSection").scrollIntoView({ behavior: "smooth" });
    }, 300);
  }
}

function closeDetailModal() {
  elements.detailModal.classList.add("hidden");
  document.body.style.overflow = "";
  elements.iframePlayer.src = ""; // Stop video playback
}

function updateVideoPlayer() {
  if (!state.currentDetail) return;
  const { id, type } = state.currentDetail;

  // Show Ad-Shield overlay first
  elements.adShieldOverlay.classList.remove("hidden");

  // Generate target URL
  const serverUrl = SERVERS[state.activeServer] 
    ? (type === "movie" 
        ? SERVERS[state.activeServer].movie.replace("{id}", id)
        : SERVERS[state.activeServer].tv.replace("{id}", id).replace("{s}", state.activeSeason).replace("{e}", state.activeEpisode))
    : SERVERS.vidsrc.movie.replace("{id}", id);

  elements.iframePlayer.src = serverUrl;
}

function setupTVControls(detail) {
  const totalSeasons = detail.seasons || 1;

  // Render Season Select Options
  elements.seasonSelect.innerHTML = Array.from({ length: totalSeasons }, (_, i) => i + 1)
    .map((s) => `<option value="${s}">Season ${s}</option>`)
    .join("");

  elements.seasonSelect.value = state.activeSeason;
  elements.seasonSelect.onchange = (e) => {
    state.activeSeason = parseInt(e.target.value);
    state.activeEpisode = 1;
    renderEpisodesForSeason(detail);
    updateVideoPlayer();
  };

  renderEpisodesForSeason(detail);
}

function renderEpisodesForSeason(detail) {
  let episodeCount = 10; // Default estimate
  if (detail.seasonsDetail && detail.seasonsDetail.length > 0) {
    const seasonInfo = detail.seasonsDetail.find((s) => s.seasonNumber === state.activeSeason);
    if (seasonInfo) episodeCount = seasonInfo.episodeCount || 10;
  }

  elements.tvTotalInfo.textContent = `Season ${state.activeSeason}: ${episodeCount} Episode`;

  elements.episodeGrid.innerHTML = Array.from({ length: episodeCount }, (_, i) => i + 1)
    .map(
      (ep) => `
    <button class="ep-pill ${ep === state.activeEpisode ? "active" : ""}" data-ep="${ep}">
      Eps ${ep}
    </button>
  `
    )
    .join("");

  elements.episodeGrid.querySelectorAll(".ep-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeEpisode = parseInt(btn.dataset.ep);
      elements.episodeGrid.querySelectorAll(".ep-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateVideoPlayer();
      showToast(`Memutar Season ${state.activeSeason} Episode ${state.activeEpisode}`);
    });
  });
}

function renderCast(cast) {
  if (!cast || cast.length === 0) {
    elements.modalCastGrid.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">Informasi pemeran tidak tersedia.</p>`;
    return;
  }

  elements.modalCastGrid.innerHTML = cast
    .map(
      (c) => `
    <div class="cast-card">
      <img class="cast-img" src="${c.photo || 'https://via.placeholder.com/100x100?text=Actor'}" alt="${escapeHtml(c.name)}" loading="lazy" />
      <div class="cast-name">${escapeHtml(c.name)}</div>
      <div class="cast-character">${escapeHtml(c.character || '')}</div>
    </div>
  `
    )
    .join("");
}

async function loadRecommendations(id, type) {
  elements.modalRecommendationsGrid.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>`;

  const recs = await api.recommendations(id, type);
  renderMediaGrid(elements.modalRecommendationsGrid, recs);
}

/* ==========================================================================
   SEARCH & FAVORITES & FILTER LOGIC
   ========================================================================== */

// Live Autocomplete Search
function handleSearchInput(query) {
  clearTimeout(state.searchDebounce);

  if (!query || query.trim().length < 2) {
    elements.searchDropdown.classList.add("hidden");
    elements.btnClearSearch.classList.add("hidden");
    return;
  }

  elements.btnClearSearch.classList.remove("hidden");

  state.searchDebounce = setTimeout(async () => {
    const results = await api.search(query.trim());
    if (results.length === 0) {
      elements.searchDropdown.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">Tidak ada hasil ditemukan</div>`;
    } else {
      elements.searchDropdown.innerHTML = results
        .slice(0, 6)
        .map(
          (r) => `
        <div class="search-item" data-id="${r.id}" data-type="${r.type}">
          <img class="search-item-img" src="${r.poster || 'https://via.placeholder.com/80x120?text=No+Poster'}" alt="${escapeHtml(r.title)}" />
          <div class="search-item-info">
            <div class="search-item-title">${escapeHtml(r.title)}</div>
            <div class="search-item-meta">
              <span>⭐ ${r.rating}</span> &bull; 
              <span>${r.year}</span> &bull; 
              <span style="text-transform:uppercase;">${r.type}</span>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      elements.searchDropdown.querySelectorAll(".search-item").forEach((item) => {
        item.addEventListener("click", () => {
          const id = parseInt(item.dataset.id);
          const type = item.dataset.type;
          elements.searchDropdown.classList.add("hidden");
          openDetail(id, type);
        });
      });
    }

    elements.searchDropdown.classList.remove("hidden");
  }, 350);
}

// Perform full page search
async function executeFullSearch(query) {
  if (!query || !query.trim()) return;

  showToast(`Mencari "${query}"...`);
  elements.searchDropdown.classList.add("hidden");
  
  const results = await api.search(query.trim());
  
  elements.searchResultsTitle.textContent = `Hasil Pencarian: "${query}"`;
  elements.searchResultsCount.textContent = `${results.length} Ditemukan`;
  
  renderMediaGrid(elements.searchResultsGrid, results);
  
  elements.searchResultsSection.classList.remove("hidden");
  elements.favoritesSection.classList.add("hidden");
  document.getElementById("homeSections").classList.add("hidden");

  elements.searchResultsSection.scrollIntoView({ behavior: "smooth" });
}

// Genre Filtering
async function handleGenreFilter(genre, btnElement) {
  document.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  btnElement.classList.add("active");

  if (genre === "all") {
    elements.searchResultsSection.classList.add("hidden");
    elements.favoritesSection.classList.add("hidden");
    document.getElementById("homeSections").classList.remove("hidden");
    return;
  }

  if (genre === "movie") {
    renderMediaGrid(elements.searchResultsGrid, state.popularMovies);
    elements.searchResultsTitle.textContent = "Semua Film Layar Lebar";
    elements.searchResultsCount.textContent = `${state.popularMovies.length} Film`;
  } else if (genre === "tv") {
    renderMediaGrid(elements.searchResultsGrid, state.popularTV);
    elements.searchResultsTitle.textContent = "Semua Serial TV";
    elements.searchResultsCount.textContent = `${state.popularTV.length} Serial`;
  } else {
    showToast("Mengambil data genre...");
    const items = await api.byGenre(genre, "movie");
    renderMediaGrid(elements.searchResultsGrid, items);
    elements.searchResultsTitle.textContent = `Film Category: ${btnElement.textContent}`;
    elements.searchResultsCount.textContent = `${items.length} Ditemukan`;
  }

  elements.searchResultsSection.classList.remove("hidden");
  elements.favoritesSection.classList.add("hidden");
  document.getElementById("homeSections").classList.add("hidden");
}

// Favorites Management
function toggleFavorite(item) {
  const index = state.favorites.findIndex((f) => f.id === item.id);
  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast("Dihapus dari favorit");
  } else {
    state.favorites.push(item);
    showToast("Disimpan ke favorit ❤️");
  }

  localStorage.setItem("lk21_favorites", JSON.stringify(state.favorites));
  updateFavBadge();
  updateModalFavButton();
}

function updateFavBadge() {
  elements.favBadge.textContent = state.favorites.length;
}

function updateModalFavButton() {
  if (!state.currentDetail) return;
  const isFav = state.favorites.some((f) => f.id === state.currentDetail.id);
  elements.btnModalFav.classList.toggle("active", isFav);
}

function renderFavoritesPage() {
  elements.favoritesCount.textContent = `${state.favorites.length} Film`;
  
  if (state.favorites.length === 0) {
    elements.favoritesEmpty.classList.remove("hidden");
    elements.favoritesGrid.innerHTML = "";
  } else {
    elements.favoritesEmpty.classList.add("hidden");
    renderMediaGrid(elements.favoritesGrid, state.favorites);
  }

  elements.favoritesSection.classList.remove("hidden");
  elements.searchResultsSection.classList.add("hidden");
  document.getElementById("homeSections").classList.add("hidden");
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

function setupEventListeners() {
  // Search input events
  elements.searchInput.addEventListener("input", (e) => handleSearchInput(e.target.value));
  elements.searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeFullSearch(e.target.value);
  });
  
  elements.btnClearSearch.addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.searchDropdown.classList.add("hidden");
    elements.btnClearSearch.classList.add("hidden");
  });

  // Close search dropdown on click outside
  document.addEventListener("click", (e) => {
    if (!elements.searchInput.contains(e.target) && !elements.searchDropdown.contains(e.target)) {
      elements.searchDropdown.classList.add("hidden");
    }
  });

  elements.btnCloseSearchSection.addEventListener("click", () => {
    elements.searchResultsSection.classList.add("hidden");
    document.getElementById("homeSections").classList.remove("hidden");
  });

  // Nav Items
  elements.navBtnTrending.addEventListener("click", () => {
    elements.searchResultsSection.classList.add("hidden");
    elements.favoritesSection.classList.add("hidden");
    document.getElementById("homeSections").classList.remove("hidden");
    document.getElementById("trendingGrid").scrollIntoView({ behavior: "smooth" });
  });

  elements.navBtnMovies.addEventListener("click", () => {
    elements.searchResultsSection.classList.add("hidden");
    elements.favoritesSection.classList.add("hidden");
    document.getElementById("homeSections").classList.remove("hidden");
    document.getElementById("popularMoviesGrid").scrollIntoView({ behavior: "smooth" });
  });

  elements.navBtnTV.addEventListener("click", () => {
    elements.searchResultsSection.classList.add("hidden");
    elements.favoritesSection.classList.add("hidden");
    document.getElementById("homeSections").classList.remove("hidden");
    document.getElementById("popularTVGrid").scrollIntoView({ behavior: "smooth" });
  });

  elements.navBtnFav.addEventListener("click", renderFavoritesPage);

  elements.brandLogo.addEventListener("click", (e) => {
    e.preventDefault();
    elements.searchResultsSection.classList.add("hidden");
    elements.favoritesSection.classList.add("hidden");
    document.getElementById("homeSections").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Genre Pills Filter Bar
  elements.genreFilterBar.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (pill) {
      const genre = pill.dataset.genre;
      handleGenreFilter(genre, pill);
    }
  });

  // Modal Controls
  elements.btnModalClose.addEventListener("click", closeDetailModal);
  elements.detailModal.addEventListener("click", (e) => {
    if (e.target === elements.detailModal) closeDetailModal();
  });

  elements.btnModalFav.addEventListener("click", () => {
    if (state.currentDetail) toggleFavorite(state.currentDetail);
  });

  elements.btnModalShare.addEventListener("click", () => {
    if (navigator.share && state.currentDetail) {
      navigator.share({
        title: state.currentDetail.title,
        text: `Nonton ${state.currentDetail.title} Gratis Sub Indo di LK21 Stream Premium!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Tautan berhasil disalin ke clipboard!");
    }
  });

  elements.btnScrollToPlayer.addEventListener("click", () => {
    document.getElementById("playerSection").scrollIntoView({ behavior: "smooth" });
  });

  // Server Pills
  elements.serverPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      elements.serverPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeServer = pill.dataset.server;
      updateVideoPlayer();
      showToast(`Server diganti ke ${pill.textContent.trim()}`);
    });
  });

  // Start player button in AdShield overlay
  elements.btnStartPlayer.addEventListener("click", () => {
    elements.adShieldOverlay.classList.add("hidden");
  });
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

function showToast(message) {
  elements.toastMessage.textContent = message;
  elements.toast.classList.remove("hidden");

  setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Run app on DOM load
document.addEventListener("DOMContentLoaded", initApp);

export default LK21;
