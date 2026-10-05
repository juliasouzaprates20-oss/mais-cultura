// Dynamic Statistics & Metrics Engine for +Cultura
// Computes live page counters, watch times, averages, and distributions

const Stats = {
  computeUserStats(userId) {
    const items = Storage.getUserItems(userId) || [];
    
    // Subsets by media type
    const books = items.filter(i => i.type === 'book');
    const movies = items.filter(i => i.type === 'movie');
    const series = items.filter(i => i.type === 'series');

    // Finished subsets
    const booksRead = books.filter(b => b.status === 'read');
    const moviesWatched = movies.filter(m => m.status === 'watched');
    const seriesCompleted = series.filter(s => s.status === 'completed');

    // ----------------- GLOBAL STATS -----------------
    const totalItems = items.length;
    const ratedItems = items.filter(i => i.rating > 0);
    const avgGlobalRating = ratedItems.length > 0
      ? (ratedItems.reduce((acc, i) => acc + i.rating, 0) / ratedItems.length).toFixed(1)
      : '0.0';

    // ----------------- BOOKS STATS & PAGE COUNTER -----------------
    // Automatically sum pages of read books (or reading books)
    const totalPagesRead = booksRead.reduce((acc, b) => acc + (b.pages || 0), 0);
    const totalBooksReadCount = booksRead.length;
    const avgPagesPerBook = totalBooksReadCount > 0 ? Math.round(totalPagesRead / totalBooksReadCount) : 0;

    let longestBook = null;
    let shortestBook = null;
    if (booksRead.length > 0) {
      longestBook = booksRead.reduce((max, b) => (b.pages > (max.pages || 0) ? b : max), booksRead[0]);
      shortestBook = booksRead.reduce((min, b) => ((b.pages || 99999) < (min.pages || 99999) ? b : min), booksRead[0]);
    }

    // Genre frequency for books
    const bookGenreCounts = {};
    booksRead.forEach(b => {
      const g = b.genre || 'Outro';
      bookGenreCounts[g] = (bookGenreCounts[g] || 0) + 1;
    });
    const topBookGenre = this.getTopKeyFromObj(bookGenreCounts) || 'N/A';

    // Books average rating
    const ratedBooks = books.filter(b => b.rating > 0);
    const avgBookRating = ratedBooks.length > 0
      ? (ratedBooks.reduce((acc, b) => acc + b.rating, 0) / ratedBooks.length).toFixed(1)
      : '0.0';

    // ----------------- MOVIES STATS -----------------
    const totalMoviesWatchedCount = moviesWatched.length;
    const totalMovieDurationMinutes = moviesWatched.reduce((acc, m) => acc + (m.duration || 0), 0);
    const formattedMovieWatchTime = this.formatDuration(totalMovieDurationMinutes);

    const movieGenreCounts = {};
    const movieDirectorCounts = {};
    moviesWatched.forEach(m => {
      const g = m.genre || 'Outro';
      movieGenreCounts[g] = (movieGenreCounts[g] || 0) + 1;

      if (m.creator && m.creator !== 'Desconhecido') {
        movieDirectorCounts[m.creator] = (movieDirectorCounts[m.creator] || 0) + 1;
      }
    });
    const topMovieGenre = this.getTopKeyFromObj(movieGenreCounts) || 'N/A';
    const topMovieDirector = this.getTopKeyFromObj(movieDirectorCounts) || 'N/A';

    const ratedMovies = movies.filter(m => m.rating > 0);
    const avgMovieRating = ratedMovies.length > 0
      ? (ratedMovies.reduce((acc, m) => acc + m.rating, 0) / ratedMovies.length).toFixed(1)
      : '0.0';

    const favoriteMovies = movies.filter(m => m.isFavorite || m.rating === 5);

    // ----------------- SERIES STATS -----------------
    const totalSeriesCount = series.length;
    const totalSeriesFinishedCount = seriesCompleted.length;
    const totalSeasons = series.reduce((acc, s) => acc + (s.seasons || 1), 0);
    const totalEpisodes = series.reduce((acc, s) => acc + (s.episodes || 10), 0);
    // Approx 45 minutes per episode
    const totalSeriesMinutes = totalEpisodes * 45;
    const formattedSeriesWatchTime = this.formatDuration(totalSeriesMinutes);

    const seriesGenreCounts = {};
    series.forEach(s => {
      const g = s.genre || 'Outro';
      seriesGenreCounts[g] = (seriesGenreCounts[g] || 0) + 1;
    });
    const topSeriesGenre = this.getTopKeyFromObj(seriesGenreCounts) || 'N/A';

    const ratedSeries = series.filter(s => s.rating > 0);
    const avgSeriesRating = ratedSeries.length > 0
      ? (ratedSeries.reduce((acc, s) => acc + s.rating, 0) / ratedSeries.length).toFixed(1)
      : '0.0';

    const favoriteSeries = series.filter(s => s.isFavorite || s.rating === 5);

    // ----------------- RATINGS DISTRIBUTION (1 to 5 stars) -----------------
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedItems.forEach(i => {
      const star = Math.min(5, Math.max(1, Math.round(i.rating)));
      ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
    });

    // ----------------- OVERALL GENRE DISTRIBUTION (Donut Chart) -----------------
    const allGenreCounts = {};
    items.forEach(i => {
      const g = i.genre || 'Geral';
      allGenreCounts[g] = (allGenreCounts[g] || 0) + 1;
    });

    // Sort genres by count
    const sortedGenres = Object.entries(allGenreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Favorites list
    const allFavorites = items.filter(i => i.isFavorite || i.rating === 5);

    // Recently added items
    const recentlyAdded = [...items]
      .sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0))
      .slice(0, 8);

    return {
      totalItems,
      avgGlobalRating,
      allFavoritesCount: allFavorites.length,
      allFavorites,
      recentlyAdded,

      // Book Metrics
      books: {
        total: books.length,
        read: totalBooksReadCount,
        reading: books.filter(b => b.status === 'reading').length,
        wantToRead: books.filter(b => b.status === 'want_to_read').length,
        totalPagesRead,
        avgPagesPerBook,
        longestBook,
        shortestBook,
        topGenre: topBookGenre,
        avgRating: avgBookRating,
        genres: bookGenreCounts
      },

      // Movie Metrics
      movies: {
        total: movies.length,
        watched: totalMoviesWatchedCount,
        wantToWatch: movies.filter(m => m.status === 'want_to_watch').length,
        totalMinutes: totalMovieDurationMinutes,
        formattedWatchTime: formattedMovieWatchTime,
        topGenre: topMovieGenre,
        topDirector: topMovieDirector,
        avgRating: avgMovieRating,
        favoriteCount: favoriteMovies.length,
        favorites: favoriteMovies.slice(0, 5)
      },

      // Series Metrics
      series: {
        total: totalSeriesCount,
        completed: totalSeriesFinishedCount,
        watching: series.filter(s => s.status === 'watching').length,
        wantToWatch: series.filter(s => s.status === 'want_to_watch').length,
        paused: series.filter(s => s.status === 'paused').length,
        totalSeasons,
        totalEpisodes,
        totalMinutes: totalSeriesMinutes,
        formattedWatchTime: formattedSeriesWatchTime,
        topGenre: topSeriesGenre,
        avgRating: avgSeriesRating,
        favoriteCount: favoriteSeries.length,
        favorites: favoriteSeries.slice(0, 5)
      },

      // Charts Data
      ratingsChartData: ratingDistribution,
      genresChartData: sortedGenres.slice(0, 6)
    };
  },

  formatDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return '0h';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const days = (hours / 24).toFixed(1);

    if (hours < 24) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${hours}h (${days} dias)`;
  },

  getTopKeyFromObj(obj) {
    let topKey = null;
    let topVal = -1;
    for (const [k, v] of Object.entries(obj)) {
      if (v > topVal) {
        topVal = v;
        topKey = k;
      }
    }
    return topKey;
  },

  formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num || 0);
  }
};
