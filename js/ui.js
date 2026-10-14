// UI Controller for +Cultura • Digital Cultural Magazine
// Complete UX, Auto-fill, Multi-Level Recommendations & Editorial Visuals

const UI = {
  currentView: 'auth',
  searchQuery: '',
  selectedGenreFilter: 'all',
  selectedStatusFilter: 'all',
  selectedSort: 'recent',
  externalSearchResults: [],
  isSearchingExternal: false,
  _autofillDebounceTimer: null,
  _globalSearchDebounceTimer: null,
  selectedAvatarUrl: null,
  currentModalType: 'book',

  // Initialize UI listeners and initial view
  init() {
    this.renderHeader();
    this.setupGlobalEvents();

    // Check if user already has an active session
    // Never auto-log into demo on fresh visit!
    const user = Storage.getCurrentUser();
    if (user) {
      this.navigate('dashboard');
    } else {
      this.navigate('auth');
    }
  },

  // Navigate to a specific view
  navigate(viewName) {
    this.currentView = viewName;
    this.searchQuery = '';
    this.selectedGenreFilter = 'all';
    this.selectedStatusFilter = 'all';
    this.externalSearchResults = [];

    // Update active nav links
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

    // Auth screen doesn't need a logged-in user
    if (viewName === 'auth') {
      this.renderAuth();
      return;
    }

    // All other views require authentication
    if (!user) {
      this.renderAuth();
      return;
    }

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

    const isDemoUser = user && user.id === 'usr_demo_lucas';

    if (user) {
      const userAvatar = user.avatar || (EDITORIAL_AVATARS && EDITORIAL_AVATARS[0] ? EDITORIAL_AVATARS[0].url : 'https://api.dicebear.com/7.x/notionists/svg?seed=user');
      userBar.innerHTML = `
        ${isDemoUser ? `
          <span class="demo-badge" title="Você está no Modo Demonstração com dados fictícios">
            🎮 Modo Demonstração
          </span>
        ` : ''}
        <button class="btn btn-primary btn-sm" onclick="UI.showAddModal()" title="Adicionar Livro, Filme ou Série">
          <span>＋</span> Adicionar
        </button>
        <div class="user-profile-menu-trigger" onclick="UI.navigate('profile')" title="Ver meu perfil">
          <img src="${userAvatar}" alt="${this.escapeHtml(user.name)}" class="user-header-avatar" onerror="this.src='${EDITORIAL_AVATARS ? EDITORIAL_AVATARS[0].url : ''}'"/>
          <span class="user-header-name">${this.escapeHtml(user.name.split(' ')[0])}${isDemoUser ? ' <em style="font-size:10px;opacity:0.75">(Demo)</em>' : ''}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="UI.handleLogout()" title="Sair da conta">
          Sair
        </button>
      `;
    } else {
      userBar.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="UI.navigate('auth')">Entrar</button>
        <button class="btn btn-primary btn-sm" onclick="UI.navigate('auth')">Cadastrar</button>
      `;
    }
  },

  // ------------------ AUTH SCREEN (Full Page) ------------------
  renderAuth(initialTab = 'login') {
    const content = document.getElementById('main-content');
    content.innerHTML = `
      <section class="auth-page-wrapper">
        <div class="auth-page-card">
          <!-- Logo e Tagline -->
          <div class="auth-logo-block">
            <div class="auth-logo-icon">
              <svg width="42" height="42" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="10" width="14" height="20" rx="3" fill="#F28C28" opacity="0.95" />
                <rect x="12" y="4" width="14" height="26" rx="3" fill="#173B57" />
                <rect x="20" y="12" width="12" height="18" rx="3" fill="#3E8E75" opacity="0.9" />
                <line x1="8" y1="18" x2="16" y2="18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <h1 class="auth-brand-name">+Cultura</h1>
            <p class="auth-tagline">Mais livros. Mais filmes. Mais séries. Mais descobertas.</p>
          </div>

          <!-- Abas Login / Criar Conta -->
          <div class="auth-tabs">
            <button
              id="auth-tab-login"
              class="auth-tab-btn ${initialTab === 'login' ? 'active' : ''}"
              onclick="UI.renderAuth('login')"
            >Entrar</button>
            <button
              id="auth-tab-register"
              class="auth-tab-btn ${initialTab === 'register' ? 'active' : ''}"
              onclick="UI.renderAuth('register')"
            >Criar conta</button>
          </div>

          <!-- Formulário de Login -->
          ${initialTab === 'login' ? `
            <form id="auth-login-form" class="auth-form" onsubmit="UI.handleLoginSubmit(event)">
              <div class="form-group">
                <label class="auth-label" for="auth-email">E-mail</label>
                <input
                  type="email"
                  id="auth-email"
                  name="email"
                  required
                  class="form-input auth-input"
                  placeholder="seu@email.com"
                  autocomplete="email"
                />
              </div>
              <div class="form-group">
                <label class="auth-label" for="auth-password">Senha</label>
                <input
                  type="password"
                  id="auth-password"
                  name="password"
                  required
                  class="form-input auth-input"
                  placeholder="Sua senha"
                  autocomplete="current-password"
                />
              </div>
              <button type="submit" class="btn btn-primary w-full auth-submit-btn">Entrar</button>
              <button
                type="button"
                class="auth-forgot-link"
                onclick="UI.showRecoverPasswordModal()"
              >Esqueci minha senha</button>
            </form>
          ` : `
            <form id="auth-register-form" class="auth-form" onsubmit="UI.handleRegisterSubmit(event)">
              <div class="form-group">
                <label class="auth-label" for="auth-name">Nome Completo</label>
                <input
                  type="text"
                  id="auth-name"
                  name="name"
                  required
                  class="form-input auth-input"
                  placeholder="Seu nome completo"
                  autocomplete="name"
                />
              </div>
              <div class="form-group">
                <label class="auth-label" for="auth-reg-email">E-mail</label>
                <input
                  type="email"
                  id="auth-reg-email"
                  name="email"
                  required
                  class="form-input auth-input"
                  placeholder="seu@email.com"
                  autocomplete="email"
                />
              </div>
              <div class="form-group">
                <label class="auth-label" for="auth-reg-password">Senha</label>
                <input
                  type="password"
                  id="auth-reg-password"
                  name="password"
                  required
                  minlength="4"
                  class="form-input auth-input"
                  placeholder="Mínimo 4 caracteres"
                  autocomplete="new-password"
                />
              </div>
              <div class="form-group">
                <label class="auth-label" for="auth-reg-confirm">Confirmar Senha</label>
                <input
                  type="password"
                  id="auth-reg-confirm"
                  name="confirmPassword"
                  required
                  minlength="4"
                  class="form-input auth-input"
                  placeholder="Repita a senha"
                  autocomplete="new-password"
                />
              </div>
              <button type="submit" class="btn btn-primary w-full auth-submit-btn">Criar minha conta</button>
            </form>
          `}

          <!-- Separador Editorial -->
          <div class="auth-divider"><span>ou</span></div>

          <!-- Botão Explícito para Modo Demonstração -->
          <button
            class="btn auth-demo-btn"
            onclick="UI.handleInstantDemoLogin()"
            title="Experimente a plataforma completa sem necessidade de cadastro"
          >
            🎮 Explorar demonstração
          </button>
          <p class="auth-demo-hint">
            Acesse com um acervo ilustrativo (12 livros, 23 filmes e 8 séries reais) para testar todas as funcionalidades.
          </p>
        </div>
      </section>
    `;
  },

  // ------------------ GUEST WELCOME REDIRECT ------------------
  renderGuestWelcome() {
    this.navigate('auth');
  },

  // ------------------ DASHBOARD EDITORIAL PERSONALIZADO ------------------
  renderDashboard(user) {
    const content = document.getElementById('main-content');
    if (!user) {
      this.renderGuestWelcome();
      return;
    }

    const stats = Stats.computeUserStats(user.id);
    const recs = Recommender.getPersonalizedRecommendations(user.id);
    const allUserItems = Storage.getUserItems(user.id);

    // Saudação personalizada por horário
    const hour = new Date().getHours();
    const greeting = hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
    const firstName = user.name ? user.name.split(' ')[0] : 'Leitor';

    // Continue de onde parou (reading or watching)
    const inProgressItems = allUserItems.filter(i => i.status === 'reading' || i.status === 'watching');

    // Para assistir / ler (wishlist)
    const wishlistItems = allUserItems.filter(i => i.status === 'want_to_read' || i.status === 'want_to_watch');

    // Descobertas recentes
    const recentDiscoveries = [...allUserItems]
      .sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0))
      .slice(0, 4);

    content.innerHTML = `
      <!-- ================= HERO EDITORIAL COM SAUDAÇÃO ================= -->
      <section class="editorial-hero-card">
        <div class="hero-left-content">
          <span class="hero-editorial-tag">Seu universo cultural</span>
          <h1 class="hero-main-title">${greeting}, ${this.escapeHtml(firstName)} 👋</h1>
          <p class="hero-subtitle">Descubra histórias selecionadas para seu gosto cultural e acompanhe suas leituras, sessões e maratonas em um único lugar.</p>
          <div class="hero-cta-group">
            <button class="btn btn-primary btn-lg" onclick="UI.showAddModal()">
              ＋ Adicionar Conteúdo
            </button>
            <button class="btn btn-secondary btn-lg" onclick="UI.navigate('discover')">
              🔍 Descobrir Obras
            </button>
          </div>
        </div>
        <div class="hero-right-illustration">
          <img src="assets/hero_books_art.jpg" alt="Composição Cultural Editorial" class="hero-img-frame" />
        </div>
      </section>

      <!-- ================= ESTATÍSTICAS RÁPIDAS TRICOLORES ================= -->
      <section class="editorial-section">
        <div class="journey-editorial-card" style="margin-bottom: 32px;">
          <div class="journey-top-row">
            <div class="journey-title-group">
              <span class="hero-editorial-tag">Métricas Culturais</span>
              <h3>Seu Universo em Números</h3>
              <p>Progresso calculado em tempo real a partir das suas conclusões e avaliações.</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="UI.navigate('progress')">
              Ver Gráficos Detalhados →
            </button>
          </div>

          <div class="journey-metrics-grid">
            <div class="journey-metric-box" onclick="UI.navigate('books')" style="cursor: pointer;">
              <span class="journey-metric-label">📚 Livros lidos</span>
              <span class="journey-metric-number">${stats.books.read}</span>
              <span class="journey-metric-sub">${Stats.formatNumber(stats.books.totalPagesRead)} páginas</span>
            </div>
            <div class="journey-metric-box" onclick="UI.navigate('movies')" style="cursor: pointer;">
              <span class="journey-metric-label">🎬 Filmes assistidos</span>
              <span class="journey-metric-number">${stats.movies.watched}</span>
              <span class="journey-metric-sub">${stats.movies.formattedWatchTime} em tela</span>
            </div>
            <div class="journey-metric-box" onclick="UI.navigate('series')" style="cursor: pointer;">
              <span class="journey-metric-label">📺 Séries finalizadas</span>
              <span class="journey-metric-number">${stats.series.completed}</span>
              <span class="journey-metric-sub">${stats.series.totalEpisodes} episódios</span>
            </div>
            <div class="journey-metric-box" onclick="UI.navigate('favorites')" style="cursor: pointer;">
              <span class="journey-metric-label">❤️ Obras favoritas</span>
              <span class="journey-metric-number">${stats.allFavoritesCount}</span>
              <span class="journey-metric-sub">marcadas com carinho</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= SEÇÃO: CONTINUE DE ONDE PAROU ================= -->
      ${inProgressItems.length > 0 ? `
        <section class="editorial-section">
          <div class="section-editorial-header">
            <h2 class="section-editorial-title">📖 Continue de onde parou</h2>
            <span class="text-muted" style="font-size: 13.5px;">Obras atualmente em andamento</span>
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
                  <p style="font-size: 12px; color: var(--accent-orange); font-weight: 700; margin-top: 4px;">
                    ${item.type === 'book' ? `Páginas estimadas: ${item.pages || 320}` : `Em progresso`}
                  </p>
                  <div style="margin-top: 10px;">
                    <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation(); UI.showEditItemModal('${item.id}')">
                      ✏️ Atualizar Progresso
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- ================= SEÇÃO: PARA ASSISTIR / LER ================= -->
      ${wishlistItems.length > 0 ? `
        <section class="editorial-section">
          <div class="section-editorial-header">
            <h2 class="section-editorial-title">🎬 Para assistir & ler</h2>
            <span class="text-muted" style="font-size: 13.5px;">Sua lista de interesses salvos</span>
          </div>
          <div class="editorial-cards-grid">
            ${wishlistItems.slice(0, 4).map(item => this.renderEditorialCard(item, true)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- ================= SEÇÃO: TALVEZ VOCÊ GOSTE (COM EXPLICAÇÕES) ================= -->
      <section class="editorial-section">
        <div class="section-editorial-header">
          <h2 class="section-editorial-title">✨ Talvez você goste</h2>
          <a href="#discover" class="section-link-more" onclick="UI.navigate('discover'); return false;">Explorar mais recomendações →</a>
        </div>
        <div class="editorial-cards-grid">
          ${recs.all.slice(0, 6).map(item => this.renderEditorialCard(item, false, true)).join('')}
        </div>
      </section>

      <!-- ================= SEÇÃO: PORQUE VOCÊ GOSTOU DE... ================= -->
      ${recs.becauseYouLiked && recs.becauseYouLiked.length > 0 ? `
        <section class="because-editorial-panel" style="margin-bottom: 40px;">
          <div class="because-header-badge">
            <span>💡</span> Recomendações com Motivo
          </div>
          <h3 class="because-headline-text">
            ${recs.becauseYouLiked[0].anchorItem 
              ? `Porque você gostou de "${recs.becauseYouLiked[0].anchorItem.title}"`
              : 'Seleção especial alinhada aos seus gêneros preferidos'}
          </h3>
          <p class="because-sub-rationale">
            ${recs.becauseYouLiked[0].rationale || 'Obras aclamadas com ritmo, estilo e autores que combinam com seu diário cultural.'}
          </p>
          <div class="because-items-grid">
            ${recs.becauseYouLiked.slice(0, 4).map(item => this.renderEditorialCard(item, false, true)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- ================= SEÇÃO: SUAS ÚLTIMAS DESCOBERTAS ================= -->
      ${recentDiscoveries.length > 0 ? `
        <section class="editorial-section">
          <div class="section-editorial-header">
            <h2 class="section-editorial-title">📝 Suas últimas descobertas</h2>
            <a href="#books" class="section-link-more" onclick="UI.navigate('books'); return false;">Ver biblioteca inteira →</a>
          </div>
          <div class="editorial-cards-grid">
            ${recentDiscoveries.map(item => this.renderEditorialCard(item, true)).join('')}
          </div>
        </section>
      ` : ''}
    `;
  },

  // ------------------ CARD EDITORIAL RENDERER ------------------
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
            <p style="font-size: 11.5px; font-style: italic; color: var(--primary-navy); margin-bottom: 6px; line-height: 1.35; background: #FAF6EE; padding: 4px 8px; border-radius: 4px; border-left: 2px solid var(--accent-orange);">
              "${this.escapeHtml(item.rationale)}"
            </p>
          ` : ''}

          <div class="editorial-card-meta-row">
            <span class="editorial-genre-pill">${this.escapeHtml(item.genre)}</span>
            <div class="editorial-rating-pill">
              <span>★</span> ${(parseFloat(item.rating) || 5.0).toFixed(1)}
            </div>
          </div>

          <div style="margin-top: 10px; display: flex; gap: 6px;">
            ${isLibraryItem ? `
              <button class="btn btn-outline btn-xs w-full" onclick="event.stopPropagation(); UI.showEditItemModal('${item.id}')">✏️ Editar</button>
              <button class="btn btn-danger btn-xs" onclick="event.stopPropagation(); UI.handleDeleteItem('${item.id}')" title="Excluir obra">🗑️</button>
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
            <span class="editorial-genre-pill">🏆 Mais longo: ${stats.books.longestBook ? `${this.escapeHtml(stats.books.longestBook.title)} (${stats.books.longestBook.pages} pág)` : 'N/A'}</span>
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

    const statusFilters = [
      { key: 'all', label: 'Todos' },
      { key: type === 'book' ? 'read' : type === 'movie' ? 'watched' : 'completed', label: type === 'book' ? 'Lidos' : type === 'movie' ? 'Assistidos' : 'Finalizadas' },
      { key: type === 'book' ? 'reading' : 'watching', label: type === 'book' ? 'Lendo Agora' : 'Assistindo' },
      { key: type === 'book' ? 'want_to_read' : 'want_to_watch', label: 'Quero Consumir' }
    ];

    let filtered = items.filter(item => {
      const matchSearch = !this.searchQuery ||
        (item.title || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (item.creator || '').toLowerCase().includes(this.searchQuery.toLowerCase());
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

        <div style="display: flex; gap: 10px; align-items: center; flex-grow: 1; max-width: 400px;">
          <input
            type="text"
            class="form-input"
            style="width: 100%; padding: 8px 12px; font-size: 13.5px;"
            placeholder="Filtrar por título ou autor/diretor..."
            value="${this.escapeHtml(this.searchQuery)}"
            oninput="UI.handleLibrarySearch(this.value, '${type}')"
          />
          <select class="discover-genre-select" onchange="UI.handleGenreFilter(this.value, '${type}')">
            <option value="all">Todos os Gêneros</option>
            ${genres.map(g => `<option value="${g}" ${this.selectedGenreFilter === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Grade de Conteúdos -->
      <div class="editorial-cards-grid" style="margin-top: 24px;">
        ${filtered.length > 0
          ? filtered.map(item => this.renderEditorialCard(item, true)).join('')
          : `
            <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-warm);">
              <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--primary-navy); margin-bottom: 8px;">Nenhum conteúdo encontrado</h3>
              <p style="color: var(--text-muted); margin-bottom: 16px;">Você pode adicionar uma nova obra à sua biblioteca em poucos segundos.</p>
              <button class="btn btn-primary btn-sm" onclick="UI.showAddModal('${type}')">Adicionar Agora</button>
            </div>
          `
        }
      </div>
    `;
  },

  // ------------------ BUSCA GLOBAL / DESCOBRIR REFORMULADA ------------------
  renderDiscover(user) {
    const content = document.getElementById('main-content');
    const catalog = Storage.getCatalog() || [];

    // Se houver busca externa ativa com resultados
    const hasExternal = this.externalSearchResults.length > 0;
    const items = hasExternal ? this.externalSearchResults : catalog;

    // Agrupamento por tipo
    const books = items.filter(i => i.type === 'book');
    const movies = items.filter(i => i.type === 'movie');
    const series = items.filter(i => i.type === 'series');

    const allGenres = Array.from(new Set(catalog.map(i => i.genre).filter(Boolean)));

    content.innerHTML = `
      <section class="discover-hero-banner">
        <span class="hero-editorial-tag">Busca Global & Descoberta</span>
        <h1 class="discover-hero-title">Encontre qualquer livro, filme ou série do mundo.</h1>
        <p class="discover-hero-sub">Pesquisa conectada em tempo real aos acervos mundiais (Open Library, iTunes & TVMaze) com capas e pôsteres oficiais.</p>

        <!-- Barra de Busca Global Ampla com Debounce -->
        <div class="global-search-container">
          <div class="global-search-bar">
            <span style="font-size: 20px; color: var(--primary-navy); margin-right: 4px;">🔍</span>
            <input
              type="text"
              id="global-search-field"
              class="global-search-input"
              placeholder="Digite o nome de qualquer livro, filme ou série..."
              value="${this.escapeHtml(this.searchQuery)}"
              oninput="UI.handleGlobalSearchInput(this.value)"
            />
            <span id="global-search-spinner" class="autofill-spinner" style="display: ${this.isSearchingExternal ? 'inline-block' : 'none'};">⏳</span>
          </div>
        </div>

        <!-- Filtros Rápidos -->
        <div class="discover-filter-bar">
          <div class="discover-type-pills">
            <button class="type-pill-btn ${this.selectedStatusFilter === 'all' ? 'active' : ''}" onclick="UI.handleDiscoverType('all')">
              🌟 Todos (${items.length})
            </button>
            <button class="type-pill-btn ${this.selectedStatusFilter === 'book' ? 'active' : ''}" onclick="UI.handleDiscoverType('book')">
              📚 Livros (${books.length})
            </button>
            <button class="type-pill-btn ${this.selectedStatusFilter === 'movie' ? 'active' : ''}" onclick="UI.handleDiscoverType('movie')">
              🎬 Filmes (${movies.length})
            </button>
            <button class="type-pill-btn ${this.selectedStatusFilter === 'series' ? 'active' : ''}" onclick="UI.handleDiscoverType('series')">
              📺 Séries (${series.length})
            </button>
          </div>

          <select class="discover-genre-select" onchange="UI.handleDiscoverGenre(this.value)">
            <option value="all">Todos os Gêneros</option>
            ${allGenres.map(g => `<option value="${g}" ${this.selectedGenreFilter === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </section>

      <!-- RESULTADOS AGRUPADOS (LIVROS, FILMES, SÉRIES) -->
      ${(this.selectedStatusFilter === 'all' || this.selectedStatusFilter === 'book') && books.length > 0 ? `
        <section class="editorial-section">
          <div class="global-search-group-header">
            <h2 class="global-search-group-title">📚 Livros</h2>
            <span class="text-muted">${books.length} obras</span>
          </div>
          <div class="editorial-cards-grid">
            ${books.map(b => this.renderEditorialCard(b, false)).join('')}
          </div>
        </section>
      ` : ''}

      ${(this.selectedStatusFilter === 'all' || this.selectedStatusFilter === 'movie') && movies.length > 0 ? `
        <section class="editorial-section">
          <div class="global-search-group-header">
            <h2 class="global-search-group-title">🎬 Filmes</h2>
            <span class="text-muted">${movies.length} títulos</span>
          </div>
          <div class="editorial-cards-grid">
            ${movies.map(m => this.renderEditorialCard(m, false)).join('')}
          </div>
        </section>
      ` : ''}

      ${(this.selectedStatusFilter === 'all' || this.selectedStatusFilter === 'series') && series.length > 0 ? `
        <section class="editorial-section">
          <div class="global-search-group-header">
            <h2 class="global-search-group-title">📺 Séries</h2>
            <span class="text-muted">${series.length} produções</span>
          </div>
          <div class="editorial-cards-grid">
            ${series.map(s => this.renderEditorialCard(s, false)).join('')}
          </div>
        </section>
      ` : ''}

      ${items.length === 0 ? `
        <div style="padding: 48px; text-align: center; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-warm); margin-top: 32px;">
          <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--primary-navy); margin-bottom: 8px;">Nenhum conteúdo encontrado</h3>
          <p style="color: var(--text-muted);">Tente pesquisar com outros termos ou adicione a obra manualmente pelo botão no topo.</p>
        </div>
      ` : ''}
    `;
  },

  handleGlobalSearchInput(val) {
    this.searchQuery = val;
    clearTimeout(this._globalSearchDebounceTimer);

    if (!val || val.trim().length < 2) {
      this.externalSearchResults = [];
      this.isSearchingExternal = false;
      this.renderDiscover(Storage.getCurrentUser());
      return;
    }

    const spinner = document.getElementById('global-search-spinner');
    if (spinner) spinner.style.display = 'inline-block';

    this._globalSearchDebounceTimer = setTimeout(async () => {
      this.isSearchingExternal = true;
      try {
        const { books, movies, series } = await SearchService.searchAll(val);
        this.externalSearchResults = [...books, ...movies, ...series];
      } catch (e) {
        console.warn('Erro na busca global', e);
      } finally {
        this.isSearchingExternal = false;
        this.renderDiscover(Storage.getCurrentUser());
      }
    }, 400);
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

  // ------------------ MINHA JORNADA CULTURAL (ESTATÍSTICAS) ------------------
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

  // ------------------ MEU PERFIL EDITORIAL COM AVATAR ------------------
  renderProfile(user) {
    if (!user) {
      this.renderGuestWelcome();
      return;
    }
    const content = document.getElementById('main-content');
    const stats = Stats.computeUserStats(user.id);
    const activities = Storage.getUserActivity(user.id);
    const userAvatar = user.avatar || (EDITORIAL_AVATARS && EDITORIAL_AVATARS[0] ? EDITORIAL_AVATARS[0].url : '');

    content.innerHTML = `
      <section class="editorial-hero-card" style="margin-bottom: 36px; padding: 36px;">
        <div style="display: flex; align-items: center; gap: 28px; flex-wrap: wrap;">
          <img src="${userAvatar}" alt="${this.escapeHtml(user.name)}" style="width: 104px; height: 104px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-navy); box-shadow: var(--shadow-card);" onerror="this.src='${EDITORIAL_AVATARS ? EDITORIAL_AVATARS[0].url : ''}'"/>
          <div>
            <span class="hero-editorial-tag">Perfil Cultural</span>
            <h1 class="hero-main-title" style="font-size: 32px;">${this.escapeHtml(user.name)}</h1>
            <p style="color: var(--text-muted); font-size: 14px;">✉️ ${this.escapeHtml(user.email)}</p>
            <p style="margin-top: 8px; color: var(--text-body); max-width: 600px;">${this.escapeHtml(user.bio || 'Apaixonado por literatura, cinema e descobertas culturais.')}</p>
            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
              ${(user.favoriteGenres || ['Ficção Científica', 'Drama', 'Fantasia']).map(g => `<span class="editorial-genre-pill">${this.escapeHtml(g)}</span>`).join('')}
            </div>
          </div>
          <div style="margin-left: auto;">
            <button class="btn btn-outline btn-sm" onclick="UI.showEditProfileModal()">✏️ Editar Perfil & Avatar</button>
          </div>
        </div>
      </section>

      <!-- Métricas Reais do Usuário no Perfil -->
      <section class="editorial-section" style="margin-bottom: 36px;">
        <div class="section-editorial-header">
          <h2 class="section-editorial-title">📊 Estatísticas Pessoais Reais</h2>
        </div>
        <div class="journey-metrics-grid">
          <div class="journey-metric-box">
            <span class="journey-metric-label">📚 Leituras Concluídas</span>
            <span class="journey-metric-number">${stats.books.read}</span>
            <span class="journey-metric-sub">${Stats.formatNumber(stats.books.totalPagesRead)} págs lidas</span>
          </div>
          <div class="journey-metric-box">
            <span class="journey-metric-label">🎬 Sessões de Cinema</span>
            <span class="journey-metric-number">${stats.movies.watched}</span>
            <span class="journey-metric-sub">Diretor top: ${this.escapeHtml(stats.movies.topDirector)}</span>
          </div>
          <div class="journey-metric-box">
            <span class="journey-metric-label">📺 Séries Finalizadas</span>
            <span class="journey-metric-number">${stats.series.completed}</span>
            <span class="journey-metric-sub">${stats.series.totalSeasons} temporadas</span>
          </div>
          <div class="journey-metric-box">
            <span class="journey-metric-label">⭐ Média de Notas</span>
            <span class="journey-metric-number">${stats.avgGlobalRating}</span>
            <span class="journey-metric-sub">${stats.allFavoritesCount} favoritadas</span>
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

  // ------------------ MODAL DE DETALHES COMPLETA COM RECOMENDAÇÕES RELACIONADAS ------------------
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
    if (!item && this.externalSearchResults.length > 0) {
      item = this.externalSearchResults.find(i => i.id === itemId);
    }
    if (!item) return;

    const modal = document.getElementById('modal-container');
    const typeLabel = item.type === 'book' ? 'Livro' : item.type === 'movie' ? 'Filme' : 'Série';

    // Buscar recomendações relacionadas ("Você também pode gostar")
    const relatedItems = Recommender.getRelatedRecommendations(item, 4);

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-detail-layout" onclick="event.stopPropagation()">
          <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px; z-index: 10;" onclick="UI.closeModal()" title="Fechar">✕</button>

          <div class="detail-split-view">
            <div class="detail-poster-col">
              <img src="${item.cover}" alt="${this.escapeHtml(item.title)}" class="detail-poster-img" onerror="this.src='${getFallbackCoverSvg(item.title, item.type)}'"/>
            </div>

            <div class="detail-info-col">
              <div class="detail-genres-row">
                <span class="genre-tag-active">${typeLabel}</span>
                <span class="genre-tag-active" style="background: #FDF3E7; color: var(--accent-orange);">${this.escapeHtml(item.genre)}</span>
                <span style="font-size: 13px; color: var(--text-muted); align-self: center;">${item.year || ''}</span>
              </div>

              <h1 class="detail-title">${this.escapeHtml(item.title)}</h1>
              <p class="detail-creator">Por <strong>${this.escapeHtml(item.creator)}</strong></p>

              <div class="detail-metrics-bar">
                ${item.type === 'book' ? `
                  <div class="metric-pill">📖 <strong>${item.pages || 0}</strong> páginas</div>
                  ${item.isbn ? `<div class="metric-pill">🔖 ISBN: <strong>${this.escapeHtml(item.isbn)}</strong></div>` : ''}
                ` : item.type === 'movie' ? `
                  <div class="metric-pill">⏱️ <strong>${item.duration || 0}</strong> minutos</div>
                ` : `
                  <div class="metric-pill">📺 <strong>${item.seasons || 1}</strong> temporadas</div>
                  <div class="metric-pill">🎞️ <strong>${item.episodes || 10}</strong> episódios</div>
                `}
                <div class="metric-pill">⭐ <strong>${(parseFloat(item.rating) || 5.0).toFixed(1)}</strong> / 5.0</div>
                <div class="metric-pill" style="color: var(--accent-green);">Status: <strong>${Storage.formatStatus(item.type, item.status || 'read')}</strong></div>
              </div>

              <div class="detail-synopsis-box">
                <h4>Sinopse da Obra</h4>
                <p>${this.escapeHtml(item.synopsis || 'Uma das produções mais aclamadas da cultura mundial.')}</p>
                ${item.publisher ? `<p style="margin-top: 6px; font-size: 12.5px; color: var(--text-muted);"><strong>Editora:</strong> ${this.escapeHtml(item.publisher)}</p>` : ''}
              </div>

              ${user && item.review ? `
                <div class="detail-user-review-box">
                  <h4>Sua Resenha Pessoal</h4>
                  <div class="user-quote-bubble">“${this.escapeHtml(item.review)}”</div>
                </div>
              ` : ''}

              <!-- Ações Principais -->
              <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
                ${user ? `
                  <button class="btn btn-primary" onclick="UI.showQuickAddModal('${item.id}')">
                    ${isLibraryItem ? '✏️ Alterar Status / Avaliação' : '＋ Adicionar à Minha Biblioteca'}
                  </button>
                  <button class="btn btn-outline" onclick="UI.handleToggleFavorite('${item.id}')">
                    ${item.isFavorite ? '❤️ Favoritado' : '🤍 Favoritar'}
                  </button>
                  ${isLibraryItem ? `
                    <button class="btn btn-danger" onclick="UI.handleDeleteItem('${item.id}')">
                      🗑️ Remover da Biblioteca
                    </button>
                  ` : ''}
                ` : `
                  <button class="btn btn-primary" onclick="UI.showAuthModal('login')">Entrar para Salvar</button>
                `}
              </div>

              <!-- SEÇÃO: VOCÊ TAMBÉM PODE GOSTAR -->
              ${relatedItems.length > 0 ? `
                <div class="detail-related-section">
                  <h3 class="detail-related-title">✨ Você também pode gostar</h3>
                  <div class="detail-related-grid">
                    ${relatedItems.map(rel => `
                      <div class="detail-related-card" onclick="UI.showDetailModal('${rel.id}', false)">
                        <img src="${rel.cover}" alt="${this.escapeHtml(rel.title)}" class="detail-related-thumb" onerror="this.src='${getFallbackCoverSvg(rel.title, rel.type)}'"/>
                        <h5 class="detail-related-info-title">${this.escapeHtml(rel.title)}</h5>
                        <p class="detail-related-info-creator">${this.escapeHtml(rel.creator)}</p>
                        <span class="detail-related-reason">${this.escapeHtml(rel.relationReason)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  },

  // ------------------ MODAL ADICIONAR COM CABEÇALHO/RODAPÉ FIXOS & AUTOCOMPLETE ------------------
  showAddModal(preselectedType = 'book') {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.showAuthModal('login');
      return;
    }

    this.currentModalType = preselectedType;
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-lg modal-fixed-layout" onclick="event.stopPropagation()">
          
          <!-- Cabeçalho Fixo -->
          <div class="modal-header modal-header-fixed">
            <h2 class="modal-title">＋ Adicionar à Revista Cultural</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()" title="Fechar">✕</button>
          </div>

          <!-- Seletor de Tipo (Livro, Filme, Série) -->
          <div style="display: flex; gap: 10px; padding: 14px 28px; background: #FAF6EE; border-bottom: 1px solid var(--border-warm); flex-shrink: 0;">
            <label class="btn btn-outline btn-sm ${preselectedType === 'book' ? 'btn-secondary' : ''}" style="cursor: pointer;">
              <input type="radio" name="modalMediaTypeSelector" value="book" ${preselectedType === 'book' ? 'checked' : ''} onchange="UI.switchAddModalType('book')" style="display: none;"/>
              📚 Livro
            </label>
            <label class="btn btn-outline btn-sm ${preselectedType === 'movie' ? 'btn-secondary' : ''}" style="cursor: pointer;">
              <input type="radio" name="modalMediaTypeSelector" value="movie" ${preselectedType === 'movie' ? 'checked' : ''} onchange="UI.switchAddModalType('movie')" style="display: none;"/>
              🎬 Filme
            </label>
            <label class="btn btn-outline btn-sm ${preselectedType === 'series' ? 'btn-secondary' : ''}" style="cursor: pointer;">
              <input type="radio" name="modalMediaTypeSelector" value="series" ${preselectedType === 'series' ? 'checked' : ''} onchange="UI.switchAddModalType('series')" style="display: none;"/>
              📺 Série
            </label>
          </div>

          <!-- Área com Scroll Próprio -->
          <div class="modal-body-scroll">
            
            <!-- Barra de Busca Rápida Automática -->
            <div class="autofill-search-section">
              <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--primary-navy); margin-bottom: 6px;">
                ⚡ Preenchimento Automático Inteligente
              </label>
              <div class="autofill-search-wrapper">
                <span class="autofill-search-icon">🔍</span>
                <input
                  type="text"
                  id="autofill-search-input"
                  class="autofill-search-input"
                  placeholder="Digite o título (ex: O Hobbit, Interestelar, Breaking Bad)..."
                  autocomplete="off"
                  oninput="UI.handleAutofillSearch(this.value)"
                />
                <span id="autofill-search-spinner" class="autofill-spinner" style="display: none;">⏳</span>
              </div>
              <div id="autofill-results-container"></div>
              <div id="autofill-feedback-container"></div>
            </div>

            <!-- Formulário Principal -->
            <form id="form-add-item" onsubmit="UI.handleSaveNewItem(event)">
              <input type="hidden" name="mediaType" id="add-modal-media-type" value="${preselectedType}"/>

              <div class="modal-form-grid" id="modal-dynamic-fields">
                ${this.getDynamicFormFields(preselectedType)}
              </div>

              <!-- Seção de Avaliação e Resenha Ampla (0/1000 caracteres) -->
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
                  <label>O que você achou? (Comentário ou Recomendação Cultural)</label>
                  <textarea
                    name="review"
                    id="add-item-review-textarea"
                    class="form-textarea-expanded"
                    maxlength="1000"
                    placeholder="Escreva suas impressões, sentimentos e reflexões sobre a obra... Suas resenhas alimentam o motor de recomendações."
                    oninput="UI.updateCharCounter(this, 'add-item-review-counter', 1000)"
                  ></textarea>
                  <div class="review-counter-row">
                    <span>Espaço confortável para recomendações ricas e sinceras.</span>
                    <span id="add-item-review-counter" class="review-counter-badge">0/1000</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0;">
                  <input type="checkbox" id="add-item-fav-check" name="isFavorite" value="true" checked style="accent-color: var(--accent-orange); width: 18px; height: 18px;"/>
                  <label for="add-item-fav-check" style="font-weight: 600; color: var(--primary-navy); cursor: pointer;">❤️ Salvar nos Favoritos</label>
                </div>
              </div>
            </form>
          </div>

          <!-- Rodapé Fixo com Botões Acessíveis -->
          <div class="modal-footer-fixed">
            <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="document.getElementById('form-add-item').requestSubmit()">Salvar Conteúdo</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    this.setFormRating(5);
  },

  switchAddModalType(type) {
    this.currentModalType = type;
    const hiddenType = document.getElementById('add-modal-media-type');
    if (hiddenType) hiddenType.value = type;

    const fieldsContainer = document.getElementById('modal-dynamic-fields');
    if (fieldsContainer) {
      fieldsContainer.innerHTML = this.getDynamicFormFields(type);
    }

    // Limpar busca anterior
    const searchInput = document.getElementById('autofill-search-input');
    if (searchInput) searchInput.value = '';
    const resultsContainer = document.getElementById('autofill-results-container');
    if (resultsContainer) resultsContainer.innerHTML = '';
    const feedbackContainer = document.getElementById('autofill-feedback-container');
    if (feedbackContainer) feedbackContainer.innerHTML = '';
  },

  // Busca rápida com debounce no cadastro de conteúdo
  handleAutofillSearch(query) {
    clearTimeout(this._autofillDebounceTimer);
    const resultsContainer = document.getElementById('autofill-results-container');
    const feedbackContainer = document.getElementById('autofill-feedback-container');
    const spinner = document.getElementById('autofill-search-spinner');

    if (!query || query.trim().length < 2) {
      if (resultsContainer) resultsContainer.innerHTML = '';
      if (feedbackContainer) feedbackContainer.innerHTML = '';
      if (spinner) spinner.style.display = 'none';
      return;
    }

    if (spinner) spinner.style.display = 'inline-block';

    this._autofillDebounceTimer = setTimeout(async () => {
      try {
        let results = [];
        if (this.currentModalType === 'book') {
          results = await SearchService.searchBooksOpenLibrary(query);
        } else if (this.currentModalType === 'movie') {
          results = await SearchService.searchMoviesItunes(query);
        } else {
          results = await SearchService.searchSeriesTVMaze(query);
        }

        if (spinner) spinner.style.display = 'none';

        if (results && results.length > 0) {
          if (feedbackContainer) feedbackContainer.innerHTML = '';
          if (resultsContainer) {
            resultsContainer.innerHTML = `
              <div class="autocomplete-dropdown">
                <div class="autocomplete-dropdown-header">RESULTADOS ENCONTRADOS (Clique para preencher)</div>
                ${results.map((r, idx) => `
                  <div class="autocomplete-item" onclick="UI.applyAutofillItem(${idx})">
                    <img src="${r.cover}" alt="${this.escapeHtml(r.title)}" class="autocomplete-thumb" onerror="this.src='${getFallbackCoverSvg(r.title, r.type)}'"/>
                    <div class="autocomplete-info">
                      <div class="autocomplete-title">${this.escapeHtml(r.title)}</div>
                      <div class="autocomplete-meta">${this.escapeHtml(r.creator)} • ${r.year || ''} • ${this.escapeHtml(r.genre)}</div>
                    </div>
                    <button type="button" class="autocomplete-select-btn">Preencher</button>
                  </div>
                `).join('')}
              </div>
            `;
            // Armazena temporariamente os resultados para acesso pelo índice
            this._lastAutofillResults = results;
          }
        } else {
          if (resultsContainer) resultsContainer.innerHTML = '';
          if (feedbackContainer) {
            feedbackContainer.innerHTML = `
              <div class="autofill-banner-empty">
                Não encontramos esse conteúdo. Você pode preencher os dados manualmente abaixo.
              </div>
            `;
          }
        }
      } catch (err) {
        if (spinner) spinner.style.display = 'none';
        console.warn('Erro no preenchimento automático', err);
      }
    }, 350);
  },

  applyAutofillItem(idx) {
    if (!this._lastAutofillResults || !this._lastAutofillResults[idx]) return;
    const item = this._lastAutofillResults[idx];
    const form = document.getElementById('form-add-item');
    if (!form) return;

    if (form.title) form.title.value = item.title || '';
    if (form.creator) form.creator.value = item.creator || '';
    if (form.genre) form.genre.value = item.genre || '';
    if (form.cover) form.cover.value = item.cover || '';
    if (form.year) form.year.value = item.year || new Date().getFullYear();

    if (this.currentModalType === 'book') {
      if (form.pages) form.pages.value = item.pages || 320;
      if (form.isbn) form.isbn.value = item.isbn || '';
      if (form.publisher) form.publisher.value = item.publisher || '';
    } else if (this.currentModalType === 'movie') {
      if (form.duration) form.duration.value = item.duration || 120;
    } else if (this.currentModalType === 'series') {
      if (form.seasons) form.seasons.value = item.seasons || 1;
      if (form.episodes) form.episodes.value = item.episodes || 10;
    }

    // Fechar dropdown e exibir banner de sucesso
    const resultsContainer = document.getElementById('autofill-results-container');
    if (resultsContainer) resultsContainer.innerHTML = '';

    const feedbackContainer = document.getElementById('autofill-feedback-container');
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="autofill-banner-success">
          ✓ Informações encontradas automaticamente. Você pode editá-las antes de salvar.
        </div>
      `;
    }

    this.showToast('✓ Dados e capa preenchidos com sucesso!', 'success');
  },

  updateCharCounter(textarea, counterId, limit) {
    const counter = document.getElementById(counterId);
    if (!counter || !textarea) return;
    const len = textarea.value.length;
    counter.textContent = `${len}/${limit}`;

    counter.classList.toggle('limit-near', len >= limit * 0.85 && len < limit);
    counter.classList.toggle('limit-reached', len >= limit);
  },

  getDynamicFormFields(type, item = null) {
    if (type === 'book') {
      return `
        <div class="form-group">
          <label>Título do Livro *</label>
          <input type="text" name="title" required class="form-input" placeholder="Ex: O Hobbit" value="${item ? this.escapeHtml(item.title) : ''}"/>
        </div>
        <div class="form-group">
          <label>Autor(a) *</label>
          <input type="text" name="creator" required class="form-input" placeholder="Ex: J.R.R. Tolkien" value="${item ? this.escapeHtml(item.creator) : ''}"/>
        </div>
        <div class="form-group">
          <label>Número de Páginas *</label>
          <input type="number" name="pages" min="1" required class="form-input" placeholder="Ex: 320" value="${item ? item.pages : '320'}"/>
        </div>
        <div class="form-group">
          <label>Gênero Literário *</label>
          <input type="text" name="genre" required class="form-input" placeholder="Ex: Fantasia, Ficção Científica" value="${item ? this.escapeHtml(item.genre) : 'Literatura'}"/>
        </div>
        <div class="form-group">
          <label>Ano de Publicação</label>
          <input type="number" name="year" class="form-input" placeholder="Ex: 1937" value="${item ? item.year : new Date().getFullYear()}"/>
        </div>
        <div class="form-group">
          <label>ISBN (Opcional)</label>
          <input type="text" name="isbn" class="form-input" placeholder="Ex: 9780547928227" value="${item && item.isbn ? this.escapeHtml(item.isbn) : ''}"/>
        </div>
        <div class="form-group">
          <label>Editora (Opcional)</label>
          <input type="text" name="publisher" class="form-input" placeholder="Ex: HarperCollins" value="${item && item.publisher ? this.escapeHtml(item.publisher) : ''}"/>
        </div>
        <div class="form-group">
          <label>URL da Capa Real (Opcional)</label>
          <input type="url" name="cover" class="form-input" placeholder="https://covers.openlibrary.org/..." value="${item ? item.cover : ''}"/>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
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
          <label>Diretor(a) *</label>
          <input type="text" name="creator" required class="form-input" placeholder="Ex: Christopher Nolan" value="${item ? this.escapeHtml(item.creator) : ''}"/>
        </div>
        <div class="form-group">
          <label>Duração (em minutos) *</label>
          <input type="number" name="duration" min="1" required class="form-input" placeholder="Ex: 169" value="${item ? item.duration : '120'}"/>
        </div>
        <div class="form-group">
          <label>Gênero Cinematográfico *</label>
          <input type="text" name="genre" required class="form-input" placeholder="Ex: Ficção Científica, Drama" value="${item ? this.escapeHtml(item.genre) : 'Cinema'}"/>
        </div>
        <div class="form-group">
          <label>Ano de Lançamento</label>
          <input type="number" name="year" class="form-input" placeholder="Ex: 2014" value="${item ? item.year : new Date().getFullYear()}"/>
        </div>
        <div class="form-group">
          <label>URL do Pôster Real (Opcional)</label>
          <input type="url" name="cover" class="form-input" placeholder="https://image.tmdb.org/..." value="${item ? item.cover : ''}"/>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
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
          <input type="text" name="genre" required class="form-input" placeholder="Ex: Drama, Crime, Suspense" value="${item ? this.escapeHtml(item.genre) : 'Drama'}"/>
        </div>
        <div class="form-group">
          <label>Ano de Estreia</label>
          <input type="number" name="year" class="form-input" placeholder="Ex: 2008" value="${item ? item.year : new Date().getFullYear()}"/>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>URL do Pôster Real (Opcional)</label>
          <input type="url" name="cover" class="form-input" placeholder="https://image.tmdb.org/..." value="${item ? item.cover : ''}"/>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
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
        <div class="modal-card modal-lg modal-fixed-layout" onclick="event.stopPropagation()">
          <div class="modal-header modal-header-fixed">
            <h2 class="modal-title">✏️ Editar ${item.type === 'book' ? 'Livro' : item.type === 'movie' ? 'Filme' : 'Série'}</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()" title="Fechar">✕</button>
          </div>

          <div class="modal-body-scroll">
            <form id="form-edit-item" onsubmit="UI.handleUpdateItem(event, '${item.id}', '${item.type}')">
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
                  <label>O que você achou? (Comentário ou Resenha)</label>
                  <textarea
                    name="review"
                    id="edit-item-review-textarea"
                    class="form-textarea-expanded"
                    maxlength="1000"
                    oninput="UI.updateCharCounter(this, 'edit-item-review-counter', 1000)"
                  >${this.escapeHtml(item.review || '')}</textarea>
                  <div class="review-counter-row">
                    <span>Edite suas anotações e reflexões culturais.</span>
                    <span id="edit-item-review-counter" class="review-counter-badge">${(item.review || '').length}/1000</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0;">
                  <input type="checkbox" id="edit-item-fav-check" name="isFavorite" value="true" ${item.isFavorite ? 'checked' : ''} style="accent-color: var(--accent-orange); width: 18px; height: 18px;"/>
                  <label for="edit-item-fav-check" style="font-weight: 600; color: var(--primary-navy); cursor: pointer;">❤️ Salvar nos Favoritos</label>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer-fixed">
            <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="document.getElementById('form-edit-item').requestSubmit()">Salvar Alterações</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    this.setFormRating(item.rating || 5);
  },

  showQuickAddModal(catalogOrItemId) {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.showAuthModal('login');
      return;
    }

    const catalog = Storage.getCatalog() || [];
    const item = catalog.find(i => i.id === catalogOrItemId) ||
                 this.externalSearchResults.find(i => i.id === catalogOrItemId) ||
                 Storage.getUserItems(user.id).find(i => i.id === catalogOrItemId);
    if (!item) return;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-md modal-fixed-layout" onclick="event.stopPropagation()">
          <div class="modal-header modal-header-fixed">
            <h2 class="modal-title">＋ Adicionar à Minha Biblioteca</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()" title="Fechar">✕</button>
          </div>

          <div class="modal-body-scroll">
            <form id="form-quick-add" onsubmit="UI.handleConfirmQuickAdd(event, '${item.id}')">
              <div style="display: flex; gap: 16px; padding: 18px 24px; background: #FAF6EE; border-bottom: 1px solid var(--border-warm);">
                <img src="${item.cover}" alt="${this.escapeHtml(item.title)}" style="width: 58px; height: 84px; object-fit: cover; border-radius: 4px; box-shadow: var(--shadow-book);" onerror="this.src='${getFallbackCoverSvg(item.title, item.type)}'"/>
                <div>
                  <h4 style="font-family: var(--font-serif); font-size: 18px; color: var(--primary-navy);">${this.escapeHtml(item.title)}</h4>
                  <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(item.creator)} • ${this.escapeHtml(item.genre)} (${item.year || ''})</p>
                </div>
              </div>

              <div style="padding: 20px 24px;">
                <div class="form-group">
                  <label>Status de Consumo</label>
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
                      <option value="paused">Pausada</option>
                    `}
                  </select>
                </div>

                <div class="form-group">
                  <label>Sua Avaliação</label>
                  <div style="display: flex; gap: 6px;" id="new-item-rating-stars">
                    ${[1, 2, 3, 4, 5].map(s => `
                      <span class="interactive-star filled" data-val="${s}" onclick="UI.setFormRating(${s})">★</span>
                    `).join('')}
                  </div>
                  <input type="hidden" name="rating" id="new-item-rating-val" value="5"/>
                </div>

                <div class="form-group">
                  <label>Comentário ou Resenha</label>
                  <textarea
                    name="review"
                    class="form-textarea-expanded"
                    maxlength="1000"
                    placeholder="Sua opinião sincera..."
                    oninput="UI.updateCharCounter(this, 'quick-add-counter', 1000)"
                  ></textarea>
                  <div class="review-counter-row">
                    <span>Grave suas reflexões culturais.</span>
                    <span id="quick-add-counter" class="review-counter-badge">0/1000</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer-fixed">
            <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="document.getElementById('form-quick-add').requestSubmit()">Adicionar Agora</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    this.setFormRating(5);
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
      year: formData.get('year'),
      pages: formData.get('pages'),
      duration: formData.get('duration'),
      seasons: formData.get('seasons'),
      episodes: formData.get('episodes'),
      isbn: formData.get('isbn'),
      publisher: formData.get('publisher'),
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
      year: formData.get('year'),
      pages: formData.get('pages'),
      duration: formData.get('duration'),
      seasons: formData.get('seasons'),
      episodes: formData.get('episodes'),
      isbn: formData.get('isbn'),
      publisher: formData.get('publisher'),
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

    const catalog = Storage.getCatalog() || [];
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
    if (!confirm('Deseja realmente remover esta obra da sua biblioteca? Esta ação não pode ser desfeita.')) return;
    const user = Storage.getCurrentUser();
    if (!user) return;
    Storage.deleteItem(user.id, itemId);
    this.closeModal();
    this.showToast('Obra removida com sucesso!', 'info');
    this.navigate(this.currentView);
  },

  // ------------------ AUTENTICAÇÃO HANDLERS ------------------
  handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const user = Storage.loginUser(form.email.value, form.password.value);
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
    const password = form.password.value;
    const confirmPass = form.confirmPassword ? form.confirmPassword.value : password;
    if (password !== confirmPass) {
      this.showToast('As senhas digitadas não coincidem.', 'error');
      return;
    }
    try {
      const user = Storage.registerUser(form.name.value, form.email.value, password);
      this.renderHeader();
      this.showToast(`Bem-vindo ao +Cultura, ${user.name}! 🎉`, 'success');
      this.navigate('dashboard');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  handleInstantDemoLogin() {
    const demo = Storage.startDemoSession();
    if (!demo) {
      this.showToast('Não foi possível carregar a conta de demonstração.', 'error');
      return;
    }
    this.renderHeader();
    this.showToast('🎮 Você está no Modo Demonstração do +Cultura.', 'info');
    this.navigate('dashboard');
  },

  handleLogout() {
    Storage.logoutUser();
    this.renderHeader();
    this.showToast('Você saiu da sua conta com segurança.', 'info');
    // NUNCA re-entrar na demo automaticamente após logout!
    this.navigate('auth');
  },

  showAuthModal(initialTab = 'login') {
    this.renderAuth(initialTab);
  },

  showRecoverPasswordModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-sm modal-fixed-layout" onclick="event.stopPropagation()">
          <div class="modal-header modal-header-fixed">
            <h2 class="modal-title">🔑 Recuperar Senha</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()" title="Fechar">✕</button>
          </div>
          <div class="modal-body-scroll" style="padding: 24px;">
            <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 14px;">
              Informe seu e-mail e defina sua nova senha de acesso.
            </p>
            <form onsubmit="UI.handleRecoverPasswordSubmit(event)">
              <div class="form-group">
                <label>E-mail cadastrado</label>
                <input type="email" name="email" required class="form-input" placeholder="seu@email.com"/>
              </div>
              <div class="form-group">
                <label>Nova senha</label>
                <input type="password" name="newPassword" required minlength="4" class="form-input" placeholder="Mínimo 4 caracteres"/>
              </div>
              <div class="form-group">
                <label>Confirmar nova senha</label>
                <input type="password" name="confirmPassword" required minlength="4" class="form-input" placeholder="Repita a nova senha"/>
              </div>
              <button type="submit" class="btn btn-primary w-full" style="margin-top: 10px;">Redefinir Senha</button>
            </form>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  },

  handleRecoverPasswordSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (form.newPassword.value !== form.confirmPassword.value) {
      this.showToast('As senhas não coincidem.', 'error');
      return;
    }
    try {
      Storage.recoverPassword(form.email.value, form.newPassword.value);
      this.closeModal();
      this.showToast('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // ------------------ MODAL EDITAR PERFIL & SELETOR DE AVATARES ------------------
  showEditProfileModal() {
    const user = Storage.getCurrentUser();
    if (!user) return;

    this.selectedAvatarUrl = user.avatar || (EDITORIAL_AVATARS && EDITORIAL_AVATARS[0] ? EDITORIAL_AVATARS[0].url : '');
    const modal = document.getElementById('modal-container');

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="UI.closeModal()">
        <div class="modal-card modal-md modal-fixed-layout" onclick="event.stopPropagation()">
          <div class="modal-header modal-header-fixed">
            <h2 class="modal-title">✏️ Personalizar Perfil & Avatar</h2>
            <button class="modal-close-btn" onclick="UI.closeModal()" title="Fechar">✕</button>
          </div>

          <div class="modal-body-scroll">
            <form id="form-edit-profile" onsubmit="UI.handleUpdateProfileSubmit(event)" style="padding: 24px;">
              <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" name="name" required class="form-input" value="${this.escapeHtml(user.name)}"/>
              </div>

              <div class="form-group">
                <label>Biografia / Apresentação Cultural</label>
                <textarea name="bio" class="form-input form-textarea" rows="3" placeholder="Compartilhe seus gostos literários e cinematográficos...">${this.escapeHtml(user.bio || '')}</textarea>
              </div>

              <!-- SELETOR DE AVATAR EDITORIAL COM 16 OPÇÕES -->
              <div class="avatar-selection-container">
                <label style="display: block; font-weight: 700; color: var(--primary-navy); margin-bottom: 8px;">
                  Escolha seu Avatar Editorial
                </label>

                <div class="avatar-tabs">
                  <button type="button" class="avatar-tab-btn active" id="tab-btn-presets" onclick="UI.switchAvatarTab('presets')">
                    🎨 Avatares Prontos (16 opções)
                  </button>
                  <button type="button" class="avatar-tab-btn" id="tab-btn-photo" onclick="UI.switchAvatarTab('photo')">
                    🖼️ Usar Minha Foto
                  </button>
                  <button type="button" class="avatar-tab-btn" id="tab-btn-default" onclick="UI.switchAvatarTab('default')">
                    👤 Padrão
                  </button>
                </div>

                <!-- Painel de Avatares Prontos -->
                <div id="avatar-panel-presets">
                  <div class="avatar-grid">
                    ${(EDITORIAL_AVATARS || []).map(av => `
                      <div
                        class="avatar-grid-item ${this.selectedAvatarUrl === av.url ? 'selected' : ''}"
                        onclick="UI.selectPresetAvatar('${encodeURIComponent(av.url)}', this)"
                        title="${av.name}"
                      >
                        <img src="${av.url}" alt="${av.name}" class="avatar-grid-thumb"/>
                        <span class="avatar-grid-label">${av.name}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Painel de Foto Própria -->
                <div id="avatar-panel-photo" style="display: none; padding: 10px 0;">
                  <label style="font-size: 13px; color: var(--text-muted);">Cole a URL da sua foto ou imagem:</label>
                  <input
                    type="url"
                    id="profile-custom-photo-url"
                    class="form-input"
                    style="margin-top: 6px;"
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value="${this.selectedAvatarUrl.startsWith('data:') ? '' : this.escapeHtml(this.selectedAvatarUrl)}"
                    oninput="UI.handleCustomPhotoInput(this.value)"
                  />
                  <div style="margin-top: 12px; display: flex; align-items: center; gap: 12px;">
                    <img id="custom-photo-preview" src="${this.selectedAvatarUrl}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-navy);" onerror="this.src='${EDITORIAL_AVATARS ? EDITORIAL_AVATARS[0].url : ''}'"/>
                    <span style="font-size: 12px; color: var(--text-muted);">Prévia da foto de perfil</span>
                  </div>
                </div>

                <input type="hidden" name="avatar" id="profile-avatar-hidden-input" value="${this.escapeHtml(this.selectedAvatarUrl)}"/>
              </div>
            </form>
          </div>

          <div class="modal-footer-fixed">
            <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="document.getElementById('form-edit-profile').requestSubmit()">Salvar Perfil</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  switchAvatarTab(tab) {
    document.querySelectorAll('.avatar-tab-btn').forEach(btn => btn.classList.remove('active'));
    const presetsPanel = document.getElementById('avatar-panel-presets');
    const photoPanel = document.getElementById('avatar-panel-photo');
    const hiddenInput = document.getElementById('profile-avatar-hidden-input');

    if (tab === 'presets') {
      document.getElementById('tab-btn-presets')?.classList.add('active');
      if (presetsPanel) presetsPanel.style.display = 'block';
      if (photoPanel) photoPanel.style.display = 'none';
    } else if (tab === 'photo') {
      document.getElementById('tab-btn-photo')?.classList.add('active');
      if (presetsPanel) presetsPanel.style.display = 'none';
      if (photoPanel) photoPanel.style.display = 'block';
    } else if (tab === 'default') {
      document.getElementById('tab-btn-default')?.classList.add('active');
      const defaultUrl = EDITORIAL_AVATARS && EDITORIAL_AVATARS[0] ? EDITORIAL_AVATARS[0].url : '';
      this.selectedAvatarUrl = defaultUrl;
      if (hiddenInput) hiddenInput.value = defaultUrl;
      this.showToast('Avatar padrão selecionado.', 'info');
    }
  },

  selectPresetAvatar(encodedUrl, element) {
    const url = decodeURIComponent(encodedUrl);
    this.selectedAvatarUrl = url;
    const hiddenInput = document.getElementById('profile-avatar-hidden-input');
    if (hiddenInput) hiddenInput.value = url;

    document.querySelectorAll('.avatar-grid-item').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');
  },

  handleCustomPhotoInput(url) {
    if (!url) return;
    this.selectedAvatarUrl = url;
    const hiddenInput = document.getElementById('profile-avatar-hidden-input');
    if (hiddenInput) hiddenInput.value = url;
    const preview = document.getElementById('custom-photo-preview');
    if (preview) preview.src = url;
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
        avatar: form.avatar.value || this.selectedAvatarUrl
      });
      this.closeModal();
      this.renderHeader();
      this.showToast('Perfil e avatar atualizados com sucesso! ✨', 'success');
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
