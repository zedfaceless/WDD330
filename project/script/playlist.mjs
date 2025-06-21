const STORAGE_KEY = "musicstream-favorites";

export function loadFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function addToFavorites(track) {
  const favorites = loadFavorites();

  if (favorites.some((f) => f.id === track.id)) return; // Avoid duplicates

  favorites.push(track);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function removeFromFavorites(trackId) {
  const updated = loadFavorites().filter((track) => track.id !== trackId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
