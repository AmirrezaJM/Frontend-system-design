async function loadMovies() {
  try {
    const res = await fetch("/api/movies");

    if (!res.ok) {
      throw new Error(`Failed to load movies: ${res.status}`);
    }

    const movies = await res.json();

    const container = document.getElementById("movies");
    container.innerHTML = "";

    movies.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <img src="${movie.posterUrl}" alt="${movie.title}" />
        <div class="movie-title">${movie.title}</div>
        <div class="movie-meta">${movie.durationMinutes} min</div>
        <p>${movie.description}</p>
        <div class="movie-actions">
          <button data-id="${movie.id}">Book ticket</button>
        </div>
      `;

      container.appendChild(card);
    });

    container.addEventListener("click", async (e) => {
      if (e.target.tagName === "BUTTON") {
        const id = e.target.getAttribute("data-id");
        const button = e.target;

        try {
          button.disabled = true;
          button.textContent = "Booking...";

          const res = await fetch(`/api/movies/${id}/book`, { method: "POST" });

          if (!res.ok) {
            throw new Error(`Booking failed: ${res.status}`);
          }

          alert("Booking request sent (fake 🙂)");
          button.textContent = "Book ticket";
        } catch (error) {
          console.error("Booking error:", error);
          alert("Failed to book ticket. Please try again.");
          button.textContent = "Book ticket";
        } finally {
          button.disabled = false;
        }
      }
    });
  } catch (error) {
    console.error("Error loading movies:", error);
    const container = document.getElementById("movies");
    container.innerHTML = `
      <div style="color: #ff6b6b; padding: 1rem; text-align: center;">
        <p>Failed to load movies. Please refresh the page.</p>
      </div>
    `;
  }
}

loadMovies();