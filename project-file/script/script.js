const clientId = "5ba5248c4ec44b9bbecfd38df473919b";
const redirectUri = "https://zedfaceless.github.io/WDD330/project%20file/index.html";
const scopes = "user-read-private user-read-email";
console.log("🎵 script.js loaded");

// PKCE Helpers
function generateRandomString(len) {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)), b => b.toString(16).padStart(2, '0')).join('');
}
function base64UrlEncode(a) {
  return btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha256(v) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
}

// Redirect to Spotify
async function redirectToSpotifyAuth() {
  const verifier = generateRandomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));
  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    code_challenge_method: "S256",
    code_challenge: challenge
  });
  window.location = `https://accounts.spotify.com/authorize?${params}`;
}

// Exchange Code for Token + Setup App
async function handleRedirectAndSetup() {
  const code = new URLSearchParams(window.location.search).get("code");
  if (!code) return;

  const verifier = localStorage.getItem("spotify_code_verifier");
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code, redirect_uri: redirectUri, code_verifier: verifier
  });

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      window.history.replaceState({}, "", redirectUri);
      setupApp(data.access_token);
    } else {
      console.error("Token error:", data);
    }
  } catch (e) {
    console.error("Exchange failed:", e);
  }
}

// Fetch User Profile
async function fetchUserProfile(token) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const p = document.createElement("p");
  p.textContent = `🎉 Logged in as ${data.display_name || data.id}`;
  p.style.fontWeight = "bold";
  document.querySelector(".hero-content").appendChild(p);
}

// Search Music
async function searchMusic(token) {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { tracks } = await res.json();
  displayResults(tracks.items || []);
}

// Display Results
function displayResults(list) {
  const ul = document.getElementById("resultsList");
  ul.innerHTML = "";
  list.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${t.name}</strong> — ${t.artists[0].name}<br/>
      <button class="preview" data-preview="${t.preview_url}">▶️ Preview</button>
      <button class="lyrics" data-title="${t.name}" data-artist="${t.artists[0].name}">📝 Lyrics</button>
    `;
    ul.appendChild(li);
  });

  ul.querySelectorAll(".preview").forEach(b =>
    b.onclick = () => new Audio(b.dataset.preview).play()
  );
  ul.querySelectorAll(".lyrics").forEach(b =>
    b.onclick = () => fetchLyrics(b.dataset.title, b.dataset.artist)
  );
}

// Fetch Lyrics
async function fetchLyrics(title, artist) {
  const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  const { lyrics } = await res.json();
  document.getElementById("lyricsBox").textContent = lyrics || "❌ Lyrics not found.";
}

// Setup App after login
function setupApp(token) {
  fetchUserProfile(token);
  document.getElementById("searchBtn").onclick = () => searchMusic(token);
  document.getElementById("exploreBtn").onclick = () => {
    document.querySelector(".search-section").scrollIntoView({ behavior: "smooth" });
    document.getElementById("searchInput").focus();
  };
}

// Initialize on DOM load
window.onload = () => {
  document.getElementById("loginBtn").onclick = redirectToSpotifyAuth;

  const token = localStorage.getItem("spotify_access_token");
  if (token) setupApp(token);
  else handleRedirectAndSetup();
};
