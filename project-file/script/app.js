// script/app.js

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsList = document.getElementById("resultsList");
  const lyricsBox = document.getElementById("lyricsBox");

  const dummySongs = [
    { title: "Hello", artist: "Adele", lyrics: "Hello, it's me\nI was wondering if after all these years..." },
    { title: "Blinding Lights", artist: "The Weeknd", lyrics: "I said, ooh, I'm blinded by the lights..." },
    { title: "Someone Like You", artist: "Adele", lyrics: "Never mind, I'll find someone like you..." },
    { title: "Let It Be", artist: "The Beatles", lyrics: "When I find myself in times of trouble, Mother Mary comes to me..." }
  ];

  function searchSongs() {
    const query = searchInput.value.trim().toLowerCase();
    resultsList.innerHTML = "";
    lyricsBox.textContent = "Lyrics will appear here...";

    if (!query) return;

    const filtered = dummySongs.filter(song =>
      song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      resultsList.innerHTML = "<li>No songs found.</li>";
      return;
    }

    filtered.forEach(song => {
      const li = document.createElement("li");
      li.textContent = `${song.title} – ${song.artist}`;
      li.addEventListener("click", () => {
        lyricsBox.textContent = song.lyrics;
        lyricsBox.scrollIntoView({ behavior: "smooth" });
      });
      resultsList.appendChild(li);
    });
  }

  searchBtn.addEventListener("click", searchSongs);
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchSongs();
  });
});
