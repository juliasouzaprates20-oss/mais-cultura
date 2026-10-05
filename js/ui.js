// UI Controller for +Cultura • Digital Cultural Magazine

const UI = {
  currentView: 'dashboard',
  searchQuery: '',
  selectedGenreFilter: 'all',
  selectedStatusFilter: 'all',
  selectedSort: 'recent',
  externalSearchResults: [],
  isSearchingExternal: false,

  // Initialize UI listeners and initial view
  init() {
    this.renderHeader();
    this.setupGlobalEvents();
    this.navigate(this.currentView);
  },

  // Navigate to a specific view
  navigate(viewName) {
    this.currentView = viewName;
    this.searchQuery = '';
    this.selectedGenreFilter = 'all';
    this.selectedStatusFilter = 'all';
    this.externalSearchResults = [];

    // Update active nav link
    document.querySelectorAll('.nav-item, .mobile-link, .mobile-nav-item').forEach(el => {
      const target = el.getAttribute('data-view') || (el.getAttribute('href') ? el.getAttribute('href').replace('#', '') : '');
      if (target === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const user = Storage.getCurrentUser();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewName) {
      case 'dashboard':
        this.renderDashboard(user);
        break;
      case 'books':
        this.renderMediaLibrary('book', user);
        break;
      case 'movies':
        this.renderMediaLibrary('movie', user);
        break;
      case 'series':
        this.renderMediaLibrary('series', user);
        break;
      case 'discover':
        this.renderDiscover(user);
        break;
      case 'favorites':
        this.renderFavorites(user);
        break;
      case 'progress':
        this.renderProgress(user);
        break;
      case 'profile':
        this.renderProfile(user);
        break;
      default:
        this.renderDashboard(user);
    }
  },

  // ------------------ HEADER EDITORIAL ------------------
  renderHeader() {
    const user = Storage.getCurrentUser();
    const userBar = document.getElementById('user-header-bar');
    if (!userBar) return;

    if (user) {
      userBar.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="UI.showAddModal()" title="Adicionar Livro, Filme ou Série">
          <span>＋</span> Adicionar
        </button>
        <div class="user-profile-menu-trigger" onclick="UI.navigate('profile')">
          <img src="${user.avatar}" alt="${user.name}" class="user-header-avatar" onerror="this.src='https://api.dicebear.com/7.x/notionists/svg?seed=user'"/>
          <span class="user-header-name">${user.name.split(' ')[0]}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="UI.handleLogout()" title="Sair da conta">
          Sair
        </button>
      `;
    } else {
      userBar.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="UI.showAuthModal('login')">Entrar</button>
        <button class="btn btn-primary btn-sm" onclick="UI.showAuthModal('register')">Cadastrar</button>
      `;
    }
  },

  // ------------------ HOME / DASHBOARD EDITORIAL ------------------
  renderDashboard(user) {
    const content = document.getElementById('main-content');
    if (!user) {
      this.renderGuestWelcome();
      return;
    }

    const stats = Stats.computeUserStats(user.id);
    const recs = Recommender.getPersonalizedRecommendations(user.id);
    const allUserItems = Storage.getUserItems(user.id);

    // In-progress items for "Continue de onde parou"
    const inProgressItems = allUserItems.filter(i => i.status === 'reading' || i.status === 'watching');

    // Unconsumed curated items for "Descubra algo novo"
    const catalog = Storage.getCatalog();
    const userConsumedTitles = new Set(allUserItems.map(i => i.title.toLowerCase().trim()));
    const somethingNewItems = catalog.filter(c => !userConsumedTitles.has(c.title.toLowerCase().trim())).slice(0, 5);

    content.innerHTML = `
      <!-- ================= HERO EDITORIAL ================= -->
      <section class="editorial-hero-card">
        <div class="hero-left-content">
          <span class="hero-editorial-tag">Revista Cultural Digital</span>
          <h1 class="hero-main-title">Descubra histórias que combinam com você.</h1>
          <p class="hero-subtitle">Explore livros, filmes e séries escolhidos especialmente para o seu gosto, e acompanhe sua trajetória cultural em um único lugar.</p>
          <div class="hero-cta-group">
            <button class="btn btn-primary btn-lg" onclick="UI.navigate('discover')">
              Descobrir conteúdos
            </button>
            <button class="btn btn-secondary btn-lg" onclick="UI.navigate('books')">
              Minha biblioteca
            </button>
          </div>
        </div>
        <div class="hero-right-illustration">
          <img src="assets/hero_books_art.jpg" alt="Composição Cultural Editorial" class="hero-img-frame" />
        </div>
      </section>

      <!-- ================= SEÇÃO 1: RECOMENDADOS PARA VOCÊ ================= -->
      <section class="editorial-section">
        <div class="section-editorial-header">
          <h2 class="section-editorial-title">Recomendados para você</h2>
          <a href="#discover" class="section-link-more" onclick="UI.navigate('discover'); return false;">Ver mais →</a>
        </div>
        <div class="editorial-cards-grid">
          ${recs.all.slice(0, 6).map(item => this.renderEditorialCard(item, false)).join('')}
        </div>
      </section>

      <!-- ================= SEÇÃO 2: PORQUE VOCÊ GOSTOU DE... ================= -->
      ${recs.becauseYouLiked && recs.becauseYouLiked.length > 0 ? `
        <section class="because-editorial-panel">
          <div class="because-header-badge">
            <span>💡</span> Recomendações com Motivo
          </div>
          <h3 class="because-headline-text">
            Você avaliou "${recs.becauseYouLiked[0].anchorItem ? recs.becauseYouLiked[0].anchorItem.title : 'Duna'}" com ⭐⭐⭐⭐⭐
          </h3>
          <p class="because-sub-rationale">
            "Por isso, selecionamos estas histórias com base nas suas preferências por narrativas aclamadas e autores favoritos."
          </p>
          <div class="because-items-grid">
            ${recs.becauseYouLiked.slice(0, 4).map(item => this.renderEditorialCard(item, false, true)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- ================= SEÇÃO 3: SUA JORNADA CULTURAL ================= -->
      <section class="editorial-section">
        <div class="journey-editorial-card">
          <div class="journey-top-row">
            <div class="journey-title-group">
              <span class="hero-editorial-tag">Seu Diário Pessoal</span>
              <h3>Sua jornada cultural</h3>
              <p>Acompanhamento automático das suas leituras e maratonas em tempo real.</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="UI.navigate('progress')">
              Ver Estatísticas Completas →
            </button>
          </div>

          <div class="journey-metrics-grid">
            <div class="journey-metric-box" onclick="UI.navigate('books')" style="cursor: pointer;">
              <span class="journey-metric-label">📚 Livros lidos</span>
              <span class="journey-metric-number">${stats.books.read}</span>
              <span class="journey-metric-sub">de ${stats.books.total} catalogados</span>
            </div>
            <div class="journey-metric-box">
              <span class="journey-metric-label">📖 Páginas lidas</span>
              <span class="journey-metric-number">${Stats.formatNumber(stats.books.totalPagesRead)}</span>
              <span class="journey-metric-sub">páginas acumuladas</span>
            </div>
            <div class="journey-metric-box" onclick="UI.navigate('movies')" style="cursor: pointer;">
              <span class="journey-metric-label">🎬 Filmes assistidos</span>
              <span class="journey-metric-number">${stats.movies.watched}</span>
              <span class="journey-metric-sub">${stats.movies.formattedWatchTime} em tela</span>
            </div>
            <div class="journey-metric-box" onclick="UI.navigate('series')" style="cursor: pointer;">
              <span class="journey-metric-label">📺 Séries assistidas</span>
              <span class="journey-metric-number">${stats.series.completed}</span>
              <span class="journey-metric-sub">${stats.series.totalEpisodes} episódios</span>
            </div>
          </div>

          <!-- Barra Visual de Progresso Cultural -->
          <div class="journey-progress-track" title="Distribuição do seu acervo cultural">
            <div class="progress-seg-books"></div>
            <div class="progress-seg-movies"></div>
            <div class="progress-seg-series"></div>
          </div>
        </div>
      </section>

      <!-- ================= SEÇÃO 4: CONTINUE DE ONDE PAROU ================= -->
      ${inProgressItems.length > 0 ? `
        <section class="editorial-section">
          <div class="section-editorial-header">
            <h2 class="section-editorial-title">Continue de onde parou</h2>
            <span class="text-muted" style="font-size: 13.5px;">Leituras e maratonas em andamento</span>
          </div>
          <div class="continue-reading-container">
            ${inProgressItems.map(item => `
              <div class="continue-card" onclick="UI.showDetailModal('${item.id}', true)">
                <div class="continue-thumb-side">
                  <img src="${item.cover}" alt="${this.escapeHtml(item.title)}" onerror="this.src='${getFallbackCoverSvg(item.title, item.type)}'"/>
                </div>
                <div class="continue-info-side">
                  <span class="continue-tag">${item.type === 'book' ? '📖 Lendo Agora' : '📺 Assistindo Agora'}</span>
                  <h4 class="continue-title">${this.escapeHtml(item.title)}</h4>
                  <p class="continue-creator">${this.escapeHtml(item.creator)} • ${item.genre}</p>
                  <div style="margin-top: 8px;">
                    <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation(); UI.showEditItemModal('${item.id}')">
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- ================= SEÇÃO 5: MINHA BIBLIOTECA (ABAS COLORIDAS) ================= -->
      <section class="editorial-section">
        <div class="section-editorial-header">
          <h2 class="section-editorial-title">Minha Biblioteca</h2>
          <a href="#books" class="section-link-more" onclick="UI.navigate('books'); return false;">Ver biblioteca completa →</a>
        </div>

        <div class="library-color-tabs">
          <button class="tab-badge-btn tab-reading-orange" onclick="UI.navigate('books')">
            Lendo Agora (${allUserItems.filter(i => i.status === 'reading').length})
          </button>
          <button class="tab-badge-btn tab-done-green" onclick="UI.navigate('books')">
            Lidos (${stats.books.read})
          </button>
          <button class="tab-badge-btn tab-want-navy" onclick="UI.navigate('books')">
            Desejados (${allUserItems.filter(i => i.status === 'want_to_read' || i.status === 'want_to_watch').length})
          </button>
        </div>

        <div class="editorial-cards-grid">
          ${allUserItems.slice(0, 6).map(item => this.renderEditorialCard(item, true)).join('')}
        </div>
      </section>

      <!-- ================= SEÇÃO 6: DESCUBRA ALGO NOVO ================= -->
      <section class="editorial-section">
        <div class="section-editorial-header">
          <h2 class="section-editorial-title">Descubra algo novo</h2>
          <a href="#discover" class="section-link-more" onclick="UI.navigate('discover'); return false;">Explorar acervo →</a>
        </div>
        <div class="editorial-cards-grid">
          ${somethingNewItems.map(item => this.renderEditorialCard(item, false)).join('')}
        </div>
      </section>
    `;
  },

  // ------------------ GUEST WELCOME SCREEN ------------------
  renderGuestWelcome() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
      <section class="editorial-hero-card" style="margin-top: 20px;">
        <div class="hero-left-content">
          <span class="hero-editorial-tag">+Cultura • Revista Cultural</span>
          <h1 class="hero-main-title">Mais livros. Mais filmes. Mais séries. Mais descobertas.</h1>
          <p class="hero-subtitle">
            Acompanhe o que você lê e assiste com um motor de recomendações hiperpersonalizadas que aprende com cada avaliação sua.
          </p>
          <div class="hero-cta-group">
            <button class="btn btn-primary btn-lg" onclick="UI.handleInstantDemoLogin()">
              🚀 Entrar como Usuário Demo
            </button>
            <button class="btn btn-outline btn-lg" onclick="UI.showAuthModal('register')">
              Criar Conta Gratuita
            </button>
          </div>
          <p style="font-size: 13px; color: #5F7488; margin-top: 10px;">
            A conta demo já vem pré-carregada com 12 livros (4.850 páginas), 23 filmes e 8 séries!
          </p>
        </div>
        <div class="hero-right-illustration">
          <img src="assets/hero_books_art.jpg" alt="Revista +Cultura" class="hero-img-frame" />
        </div>
      </section>
    `;
  },

  // ------------------ CARD EDITORIAL RENDERER (CAPAS REAIS) ------------------
  renderEditorialCard(item, isLibraryItem = true, showRationale = false) {
    const typeLabel = item.type === 'book' ? 'Livro' : item.type === 'movie' ? 'Filme' : 'Série';

    return `
      <div class="editorial-card" onclick="UI.showDetailModal('${item.id}', ${isLibraryItem})">
        <div class="editorial-cover-wrap">
          <img
            src="${item.cover}"
            alt="${this.escapeHtml(item.title)}"
            class="editorial-cover-img"
            loading="lazy"
            onerror="this.src='${getFallbackCoverSvg(item.title, item.type)}'"
          />
          <span class="editorial-type-badge">${typeLabel}</span>
          ${item.matchPercentage ? `<span class="editorial-match-tag">🔥 ${item.matchPercentage}%</span>` : ''}
          <button
            class="editorial-fav-trigger"
            onclick="event.stopPropagation(); UI.handleToggleFavorite('${item.id}')"
            title="${item.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}"
          >
            ${item.isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="editorial-card-info">
          <h3 class="editorial-card-title" title="${this.escapeHtml(item.title)}">
            ${this.escapeHtml(item.title)}
          </h3>
          <p class="editorial-card-creator">${this.escapeHtml(item.creator)}</p>

          ${showRationale && item.rationale ? `
            <p style="font-size: 11.5px; font-style: italic; color: #173B57; margin-bottom: 6px; line-height: 1.35;">
              "${this.escapeHtml(item.rationale.substring(0, 60))}..."
            </p>
          ` : ''}

          <div class="editorial-card-meta-row">
            <span class="editorial-genre-pill">${item.genre}</span>
            <div class="editorial-rating-pill">
              <span>★</span> ${(item.rating || 5.0).toFixed(1)}
            </div>
          </div>

          <div style="margin-top: 10px; display: flex; gap: 6px;">
            ${isLibraryItem ? `
              <button class="btn btn-outline btn-xs w-full" onclick="event.stopPropagation(); UI.showEditItemModal('${item.id}')">✏️ Editar</button>
              <button class="btn btn-danger btn-xs" onclick="event.stopPropagation(); UI.handleDeleteItem('${item.id}')">🗑️</button>
            ` : `
              <button class="btn btn-secondary btn-xs w-full" onclick="event.stopPropagation(); UI.showQuickAddModal('${item.id}')">
                ＋ Adicionar
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  // ------------------ MINHA BIBLIOTECA (LIVROS, FILMES, SÉRIES) ------------------
  renderMediaLibrary(type, user) {
    if (!user) {
      this.renderGuestWelcome();
      return;
    }

    const content = document.getElementById('main-content');
    const items = Storage.getUserItems(user.id).filter(i => i.type === type);
    const stats = Stats.computeUserStats(user.id);
    const typeLabel = type === 'book' ? 'Livros' : type === 'movie' ? 'Filmes' : 'Séries';

    // Banner de métricas culturais
    let bannerHtml = '';
    if (type === 'book') {
      bannerHtml = `
        <div class="because-editorial-panel" style="border-left-color: var(--accent-orange); margin-bottom: 28px;">
          <span class="because-header-badge">📖 Contador Oficial de Leituras</span>
          <h2 class="because-headline-text" style="font-size: 26px;">
            Você já leu <strong>${stats.books.read}</strong> livros e <strong>${Stats.formatNumber(stats.books.totalPagesRead)}</strong> páginas!
          </h2>
          <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
            <span class="editorial-genre-pill">📚 Média: ${stats.books.avgPagesPerBook} págs/livro</span>
            <span class="editorial-genre-pill">🏆 Mais longo: ${stats.books.longestBook ? `${stats.books.longestBook.title} (${stats.books.longestBook.pages} pág)` : 'N/A'}</span>
            <span class="editorial-genre-pill">⚡ Gênero favorito: ${stats.books.topGenre}</span>
          </div>
        </div>
      `;
    } else if (type === 'movie') {
      bannerHtml = `
        <div class="because-editorial-panel" style="border-left-color: var(--primary-navy); margin-bottom: 28px;">
          <span class="because-header-badge" style="color: var(--primary-navy);">🎬 Sessão Cinema</span>
          <h2 class="because-headline-text" style="font-size: 26px;">
            Tempo total assistido: <strong>${stats.movies.formattedWatchTime}</strong> (${stats.movies.watched} filmes)
          </h2>
          <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
            <span class="editorial-genre-pill">🎥 Diretor favorito: ${stats.movies.topDirector}</span>
            <span class="editorial-genre-pill">⭐ Média: ${stats.movies.avgRating} / 5</span>
            <span class="editorial-genre-pill">🍿 Gênero: ${stats.movies.topGenre}</span>
          </div>
        </div>
      `;
    } else {
      bannerHtml = `
        <div class="because-editorial-panel" style="border-left-color: var(--accent-green); margin-bottom: 28px;">
          <span class="because-header-badge" style="color: var(--accent-green);">📺 Maratonas Culturais</span>
          <h2 class="because-headline-text" style="font-size: 26px;">
            <strong>${stats.series.totalSeasons}</strong> temporadas & <strong>${stats.series.totalEpisodes}</strong> episódios maratonados!
          </h2>
          <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
            <span class="editorial-genre-pill">📺 ${stats.series.completed} finalizadas</span>
            <span class="editorial-genre-pill">⭐ Média: ${stats.series.avgRating} / 5</span>
            <span class="editorial-genre-pill">🎭 Gênero: ${stats.series.topGenre}</span>
          </div>
        </div>
      `;
    }

    // Status filter options
    let statusFilters = [
      { key: 'all', label: 'Todos' },
      { key: type === 'book' ? 'read' : type === 'movie' ? 'watched' : 'completed', label: type === 'book' ? 'Lidos' : type === 'movie' ? 'Assistidos' : 'Finalizadas' },
      { key: type === 'book' ? 'reading' : 'watching', label: type === 'book' ? 'Lendo Agora' : 'Assistindo' },
      { key: type === 'book' ? 'want_to_read' : 'want_to_watch', label: 'Quero Consumir' }
    ];

    // Filter items
    let filtered = items.filter(item => {
      const matchSearch = !this.searchQuery ||
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.creator.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = this.selectedStatusFilter === 'all' || item.status === this.selectedStatusFilter;
      const matchGenre = this.selectedGenreFilter === 'all' || item.genre === this.selectedGenreFilter;
      return matchSearch && matchStatus && matchGenre;
    });

    const genres = Array.from(new Set(items.map(i => i.genre).filter(Boolean)));

    content.innerHTML = `
      <section style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div>
          <span class="hero-editorial-tag">Minha Biblioteca</span>
          <h1 class="hero-main-title" style="font-size: 34px;">${typeLabel}</h1>
        </div>
        <button class="btn btn-primary" onclick="UI.showAddModal('${type}')">
          ＋ Novo ${type === 'book' ? 'Livro' : type === 'movie' ? 'Filme' : 'Série'}
        </button>
      </section>

      ${bannerHtml}

      <!-- Barra de Filtros e Busca -->
      <div class="discover-filter-bar">
        <div class="discover-type-pills">
          ${statusFilters.map(sf => `
            <button
              class="type-pill-btn ${this.selectedStatusFilter === sf.key ? 'active' : ''}"
              onclick="UI.handleStatusFilter('${sf.key}', '${type}')"
            >
              ${sf.label}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <input
            type="text"
            class="form-input"
            style="padding: 7px 12px; font-size: 13.5px; width: 220px;"
            placeholder="Buscar por título ou autor..."
            value="${this.escapeHtml(this.searchQuery)}"
            oninput="UI.handleLibrarySearch(this.value, '${type}')"
          />
          <select class="discover-genre-select" onchange="UI.handleGenreFilter(this.value, '${type}')">
            <option value="all">Todos os Gêneros</option>
            ${genres.map(g => `<option value="${g}" ${this.selectedGenreFilter === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="editorial-cards-grid">
        ${filtered.length > 0
          ? filtered.map(item => this.renderEditorialCard(item, true)).join('')
          : `
            <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-warm);">
              <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--primary-navy); margin-bottom: 8px;">Nenhum conteúdo encontrado</h3>
              <p style="color: var(--text-muted); margin-bottom: 16px;">Adicione uma obra ou altere os filtros selecionados.</p>
              <button class="btn btn-primary btn-sm" onclick="UI.showAddModal('${type}')">Adicionar Conteúdo</button>
            </div>
          `
        }
      </div>
    `;
  },

  // ------------------ DESCOBRIR (REFORMULADA COM PESQUISA AMPLA E DADOS REAIS) ------------------
  renderDiscover(user) {
    const content = document.getElementById('main-content');
    const catalog = Storage.getCatalog();

    // Results to show: external search if active, or local catalog filtered
    let itemsToShow = this.externalSearchResults.length > 0 ? this.externalSearchResults : catalog;

    let filtered = itemsToShow.filter(item => {
      const matchType = this.selectedStatusFilter === 'all' || item.type === this.selectedStatusFilter;
      const matchSearch = !this.searchQuery ||
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.creator.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.synopsis.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchGenre = this.selectedGenreFilter === 'all' || item.genre === this.selectedGenreFilter;
      return matchType && matchSearch && matchGenre;
    });

    const allGenres = Array.from(new Set(catalog.map(i => i.genre).filter(Boolean)));

    content.innerHTML = `
      <section class="discover-hero-banner">
        <span class="hero-editorial-tag">Descobrir Novos Conteúdos</span>
        <h1 class="discover-hero-title">Histórias, filmes e séries para despertar sua curiosidade.</h1>
        <p class="discover-hero-sub">Explore o catálogo editorial com capas e pôsteres reais ou pesquise qualquer obra do mundo em tempo real.</p>

        <!-- Barra de Pesquisa Grande -->
        <form onsubmit="UI.handleDiscoverSubmitSearch(event)" class="discover-search-box-large">
          <span style="font-size: 20px; color: #173B57; margin-left: 6px;">🔎</span>
          <input
            type="text"
            id="discover-search-input-field"
            class="discover-search-input"
            placeholder="Pesquise por título, autor, diretor ou gênero..."
            value="${this.escapeHtml(this.searchQuery)}"
            oninput="UI.handleDiscoverLocalSearch(this.value)"
          />
          <button type="submit" class="discover-search-submit">
            ${this.isSearchingExternal ? 'Buscando...' : 'Buscar no Acervo'}
          </button>
        </form>

        <div class="discover-filter-bar">
          <div class="discover-type-pills">
            <button class="type-pill-btn ${this.selectedStatusFilter === 'all' ? 'active' : ''}" onclick="UI.handleDiscoverType('all')">
              🌟 Todos
            </button>
            <button class="type-pill-btn ${this.selectedStatusFilter === 'book' ? 'active' : ''}" onclick="UI.handleDiscoverType('book')">
              📚 Livros
            </button>
            <button class="type-pill-btn ${this.selectedStatusFilter === 'movie' ? 'active' : ''}" onclick="UI.handleDiscoverType('movie')">
              🎬 Filmes
            </button>
            <button class="type-pill-btn ${this.selectedStatusFilter === 'series' ? 'active' : ''}" onclick="UI.handleDiscoverType('series')">
              📺 Séries
            </button>
          </div>

          <select class="discover-genre-select" onchange="UI.handleDiscoverGenre(this.value)">
            <option value="all">Todos os Gêneros</option>
            ${allGenres.map(g => `<option value="${g}" ${this.selectedGenreFilter === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </section>

      <!-- Grade Arejada de Descoberta -->
      <div class="editorial-cards-grid">
        ${filtered.map(item => this.renderEditorialCard(item, false)).join('')}
      </div>
    `;
  },

  // ------------------ MEUS FAVORITOS ------------------
  renderFavorites(user) {
    if (!user) {
      this.renderGuestWelcome();
      return;
    }
    const content = document.getElementById('main-content');
    const items = Storage.getUserItems(user.id).filter(i => i.isFavorite || i.rating === 5);

    content.innerHTML = `
      <section style="margin-bottom: 28px;">
        <span class="hero-editorial-tag">Galeria Afetiva</span>
        <h1 class="hero-main-title" style="font-size: 34px;">❤️ Meus Favoritos</h1>
        <p class="text-muted">As obras que marcaram sua trajetória com nota máxima e coração preenchido.</p>
      </section>

      <div class="editorial-cards-grid">
        ${items.length > 0
          ? items.map(item => this.renderEditorialCard(item, true)).join('')
          : `
            <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-warm);">
              <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--primary-navy); margin-bottom: 8px;">Nenhum favorito salvo ainda</h3>
              <p style="color: var(--text-muted);">Clique no ícone de coração em qualquer livro, filme ou série para guardá-lo aqui.</p>
            </div>
          `
        }
      </div>
    `;
  },

  // ------------------ MEU PROGRESSO (ESTATÍSTICAS COMPLETAS) ------------------
  renderProgress(user) {
    if (!user) {
      this.renderGuestWelcome();
      return;
    }
    const content = document.getElementById('main-content');
    const stats = Stats.computeUserStats(user.id);

    content.innerHTML = `
      <section style="margin-bottom: 32px;">
        <span class="hero-editorial-tag">Diário & Métricas</span>
        <h1 class="hero-main-title" style="font-size: 34px;">Minha Jornada Cultural</h1>
        <p class="text-muted">Análise aprofundada dos seus hábitos de leitura, sessões de cinema e maratonas.</p>
      </section>

      <!-- Painel Principal de Estatísticas -->
      <div class="journey-metrics-grid" style="margin-bottom: 36px;">
        <div class="journey-metric-box">
          <span class="journey-metric-label">📖 Páginas Lidas</span>
          <span class="journey-metric-number">${Stats.formatNumber(stats.books.totalPagesRead)}</span>
          <span class="journey-metric-sub">em ${stats.books.read} livros concluídos</span>
        </div>
        <div class="journey-metric-box">
          <span class="journey-metric-label">⏱️ Tempo em Filmes</span>
          <span class="journey-metric-number">${stats.movies.formattedWatchTime}</span>
          <span class="journey-metric-sub">${stats.movies.watched} filmes assistidos</span>
        </div>
        <div class="journey-metric-box">
          <span class="journey-metric-label">🎞️ Maratonas de Séries</span>
          <span class="journey-metric-number">${stats.series.totalEpisodes} eps</span>
          <span class="journey-metric-sub">${stats.series.totalSeasons} temporadas assistidas</span>
        </div>
        <div class="journey-metric-box">
          <span class="journey-metric-label">⭐ Média de Avaliação</span>
          <span class="journey-metric-number">${stats.avgGlobalRating}★</span>
          <span class="journey-metric-sub">em todos os formatos</span>
        </div>
      </div>

      <!-- Gráficos Editoriais em SVG -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; margin-bottom: 40px;">
        <div style="background: #FFFFFF; border: 1px solid var(--border-warm); border-radius: var(--radius-md); padding: 28px; box-shadow: var(--shadow-card);">
          <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--primary-navy); margin-bottom: 4px;">🎨 Distribuição por Gênero</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Proporção dos temas que você mais consome</p>
          <div id="chart-genre-donut"></div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid var(--border-warm); border-radius: var(--radius-md); padding: 28px; box-shadow: var(--shadow-card);">
          <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--primary-navy); margin-bottom: 4px;">⭐ Frequência de Avaliações</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Distribuição de notas de 1 a 5 estrelas</p>
          <div id="chart-ratings-bar"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      Charts.renderGenreDonut('chart-genre-donut', stats.genresChartData);
      Charts.renderRatingsBarChart('chart-ratings-bar', stats.ratingsChartData);
    }, 40);
  },

  // ------------------ MEU PERFIL EDITORIAL ------------------
  renderProfile(user) {
    if (!user) {
      this.renderGuestWelcome();
      return;
    }
    const content = document.getElementById('main-content');
    const stats = Stats.computeUserStats(user.id);
    const activities = Storage.getUserActivity(user.id);

    content.innerHTML = `
      <section class="editorial-hero-card" style="margin-bottom: 36px; padding: 36px;">
        <div style="display: flex; align-items: center; gap: 28px; flex-wrap: wrap;">
          <img src="${user.avatar}" alt="${user.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-navy);" onerror="this.src='https://api.dicebear.com/7.x/notionists/svg?seed=user'"/>
          <div>
            <span class="hero-editorial-tag">Perfil Cultural</span>
            <h1 class="hero-main-title" style="font-size: 32px;">${user.name}</h1>
            <p style="color: var(--text-muted); font-size: 14px;">✉️ ${user.email}</p>
            <p style="margin-top: 8px; color: var(--text-body); max-width: 600px;">${user.bio || 'Apaixonado por literatura, cinema e descobertas culturais.'}</p>
            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
              ${(user.favoriteGenres || ['Ficção Científica', 'Drama', 'Fantasia']).map(g => `<span class="editorial-genre-pill">${g}</span>`).join('')}
            </div>
          </div>
          <div style="margin-left: auto;">
            <button class="btn btn-outline btn-sm" onclick="UI.showEditProfileModal()">✏️ Editar Perfil</button>
          </div>
        </div>
      </section>

      <!-- Histórico de Atividades Recentes -->
      <section class="editorial-section">
        <div class="section-editorial-header">
          <h2 class="section-editorial-title">📜 Histórico de Atividades</h2>
        </div>
        <div style="background: #FFFFFF; border: 1px solid var(--border-warm); border-radius: var(--radius-md); padding: 24px;">
          ${activities.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${activities.slice(0, 10).map(act => `
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F0E8DC; padding-bottom: 10px;">
                  <div>
                    <strong style="color: var(--primary-navy);">${this.escapeHtml(act.title)}</strong>
                    <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(act.details)}</p>
                  </div>
                  <span style="font-size: 12px; color: var(--text-dim);">${new Date(act.timestamp).toLocaleDateString('pt-BR')}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: var(--text-muted);">Nenhuma atividade registrada ainda.</p>'}
        </div>
      </section>
    `;
  },

  // ------------------ MODAL DE DETALHES COM CAPA REAL GRANDE ------------------
  showDetailModal(itemId, isLibraryItem = true) {
    const user = Storage.getCurrentUser();
    let item = null;

    if (isLibraryItem && user) {
      item = Storage.getUserItems(user.id).find(i => i.id === itemId);
    }
    if (!item) {
      item = Storage.getCatalog().find(i => i.id === itemId);
    }
    if (!item && user) {
      item = Storage.getUserItems(user.id).find(i => i.id === itemId);
    }
    if (!item) return;

    const modal = document.getElementById('modal-container');
    const typeLabel = item.type === 'book' ? 'Livro' : item.type === 'movie' ? 'Filme' : 'Série';

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-detail-layout" onclick="event.stopPropagation()">
          <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px; z-index: 10;" onclick="UI.closeModal()">✕</button>

          <div class="detail-split-view">
            <div class="detail-poster-col">
              <img src="${item.cover}" alt="${this.escapeHtml(item.title)}" class="detail-poster-img" onerror="this.src='${getFallbackCoverSvg(item.title, item.type)}'"/>
            </div>

            <div class="detail-info-col">
              <div class="detail-genres-row">
                <span class="genre-tag-active">${typeLabel}</span>
                <span class="genre-tag-active" style="background: #FDF3E7; color: var(--accent-orange);">${item.genre}</span>
                <span style="font-size: 13px; color: var(--text-muted); align-self: center;">${item.year || ''}</span>
              </div>

              <h1 class="detail-title">${this.escapeHtml(item.title)}</h1>
              <p class="detail-creator">Por <strong>${this.escapeHtml(item.creator)}</strong></p>

              <div class="detail-metrics-bar">
                ${item.type === 'book' ? `
                  <div class="metric-pill">📖 <strong>${item.pages || 0}</strong> páginas</div>
                ` : item.type === 'movie' ? `
                  <div class="metric-pill">⏱️ <strong>${item.duration || 0}</strong> minutos</div>
                ` : `
                  <div class="metric-pill">📺 <strong>${item.seasons || 1}</strong> temporadas</div>
                `}
                <div class="metric-pill">⭐ <strong>${(item.rating || 5.0).toFixed(1)}</strong> / 5.0</div>
              </div>

              <div class="detail-synopsis-box">
                <h4>Sinopse da Obra</h4>
                <p>${this.escapeHtml(item.synopsis || 'Uma das produções mais aclamadas da cultura mundial.')}</p>
                ${item.cast ? `<p style="margin-top: 8px; font-size: 13px; color: var(--text-muted);"><strong>Destaques:</strong> ${this.escapeHtml(item.cast)}</p>` : ''}
              </div>

              ${user && item.review ? `
                <div class="detail-user-review-box">
                  <h4>Sua Resenha Pessoal</h4>
                  <div class="user-quote-bubble">“${this.escapeHtml(item.review)}”</div>
                </div>
              ` : ''}

              <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
                ${user ? `
                  <button class="btn btn-primary" onclick="UI.showQuickAddModal('${item.id}')">
                    ${isLibraryItem ? '✏️ Alterar Status / Nota' : '＋ Adicionar à Minha Biblioteca'}
                  </button>
                  <button class="btn btn-outline" onclick="UI.handleToggleFavorite('${item.id}')">
                    ${item.isFavorite ? '❤️ Favoritado' : '🤍 Favoritar'}
                  </button>
                ` : `
                  <button class="btn btn-primary" onclick="UI.showAuthModal('login')">Entrar para Salvar</button>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  },

  // ------------------ MODAL DE ADICIONAR COM CAMPOS DINÂMICOS ------------------
  showAddModal(preselectedType = 'book') {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.showAuthModal('login');
      return;
    }

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-lg" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">＋ Adicionar à Revista Cultural</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()">✕</button>
          </div>

          <form id="form-add-item" onsubmit="UI.handleSaveNewItem(event)">
            <div style="display: flex; gap: 10px; padding: 16px 28px; background: #FAF6EE; border-bottom: 1px solid var(--border-warm);">
              <label class="btn btn-outline btn-sm ${preselectedType === 'book' ? 'btn-secondary' : ''}" style="cursor: pointer;">
                <input type="radio" name="mediaType" value="book" ${preselectedType === 'book' ? 'checked' : ''} onchange="UI.switchAddModalType('book')" style="display: none;"/>
                📚 Livro
              </label>
              <label class="btn btn-outline btn-sm ${preselectedType === 'movie' ? 'btn-secondary' : ''}" style="cursor: pointer;">
                <input type="radio" name="mediaType" value="movie" ${preselectedType === 'movie' ? 'checked' : ''} onchange="UI.switchAddModalType('movie')" style="display: none;"/>
                🎬 Filme
              </label>
              <label class="btn btn-outline btn-sm ${preselectedType === 'series' ? 'btn-secondary' : ''}" style="cursor: pointer;">
                <input type="radio" name="mediaType" value="series" ${preselectedType === 'series' ? 'checked' : ''} onchange="UI.switchAddModalType('series')" style="display: none;"/>
                📺 Série
              </label>
            </div>

            <div class="modal-form-grid" id="modal-dynamic-fields">
              ${this.getDynamicFormFields(preselectedType)}
            </div>

            <div class="form-review-section">
              <div class="form-group">
                <label>Sua Avaliação (1 a 5 estrelas)</label>
                <div style="display: flex; gap: 6px;" id="new-item-rating-stars">
                  ${[1, 2, 3, 4, 5].map(s => `
                    <span class="interactive-star filled" data-val="${s}" onclick="UI.setFormRating(${s})">★</span>
                  `).join('')}
                </div>
                <input type="hidden" name="rating" id="new-item-rating-val" value="5"/>
              </div>

              <div class="form-group">
                <label>Comentário ou Resenha Cultural</label>
                <textarea name="review" class="form-input form-textarea" rows="3" placeholder="O que você achou desta obra? Suas impressões alimentam suas recomendações..."></textarea>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; margin: 10px 0;">
                <input type="checkbox" id="add-item-fav-check" name="isFavorite" value="true" checked style="accent-color: var(--accent-orange); width: 18px; height: 18px;"/>
                <label for="add-item-fav-check" style="font-weight: 600; color: var(--primary-navy); cursor: pointer;">❤️ Salvar nos Favoritos</label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Conteúdo</button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('open');
    this.setFormRating(5);
  },

  switchAddModalType(type) {
    const fieldsContainer = document.getElementById('modal-dynamic-fields');
    if (fieldsContainer) {
      fieldsContainer.innerHTML = this.getDynamicFormFields(type);
    }
  },

  getDynamicFormFields(type, item = null) {
    if (type === 'book') {
      return `
        <div class="form-group">
          <label>Título do Livro *</label>
          <input type="text" name="title" required class="form-input" placeholder="Ex: 1984" value="${item ? this.escapeHtml(item.title) : ''}"/>
        </div>
        <div class="form-group">
          <label>Autor *</label>
          <input type="text" name="creator" required class="form-input" placeholder="Ex: George Orwell" value="${item ? this.escapeHtml(item.creator) : ''}"/>
        </div>
        <div class="form-group">
          <label>Número de Páginas *</label>
          <input type="number" name="pages" min="1" required class="form-input" placeholder="Ex: 336" value="${item ? item.pages : '320'}"/>
        </div>
        <div class="form-group">
          <label>Gênero Literário *</label>
          <input type="text" name="genre" required class="form-input" placeholder="Ex: Ficção Científica, Clássico" value="${item ? this.escapeHtml(item.genre) : 'Ficção Científica'}"/>
        </div>
        <div class="form-group">
          <label>URL da Capa Real (Opcional)</label>
          <input type="url" name="cover" class="form-input" placeholder="https://covers.openlibrary.org/..." value="${item ? item.cover : ''}"/>
        </div>
        <div class="form-group">
          <label>Status de Leitura</label>
          <select name="status" class="form-input">
            <option value="read" ${item && item.status === 'read' ? 'selected' : ''}>Lido</option>
            <option value="reading" ${item && item.status === 'reading' ? 'selected' : ''}>Lendo Agora</option>
            <option value="want_to_read" ${item && item.status === 'want_to_read' ? 'selected' : ''}>Quero ler</option>
          </select>
        </div>
      `;
    } else if (type === 'movie') {
      return `
        <div class="form-group">
          <label>Título do Filme *</label>
          <input type="text" name="title" required class="form-input" placeholder="Ex: Interestelar" value="${item ? this.escapeHtml(item.title) : ''}"/>
        </div>
        <div class="form-group">
          <label>Diretor *</label>
          <input type="text" name="creator" required class="form-input" placeholder="Ex: Christopher Nolan" value="${item ? this.escapeHtml(item.creator) : ''}"/>
        </div>
        <div class="form-group">
          <label>Duração (minutos) *</label>
          <input type="number" name="duration" min="1" required class="form-input" placeholder="Ex: 169" value="${item ? item.duration : '120'}"/>
        </div>
        <div class="form-group">
          <label>Gênero Cinematográfico *</label>
          <input type="text" name="genre" required class="form-input" placeholder="Ex: Ficção Científica, Drama" value="${item ? this.escapeHtml(item.genre) : 'Ficção Científica'}"/>
        </div>
        <div class="form-group">
          <label>URL do Pôster Real (Opcional)</label>
          <input type="url" name="cover" class="form-input" placeholder="https://image.tmdb.org/..." value="${item ? item.cover : ''}"/>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status" class="form-input">
            <option value="watched" ${item && item.status === 'watched' ? 'selected' : ''}>Assistido</option>
            <option value="want_to_watch" ${item && item.status === 'want_to_watch' ? 'selected' : ''}>Quero assistir</option>
          </select>
        </div>
      `;
    } else {
      return `
        <div class="form-group">
          <label>Título da Série *</label>
          <input type="text" name="title" required class="form-input" placeholder="Ex: Breaking Bad" value="${item ? this.escapeHtml(item.title) : ''}"/>
        </div>
        <div class="form-group">
          <label>Criador / Showrunner *</label>
          <input type="text" name="creator" required class="form-input" placeholder="Ex: Vince Gilligan" value="${item ? this.escapeHtml(item.creator) : ''}"/>
        </div>
        <div class="form-group">
          <label>Número de Temporadas</label>
          <input type="number" name="seasons" min="1" class="form-input" value="${item ? item.seasons : '1'}"/>
        </div>
        <div class="form-group">
          <label>Número de Episódios</label>
          <input type="number" name="episodes" min="1" class="form-input" value="${item ? item.episodes : '10'}"/>
        </div>
        <div class="form-group">
          <label>Gênero *</label>
          <input type="text" name="genre" required class="form-input" placeholder="Ex: Drama, Crime" value="${item ? this.escapeHtml(item.genre) : 'Drama'}"/>
        </div>
        <div class="form-group">
          <label>Status da Série</label>
          <select name="status" class="form-input">
            <option value="completed" ${item && item.status === 'completed' ? 'selected' : ''}>Finalizada</option>
            <option value="watching" ${item && item.status === 'watching' ? 'selected' : ''}>Assistindo Agora</option>
            <option value="want_to_watch" ${item && item.status === 'want_to_watch' ? 'selected' : ''}>Quero assistir</option>
            <option value="paused" ${item && item.status === 'paused' ? 'selected' : ''}>Pausada</option>
          </select>
        </div>
      `;
    }
  },

  showEditItemModal(itemId) {
    const user = Storage.getCurrentUser();
    if (!user) return;
    const items = Storage.getUserItems(user.id);
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-lg" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">✏️ Editar ${item.type === 'book' ? 'Livro' : item.type === 'movie' ? 'Filme' : 'Série'}</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()">✕</button>
          </div>

          <form onsubmit="UI.handleUpdateItem(event, '${item.id}', '${item.type}')">
            <div class="modal-form-grid">
              ${this.getDynamicFormFields(item.type, item)}
            </div>

            <div class="form-review-section">
              <div class="form-group">
                <label>Sua Avaliação (1 a 5 estrelas)</label>
                <div style="display: flex; gap: 6px;" id="new-item-rating-stars">
                  ${[1, 2, 3, 4, 5].map(s => `
                    <span class="interactive-star ${s <= item.rating ? 'filled' : ''}" data-val="${s}" onclick="UI.setFormRating(${s})">★</span>
                  `).join('')}
                </div>
                <input type="hidden" name="rating" id="new-item-rating-val" value="${item.rating || 5}"/>
              </div>

              <div class="form-group">
                <label>Comentário ou Resenha</label>
                <textarea name="review" class="form-input form-textarea" rows="3">${this.escapeHtml(item.review || '')}</textarea>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; margin: 10px 0;">
                <input type="checkbox" id="edit-item-fav-check" name="isFavorite" value="true" ${item.isFavorite ? 'checked' : ''} style="accent-color: var(--accent-orange); width: 18px; height: 18px;"/>
                <label for="edit-item-fav-check" style="font-weight: 600; color: var(--primary-navy); cursor: pointer;">❤️ Salvar nos Favoritos</label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('open');
  },

  showQuickAddModal(catalogOrItemId) {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.showAuthModal('login');
      return;
    }

    const catalog = Storage.getCatalog();
    const item = catalog.find(i => i.id === catalogOrItemId) ||
                 this.externalSearchResults.find(i => i.id === catalogOrItemId) ||
                 Storage.getUserItems(user.id).find(i => i.id === catalogOrItemId);
    if (!item) return;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-md" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">＋ Adicionar à Minha Biblioteca</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()">✕</button>
          </div>

          <form onsubmit="UI.handleConfirmQuickAdd(event, '${item.id}')">
            <div style="display: flex; gap: 16px; padding: 18px 24px; background: #FAF6EE; border-bottom: 1px solid var(--border-warm);">
              <img src="${item.cover}" alt="${item.title}" style="width: 55px; height: 80px; object-fit: cover; border-radius: 4px; box-shadow: var(--shadow-book);" onerror="this.src='${getFallbackCoverSvg(item.title, item.type)}'"/>
              <div>
                <h4 style="font-family: var(--font-serif); font-size: 17px; color: var(--primary-navy);">${this.escapeHtml(item.title)}</h4>
                <p style="font-size: 13px; color: var(--text-muted);">${this.escapeHtml(item.creator)} • ${item.genre} (${item.year || ''})</p>
              </div>
            </div>

            <div style="padding: 20px 24px;">
              <div class="form-group">
                <label>Status</label>
                <select name="status" class="form-input">
                  ${item.type === 'book' ? `
                    <option value="read" selected>Lido</option>
                    <option value="reading">Lendo Agora</option>
                    <option value="want_to_read">Quero ler</option>
                  ` : item.type === 'movie' ? `
                    <option value="watched" selected>Assistido</option>
                    <option value="want_to_watch">Quero assistir</option>
                  ` : `
                    <option value="completed" selected>Finalizada</option>
                    <option value="watching">Assistindo Agora</option>
                    <option value="want_to_watch">Quero assistir</option>
                  `}
                </select>
              </div>

              <div class="form-group">
                <label>Sua Nota</label>
                <div style="display: flex; gap: 6px;" id="new-item-rating-stars">
                  ${[1, 2, 3, 4, 5].map(s => `
                    <span class="interactive-star filled" data-val="${s}" onclick="UI.setFormRating(${s})">★</span>
                  `).join('')}
                </div>
                <input type="hidden" name="rating" id="new-item-rating-val" value="5"/>
              </div>

              <div class="form-group">
                <label>Comentário</label>
                <textarea name="review" class="form-input form-textarea" rows="2" placeholder="Sua opinião sincera..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Adicionar Agora</button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('open');
    this.setFormRating(5);
  },

  // ------------------ BUSCA GLOBAL & EXTERNA ------------------
  handleDiscoverLocalSearch(val) {
    this.searchQuery = val;
    this.renderDiscover(Storage.getCurrentUser());
  },

  async handleDiscoverSubmitSearch(e) {
    e.preventDefault();
    const query = document.getElementById('discover-search-input-field')?.value || this.searchQuery;
    if (!query || query.trim().length < 2) return;

    this.isSearchingExternal = true;
    this.showToast(`Buscando "${query}" em acervos globais...`, 'info');

    // Search OpenLibrary for books & iTunes for cinema
    const [books, movies] = await Promise.all([
      SearchService.searchBooksOpenLibrary(query),
      SearchService.searchMoviesItunes(query)
    ]);

    this.externalSearchResults = [...books, ...movies];
    this.isSearchingExternal = false;

    if (this.externalSearchResults.length > 0) {
      this.showToast(`${this.externalSearchResults.length} obras encontradas no acervo mundial! ✨`, 'success');
    } else {
      this.showToast('Nenhum resultado externo. Mostrando catálogo local.', 'info');
    }

    this.renderDiscover(Storage.getCurrentUser());
  },

  handleDiscoverType(type) {
    this.selectedStatusFilter = type;
    this.renderDiscover(Storage.getCurrentUser());
  },

  handleDiscoverGenre(genre) {
    this.selectedGenreFilter = genre;
    this.renderDiscover(Storage.getCurrentUser());
  },

  handleLibrarySearch(val, type) {
    this.searchQuery = val;
    this.renderMediaLibrary(type, Storage.getCurrentUser());
  },

  handleStatusFilter(status, type) {
    this.selectedStatusFilter = status;
    this.renderMediaLibrary(type, Storage.getCurrentUser());
  },

  handleGenreFilter(genre, type) {
    this.selectedGenreFilter = genre;
    this.renderMediaLibrary(type, Storage.getCurrentUser());
  },

  handleToggleFavorite(itemId) {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.showAuthModal('login');
      return;
    }
    const isFav = Storage.toggleFavorite(user.id, itemId);
    this.showToast(isFav ? 'Adicionado aos favoritos ❤️' : 'Removido dos favoritos', 'info');
    this.navigate(this.currentView);
  },

  handleDeleteItem(itemId) {
    if (!confirm('Deseja realmente remover esta obra da sua biblioteca?')) return;
    const user = Storage.getCurrentUser();
    if (!user) return;
    Storage.deleteItem(user.id, itemId);
    this.showToast('Obra removida com sucesso!', 'info');
    this.navigate(this.currentView);
  },

  handleSaveNewItem(e) {
    e.preventDefault();
    const user = Storage.getCurrentUser();
    if (!user) return;

    const form = e.target;
    const formData = new FormData(form);
    const mediaType = formData.get('mediaType');

    const itemData = {
      type: mediaType,
      title: formData.get('title'),
      creator: formData.get('creator'),
      genre: formData.get('genre'),
      cover: formData.get('cover'),
      pages: formData.get('pages'),
      duration: formData.get('duration'),
      seasons: formData.get('seasons'),
      episodes: formData.get('episodes'),
      year: formData.get('year'),
      status: formData.get('status'),
      rating: parseFloat(formData.get('rating')) || 5,
      review: formData.get('review') || '',
      isFavorite: formData.get('isFavorite') === 'true'
    };

    try {
      Storage.addItem(user.id, itemData);
      this.closeModal();
      this.showToast(`"${itemData.title}" adicionado à sua biblioteca! ✨`, 'success');
      this.navigate(this.currentView);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  handleUpdateItem(e, itemId, type) {
    e.preventDefault();
    const user = Storage.getCurrentUser();
    if (!user) return;

    const form = e.target;
    const formData = new FormData(form);

    const updates = {
      title: formData.get('title'),
      creator: formData.get('creator'),
      genre: formData.get('genre'),
      cover: formData.get('cover'),
      pages: formData.get('pages'),
      duration: formData.get('duration'),
      seasons: formData.get('seasons'),
      episodes: formData.get('episodes'),
      year: formData.get('year'),
      status: formData.get('status'),
      rating: parseFloat(formData.get('rating')) || 5,
      review: formData.get('review') || '',
      isFavorite: formData.get('isFavorite') === 'true'
    };

    try {
      Storage.updateItem(user.id, itemId, updates);
      this.closeModal();
      this.showToast('Obra atualizada com sucesso!', 'success');
      this.navigate(this.currentView);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  handleConfirmQuickAdd(e, catalogOrItemId) {
    e.preventDefault();
    const user = Storage.getCurrentUser();
    if (!user) return;

    const catalog = Storage.getCatalog();
    const catItem = catalog.find(i => i.id === catalogOrItemId) ||
                    this.externalSearchResults.find(i => i.id === catalogOrItemId) ||
                    Storage.getUserItems(user.id).find(i => i.id === catalogOrItemId);
    if (!catItem) return;

    const form = e.target;
    const formData = new FormData(form);

    const newItem = {
      ...catItem,
      id: null,
      catalogId: catItem.id,
      status: formData.get('status'),
      rating: parseFloat(formData.get('rating')) || 5,
      review: formData.get('review') || '',
      isFavorite: true
    };

    Storage.addItem(user.id, newItem);
    this.closeModal();
    this.showToast(`"${catItem.title}" adicionado à sua biblioteca! ✨`, 'success');
    this.navigate(this.currentView);
  },

  // ------------------ AUTH MODAL ------------------
  showAuthModal(initialTab = 'login') {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-sm" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">${initialTab === 'login' ? 'Entrar no +Cultura' : 'Criar Nova Conta'}</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()">✕</button>
          </div>

          <div style="padding: 24px;">
            ${initialTab === 'login' ? `
              <form onsubmit="UI.handleLoginSubmit(event)">
                <div class="form-group">
                  <label>E-mail</label>
                  <input type="email" name="email" required class="form-input" value="lucas@cultura.com"/>
                </div>
                <div class="form-group">
                  <label>Senha</label>
                  <input type="password" name="password" required class="form-input" value="demo"/>
                </div>
                <button type="submit" class="btn btn-primary w-full" style="margin-top: 8px;">Entrar na Conta</button>
                <div style="text-align: center; margin: 16px 0; color: #8FA2B5; font-size: 12px;">OU</div>
                <button type="button" class="btn btn-secondary w-full" onclick="UI.handleInstantDemoLogin()">
                  🚀 Entrar como Usuário Demo (Lucas Mendes)
                </button>
              </form>
            ` : `
              <form onsubmit="UI.handleRegisterSubmit(event)">
                <div class="form-group">
                  <label>Nome Completo</label>
                  <input type="text" name="name" required class="form-input" placeholder="Seu nome"/>
                </div>
                <div class="form-group">
                  <label>E-mail</label>
                  <input type="email" name="email" required class="form-input" placeholder="seu@email.com"/>
                </div>
                <div class="form-group">
                  <label>Senha</label>
                  <input type="password" name="password" required minlength="4" class="form-input" placeholder="Mínimo 4 caracteres"/>
                </div>
                <button type="submit" class="btn btn-primary w-full" style="margin-top: 8px;">Criar Conta Cultural</button>
              </form>
            `}
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const user = Storage.loginUser(form.email.value, form.password.value);
      this.closeModal();
      this.renderHeader();
      this.showToast(`Bem-vindo de volta, ${user.name}! 👋`, 'success');
      this.navigate('dashboard');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const user = Storage.registerUser(form.name.value, form.email.value, form.password.value);
      this.closeModal();
      this.renderHeader();
      this.showToast(`Bem-vindo ao +Cultura, ${user.name}! 🎉`, 'success');
      this.navigate('dashboard');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  handleInstantDemoLogin() {
    Storage.seedDemoUser();
    const demo = Storage.getCurrentUser();
    this.closeModal();
    this.renderHeader();
    this.showToast(`Conectado como ${demo.name} (Demo oficial)! 🚀`, 'success');
    this.navigate('dashboard');
  },

  handleLogout() {
    Storage.logoutUser();
    this.renderHeader();
    this.showToast('Você saiu da sua conta.', 'info');
    this.navigate('dashboard');
  },

  showEditProfileModal() {
    const user = Storage.getCurrentUser();
    if (!user) return;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-md" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">✏️ Editar Perfil Cultural</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()">✕</button>
          </div>

          <form onsubmit="UI.handleUpdateProfileSubmit(event)" style="padding: 24px;">
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" name="name" required class="form-input" value="${this.escapeHtml(user.name)}"/>
            </div>
            <div class="form-group">
              <label>Biografia / Apresentação</label>
              <textarea name="bio" class="form-input form-textarea" rows="3">${this.escapeHtml(user.bio || '')}</textarea>
            </div>
            <div class="form-group">
              <label>Foto de Perfil (URL)</label>
              <input type="url" name="avatar" class="form-input" value="${this.escapeHtml(user.avatar || '')}"/>
            </div>
            <div class="modal-footer" style="padding: 16px 0 0 0; background: transparent;">
              <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Perfil</button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('open');
  },

  handleUpdateProfileSubmit(e) {
    e.preventDefault();
    const user = Storage.getCurrentUser();
    if (!user) return;
    const form = e.target;
    try {
      Storage.updateUserProfile(user.id, {
        name: form.name.value,
        bio: form.bio.value,
        avatar: form.avatar.value
      });
      this.closeModal();
      this.renderHeader();
      this.showToast('Perfil atualizado com sucesso!', 'success');
      this.navigate('profile');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  setFormRating(val) {
    const hidden = document.getElementById('new-item-rating-val');
    if (hidden) hidden.value = val;
    document.querySelectorAll('#new-item-rating-stars .interactive-star').forEach(star => {
      const starVal = parseInt(star.dataset.val, 10);
      star.classList.toggle('filled', starVal <= val);
    });
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) {
      modal.classList.remove('open');
      modal.innerHTML = '';
    }
  },

  setupGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : '📖';

    toast.innerHTML = `
      <span>${icon}</span>
      <span style="flex-grow: 1;">${this.escapeHtml(message)}</span>
      <button onclick="this.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:14px; color:#8FA2B5;">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  },

  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
