let tracks = [];
let currentIndex = -1;
let audio = new Audio();
let isPlaying = false;
let progressInterval = null;

// ── Fetch depuis l'API Deezer ──
function fetchMusic(query) {
  document.getElementById('tracksGrid').innerHTML = '<div class="loading"><div class="spinner"></div>Chargement...</div>';
  document.getElementById('sectionCount').textContent = '';

  const proxy = 'https://api.allorigins.win/get?url=';
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`;

  fetch(proxy + encodeURIComponent(url))
    .then(res => res.json())
    .then(data => {
      const parsed = JSON.parse(data.contents);
      const songs = parsed.data.map(track => ({
        title: track.title,
        artist: track.artist.name,
        preview: track.preview,
        cover: track.album.cover_medium
      }));
      tracks = songs;
      renderTracks();
    })
    .catch(() => {
      document.getElementById('tracksGrid').innerHTML = '<div class="loading">Erreur de chargement. Vérifiez votre connexion.</div>';
    });
}

// ── Afficher les cartes ──
function renderTracks() {
  const grid = document.getElementById('tracksGrid');
  document.getElementById('sectionCount').textContent = tracks.length + ' titres';

  if (tracks.length === 0) {
    grid.innerHTML = '<div class="loading">Aucun résultat trouvé.</div>';
    return;
  }

  grid.innerHTML = tracks.map((t, i) => `
    <div class="track-card ${i === currentIndex ? 'playing' : ''}" onclick="playTrack(${i})">
      <div class="track-cover">
        <img src="${t.cover}" alt="${t.title}" loading="lazy" />
        <div class="track-cover-overlay">
          ${i === currentIndex && isPlaying
            ? `<div class="equalizer"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>`
            : `<div class="play-btn">▶</div>`
          }
        </div>
      </div>
      <div class="track-info">
        <div class="track-title">${t.title}</div>
        <div class="track-artist">${t.artist}</div>
      </div>
    </div>
  `).join('');
}

// ── Jouer une piste ──
function playTrack(index) {
  if (currentIndex === index && isPlaying) {
    pauseTrack();
    return;
  }

  currentIndex = index;
  const track = tracks[index];

  document.getElementById('playerCover').src = track.cover;
  document.getElementById('playerTitle').textContent = track.title;
  document.getElementById('playerArtist').textContent = track.artist;
  document.getElementById('player').classList.add('visible');

  audio.pause();
  if (track.preview) {
    audio.src = track.preview;
    audio.play().catch(() => showToast('Aperçu non disponible pour ce titre.'));
  } else {
    showToast('Aperçu non disponible pour ce titre.');
  }

  isPlaying = true;
  document.getElementById('mainPlayBtn').textContent = '⏸';
  startProgress();
  renderTracks();
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  document.getElementById('mainPlayBtn').textContent = '▶';
  clearInterval(progressInterval);
  renderTracks();
}

function togglePlay() {
  if (currentIndex === -1) return;
  if (isPlaying) pauseTrack();
  else {
    audio.play().catch(() => {});
    isPlaying = true;
    document.getElementById('mainPlayBtn').textContent = '⏸';
    startProgress();
    renderTracks();
  }
}

function nextTrack() {
  if (tracks.length === 0) return;
  playTrack((currentIndex + 1) % tracks.length);
}

function prevTrack() {
  if (tracks.length === 0) return;
  playTrack((currentIndex - 1 + tracks.length) % tracks.length);
}

function startProgress() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    const duration = audio.duration || 30;
    const current = audio.currentTime || 0;
    document.getElementById('progressFill').style.width = (current / duration * 100) + '%';
    document.getElementById('currentTime').textContent = formatTime(current);
    document.getElementById('totalTime').textContent = formatTime(duration);
    if (current >= duration) nextTrack();
  }, 500);
}

function seekTo(e) {
  const pct = e.offsetX / e.currentTarget.offsetWidth;
  audio.currentTime = pct * (audio.duration || 30);
}

function setVolume(e) {
  const pct = Math.min(100, Math.max(0, (e.offsetX / e.currentTarget.offsetWidth) * 100));
  document.getElementById('volumeFill').style.width = pct + '%';
  audio.volume = pct / 100;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('sectionTitle').textContent = `Résultats : "${q}"`;
  fetchMusic(q);
}

function handleKey(e) {
  if (e.key === 'Enter') doSearch();
}

function searchGenre(genre, btn) {
  document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const titles = { pop: 'Tendances Pop', 'hip hop': 'Hip-Hop', afrobeats: 'Afrobeats 🌍', jazz: 'Jazz', lofi: 'Lofi' };
  document.getElementById('sectionTitle').textContent = titles[genre] || genre;
  fetchMusic(genre);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

audio.addEventListener('ended', nextTrack);

// ── Initialisation ──
fetchMusic('pop');