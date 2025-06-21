// --- Spotify App Config ---
const clientId = "5ba5248c4ec44b9bbecfd38df473919b";
const redirectUri = "https://zedfaceless.github.io/WDD330/project%20file/index.html";
const scopes = "user-read-private user-read-email";

console.log("🎵 script.js loaded");

// --- PKCE Helpers ---
function generateRandomString(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(36)).join('');
}
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function createCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

// --- Redirect to Spotify ---
async function redirectToSpotifyAuth() {
  const verifier = generateRandomString(64);
  const challenge = await createCodeChallenge(verifier);
  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// --- Token Exchange ---
async function handleRedirectAndSetup() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return;

  const verifier = localStorage.getItem("spotify_code_verifier");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem("spotify_access_token", data.access_token);
    window.history.replaceState({}, "", redirectUri); // Remove code from URL
    setupApp(data.access_token);
  } else {
    console.error("❌ Token fetch failed:", data);
  }
}

// --- Fetch Profile Info ---
async function fetchUserProfile(token) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await res.json();
  const hero = document.querySelector(".hero-content");
  if (hero) {
    const p = document.createElement("p");
    p.textContent = `🎉 Logged in as ${user.display_name || user.id}`;
    hero.appendChild(p);
  }
}

// --- Search Music ---
async function searchMusic(token) {
  const input = document.getElementById("searchInput");
  const q = input?.value.trim();
  if (!q) return;

  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tracks = data.tracks?.items || [];
  displayResults(tracks, token);
}

// --- Display Results ---
function displayResults(tracks) {
  const list = document.getElementById("resultsList");
  list.innerHTML = "";
  tracks.forEach(track => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${track.name}</strong> by ${track.artists[0].name}<br/>
      <button data-url="${track.preview_url}">▶️ Preview</button>
      <button data-title="${track.name}" data-artist="${track.artists[0].name}">📝 Lyrics</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll("button[data-url]").forEach(btn => {
    btn.onclick = () => {
      const audio = new Audio(btn.dataset.url);
      audio.play();
    };
  });

  list.querySelectorAll("button[data-title]").forEach(btn => {
    btn.onclick = () => {
      fetchLyrics(btn.dataset.title, btn.dataset.artist);
    };
  });
}

// --- Fetch Lyrics ---
async function fetchLyrics(title, artist) {
  const lyricsBox = document.getElementById("lyricsBox");
  lyricsBox.textContent = "Loading lyrics...";
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await res.json();
    lyricsBox.textContent = data.lyrics || "❌ Lyrics not found.";
  } catch {
    lyricsBox.textContent = "❌ Lyrics fetch failed.";
  }
}

// --- App Setup ---
function setupApp(token) {
  fetchUserProfile(token);

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => searchMusic(token));
  }

  const exploreBtn = document.getElementById("exploreBtn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      const section = document.querySelector(".search-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", redirectToSpotifyAuth);
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const token = localStorage.getItem("spotify_access_token");

  if (code) {
    handleRedirectAndSetup();
  } else if (token) {
    setupApp(token);
  }
});
