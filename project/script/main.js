import { performSearch, renderSearchResults } from "./search.mjs";
import { fetchLyrics } from "./lyrics.mjs";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  try {
    showLoading("search-results");
    const results = await performSearch(query);
    renderSearchResults(results);
  } catch (error) {
    displayError("search-results", "Search failed. Please try again later.");
    console.error(error);
  }
});

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "<p>Loading...</p>";
}

function displayError(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<p class="error">${message}</p>`;
}
