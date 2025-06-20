export async function fetchLyrics(songTitle, artist) {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`;
  const lyricsContainer = document.getElementById("lyrics");

  lyricsContainer.innerHTML = "<p>Loading lyrics...</p>";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Lyrics not found");

    const data = await response.json();
    lyricsContainer.textContent = data.lyrics || "Lyrics unavailable.";
  } catch (error) {
    console.error("Lyrics error:", error);
    lyricsContainer.textContent = "Unable to fetch lyrics.";
  }
}
