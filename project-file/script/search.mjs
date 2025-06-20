import { fetchLyrics } from "./lyrics.mjs";
import { addToFavorites } from "./playlist.mjs";

export async function performSearch(query) {
  const token = "24bf9cff22ce4661839c62050f7e45b8";
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Spotify API error: ${response.status}`);
    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export function renderSearchResults(tracks) {
  const container = document.getElementById("search-results");
  container.innerHTML = "";

  if (!tracks.length) {
    container.innerHTML = "<p>No tracks found.</p>";
    return;
  }

  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "track-card";

    card.innerHTML = `
      <img src="${track.album.images[0].url}" alt="${track.name}" />
      <h3>${track.name}</h3>
      <p>${track.artists.map((a) => a.name).join(", ")}</p>
      <button class="lyrics-btn">Lyrics</button>
      <button class="fav-btn">Add to Favorites</button>
    `;

    card.querySelector(".lyrics-btn").addEventListener("click", () => {
      fetchLyrics(track.name, track.artists[0].name);
    });

    card.querySelector(".fav-btn").addEventListener("click", () => {
      addToFavorites(track);
      alert(`Added "${track.name}" to favorites`);
    });

    container.appendChild(card);
  });
}
