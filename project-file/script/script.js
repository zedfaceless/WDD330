const clientId = '24bf9cff22ce4661839c62050f7e45b8';
const redirectUri = 'https://zedfaceless.github.io/WDD330/project%20file/index.html';
const scopes = 'user-read-private user-read-email';

window.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const authUrl = `https://accounts.spotify.com/authorize` +
        `?client_id=${clientId}` +
        `&response_type=token` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scopes)}`;
        
      // Redirect to Spotify login
      window.location.href = authUrl;
    });
  }

  // After redirect: extract the token from the URL hash
  const hash = window.location.hash;
  if (hash.includes('access_token')) {
    const tokenMatch = hash.match(/access_token=([^&]*)/);
    if (tokenMatch && tokenMatch[1]) {
      const accessToken = tokenMatch[1];
      console.log("✅ Access Token:", accessToken);

      // Display login success message
      const lyricsBox = document.getElementById('lyricsBox');
      if (lyricsBox) {
        lyricsBox.textContent = '🎉 Logged in with Spotify!';
      }

      // Store token (optional)
      localStorage.setItem('spotify_token', accessToken);
    }
  }
});
