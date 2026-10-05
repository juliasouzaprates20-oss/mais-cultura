// Storage & Multi-User State Management for +Cultura
// Strict isolation per user using localStorage keys

const STORAGE_KEYS = {
  USERS: 'mais_cultura_users_v4',
  CURRENT_USER_ID: 'mais_cultura_current_user_id_v4',
  CATALOG: 'mais_cultura_catalog_v4',
  USER_ITEMS_PREFIX: 'mais_cultura_items_v4_',
  USER_ACTIVITY_PREFIX: 'mais_cultura_activity_v4_'
};

const Storage = {
  init() {
    // Initialize catalog
    if (!localStorage.getItem(STORAGE_KEYS.CATALOG)) {
      localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(DEFAULT_CATALOG));
    }

    const users = this.getUsers();
    if (users.length === 0) {
      this.seedDemoUser();
    }
  },

  // ------------------ USERS ------------------
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users', e);
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser() {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === currentId) || null;
  },

  setCurrentUser(user) {
    if (user && user.id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  },

  registerUser(name, email, password, avatar = null, bio = '') {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: cleanEmail,
      password: password,
      avatar: avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
      bio: bio || 'Leitor e cinéfilo apaixonado por narrativas marcantes e novas descobertas culturais.',
      favoriteGenres: ['Ficção Científica', 'Drama', 'Fantasia'],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    this.saveUserItems(newUser.id, []);
    this.saveUserActivity(newUser.id, [
      {
        id: 'act_' + Date.now(),
        type: 'registered',
        title: 'Bem-vindo ao +Cultura!',
        mediaType: 'system',
        details: 'Conta criada com sucesso na sua revista cultural personalizada.',
        timestamp: new Date().toISOString()
      }
    ]);

    return newUser;
  },

  loginUser(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    this.setCurrentUser(user);
    return user;
  },

  logoutUser() {
    this.setCurrentUser(null);
  },

  recoverPassword(email, newPassword) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      throw new Error('Nenhum usuário cadastrado com este e-mail.');
    }

    users[userIndex].password = newPassword;
    this.saveUsers(users);
    return true;
  },

  updateUserProfile(userId, { name, avatar, bio, favoriteGenres }) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Usuário não encontrado.');

    if (name) users[idx].name = name.trim();
    if (avatar) users[idx].avatar = avatar;
    if (typeof bio === 'string') users[idx].bio = bio.trim();
    if (Array.isArray(favoriteGenres)) users[idx].favoriteGenres = favoriteGenres;

    this.saveUsers(users);
    return users[idx];
  },

  // ------------------ USER-ISOLATED ITEMS ------------------
  getUserItems(userId) {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_ITEMS_PREFIX + userId);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error fetching user items', e);
      return [];
    }
  },

  saveUserItems(userId, items) {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEYS.USER_ITEMS_PREFIX + userId, JSON.stringify(items));
  },

  addItem(userId, itemData) {
    if (!userId) throw new Error('Usuário não autenticado.');
    const items = this.getUserItems(userId);

    if (!itemData.title || !itemData.type) {
      throw new Error('Título e formato (Livro, Filme ou Série) são obrigatórios.');
    }

    const newItem = {
      id: itemData.id || 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      catalogId: itemData.catalogId || null,
      type: itemData.type,
      title: itemData.title.trim(),
      creator: (itemData.creator || 'Desconhecido').trim(),
      genre: itemData.genre || 'Geral',
      genres: Array.isArray(itemData.genres) && itemData.genres.length > 0 ? itemData.genres : [itemData.genre || 'Geral'],
      year: parseInt(itemData.year, 10) || new Date().getFullYear(),
      cover: itemData.cover || getFallbackCoverSvg(itemData.title, itemData.type),
      synopsis: itemData.synopsis || '',
      tags: Array.isArray(itemData.tags) ? itemData.tags : [itemData.genre || 'Geral'],

      pages: itemData.type === 'book' ? Math.max(1, parseInt(itemData.pages, 10) || 100) : 0,
      duration: itemData.type === 'movie' ? Math.max(1, parseInt(itemData.duration, 10) || 90) : 0,
      seasons: itemData.type === 'series' ? Math.max(1, parseInt(itemData.seasons, 10) || 1) : 0,
      episodes: itemData.type === 'series' ? Math.max(1, parseInt(itemData.episodes, 10) || 10) : 0,

      status: itemData.status || (itemData.type === 'book' ? 'read' : itemData.type === 'movie' ? 'watched' : 'completed'),
      rating: parseFloat(itemData.rating) || 0,
      review: (itemData.review || '').trim(),
      dateStarted: itemData.dateStarted || null,
      dateFinished: itemData.dateFinished || new Date().toISOString().split('T')[0],
      isFavorite: !!itemData.isFavorite,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.unshift(newItem);
    this.saveUserItems(userId, items);

    this.logActivity(userId, {
      type: 'added',
      title: newItem.title,
      mediaType: newItem.type,
      details: `Adicionado à biblioteca como "${this.formatStatus(newItem.type, newItem.status)}"`
    });

    return newItem;
  },

  updateItem(userId, itemId, updates) {
    if (!userId) throw new Error('Usuário não autenticado.');
    const items = this.getUserItems(userId);
    const idx = items.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Item não encontrado.');

    const oldItem = items[idx];
    const updated = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updated.type === 'book' && updates.pages !== undefined) {
      updated.pages = Math.max(1, parseInt(updates.pages, 10) || 100);
    }
    if (updated.type === 'movie' && updates.duration !== undefined) {
      updated.duration = Math.max(1, parseInt(updates.duration, 10) || 90);
    }
    if (updated.type === 'series') {
      if (updates.seasons !== undefined) updated.seasons = Math.max(1, parseInt(updates.seasons, 10) || 1);
      if (updates.episodes !== undefined) updated.episodes = Math.max(1, parseInt(updates.episodes, 10) || 10);
    }

    items[idx] = updated;
    this.saveUserItems(userId, items);

    if (updates.rating !== undefined && updates.rating !== oldItem.rating) {
      this.logActivity(userId, {
        type: 'rated',
        title: updated.title,
        mediaType: updated.type,
        details: `Avaliou com ${updates.rating} estrela${updates.rating > 1 ? 's' : ''}`
      });
    }

    if (updates.review !== undefined && updates.review !== oldItem.review && updates.review.trim()) {
      this.logActivity(userId, {
        type: 'reviewed',
        title: updated.title,
        mediaType: updated.type,
        details: `Resenha: "${updates.review.substring(0, 45)}${updates.review.length > 45 ? '...' : ''}"`
      });
    }

    return updated;
  },

  deleteItem(userId, itemId) {
    if (!userId) throw new Error('Usuário não autenticado.');
    let items = this.getUserItems(userId);
    const item = items.find(i => i.id === itemId);
    if (!item) return false;

    items = items.filter(i => i.id !== itemId);
    this.saveUserItems(userId, items);

    this.logActivity(userId, {
      type: 'deleted',
      title: item.title,
      mediaType: item.type,
      details: 'Removido da biblioteca pessoal'
    });

    return true;
  },

  toggleFavorite(userId, itemId) {
    const items = this.getUserItems(userId);
    const item = items.find(i => i.id === itemId);
    if (!item) return false;

    item.isFavorite = !item.isFavorite;
    item.updatedAt = new Date().toISOString();
    this.saveUserItems(userId, items);

    this.logActivity(userId, {
      type: 'favorite',
      title: item.title,
      mediaType: item.type,
      details: item.isFavorite ? 'Marcado como favorito ❤️' : 'Removido dos favoritos'
    });

    return item.isFavorite;
  },

  updateRatingAndReview(userId, itemId, rating, review) {
    return this.updateItem(userId, itemId, {
      rating: parseFloat(rating),
      review: (review || '').trim()
    });
  },

  // ------------------ ACTIVITY LOGS ------------------
  getUserActivity(userId) {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY_PREFIX + userId);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading activity', e);
      return [];
    }
  },

  saveUserActivity(userId, activities) {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEYS.USER_ACTIVITY_PREFIX + userId, JSON.stringify(activities.slice(0, 50)));
  },

  logActivity(userId, { type, title, mediaType, details }) {
    if (!userId) return;
    const activities = this.getUserActivity(userId);
    activities.unshift({
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      title,
      mediaType,
      details,
      timestamp: new Date().toISOString()
    });
    this.saveUserActivity(userId, activities);
  },

  getCatalog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATALOG);
      return data ? JSON.parse(data) : DEFAULT_CATALOG;
    } catch (e) {
      return DEFAULT_CATALOG;
    }
  },

  formatStatus(type, status) {
    if (type === 'book') {
      if (status === 'want_to_read') return 'Quero ler';
      if (status === 'reading') return 'Lendo';
      return 'Lido';
    }
    if (type === 'movie') {
      if (status === 'want_to_watch') return 'Quero assistir';
      return 'Assistido';
    }
    if (type === 'series') {
      if (status === 'want_to_watch') return 'Quero assistir';
      if (status === 'watching') return 'Assistindo';
      if (status === 'paused') return 'Pausada';
      return 'Finalizada';
    }
    return status;
  },

  // ------------------ SEED DEMO USER (EDITORIAL REFERENCE) ------------------
  seedDemoUser() {
    const demoId = 'usr_demo_lucas';
    const demoUser = {
      id: demoId,
      name: 'Lucas Mendes',
      email: 'lucas@cultura.com',
      password: 'demo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Leitor voraz de ficção científica e clássicos, cinéfilo de fim de semana e maratonista de séries com reviravoltas.',
      favoriteGenres: ['Ficção Científica', 'Drama', 'Fantasia', 'Suspense'],
      createdAt: '2024-01-15T10:00:00.000Z'
    };

    const demoItems = [];

    // 12 LIVROS LIDOS COM CAPAS REAIS (Soma exata = 4.850 páginas!)
    // 336 + 384 + 464 + 688 + 320 + 480 + 152 + 576 + 264 + 448 + 216 + 522 = 4.850 páginas!
    const realBooksData = [
      {
        title: "1984",
        creator: "George Orwell",
        genre: "Ficção Científica",
        year: 1949,
        pages: 336,
        cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        rating: 5,
        status: "read",
        review: "Aterrorizante de tão atual. Uma das leituras mais impactantes da minha vida.",
        fav: true
      },
      {
        title: "O Sol é para Todos",
        creator: "Harper Lee",
        genre: "Drama",
        year: 1960,
        pages: 384,
        cover: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
        rating: 5,
        status: "read",
        review: "Atticus Finch é a síntese da coragem e retidão moral. Inesquecível.",
        fav: true
      },
      {
        title: "Sapiens: Uma Breve História da Humanidade",
        creator: "Yuval Noah Harari",
        genre: "História",
        year: 2014,
        pages: 464,
        cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
        rating: 5,
        status: "read",
        review: "Muda totalmente nossa perspectiva sobre a evolução e as ficções compartilhadas.",
        fav: true
      },
      {
        title: "Duna",
        creator: "Frank Herbert",
        genre: "Ficção Científica",
        year: 1965,
        pages: 688,
        cover: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
        rating: 5,
        status: "read",
        review: "A obra-prima definitiva da ficção científica. Política, ecologia e religião em Arrakis.",
        fav: true
      },
      {
        title: "O Hobbit",
        creator: "J.R.R. Tolkien",
        genre: "Fantasia",
        year: 1937,
        pages: 320,
        cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
        rating: 5,
        status: "read",
        review: "Aventura calorosa e mágica que abriu as portas da Terra-média.",
        fav: true
      },
      {
        title: "A Menina que Roubava Livros",
        creator: "Markus Zusak",
        genre: "Drama",
        year: 2005,
        pages: 480,
        cover: "https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg",
        rating: 5,
        status: "read",
        review: "A narração da Morte e a relação de Liesel com as palavras emocionam até a última linha.",
        fav: true
      },
      {
        title: "A Revolução dos Bichos",
        creator: "George Orwell",
        genre: "Fábula",
        year: 1945,
        pages: 152,
        cover: "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg",
        rating: 4,
        status: "reading", // EM ANDAMENTO / LENDO AGORA (como na ref!)
        review: "Sátira política atemporal e afiada sobre a corrupção do poder.",
        fav: false
      },
      {
        title: "O Senhor dos Anéis: A Sociedade do Anel",
        creator: "J.R.R. Tolkien",
        genre: "Fantasia",
        year: 1954,
        pages: 576,
        cover: "https://covers.openlibrary.org/b/isbn/9780618346257-L.jpg",
        rating: 5,
        status: "read",
        review: "Construção de mundo magistral e poesia em prosa.",
        fav: true
      },
      {
        title: "Torto Arado",
        creator: "Itamar Vieira Junior",
        genre: "Literatura Brasileira",
        year: 2019,
        pages: 264,
        cover: "https://covers.openlibrary.org/b/isbn/9786556920405-L.jpg",
        rating: 5,
        status: "read",
        review: "Força ancestral e prosa lírica inesquecível do sertão baiano.",
        fav: true
      },
      {
        title: "Cem Anos de Solidão",
        creator: "Gabriel García Márquez",
        genre: "Realismo Mágico",
        year: 1967,
        pages: 448,
        cover: "https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg",
        rating: 4,
        status: "read",
        review: "A saga mágica de Macondo é uma experiência sensorial única.",
        fav: false
      },
      {
        title: "Fahrenheit 451",
        creator: "Ray Bradbury",
        genre: "Ficção Científica",
        year: 1953,
        pages: 216,
        cover: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
        rating: 4,
        status: "read",
        review: "Um tributo vital ao pensamento crítico e ao amor pelos livros.",
        fav: false
      },
      {
        title: "O Nome do Vento",
        creator: "Patrick Rothfuss",
        genre: "Fantasia",
        year: 2007,
        pages: 522,
        cover: "https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg",
        rating: 5,
        status: "read",
        review: "A história de Kvothe possui um lirismo que poucos autores de fantasia alcançam.",
        fav: true
      }
    ];

    realBooksData.forEach((b, idx) => {
      demoItems.push({
        id: `demo_book_${idx + 1}`,
        type: 'book',
        title: b.title,
        creator: b.creator,
        genre: b.genre,
        genres: [b.genre],
        year: b.year,
        pages: b.pages,
        cover: b.cover,
        synopsis: b.review,
        status: b.status,
        rating: b.rating,
        review: b.review,
        dateFinished: b.status === 'read' ? '2024-0' + ((idx % 9) + 1) + '-15' : null,
        dateStarted: '2024-01-10',
        isFavorite: b.fav,
        addedAt: new Date(Date.now() - (idx + 1) * 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // 23 FILMES COM PÔSTERES REAIS DO TMDB
    const realMoviesData = [
      { title: 'Interestelar', creator: 'Christopher Nolan', genre: 'Ficção Científica', year: 2014, duration: 169, cover: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: 5, fav: true, review: 'O maior épico de ficção do nosso tempo.' },
      { title: 'Oppenheimer', creator: 'Christopher Nolan', genre: 'Biografia', year: 2023, duration: 180, cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: 5, fav: true, review: 'Atuações monumentais e montagem ritmada.' },
      { title: 'Parasita', creator: 'Bong Joon-ho', genre: 'Suspense', year: 2019, duration: 132, cover: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', rating: 5, fav: true, review: 'Roteiro e direção impecáveis.' },
      { title: 'Blade Runner 2049', creator: 'Denis Villeneuve', genre: 'Ficção Científica', year: 2017, duration: 164, cover: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', rating: 5, fav: true, review: 'Visual mais lindo da história recente.' },
      { title: 'Whiplash', creator: 'Damien Chazelle', genre: 'Drama', year: 2014, duration: 106, cover: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', rating: 5, fav: true, review: 'Tensão do início ao fim.' },
      { title: 'O Poderoso Chefão', creator: 'Francis Ford Coppola', genre: 'Drama', year: 1972, duration: 175, cover: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', rating: 5, fav: true, review: 'Perfeição cinematográfica.' },
      { title: 'A Viagem de Chihiro', creator: 'Hayao Miyazaki', genre: 'Animação', year: 2001, duration: 125, cover: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', rating: 5, fav: true, review: 'Poesia visual e maturidade infantil.' },
      { title: 'Matrix', creator: 'Lana e Lilly Wachowski', genre: 'Ficção Científica', year: 1999, duration: 136, cover: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rating: 5, fav: true, review: 'Revolucionou os efeitos e a narrativa.' },
      { title: 'Clube da Luta', creator: 'David Fincher', genre: 'Suspense', year: 1999, duration: 139, cover: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: 4, fav: false, review: 'Reviravolta inacreditável.' },
      { title: 'Pulp Fiction', creator: 'Quentin Tarantino', genre: 'Crime', year: 1994, duration: 154, cover: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rating: 5, fav: true, review: 'Diálogos inesquecíveis.' },
      { title: 'Duna: Parte 2', creator: 'Denis Villeneuve', genre: 'Ficção Científica', year: 2024, duration: 166, cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGzyAiIHQw9h.jpg', rating: 5, fav: true, review: 'Grandioso e sonoro de arrepiar.' },
      { title: 'Cidade de Deus', creator: 'Fernando Meirelles', genre: 'Drama', year: 2002, duration: 130, cover: 'https://image.tmdb.org/t/p/w500/k7eYdWvhYQ7RQo9OB8fZY428FeW.jpg', rating: 5, fav: true, review: 'Cinema nacional no topo do mundo.' },
      { title: 'Central do Brasil', creator: 'Walter Salles', genre: 'Drama', year: 1998, duration: 110, cover: 'https://image.tmdb.org/t/p/w500/7nFq5W2q0sIe09R6uB1jK5dE90M.jpg', rating: 5, fav: true, review: 'Fernanda Montenegro perfeita.' },
      { title: 'O Cavaleiro das Trevas', creator: 'Christopher Nolan', genre: 'Ação', year: 2008, duration: 152, cover: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 5, fav: true, review: 'Heath Ledger eterno como Coringa.' },
      { title: 'A Chegada', creator: 'Denis Villeneuve', genre: 'Ficção Científica', year: 2016, duration: 116, cover: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', rating: 5, fav: true, review: 'Linguagem e tempo combinados com genialidade.' },
      { title: 'De Volta Para o Futuro', creator: 'Robert Zemeckis', genre: 'Ficção Científica', year: 1985, duration: 116, cover: 'https://image.tmdb.org/t/p/w500/7lyBcpYB0Qt8gYvXYaEZUNNsSOr.jpg', rating: 5, fav: true, review: 'Roteiro perfeito de viagem no tempo.' },
      { title: 'O Retorno do Rei', creator: 'Peter Jackson', genre: 'Fantasia', year: 2003, duration: 201, cover: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', rating: 5, fav: true, review: 'Conclusão apoteótica do cinema épico.' },
      { title: 'O Show de Truman', creator: 'Peter Weir', genre: 'Drama', year: 1998, duration: 103, cover: 'https://image.tmdb.org/t/p/w500/vuza0WqY239ISQDoFjAQvi695ik.jpg', rating: 5, fav: true, review: 'Jim Carrey em atuação dramática brilhante.' },
      { title: 'WALL-E', creator: 'Andrew Stanton', genre: 'Animação', year: 2008, duration: 98, cover: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', rating: 5, fav: true, review: 'Primeiro ato sem diálogos é pura arte.' },
      { title: 'Brilho Eterno', creator: 'Michel Gondry', genre: 'Romance', year: 2004, duration: 108, cover: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5q9IzL.jpg', rating: 5, fav: true, review: 'Sensível, inventivo e dilacerante.' },
      { title: 'O Iluminado', creator: 'Stanley Kubrick', genre: 'Terror', year: 1980, duration: 146, cover: 'https://image.tmdb.org/t/p/w500/9Pf9nO6e5gQc6t2Y0i2f2R4G3eU.jpg', rating: 4, fav: false, review: 'Clima claustrofóbico mestre.' },
      { title: 'Seven: Os Sete Crimes Capitais', creator: 'David Fincher', genre: 'Suspense', year: 1995, duration: 127, cover: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg', rating: 5, fav: true, review: 'Final mais marcante dos anos 90.' },
      { title: 'Bastardos Inglórios', creator: 'Quentin Tarantino', genre: 'Ação', year: 2009, duration: 153, cover: 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDD5Km0CZ7D7KyOYAh.jpg', rating: 4, fav: false, review: 'Christoph Waltz extraordinário.' }
    ];

    realMoviesData.forEach((m, idx) => {
      demoItems.push({
        id: `demo_movie_${idx + 1}`,
        type: 'movie',
        title: m.title,
        creator: m.creator,
        genre: m.genre,
        genres: [m.genre],
        year: m.year,
        duration: m.duration,
        cover: m.cover,
        synopsis: m.review,
        status: 'watched',
        rating: m.rating,
        review: m.review,
        dateFinished: '2024-0' + ((idx % 9) + 1) + '-10',
        isFavorite: m.fav,
        addedAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // 8 SÉRIES COM PÔSTERES REAIS DO TMDB
    const realSeriesData = [
      { title: 'Breaking Bad', creator: 'Vince Gilligan', genre: 'Drama', year: 2008, seasons: 5, episodes: 62, cover: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', rating: 5, status: 'completed', fav: true, review: 'A melhor evolução de personagem da TV.' },
      { title: 'Dark', creator: 'Baran bo Odar', genre: 'Ficção Científica', year: 2017, seasons: 3, episodes: 26, cover: 'https://image.tmdb.org/t/p/w500/apbrkMDHHcHv7Flss3q5DCc3vL7.jpg', rating: 5, status: 'completed', fav: true, review: 'Quebra-cabeça temporal magistral.' },
      { title: 'Succession', creator: 'Jesse Armstrong', genre: 'Drama', year: 2018, seasons: 4, episodes: 39, cover: 'https://image.tmdb.org/t/p/w500/7HXag6t1zKz26iXfT2mJ9U7V38f.jpg', rating: 5, status: 'completed', fav: true, review: 'Diálogos afiados e atuações de ouro.' },
      { title: 'Severance (Ruptura)', creator: 'Dan Erickson', genre: 'Suspense', year: 2022, seasons: 2, episodes: 19, cover: 'https://image.tmdb.org/t/p/w500/4n74v43yE6q1y3bHqf1b0aV7xL5.jpg', rating: 5, status: 'watching', fav: true, review: 'Conceito originalíssimo e tensão máxima.' }, // EM ANDAMENTO / ASSISTINDO!
      { title: 'The Last of Us', creator: 'Craig Mazin', genre: 'Drama', year: 2023, seasons: 1, episodes: 9, cover: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7J9AhP.jpg', rating: 5, status: 'completed', fav: true, review: 'Adaptação emocionante e leal aos jogos.' },
      { title: 'Arcane', creator: 'Christian Linke', genre: 'Animação', year: 2021, seasons: 2, episodes: 18, cover: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', rating: 5, status: 'completed', fav: true, review: 'Pintura a óleo em movimento e roteiro trágico.' },
      { title: 'Stranger Things', creator: 'Os Irmãos Duffer', genre: 'Ficção Científica', year: 2016, seasons: 4, episodes: 34, cover: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', rating: 4, status: 'completed', fav: false, review: 'Aventura oitentista envolvente.' },
      { title: 'O Gambito da Rainha', creator: 'Scott Frank', genre: 'Drama', year: 2020, seasons: 1, episodes: 7, cover: 'https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg', rating: 5, status: 'completed', fav: true, review: 'Minissérie elegante e magnética.' }
    ];

    realSeriesData.forEach((s, idx) => {
      demoItems.push({
        id: `demo_series_${idx + 1}`,
        type: 'series',
        title: s.title,
        creator: s.creator,
        genre: s.genre,
        genres: [s.genre],
        year: s.year,
        seasons: s.seasons,
        episodes: s.episodes,
        cover: s.cover,
        synopsis: s.review,
        status: s.status,
        rating: s.rating,
        review: s.review,
        dateFinished: s.status === 'completed' ? '2024-0' + ((idx % 8) + 1) + '-20' : null,
        dateStarted: '2024-02-01',
        isFavorite: s.fav,
        addedAt: new Date(Date.now() - (idx + 1) * 86400000 * 4).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Save demo user & items
    const users = this.getUsers();
    if (!users.some(u => u.id === demoId)) {
      users.push(demoUser);
      this.saveUsers(users);
    }
    this.saveUserItems(demoId, demoItems);

    const demoActivities = [
      { id: 'act_1', type: 'rated', title: 'Interestelar', mediaType: 'movie', details: 'Avaliou com 5 estrelas', timestamp: '2024-09-28T14:32:00Z' },
      { id: 'act_2', type: 'finished', title: 'Duna (688 páginas)', mediaType: 'book', details: 'Concluiu a leitura e deu nota máxima', timestamp: '2024-09-25T19:15:00Z' },
      { id: 'act_3', type: 'reviewed', title: 'Dark', mediaType: 'series', details: 'Escreveu uma resenha sobre os paradoxos temporais', timestamp: '2024-09-20T21:40:00Z' },
      { id: 'act_4', type: 'favorite', title: 'Torto Arado', mediaType: 'book', details: 'Marcado como favorito ❤️', timestamp: '2024-09-18T10:11:00Z' },
      { id: 'act_5', type: 'rated', title: 'Severance (Ruptura)', mediaType: 'series', details: 'Avaliou com 5 estrelas', timestamp: '2024-09-10T16:05:00Z' },
      { id: 'act_6', type: 'added', title: 'A Revolução dos Bichos', mediaType: 'book', details: 'Iniciou a leitura ("Lendo Agora")', timestamp: '2024-09-02T11:20:00Z' }
    ];
    this.saveUserActivity(demoId, demoActivities);

    if (!this.getCurrentUser()) {
      this.setCurrentUser(demoUser);
    }
  }
};
