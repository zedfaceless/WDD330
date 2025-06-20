const clientId = '24bf9cff22ce4661839c62050f7e45b8';
const redirectUri = 'https://zedfaceless.github.io/WDD330/project%20file/index.html';
const scopes = 'user-read-private user-read-email';

window.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}` +
        `&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scopes)}`;
      window.location = authUrl;
    });
  }

  // Handle access token after redirect
  const hash = window.location.hash;
  if (hash) {
    const tokenMatch = hash.match(/access_token=([^&]*)/);
    if (tokenMatch) {
      const accessToken = tokenMatch[1];
      console.log("✅ Access Token:", accessToken);
      // You can now use this token to fetch data from Spotify APIs
    }
  }
});
