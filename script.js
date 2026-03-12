let tracks = []
let currentIndex = 0
let audio = new Audio()

function fetchMusic(query) {
  document.getElementById("tracksGrid").innerHTML = "Chargement..."

  fetch(`https://striveschool-api.herokuapp.com/api/deezer/search?q=${query}`)
    .then(res => res.json())
    .then(data => {
      tracks = data.data
      renderTracks()
    })
}

function renderTracks() {
  let grid = document.getElementById("tracksGrid")
  grid.innerHTML = ""

  tracks.forEach((track, i) => {
    grid.innerHTML += `
      <div class="track" onclick="playTrack(${i})">
        <img src="${track.album.cover_medium}">
        <h3>${track.title}</h3>
        <p>${track.artist.name}</p>
      </div>
    `
  })
}

function playTrack(index) {
  let track = tracks[index]
  currentIndex = index
  audio.src = track.preview
  audio.play()
  document.getElementById("playerCover").src = track.album.cover_medium
  document.getElementById("playerTitle").innerText = track.title
  document.getElementById("playerArtist").innerText = track.artist.name
}

function togglePlay() {
  if (audio.paused) {
    audio.play()
  } else {
    audio.pause()
  }
}

function nextTrack() {
  currentIndex++
  if (currentIndex >= tracks.length) {
    currentIndex = 0
  }
  playTrack(currentIndex)
}

function prevTrack() {
  currentIndex--
  if (currentIndex < 0) {
    currentIndex = tracks.length - 1
  }
  playTrack(currentIndex)
}

function doSearch() {
  let query = document.getElementById("searchInput").value
  fetchMusic(query)
}

function searchGenre(genre) {
  fetchMusic(genre)
}

fetchMusic("pop")