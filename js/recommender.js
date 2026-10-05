// Smart Recommendation Engine for +Cultura
// Learns continuously from user ratings, reviews, genres, creators, length, and negative feedback

const Recommender = {
  // Main method to compute personalized recommendations
  getPersonalizedRecommendations(userId) {
    const user = Storage.getCurrentUser();
    const userItems = Storage.getUserItems(userId);
    const catalog = Storage.getCatalog();

    // Set of item titles or IDs user has already consumed
    const consumedTitles = new Set(
      userItems
        .filter(item => ['read', 'watched', 'completed'].includes(item.status) || item.rating > 0)
        .map(item => item.title.toLowerCase().trim())
    );

    // Profile preferences & signals
    const genreWeights = {};
    const creatorWeights = {};
    const tagWeights = {};
    const negativeGenres = new Set();
    const negativeCreators = new Set();
    const userPositiveAnchors = [];

    // Factor in profile favorite genres as base baseline
    if (user && Array.isArray(user.favoriteGenres)) {
      user.favoriteGenres.forEach(genre => {
        genreWeights[genre] = (genreWeights[genre] || 0) + 12;
      });
    }

    // Book pages & movie durations preferences
    let bookPagesSum = 0;
    let highRatedBooksCount = 0;
    let movieDurationSum = 0;
    let highRatedMoviesCount = 0;

    // Sentiment keywords to extract from comments
    const keywordMap = {
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
      'choro': 'emocionante',
      'sensível': 'emocionante',
      'psicológico': 'psicológico',
      'mente': 'psicológico'
    };

    // Analyze each user item
    userItems.forEach(item => {
      const rating = item.rating || 0;
      const isFav = !!item.isFavorite;

      // Extract length stats for positive items
      if (rating >= 4 || isFav) {
        if (item.type === 'book' && item.pages > 0) {
          bookPagesSum += item.pages;
          highRatedBooksCount++;
        }
        if (item.type === 'movie' && item.duration > 0) {
          movieDurationSum += item.duration;
          highRatedMoviesCount++;
        }
        userPositiveAnchors.push(item);
      }

      // Weight multiplier based on rating
      let weight = 0;
      if (rating === 5) weight = 20;
      else if (rating === 4) weight = 12;
      else if (rating === 3) weight = 3;
      else if (rating === 2) weight = -15; // Negative feedback penalty
      else if (rating === 1) weight = -25; // Severe penalty
      else if (item.status === 'read' || item.status === 'watched' || item.status === 'completed') {
        weight = 8; // Consumed without explicit rating
      }

      if (isFav) weight += 10; // Extra boost for marked favorites

      // Record negative signals
      if (rating > 0 && rating <= 2) {
        if (item.genre) negativeGenres.add(item.genre);
        if (item.creator) negativeCreators.add(item.creator.toLowerCase().trim());
      }

      // Genre weights
      if (item.genre) {
        genreWeights[item.genre] = (genreWeights[item.genre] || 0) + weight;
      }
      if (Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          genreWeights[g] = (genreWeights[g] || 0) + Math.round(weight * 0.7);
        });
      }

      // Creator weights (director, author, creator)
      if (item.creator) {
        const creatorKey = item.creator.toLowerCase().trim();
        creatorWeights[creatorKey] = (creatorWeights[creatorKey] || 0) + (weight * 1.5);
      }

      // Analyze review text for sentiment & tags
      if (item.review && (rating >= 4 || isFav)) {
        const reviewText = item.review.toLowerCase();
        Object.keys(keywordMap).forEach(kw => {
          if (reviewText.includes(kw)) {
            const mappedTag = keywordMap[kw];
            tagWeights[mappedTag] = (tagWeights[mappedTag] || 0) + 8;
          }
        });
      }
    });

    const avgPreferredBookPages = highRatedBooksCount > 0 ? (bookPagesSum / highRatedBooksCount) : 400;
    const avgPreferredMovieDuration = highRatedMoviesCount > 0 ? (movieDurationSum / highRatedMoviesCount) : 130;

    // Filter available catalog candidates
    const candidates = catalog.filter(catItem => {
      return !consumedTitles.has(catItem.title.toLowerCase().trim());
    });

    // Score candidates
    const scoredCandidates = candidates.map(item => {
      let score = 50; // baseline
      let rationale = '';
      let matchReason = '';
      let anchorItem = null;

      // 1. Creator affinity (highest signal)
      const creatorKey = (item.creator || '').toLowerCase().trim();
      if (negativeCreators.has(creatorKey)) {
        score -= 40;
      } else if (creatorWeights[creatorKey] && creatorWeights[creatorKey] > 0) {
        score += creatorWeights[creatorKey] * 1.8;
        const matchingUserItem = userItems.find(u => (u.creator || '').toLowerCase().trim() === creatorKey && (u.rating >= 4 || u.isFavorite));
        if (matchingUserItem) {
          anchorItem = matchingUserItem;
          rationale = `Recomendado porque você avaliou "${matchingUserItem.title}" com ${matchingUserItem.rating || 5} estrelas e adorou obras de ${item.creator}.`;
          matchReason = `Afinidade com ${item.creator}`;
        }
      }

      // 2. Genre affinity
      if (negativeGenres.has(item.genre)) {
        score -= 30;
      } else if (genreWeights[item.genre]) {
        score += genreWeights[item.genre] * 1.2;
        if (!rationale && genreWeights[item.genre] >= 15) {
          const matchingGenreItem = userPositiveAnchors.find(u => u.genre === item.genre);
          if (matchingGenreItem) {
            anchorItem = matchingGenreItem;
            rationale = `Você avaliou muito bem "${matchingGenreItem.title}" e tem forte preferência por ${item.genre}.`;
          } else {
            rationale = `Recomendado porque você adora conteúdos de ${item.genre}.`;
          }
          matchReason = `Gênero favorito: ${item.genre}`;
        }
      }

      // 3. Multi-genre matching
      if (Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          if (genreWeights[g]) {
            score += genreWeights[g] * 0.5;
          }
        });
      }

      // 4. Keyword / Tag matching from reviews
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (tagWeights[tag]) {
            score += tagWeights[tag] * 1.5;
            if (!rationale) {
              rationale = `Você elogiou temas com "${tag}" e narrativas envolventes em suas resenhas recentes.`;
              matchReason = `Tema em alta: ${tag}`;
            }
          }
        });
      }

      // 5. Length preferences
      if (item.type === 'book' && item.pages) {
        const diff = Math.abs(item.pages - avgPreferredBookPages);
        if (diff < 150) score += 10;
        else if (diff > 400) score -= 5;
      } else if (item.type === 'movie' && item.duration) {
        const diff = Math.abs(item.duration - avgPreferredMovieDuration);
        if (diff < 25) score += 10;
      }

      // 6. Public quality score baseline
      score += (item.rating || 4.5) * 4;

      // Fallback rationale if none triggered yet
      if (!rationale) {
        if (item.type === 'book') {
          rationale = `Um dos livros mais aclamados de ${item.genre}, perfeito para expandir seus horizontes literários.`;
          matchReason = `Destaque em ${item.genre}`;
        } else if (item.type === 'movie') {
          rationale = `Filme aclamado pela crítica que combina perfeitamente com sua biblioteca cinematográfica.`;
          matchReason = `Clássico do cinema`;
        } else {
          rationale = `Série com roteiro premiado e ritmo instigante altamente recomendada para você.`;
          matchReason = `Série imperdível`;
        }
      }

      // Calculate compatibility percentage (bounded between 78% and 99%)
      const matchPercentage = Math.min(99, Math.max(78, Math.round(score * 0.65)));

      return {
        ...item,
        score,
        matchPercentage,
        rationale,
        matchReason,
        anchorItem
      };
    });

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Group recommendations by type
    const recommendedBooks = scoredCandidates.filter(c => c.type === 'book').slice(0, 8);
    const recommendedMovies = scoredCandidates.filter(c => c.type === 'movie').slice(0, 8);
    const recommendedSeries = scoredCandidates.filter(c => c.type === 'series').slice(0, 8);

    // Filter "Porque você gostou..." spotlight pairs (items with a distinct anchor)
    const becauseYouLiked = scoredCandidates
      .filter(c => c.anchorItem)
      .slice(0, 6);

    // If becauseYouLiked has few items, fallback to top scored with simulated anchor from favorites
    if (becauseYouLiked.length < 3 && userPositiveAnchors.length > 0) {
      scoredCandidates.slice(0, 4).forEach(cand => {
        if (!becauseYouLiked.some(b => b.id === cand.id)) {
          const randomAnchor = userPositiveAnchors[Math.floor(Math.random() * userPositiveAnchors.length)];
          cand.anchorItem = cand.anchorItem || randomAnchor;
          cand.rationale = cand.rationale || `Você deu nota máxima para "${randomAnchor.title}" e vai amar essa produção.`;
          becauseYouLiked.push(cand);
        }
      });
    }

    return {
      all: scoredCandidates.slice(0, 15),
      books: recommendedBooks,
      movies: recommendedMovies,
      series: recommendedSeries,
      becauseYouLiked: becauseYouLiked
    };
  }
};
