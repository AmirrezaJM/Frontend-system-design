const API_BASE = window.API_BASE;

// Fetch and display cache statistics
async function updateCacheStats() {
  try {
    const res = await fetch(`${API_BASE}/__cache-stats`);
    const stats = await res.json();

    const cacheInfo = document.getElementById('cache-info');
    cacheInfo.innerHTML = `
      Requests: ${stats.requests} | 
      Hits: <span style="color: #a8e6cf;">${stats.hits}</span> | 
      Misses: <span style="color: #ffaaa5;">${stats.misses}</span> | 
      Hit Rate: <strong>${stats.hitRate}</strong> | 
      Cached Items: ${stats.cachedItems}
    `;
  } catch (error) {
    console.error('Failed to fetch cache stats:', error);
  }
}

async function loadMovies() {
  try {
    const res = await fetch(`${API_BASE}/api/movies`);

    if (!res.ok) {
      throw new Error(`Failed to load movies: ${res.status}`);
    }

    const movies = await res.json();

    const container = document.getElementById("movies");
    container.innerHTML = "";

    movies.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";

      // Note: Using innerHTML with template strings. Safe here because data comes from our server,
      // but be cautious if movie data ever comes from user input.
      card.innerHTML = `
        <img src="${movie.posterUrl}" alt="${movie.title}" />
        <div class="movie-title">${movie.title}</div>
        <div class="movie-meta">${movie.durationMinutes} min</div>
        <p>${movie.description}</p>
        <button data-id="${movie.id}">Book ticket</button>
      `;

      container.appendChild(card);
    });

    // Event delegation for booking - listener persists for all clicks
    container.onclick = async (e) => {
      if (e.target.tagName === "BUTTON") {
        const id = e.target.dataset.id;
        const button = e.target;

        try {
          button.disabled = true;
          button.textContent = "Booking...";

          const res = await fetch(`${API_BASE}/api/movies/${id}/book`, { method: "POST" });

          if (!res.ok) {
            throw new Error(`Booking failed: ${res.status}`);
          }

          alert("Booking request sent (demo)");
          button.textContent = "Book ticket";
        } catch (error) {
          console.error("Booking error:", error);
          alert("Failed to book ticket. Please try again.");
          button.textContent = "Book ticket";
        } finally {
          button.disabled = false;
        }
      }
    };

    // Update cache stats after loading
    await updateCacheStats();
  } catch (error) {
    console.error("Error loading movies:", error);
    const container = document.getElementById("movies");
    container.innerHTML = `
      <div style="color: #ff6b6b; padding: 1rem; text-align: center;">
        <p>Failed to load movies. Please check that the CDN Edge server is running at ${API_BASE}</p>
        <p>Make sure all three servers are running:</p>
        <ul style="list-style: none; padding: 0;">
          <li>✅ API Server (port 3000)</li>
          <li>✅ Origin Server (port 8080)</li>
          <li>✅ CDN Edge Server (port 9000)</li>
        </ul>
      </div>
    `;
  }
}

loadMovies();

// Auto-refresh cache stats every 3 seconds
setInterval(updateCacheStats, 3000);
