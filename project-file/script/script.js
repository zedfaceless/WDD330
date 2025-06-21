const clientId = "5ba5248c4ec44b9bbecfd38df473919b";
const redirectUri = "https://zedfaceless.github.io/WDD330/project%20file/index.html";
const scopes = "user-read-private user-read-email";

console.log("🎵 script.js loaded");

// --- PKCE Helpers ---
function generateRandomString(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}
function base64UrlEncode(str) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}
async function createCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

// --- Redirect to Spotify Auth ---
async function redirectToSpotifyAuth() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const args = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location = `https://accounts.spotify.com/authorize?${args.toString()}`;
}

// --- Exchange Code for Token ---
async function handleRedirectAndSetup() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (!code) return;

  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      // Remove ?code= from URL
      window.history.replaceState({}, document.title, redirectUri);

      setupApp(data.access_token);
    } else {
      console.error("❌ Token error:", data);
    }
  } catch (err) {
    console.error("❌ Token fetch failed:", err);
  }
}

// --- Show Logged-in User ---
async function fetchUserProfile(token) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  const hero = document.querySelector(".hero-content");
  if (hero) {
    const msg = document.createElement("p");
    msg.textContent = `🎉 Logged in as ${data.display_name || data.id}`;
    msg.style.fontWeight = "bold";
    hero.appendChild(msg);
  }
}

// --- Search Music ---
async function searchMusic(token) {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const query = input.value.trim();
  if (!query) return;

  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  const results = data.tracks?.items || [];
  displayResults(results, token);
}

// --- Show Results ---
function displayResults(tracks, token) {
  const list = document.getElementById("resultsList");
  if (!list) return;

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
    btn.addEventListener("click", () => {
      const audio = new Audio(btn.dataset.url);
      audio.play();
    });
  });

  list.querySelectorAll("button[data-title]").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      const artist = btn.dataset.artist;
      fetchLyrics(title, artist);
    });
  });
}

// --- Fetch Lyrics ---
async function fetchLyrics(title, artist) {
  const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  const data = await response.json();

  const lyricsBox = document.getElementById("lyricsBox");
  if (!lyricsBox) return;

  lyricsBox.textContent = data.lyrics || "❌ No lyrics found.";
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
        const input = document.getElementById("searchInput");
        if (input) input.focus();
      }
    });
  }
}

// --- Initialize ---
window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", redirectToSpotifyAuth);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = localStorage.getItem("spotify_access_token");

  if (urlParams.has("code")) {
    handleRedirectAndSetup(); // This calls setupApp internally
  } else if (token) {
    setupApp(token);
  }
});
