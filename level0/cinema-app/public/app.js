async function loadMovies() {
    const res = await fetch("/api/movies");
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
        await fetch(`/api/movies/${id}/book`, { method: "POST" });
        alert("Booking request sent (fake 🙂)");
      }
    }, { once: true });
  }
  
  loadMovies();
  