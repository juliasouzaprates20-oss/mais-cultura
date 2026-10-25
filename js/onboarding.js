// Onboarding — +Cultura Cultural Preferences Survey
// 3-step wizard: formats+genres → what you've consumed → review & finish

const Onboarding = {
  // ─── State ────────────────────────────────────────────────────────────────
  _state: {
    step: 1,
    userId: null,
    preferredFormats: [],
    preferredGenres: [],
    consumedFormats: [],
    selectedTitles: [],
    step1Done: false,
    step2Done: false,
    _searchDebounce: null,
    _lastSearchResults: [],
    _searchType: "book"
  },

  GENRES_BY_FORMAT: {
    book: ["Romance","Fantasia","Ficção Científica","Mistério e Suspense","Terror","Drama","Aventura","História","Biografia","Distopia","Clássicos","Mangá e HQ","Literatura Brasileira","Filosofia","Autoajuda"],
    movie: ["Drama","Comédia","Ação","Aventura","Ficção Científica","Terror","Suspense","Romance","Animação","Documentário","Biografia","Fantasia","Crime","Faroeste","Musical"],
    series: ["Drama","Comédia","Ficção Científica","Suspense","Terror","Crime","Fantasia","Animação","Documentário","Ação","Biografia","Reality","Mistério","Romance","Thriller"]
  },

  checkAndLaunch(userId, force = false) {
    if (!userId || userId === "usr_demo_lucas") return false;
    if (!Storage.needsOnboarding(userId)) return false;
    const saved = Storage.getOnboarding(userId);
    if (!force && saved && saved.deferred) {
      return false; // User deferred onboarding, don't auto-open modal
    }
    this._launchForUser(userId);
    return true;
  },

  _launchForUser(userId) {
    this._state.userId = userId;
    const saved = Storage.getOnboarding(userId);
    if (saved && saved.status === "in_progress") {
      this._state.step            = saved.step || 1;
      this._state.preferredFormats = saved.preferredFormats || [];
      this._state.preferredGenres  = saved.preferredGenres  || [];
      this._state.consumedFormats  = saved.consumedFormats  || [];
      this._state.selectedTitles   = saved.selectedTitles   || [];
      this._state.step1Done        = saved.step1Done        || false;
      this._state.step2Done        = saved.step2Done        || false;
      Storage.saveOnboarding(userId, { deferred: false });
    } else {
      this._state.step = 1;
      this._state.preferredFormats = [];
      this._state.preferredGenres  = [];
      this._state.consumedFormats  = [];
      this._state.selectedTitles   = [];
      this._state.step1Done = false;
      this._state.step2Done = false;
      Storage.saveOnboarding(userId, { status: "in_progress", step: 1, deferred: false });
    }
    this._render();
  },

  deferOnboarding() {
    const uid = this._state.userId;
    if (uid) {
      Storage.saveOnboarding(uid, {
        status: "in_progress",
        deferred: true,
        step: this._state.step,
        preferredFormats: this._state.preferredFormats,
        preferredGenres:  this._state.preferredGenres,
        consumedFormats:  this._state.consumedFormats,
        selectedTitles:   this._state.selectedTitles,
        step1Done:        this._state.step1Done,
        step2Done:        this._state.step2Done
      });
    }
    if (typeof UI !== "undefined") UI.navigate("dashboard");
  },

  _render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    const step = this._state.step;
    const steps = ["Preferências","O que já consumi","Revisão"];
    const icons  = ["🎭","📚","✅"];
    container.innerHTML = [
      '<div class="onboarding-overlay">',
      '<div class="onboarding-card" role="dialog" aria-label="Pesquisa de preferências culturais">',
      '<div class="onboarding-progress-bar">',
      steps.map((label, i) => [
        '<div class="onboarding-step-item ' + (i+1===step?"active":i+1<step?"done":"") + '">',
        '<div class="onboarding-step-dot">' + (i+1<step?"✓":icons[i]) + "</div>",
        '<span class="onboarding-step-label">' + label + "</span>",
        "</div>",
        i < steps.length-1 ? '<div class="onboarding-step-connector"></div>' : ""
      ].join("")).join(""),
      "</div>",
      '<div class="onboarding-body" id="onboarding-body">',
      step===1 ? this._renderStep1() : step===2 ? this._renderStep2() : this._renderStep3(),
      "</div>",
      '<div class="onboarding-footer">',
      step > 1 ? '<button class="btn btn-ghost btn-sm" onclick="Onboarding.prevStep()">← Voltar</button>' : "<div></div>",
      '<button class="btn btn-ghost btn-sm onboarding-defer-btn" onclick="Onboarding.deferOnboarding()">Fazer isso depois</button>',
      step < 3
        ? '<button class="btn btn-primary" id="onboarding-next-btn" onclick="Onboarding.nextStep()">Continuar →</button>'
        : '<button class="btn btn-primary" id="onboarding-finish-btn" onclick="Onboarding.finish()">✨ Concluir e personalizar</button>',
      "</div>",
      "</div>",
      "</div>"
    ].join("");
    this._bindEvents();
  },

  _renderStep1() {
    const { preferredFormats, preferredGenres } = this._state;
    const fmts = preferredFormats.length > 0 ? preferredFormats : ["book","movie","series"];
    const genreSet = new Set();
    fmts.forEach(f => (this.GENRES_BY_FORMAT[f] || []).forEach(g => genreSet.add(g)));
    const genres = [...genreSet];
    const fmtOpts = [
      { val:"book",   label:"📚 Livros" },
      { val:"movie",  label:"🎬 Filmes" },
      { val:"series", label:"📺 Séries" }
    ];
    return [
      '<div class="onboarding-step">',
      '<div class="onboarding-tag">Etapa 1 de 3</div>',
      '<h2 class="onboarding-title">Vamos conhecer seu gosto cultural?</h2>',
      '<p class="onboarding-subtitle">Conte o que você gosta para receber recomendações mais a sua cara.</p>',
      '<div class="onboarding-question">',
      '<h3 class="onboarding-question-label">O que você mais gosta de consumir?</h3>',
      '<p class="onboarding-hint">Pode selecionar mais de um.</p>',
      '<div class="onboarding-chips-row" id="format-chips">',
      fmtOpts.map(f =>
        '<button class="onboarding-chip ' + (preferredFormats.includes(f.val)?"selected":"") +
        '" onclick="Onboarding.toggleFormat(\'' + f.val + '\')" aria-pressed="' + preferredFormats.includes(f.val) +
        '" id="format-chip-' + f.val + '">' + f.label + "</button>"
      ).join(""),
      "</div></div>",
      '<div class="onboarding-question">',
      '<h3 class="onboarding-question-label">Quais gêneros você mais gosta?</h3>',
      '<p class="onboarding-hint">Selecione quantos quiser. Pode pular se preferir.</p>',
      '<div class="onboarding-chips-wrap" id="genre-chips">',
      genres.map(g =>
        '<button class="onboarding-chip onboarding-chip-sm ' + (preferredGenres.includes(g)?"selected":"") +
        '" onclick="Onboarding.toggleGenre(this)" aria-pressed="' + preferredGenres.includes(g) +
        '" data-genre="' + this._escHtml(g) + '">' + this._escHtml(g) + "</button>"
      ).join(""),
      "</div></div>",
      "</div>"
    ].join("");
  },

  _renderStep2() {
    let { consumedFormats, selectedTitles, _searchType } = this._state;
    if (!consumedFormats || consumedFormats.length === 0) {
      consumedFormats = this._state.preferredFormats.length > 0
        ? [...this._state.preferredFormats]
        : ["book", "movie", "series"];
      this._state.consumedFormats = consumedFormats;
    }
    if (!_searchType || !consumedFormats.includes(_searchType)) {
      _searchType = consumedFormats[0] || "book";
      this._state._searchType = _searchType;
    }
    const fmtLabels = { book:"📚 Livros", movie:"🎬 Filmes", series:"📺 Séries" };
    return [
      '<div class="onboarding-step">',
      '<div class="onboarding-tag">Etapa 2 de 3</div>',
      '<h2 class="onboarding-title">O que você já leu ou assistiu?</h2>',
      '<p class="onboarding-subtitle">Adicione títulos para personalizar suas recomendações. Você pode completar depois.</p>',
      '<div class="onboarding-question">',
      '<h3 class="onboarding-question-label">Quais formatos você consome?</h3>',
      '<div class="onboarding-chips-row" id="consumed-format-chips">',
      Object.entries(fmtLabels).map(([val,label]) =>
        '<button class="onboarding-chip ' + (consumedFormats.includes(val)?"selected":"") +
        '" onclick="Onboarding.toggleConsumedFormat(\'' + val + '\')" aria-pressed="' + consumedFormats.includes(val) +
        '" id="consumed-chip-' + val + '">' + label + "</button>"
      ).join(""),
      "</div></div>",
      '<div class="onboarding-question" id="title-search-section">',
      '<h3 class="onboarding-question-label">Pesquise títulos que você já conhece</h3>',
      '<div class="onboarding-search-tabs" id="search-type-tabs">',
      consumedFormats.map(f =>
        '<button class="onboarding-search-tab ' + (_searchType===f?"active":"") +
        '" onclick="Onboarding.setSearchType(\'' + f + '\')">' + fmtLabels[f] + "</button>"
      ).join(""),
      "</div>",
      '<div class="onboarding-search-bar">',
      '<input type="text" id="onboarding-search-input" class="form-input onboarding-search-input" placeholder="Digite o título (ex: Harry Potter, Dom Casmurro, Interestelar, Dark)..." oninput="Onboarding.handleSearch(this.value)" autocomplete="off"/>',
      '<span class="onboarding-search-spinner" id="onboarding-search-spinner" style="display:none">⏳</span>',
      "</div>",
      '<div id="onboarding-search-results" class="onboarding-search-results"></div>',
      "</div>",
      selectedTitles.length > 0 ? [
        '<div class="onboarding-question">',
        '<h3 class="onboarding-question-label">Títulos selecionados (' + selectedTitles.length + ')</h3>',
        '<div class="onboarding-selected-list" id="selected-titles-list">',
        selectedTitles.map((t,i) => this._renderSelectedTitle(t,i)).join(""),
        "</div></div>"
      ].join("") : "",
      "</div>"
    ].join("");
  },

  _renderSelectedTitle(t, idx) {
    const opts = this._statusOptions(t.type);
    return [
      '<div class="onboarding-selected-item" id="selected-item-' + idx + '">',
      '<img src="' + this._escHtml(t.cover) + '" alt="' + this._escHtml(t.title) + '" class="onboarding-selected-cover" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"60\\\" height=\\\"90\\\"><rect fill=\\\"#e2d9ce\\\" width=\\\"60\\\" height=\\\"90\\\"/></svg>\'"/>',
      '<div class="onboarding-selected-info">',
      '<span class="onboarding-selected-title">' + this._escHtml(t.title) + "</span>",
      '<span class="onboarding-selected-creator">' + this._escHtml(t.creator||"") + "</span>",
      '<select class="onboarding-status-select form-input" onchange="Onboarding.updateSelectedStatus(' + idx + ', this.value)">',
      opts.map(o => '<option value="' + o.val + '"' + (t.status===o.val?" selected":"") + ">" + o.label + "</option>").join(""),
      "</select></div>",
      '<button class="onboarding-remove-btn" onclick="Onboarding.removeSelected(' + idx + ')" title="Remover">✕</button>',
      "</div>"
    ].join("");
  },

  _statusOptions(type) {
    if (type==="book")  return [{val:"read",label:"Lido"},{val:"reading",label:"Lendo"},{val:"want_to_read",label:"Quero ler"}];
    if (type==="movie") return [{val:"watched",label:"Assistido"},{val:"want_to_watch",label:"Quero assistir"}];
    return [{val:"completed",label:"Concluída"},{val:"watching",label:"Assistindo"},{val:"want_to_watch",label:"Quero assistir"}];
  },

  _defaultStatus(type) {
    if (type==="book")  return "read";
    if (type==="movie") return "watched";
    return "completed";
  },

  _renderStep3() {
    const { preferredFormats, preferredGenres, selectedTitles } = this._state;
    const fmtLabels = { book:"📚 Livros", movie:"🎬 Filmes", series:"📺 Séries" };
    return [
      '<div class="onboarding-step">',
      '<div class="onboarding-tag">Etapa 3 de 3</div>',
      '<h2 class="onboarding-title">Revisão das suas preferências</h2>',
      '<p class="onboarding-subtitle">Confira o resumo. Clique em "Voltar" para editar qualquer item.</p>',
      '<div class="onboarding-review-grid">',
      '<div class="onboarding-review-block">',
      '<h4 class="onboarding-review-label">🎯 Formatos preferidos</h4>',
      preferredFormats.length > 0
        ? '<div class="onboarding-chips-row">' + preferredFormats.map(f=>'<span class="onboarding-chip selected">'+(fmtLabels[f]||f)+"</span>").join("") + "</div>"
        : '<p class="onboarding-empty-note">Nenhum selecionado</p>',
      "</div>",
      '<div class="onboarding-review-block">',
      '<h4 class="onboarding-review-label">🎭 Gêneros favoritos</h4>',
      preferredGenres.length > 0
        ? '<div class="onboarding-chips-wrap">' + preferredGenres.map(g=>'<span class="onboarding-chip onboarding-chip-sm selected">'+this._escHtml(g)+"</span>").join("") + "</div>"
        : '<p class="onboarding-empty-note">Nenhum selecionado — usaremos recomendações gerais.</p>',
      "</div>",
      selectedTitles.length > 0 ? [
        '<div class="onboarding-review-block" style="grid-column:1/-1">',
        '<h4 class="onboarding-review-label">📋 Títulos registrados (' + selectedTitles.length + ')</h4>',
        '<div class="onboarding-review-titles">',
        selectedTitles.map(t =>
          '<div class="onboarding-review-title-row"><img src="' + this._escHtml(t.cover) + '" alt="" class="onboarding-review-thumb" onerror="this.style.display=\'none\'"/><div><strong>' +
          this._escHtml(t.title) + '</strong><span style="font-size:12px;color:var(--text-muted);margin-left:8px;">' +
          Storage.formatStatus(t.type, t.status) + "</span></div></div>"
        ).join(""),
        "</div></div>"
      ].join("") : [
        '<div class="onboarding-review-block" style="grid-column:1/-1">',
        '<h4 class="onboarding-review-label">📋 Títulos</h4>',
        '<p class="onboarding-empty-note">Nenhum título adicionado — você pode fazer isso a qualquer momento na sua biblioteca.</p>',
        "</div>"
      ].join(""),
      "</div>",
      '<div class="onboarding-welcome-msg">🎉 Tudo pronto! Vamos personalizar suas recomendações com base no que você compartilhou.</div>',
      "</div>"
    ].join("");
  },

  nextStep() {
    const step = this._state.step;
    if (step === 1) {
      this._state.step1Done = true;
      this._state.step = 2;
      if (!this._state._searchType) this._state._searchType = this._state.consumedFormats[0] || this._state.preferredFormats[0] || "book";
    } else if (step === 2) {
      this._state.step2Done = true;
      this._state.step = 3;
    }
    this._saveProgress();
    this._render();
  },

  prevStep() {
    if (this._state.step > 1) { this._state.step--; this._saveProgress(); this._render(); }
  },

  _saveProgress() {
    const s = this._state;
    Storage.saveOnboarding(s.userId, {
      status: "in_progress", step: s.step,
      preferredFormats: s.preferredFormats, preferredGenres: s.preferredGenres,
      consumedFormats: s.consumedFormats, selectedTitles: s.selectedTitles,
      step1Done: s.step1Done, step2Done: s.step2Done
    });
  },

  async finish() {
    const { userId, preferredFormats, preferredGenres, selectedTitles } = this._state;
    if (!userId) return;
    Storage.saveOnboarding(userId, { status:"in_progress", preferredFormats, preferredGenres, selectedTitles });
    Storage.markOnboardingComplete(userId);
    let added = 0, updated = 0;
    const normalizeStr = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s]/gi,"").replace(/\s+/g," ").trim();
    for (const t of selectedTitles) {
      try {
        const inLib = Storage.isItemInLibrary(userId, t);
        if (inLib) {
          const ex = Storage.getUserItems(userId).find(i => i.type===t.type && normalizeStr(i.title)===normalizeStr(t.title));
          if (ex && ex.status !== t.status) Storage.updateItem(userId, ex.id, { status: t.status });
          updated++;
        } else {
          Storage.addItem(userId, {
            type: t.type, title: t.title, creator: t.creator||"Desconhecido",
            genre: t.genre||"Geral", genres: t.genres||[t.genre||"Geral"],
            year: t.year||new Date().getFullYear(), cover: t.cover||"",
            status: t.status, synopsis: t.synopsis||"", isbn: t.isbn||"",
            publisher: t.publisher||"", pages: t.type==="book"?(t.pages||0):0,
            duration: t.type==="movie"?(t.duration||90):0,
            seasons: t.type==="series"?(t.seasons||1):0,
            episodes: t.type==="series"?(t.episodes||10):0,
            rating: 0, review: "", isFavorite: false,
            dateFinished: ["read","watched","completed"].includes(t.status) ? new Date().toISOString().split("T")[0] : null,
            dateStarted: null, currentPage: 0
          });
          added++;
        }
      } catch(err) { console.warn("Onboarding addItem error", err); }
    }
    Storage.logActivity(userId, {
      type: "onboarding", title: "Preferências culturais configuradas", mediaType: "system",
      details: (added>0?added+" título(s) adicionado(s). ":"") + (updated>0?updated+" item(s) atualizado(s). ":"") + "Recomendações personalizadas ativadas!"
    });
    this._renderWelcome();
  },

  _renderWelcome() {
    const container = document.getElementById("main-content");
    if (!container) return;
    const user = Storage.getCurrentUser();
    const firstName = user ? user.name.split(" ")[0] : "você";
    container.innerHTML = [
      '<div class="onboarding-overlay onboarding-welcome-overlay">',
      '<div class="onboarding-welcome-card">',
      '<div class="onboarding-welcome-icon">🎉</div>',
      '<h1 class="onboarding-welcome-title">Bem-vindo, ' + this._escHtml(firstName) + '!</h1>',
      '<p class="onboarding-welcome-text">Suas preferências foram salvas. O +Cultura agora vai priorizar os gêneros e formatos que você ama.</p>',
      '<div class="onboarding-welcome-dots">',
      '<span>✅ Preferências salvas</span>',
      '<span>📚 Biblioteca atualizada</span>',
      '<span>✨ Recomendações ativadas</span>',
      "</div>",
      '<button class="btn btn-primary btn-lg" onclick="Onboarding._goToDashboard()">Ir para o +Cultura →</button>',
      "</div></div>"
    ].join("");
    setTimeout(() => this._goToDashboard(), 3500);
  },

  _goToDashboard() {
    if (typeof UI !== "undefined") { UI.renderHeader(); UI.navigate("dashboard"); }
  },

  toggleFormat(fmt) {
    const arr = this._state.preferredFormats;
    const i = arr.indexOf(fmt);
    if (i>=0) arr.splice(i,1); else arr.push(fmt);
    this._state.preferredFormats = arr;
    const body = document.getElementById("onboarding-body");
    if (body) body.innerHTML = this._renderStep1();
    this._bindEvents();
  },

  toggleGenre(el) {
    const g = el.dataset.genre;
    if (!g) return;
    const arr = this._state.preferredGenres;
    const i = arr.indexOf(g);
    if (i>=0) arr.splice(i,1); else arr.push(g);
    this._state.preferredGenres = arr;
    el.classList.toggle("selected", arr.includes(g));
    el.setAttribute("aria-pressed", arr.includes(g));
  },

  toggleConsumedFormat(fmt) {
    const arr = this._state.consumedFormats;
    const i = arr.indexOf(fmt);
    if (i>=0) arr.splice(i,1); else arr.push(fmt);
    this._state.consumedFormats = arr;
    if (!arr.includes(this._state._searchType)) this._state._searchType = arr[0] || "book";
    const body = document.getElementById("onboarding-body");
    if (body) body.innerHTML = this._renderStep2();
    this._bindEvents();
  },

  setSearchType(type) {
    this._state._searchType = type;
    document.querySelectorAll(".onboarding-search-tab").forEach(t => {
      const lbl = t.textContent.trim().toLowerCase();
      t.classList.toggle("active",
        (type==="book" && lbl.includes("livro")) ||
        (type==="movie" && lbl.includes("filme")) ||
        (type==="series" && (lbl.includes("série") || lbl.includes("serie")))
      );
    });
    const r = document.getElementById("onboarding-search-results");
    if (r) r.innerHTML = "";
    const inp = document.getElementById("onboarding-search-input");
    if (inp) { inp.value = ""; inp.focus(); }
    this._state._lastSearchResults = [];
  },

  _searchCatalog(query, type) {
    const q = (query || "").toLowerCase().trim();
    if (!q) return [];
    const catalog = (typeof Storage !== "undefined" ? Storage.getCatalog() : null) || (typeof EDITORIAL_CATALOG !== "undefined" ? EDITORIAL_CATALOG : []);
    return catalog.filter(item => {
      if (type && item.type !== type) return false;
      const title = (item.title || "").toLowerCase();
      const creator = (item.creator || "").toLowerCase();
      const genre = (item.genre || "").toLowerCase();
      return title.includes(q) || creator.includes(q) || genre.includes(q);
    }).map(item => ({
      ...item,
      id: item.id || ("cat_" + (item.title || "").replace(/\s+/g, "_")),
      isCatalog: true
    }));
  },

  handleSearch(query) {
    clearTimeout(this._state._searchDebounce);
    const spinner = document.getElementById("onboarding-search-spinner");
    const results = document.getElementById("onboarding-search-results");
    const q = (query || "").trim();
    if (!q || q.length < 2) {
      if (results) results.innerHTML = "";
      if (spinner) spinner.style.display = "none";
      return;
    }

    const type = this._state._searchType;
    // Show instant catalog matches immediately
    const catalogHits = this._searchCatalog(q, type);
    this._state._lastSearchResults = [...catalogHits];
    this._renderSearchResults(catalogHits, q);

    if (spinner) spinner.style.display = "inline-block";

    this._state._searchDebounce = setTimeout(async () => {
      try {
        let externalHits = [];
        if (type === "book")       externalHits = await SearchService.searchBooksOpenLibrary(q);
        else if (type === "movie") externalHits = await SearchService.searchMoviesItunes(q);
        else                       externalHits = await SearchService.searchSeriesTVMaze(q);

        if (spinner) spinner.style.display = "none";

        // Merge catalog hits + external hits, avoiding duplicates
        const normalizeStr = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, "").replace(/\s+/g, " ").trim();
        const seen = new Set(catalogHits.map(c => normalizeStr(c.title)));
        const combined = [...catalogHits];
        for (const ext of externalHits) {
          const normTitle = normalizeStr(ext.title);
          if (!seen.has(normTitle)) {
            seen.add(normTitle);
            combined.push(ext);
          }
        }

        this._state._lastSearchResults = combined;
        this._renderSearchResults(combined, q);
      } catch(err) {
        if (spinner) spinner.style.display = "none";
        console.warn("Onboarding search error", err);
      }
    }, 350);
  },

  _renderSearchResults(hits, query = "") {
    const container = document.getElementById("onboarding-search-results");
    if (!container) return;
    const uid = this._state.userId;
    const escQuery = this._escHtml(query);

    let html = "";
    if (!hits || hits.length === 0) {
      html += '<p class="onboarding-no-results">Nenhum resultado encontrado para "' + escQuery + '".</p>';
    } else {
      html += hits.map((h, idx) => {
        const alreadySel = this._state.selectedTitles.some(t => t.id === h.id || (t.title && t.title.toLowerCase() === (h.title || "").toLowerCase() && t.type === h.type));
        const inLib = uid ? Storage.isItemInLibrary(uid, h) : false;
        return [
          '<div class="onboarding-result-item' + (alreadySel ? " already-selected" : "") + '">',
          '<img src="' + this._escHtml(h.cover) + '" alt="' + this._escHtml(h.title) + '" class="onboarding-result-cover" onerror="this.onerror=null;this.style.background=\'#e2d9ce\';this.src=\'\'"/>',
          '<div class="onboarding-result-info">',
          '<span class="onboarding-result-title">' + this._escHtml(h.title) + "</span>",
          '<span class="onboarding-result-meta">' + this._escHtml(h.creator || "") + (h.year ? " • " + h.year : "") + "</span>",
          inLib ? '<span class="onboarding-in-library-badge">✓ Na sua biblioteca</span>' : "",
          "</div>",
          '<button class="btn btn-sm ' + (alreadySel ? "btn-ghost" : "btn-secondary") + ' onboarding-result-add-btn" onclick="Onboarding.selectTitle(' + idx + ')" ' + (alreadySel ? "disabled" : "") + ">",
          alreadySel ? "✓ Selecionado" : "＋ Adicionar",
          "</button></div>"
        ].join("");
      }).join("");
    }

    if (query && query.trim().length >= 2) {
      html += [
        '<div class="onboarding-custom-add-prompt">',
        '<span>Não encontrou? </span>',
        '<button class="btn btn-ghost btn-sm" onclick="Onboarding.addCustomTitle(\'' + this._escHtml(query.replace(/'/g, "\\'")) + '\')">',
        '＋ Adicionar "' + escQuery + '" manualmente',
        '</button>',
        '</div>'
      ].join("");
    }

    container.innerHTML = html;
  },

  addCustomTitle(rawTitle) {
    if (!rawTitle || !rawTitle.trim()) return;
    const title = rawTitle.trim();
    const type = this._state._searchType || "book";
    const alreadySel = this._state.selectedTitles.some(t => (t.title || "").toLowerCase() === title.toLowerCase() && t.type === type);
    if (!alreadySel) {
      const cover = typeof getFallbackCoverSvg === "function" ? getFallbackCoverSvg(title, type) : "";
      this._state.selectedTitles.push({
        id: "custom_" + Date.now(),
        type: type,
        title: title,
        creator: "Criador informado",
        genre: "Geral",
        genres: ["Geral"],
        year: new Date().getFullYear(),
        cover: cover,
        status: this._defaultStatus(type),
        synopsis: "Título adicionado manualmente pelo usuário durante a personalização cultural."
      });
    }
    const body = document.getElementById("onboarding-body");
    if (body) body.innerHTML = this._renderStep2();
    this._bindEvents();
  },

  selectTitle(idx) {
    const hit = this._state._lastSearchResults[idx];
    if (!hit) return;
    const alreadySel = this._state.selectedTitles.some(t => t.id===hit.id || (t.title&&t.title.toLowerCase()===(hit.title||"").toLowerCase()&&t.type===hit.type));
    if (alreadySel) return;
    this._state.selectedTitles.push({ ...hit, status: this._defaultStatus(hit.type) });
    const body = document.getElementById("onboarding-body");
    if (body) body.innerHTML = this._renderStep2();
    this._bindEvents();
  },

  updateSelectedStatus(idx, status) {
    if (this._state.selectedTitles[idx]) this._state.selectedTitles[idx].status = status;
  },

  removeSelected(idx) {
    this._state.selectedTitles.splice(idx, 1);
    const body = document.getElementById("onboarding-body");
    if (body) body.innerHTML = this._renderStep2();
    this._bindEvents();
  },

  _bindEvents() {
    const input = document.getElementById("onboarding-search-input");
    if (input) {
      input.addEventListener("keydown", e => { if (e.key==="Enter") { e.preventDefault(); this.handleSearch(input.value); }});
    }
  },

  renderProfileSection(userId) {
    const data = Storage.getOnboarding(userId);
    const esc = s => UI.escapeHtml(s);
    if (!data || data.status === "in_progress" && !data.preferredFormats) {
      return [
        '<div class="onboarding-profile-section">',
        '<h3 class="onboarding-profile-title">🎭 Minhas Preferências Culturais</h3>',
        '<p style="color:var(--text-muted);margin-bottom:12px;">Você ainda não configurou suas preferências.</p>',
        '<button class="btn btn-secondary btn-sm" onclick="Onboarding.launchFromProfile(\'' + userId + '\')">Configurar agora</button>',
        "</div>"
      ].join("");
    }
    const fmtLabels = { book:"📚 Livros", movie:"🎬 Filmes", series:"📺 Séries" };
    const formats = (data.preferredFormats||[]).map(f=>fmtLabels[f]||f);
    const genres  = data.preferredGenres  || [];
    const titles  = data.selectedTitles   || [];
    return [
      '<div class="onboarding-profile-section">',
      '<div class="onboarding-profile-header">',
      '<h3 class="onboarding-profile-title">🎭 Minhas Preferências Culturais</h3>',
      '<button class="btn btn-outline btn-sm" onclick="Onboarding.launchFromProfile(\'' + userId + '\')">✏️ Editar</button>',
      "</div>",
      formats.length > 0 ? [
        '<div class="onboarding-profile-row">',
        '<span class="onboarding-profile-label">Formatos preferidos:</span>',
        '<div class="onboarding-chips-row">' + formats.map(f=>'<span class="onboarding-chip selected">'+f+"</span>").join("") + "</div>",
        "</div>"
      ].join("") : "",
      genres.length > 0 ? [
        '<div class="onboarding-profile-row">',
        '<span class="onboarding-profile-label">Gêneros favoritos:</span>',
        '<div class="onboarding-chips-wrap">' + genres.slice(0,10).map(g=>'<span class="onboarding-chip onboarding-chip-sm selected">'+esc(g)+"</span>").join("") +
        (genres.length>10?'<span style="color:var(--text-muted);font-size:12px;">+' + (genres.length-10) + " mais</span>":"") + "</div>",
        "</div>"
      ].join("") : "",
      titles.length > 0 ? [
        '<div class="onboarding-profile-row">',
        '<span class="onboarding-profile-label">Histórico de títulos (' + titles.length + '):</span>',
        '<div class="onboarding-profile-titles">',
        titles.slice(0,6).map(t =>
          '<div class="onboarding-profile-title-item"><img src="' + esc(t.cover) + '" alt="" class="onboarding-profile-title-thumb" onerror="this.style.display=\'none\'"/><div>' +
          '<span style="font-size:13px;font-weight:600;color:var(--primary-navy);">' + esc(t.title) + "</span><br/>" +
          '<span style="font-size:11px;color:var(--text-muted);">' + Storage.formatStatus(t.type, t.status) + "</span></div></div>"
        ).join(""),
        titles.length>6 ? '<p style="font-size:12px;color:var(--text-muted);margin-top:6px;">+' + (titles.length-6) + " título(s) no histórico</p>" : "",
        "</div></div>"
      ].join("") : "",
      data.status==="in_progress" ? [
        '<div class="onboarding-profile-incomplete">',
        '⚠️ Configuração incompleta — <a href="#" onclick="Onboarding.launchFromProfile(\'' + userId + '\'); return false;">clique para continuar</a>',
        "</div>"
      ].join("") : "",
      "</div>"
    ].join("");
  },

  launchFromProfile(userId) {
    this._state.userId = userId;
    const saved = Storage.getOnboarding(userId);
    if (saved) {
      this._state.step = 1;
      this._state.preferredFormats = saved.preferredFormats || [];
      this._state.preferredGenres  = saved.preferredGenres  || [];
      this._state.consumedFormats  = saved.consumedFormats  || [];
      this._state.selectedTitles   = saved.selectedTitles   || [];
      this._state.step1Done        = saved.step1Done        || false;
      this._state.step2Done        = saved.step2Done        || false;
      Storage.saveOnboarding(userId, { status:"in_progress" });
    }
    this._render();
  },

  _escHtml(text) {
    if (!text) return "";
    return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
};
