// Smart Multi-Level Recommendation Engine for +Cultura
// Structured in 3 intelligence levels: Direct Signals, Consumption Patterns & Future Extensibility

const Recommender = {
  // Keyword dictionary to identify emotional/thematic preferences from reviews
  keywordMap: {
    'viagem no tempo': 'viagem no tempo',
    'temporal': 'viagem no tempo',
    'paradoxo': 'viagem no tempo',
    'espaço': 'espaço',
    'universo': 'espaço',
    'planeta': 'espaço',
    'complexo': 'complexo',
    'reviravolta': 'reviravoltas',
    'final surpreendente': 'reviravoltas',
    'filosófico': 'filosófico',
    'filosofia': 'filosófico',
    'distopia': 'distopia',
    'totalitário': 'distopia',
    'máfia': 'máfia',
    'crime': 'máfia',
    'investigação': 'investigação',
    'detetive': 'investigação',
    'épico': 'épico',
    'fantasia': 'fantasia',
    'magia': 'magia',
    'emocionante': 'emocionante',
    'sensível': 'emocionante',
    'psicológico': 'psicológico',
    'mente': 'psicológico'
  },

  // Main method to compute personalized recommendations across Levels 1, 2, and 3
  getPersonalizedRecommendations(userId) {
    const user = Storage.getCurrentUser();
    const userItems = Storage.getUserItems(userId) || [];
    const catalog = Storage.getCatalog() || [];

    // Set of titles user already has in library
    const consumedTitles = new Set(
      userItems.map(item => (item.title || '').toLowerCase().trim())
    );

    // ==========================================
    // NÍVEL 1 & NÍVEL 2: EXTRAÇÃO DE PERFIL E SINAIS
    // ==========================================
    const genreWeights = {};
    const genreCounts = {};
    const genrePositiveCounts = {};
    const genreNegativeCounts = {};
    const creatorWeights = {};
    const tagWeights = {};
    const negativeGenres = new Set();
    const negativeCreators = new Set();
    
    // High affinity anchors (rated 4-5 or favorited)
    const positiveAnchors = [];

    // Base profile genres (Nível 1)
    if (user && Array.isArray(user.favoriteGenres)) {
      user.favoriteGenres.forEach(genre => {
        genreWeights[genre] = (genreWeights[genre] || 0) + 14;
      });
    }

    // Onboarding-derived preferences (Nível 1 — explicit user input)
    let onboardingPreferredFormats = [];
    if (user && user.id !== 'usr_demo_lucas') {
      const onboardingData = Storage.getOnboarding(user.id);
      if (onboardingData) {
        // Boost genres from onboarding (slightly stronger than favoriteGenres since they're explicit)
        if (Array.isArray(onboardingData.preferredGenres)) {
          onboardingData.preferredGenres.forEach(genre => {
            genreWeights[genre] = (genreWeights[genre] || 0) + 18;
          });
        }
        // Track preferred formats to boost matching type candidates
        if (Array.isArray(onboardingData.preferredFormats)) {
          onboardingPreferredFormats = onboardingData.preferredFormats;
        }
      }
    }

    // Metrics for consumption patterns (Nível 2)
    let bookPagesSum = 0;
    let highRatedBooksCount = 0;
    let movieDurationSum = 0;
    let highRatedMoviesCount = 0;
    let completedItemsCount = 0;

    userItems.forEach(item => {
      const rating = parseFloat(item.rating) || 0;
      const isFav = !!item.isFavorite;
      const isCompleted = ['read', 'watched', 'completed'].includes(item.status);

      if (isCompleted) completedItemsCount++;

      // Track genre consumption count (Nível 2)
      if (item.genre) {
        genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
      }

      // Weight based on explicit rating and favorite status (Nível 1)
      let weight = 0;
      if (rating === 5) weight = 22;
      else if (rating === 4) weight = 14;
      else if (rating === 3) weight = 4;
      else if (rating === 2) weight = -15; // Negative feedback
      else if (rating === 1) weight = -30; // Strong negative feedback
      else if (isCompleted) weight = 8;

      if (isFav) weight += 12; // Extra boost for favorites

      if (rating >= 4 || isFav) {
        positiveAnchors.push(item);
        if (item.type === 'book' && item.pages > 0) {
          bookPagesSum += item.pages;
          highRatedBooksCount++;
        }
        if (item.type === 'movie' && item.duration > 0) {
          movieDurationSum += item.duration;
          highRatedMoviesCount++;
        }
      }

      // Record sentiment signals avoiding treating a single low rating as total genre rejection
      if (item.genre) {
        if (rating > 0 && rating <= 2) {
          genreNegativeCounts[item.genre] = (genreNegativeCounts[item.genre] || 0) + 1;
        } else if (rating >= 4 || isFav) {
          genrePositiveCounts[item.genre] = (genrePositiveCounts[item.genre] || 0) + 1;
        }
      }
      if (rating > 0 && rating <= 2 && item.creator) {
        negativeCreators.add(item.creator.toLowerCase().trim());
      }

      // Genre weights (Nível 1 & 2)
      if (item.genre) {
        genreWeights[item.genre] = (genreWeights[item.genre] || 0) + weight;
      }
      if (Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          genreWeights[g] = (genreWeights[g] || 0) + Math.round(weight * 0.7);
        });
      }

      // Creator weights (author, director, creator)
      if (item.creator && item.creator !== 'Desconhecido') {
        const creatorKey = item.creator.toLowerCase().trim();
        creatorWeights[creatorKey] = (creatorWeights[creatorKey] || 0) + (weight * 1.8);
      }

      // Review sentiment analysis (Nível 2)
      if (item.review && (rating >= 4 || isFav)) {
        const reviewText = item.review.toLowerCase();
        Object.keys(this.keywordMap).forEach(kw => {
          if (reviewText.includes(kw)) {
            const mappedTag = this.keywordMap[kw];
            tagWeights[mappedTag] = (tagWeights[mappedTag] || 0) + 10;
          }
        });
      }
    });

    // Determine truly rejected genres (where negative votes strictly exceed positive votes and >= 2 negatives)
    Object.keys(genreNegativeCounts).forEach(g => {
      const negs = genreNegativeCounts[g] || 0;
      const pos = genrePositiveCounts[g] || 0;
      if (negs >= 2 && negs > pos) {
        negativeGenres.add(g);
      }
    });

    const avgPreferredBookPages = highRatedBooksCount > 0 ? (bookPagesSum / highRatedBooksCount) : 380;
    const avgPreferredMovieDuration = highRatedMoviesCount > 0 ? (movieDurationSum / highRatedMoviesCount) : 130;

    // Filter available candidates from catalog (strictly exclude items already in user's library)
    const candidates = catalog.filter(catItem => {
      return !Storage.isItemInLibrary(userId, catItem);
    });

    // Score candidates with clear rationale
    const scoredCandidates = candidates.map(item => {
      let score = 50; // base score
      let rationale = '';
      let matchReason = '';
      let anchorItem = null;

      const creatorKey = (item.creator || '').toLowerCase().trim();

      // ==========================================
      // NÍVEL 1: SINAIS DIRETOS (Autor, Diretor, Gênero, Favorito, Avaliação)
      // ==========================================
      if (negativeCreators.has(creatorKey)) {
        score -= 45;
      } else if (creatorWeights[creatorKey] && creatorWeights[creatorKey] > 0) {
        score += creatorWeights[creatorKey] * 2.0;
        const matchingUserItem = userItems.find(u => 
          (u.creator || '').toLowerCase().trim() === creatorKey && (u.rating >= 4 || u.isFavorite)
        );
        if (matchingUserItem) {
          anchorItem = matchingUserItem;
          const role = item.type === 'book' ? 'do mesmo autor' : item.type === 'movie' ? 'do mesmo diretor' : 'do mesmo criador';
          rationale = `${role.charAt(0).toUpperCase() + role.slice(1)} de "${matchingUserItem.title}" (${item.creator}).`;
          matchReason = `Criador em destaque: ${item.creator}`;
        }
      }

      if (negativeGenres.has(item.genre)) {
        score -= 35;
      } else if (genreWeights[item.genre]) {
        score += genreWeights[item.genre] * 1.3;
        if (!rationale && genreWeights[item.genre] >= 14) {
          const matchingGenreItem = positiveAnchors.find(u => u.genre === item.genre);
          if (matchingGenreItem) {
            anchorItem = matchingGenreItem;
            if (matchingGenreItem.isFavorite) {
              rationale = `Porque você favoritou "${matchingGenreItem.title}" e adora ${item.genre}.`;
            } else if (matchingGenreItem.rating >= 4) {
              rationale = `Porque você avaliou "${matchingGenreItem.title}" com nota alta.`;
            } else {
              rationale = `Você costuma gostar de conteúdos de ${item.genre}.`;
            }
          } else {
            rationale = `Você costuma gostar de ${item.genre}.`;
          }
          matchReason = `Gênero: ${item.genre}`;
        }
      }

      // Multi-genre affinity
      if (Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          if (genreWeights[g]) {
            score += genreWeights[g] * 0.4;
          }
        });
      }

      // Review / Tag matching (Nível 2)
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (tagWeights[tag]) {
            score += tagWeights[tag] * 1.6;
            if (!rationale) {
              rationale = `Com base nas suas resenhas sobre temas de "${tag}".`;
              matchReason = `Tema favorito: ${tag}`;
            }
          }
        });
      }

      // Volume & Length Patterns (Nível 2)
      if (item.type === 'book' && item.pages) {
        const diff = Math.abs(item.pages - avgPreferredBookPages);
        if (diff < 120) score += 12;
        else if (diff > 450) score -= 8;
      } else if (item.type === 'movie' && item.duration) {
        const diff = Math.abs(item.duration - avgPreferredMovieDuration);
        if (diff < 25) score += 12;
      }

      // Onboarding preferred format boost (explicit user preference)
      if (onboardingPreferredFormats.length > 0 && onboardingPreferredFormats.includes(item.type)) {
        score += 20;
      }

      // Baseline public rating factor (Nível 1)
      score += (item.rating || 4.5) * 4;

      // ==========================================
      // NÍVEL 3: PREPARAÇÃO PARA ALGORITMOS FUTUROS
      // ==========================================
      // Framework pronto para plugar vetores de embeddings / IA local
      score = this._applyLevel3FutureScore(item, userItems, score);

      // Fallback transparente se não houver dados específicos suficientes
      if (!rationale) {
        if (positiveAnchors.length > 0) {
          const firstAnchor = positiveAnchors[0];
          rationale = `Parecido com "${firstAnchor.title}" no ritmo e temática.`;
          matchReason = 'Conteúdo semelhante';
        } else {
          rationale = 'Recomendado para você com base na curadoria cultural.';
          matchReason = 'Recomendado para você';
        }
      }

      const matchPercentage = Math.min(99, Math.max(80, Math.round(score * 0.65)));

      return {
        ...item,
        score,
        matchPercentage,
        rationale,
        matchReason,
        anchorItem
      };
    });

    // Deterministic sort: score descending, then rating, then title
    scoredCandidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (a.title || '').localeCompare(b.title || '');
    });

    const recommendedBooks = scoredCandidates.filter(c => c.type === 'book').slice(0, 8);
    const recommendedMovies = scoredCandidates.filter(c => c.type === 'movie').slice(0, 8);
    const recommendedSeries = scoredCandidates.filter(c => c.type === 'series').slice(0, 8);

    // Filter "Porque você gostou..." spotlight items (has explicit anchor)
    const becauseYouLiked = scoredCandidates
      .filter(c => c.anchorItem)
      .slice(0, 6);

    // Deterministic fallback if few items have explicit anchors
    if (becauseYouLiked.length < 3 && positiveAnchors.length > 0) {
      scoredCandidates.slice(0, 4).forEach((cand, idx) => {
        if (!becauseYouLiked.some(b => b.id === cand.id)) {
          const anchor = positiveAnchors[idx % positiveAnchors.length];
          cand.anchorItem = cand.anchorItem || anchor;
          if (!cand.rationale || cand.rationale.startsWith('Recomendado para você')) {
            cand.rationale = `Porque você avaliou "${anchor.title}" com ${anchor.rating || 5} estrelas.`;
          }
          becauseYouLiked.push(cand);
        }
      });
    }

    return {
      all: scoredCandidates.slice(0, 16),
      books: recommendedBooks,
      movies: recommendedMovies,
      series: recommendedSeries,
      becauseYouLiked: becauseYouLiked
    };
  },

  // Level 3 Extensibility Hook for future Machine Learning / Embeddings
  _applyLevel3FutureScore(item, userItems, currentScore) {
    // Structure prepared for collaborative filtering or semantic vector similarity
    return currentScore;
  },

  // Related recommendations for Item Details Page ("Você também pode gostar")
  getRelatedRecommendations(targetItem, count = 4) {
    if (!targetItem) return [];
    const catalog = Storage.getCatalog() || [];
    const user = Storage.getCurrentUser();
    const userId = user ? user.id : null;
    const targetTitle = (targetItem.title || '').toLowerCase().trim();
    const targetCreator = (targetItem.creator || '').toLowerCase().trim();
    const targetGenre = (targetItem.genre || '').toLowerCase();
    const targetTags = Array.isArray(targetItem.tags) ? targetItem.tags.map(t => t.toLowerCase()) : [];

    const candidates = catalog.filter(c => {
      if ((c.title || '').toLowerCase().trim() === targetTitle || c.id === targetItem.id) return false;
      if (userId && Storage.isItemInLibrary(userId, c)) return false;
      return true;
    });

    const scored = candidates.map(c => {
      let simScore = 0;
      let relationReason = '';

      // Same creator is highest affinity
      if (c.creator && c.creator.toLowerCase().trim() === targetCreator && targetCreator !== 'desconhecido') {
        simScore += 60;
        relationReason = `Do mesmo ${c.type === 'book' ? 'autor' : c.type === 'movie' ? 'diretor' : 'criador'} (${c.creator})`;
      }

      // Same primary genre
      if (c.genre && c.genre.toLowerCase() === targetGenre) {
        simScore += 35;
        if (!relationReason) relationReason = `Do mesmo gênero (${c.genre})`;
      }

      // Same format bonus
      if (c.type === targetItem.type) {
        simScore += 15;
      }

      // Tag overlap
      if (Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          if (targetTags.includes(t.toLowerCase())) {
            simScore += 10;
            if (!relationReason) relationReason = `Tema compartilhado: ${t}`;
          }
        });
      }

      // Public rating tiebreaker
      simScore += (c.rating || 4.5) * 3;

      if (!relationReason) {
        relationReason = `História aclamada de ${c.genre}`;
      }

      return {
        ...c,
        simScore,
        relationReason
      };
    });

    scored.sort((a, b) => b.simScore - a.simScore);
    return scored.slice(0, count);
  }
};
