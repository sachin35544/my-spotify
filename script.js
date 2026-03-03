const songs = [
    { id: 0, title: "Midnight City", cover: "https://picsum.photos/id/10/200", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 1, title: "Blinding Lights", cover: "https://picsum.photos/id/20/200", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: 2, title: "Starboy", cover: "https://picsum.photos/id/30/200", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

let myPlaylists = [{ name: "Liked Songs", songs: [0, 1, 2], isLiked: true }];
let currentSongIndex = 0;
let isPlaying = false;
const audio = new Audio();

// DOM Elements
const playlistGrid = document.getElementById('playlist-grid');
const playlistListUI = document.getElementById('playlist-list');
const playBtn = document.getElementById('play-btn');
const songModal = document.getElementById('playlist-modal');
const createModal = document.getElementById('create-playlist-modal');

function init() {
    renderSongs();
    renderLibrary();
    loadSong(0, false);
    setupEventListeners();
}

function renderSongs() {
    playlistGrid.innerHTML = "";
    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<img src="${song.cover}"><h4>${song.title}</h4>`;
        card.onclick = () => loadSong(index);
        playlistGrid.appendChild(card);
    });
}

function renderLibrary() {
    playlistListUI.innerHTML = "";
    myPlaylists.forEach((list) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        const iconHTML = list.isLiked ? '<i data-lucide="heart"></i>' : '<i data-lucide="music-2"></i>';
        li.innerHTML = `<div class="playlist-icon ${list.isLiked ? 'liked-icon' : ''}">${iconHTML}</div>
            <div class="playlist-meta"><h4>${list.name}</h4><p>${list.songs.length} songs</p></div>`;
        playlistListUI.appendChild(li);
    });
    if (window.lucide) lucide.createIcons();
}

function setupEventListeners() {
    // Open Create Playlist Modal
    document.getElementById('create-playlist').onclick = () => {
        createModal.style.display = "flex";
    };

    // Save New Playlist
    document.getElementById('save-playlist-btn').onclick = () => {
        const nameInput = document.getElementById('new-playlist-name');
        if (nameInput.value.trim()) {
            myPlaylists.push({ name: nameInput.value, songs: [], isLiked: false });
            renderLibrary();
            createModal.style.display = "none";
            nameInput.value = "";
        }
    };

    document.getElementById('close-create-modal').onclick = () => createModal.style.display = "none";

    // Add Song to Playlist Modal
    document.getElementById('open-modal-btn').onclick = () => {
        songModal.style.display = "flex";
        renderModalContent();
    };

    document.getElementById('close-modal').onclick = () => songModal.style.display = "none";
    document.getElementById('done-btn').onclick = () => songModal.style.display = "none";

    // Player Controls
    playBtn.onclick = () => isPlaying ? pauseSong() : playSong();
    document.getElementById('next-btn').onclick = () => loadSong((currentSongIndex + 1) % songs.length);
    document.getElementById('prev-btn').onclick = () => loadSong((currentSongIndex - 1 + songs.length) % songs.length);

    // Audio Updates
    audio.ontimeupdate = () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById('progress-bar').value = progress;
            document.getElementById('current-time').innerText = formatTime(audio.currentTime);
            document.getElementById('duration').innerText = formatTime(audio.duration);
        }
    };
    document.getElementById('progress-bar').oninput = (e) => audio.currentTime = (e.target.value / 100) * audio.duration;
    document.getElementById('volume-slider').oninput = (e) => audio.volume = e.target.value / 100;

    window.onclick = (e) => {
        if (e.target == songModal) songModal.style.display = "none";
        if (e.target == createModal) createModal.style.display = "none";
    };
}

function renderModalContent() {
    const modalList = document.getElementById('modal-list');
    modalList.innerHTML = "";
    const currentId = songs[currentSongIndex].id;
    myPlaylists.forEach((list, index) => {
        const isChecked = list.songs.includes(currentId);
        const div = document.createElement('div');
        div.className = 'playlist-option';
        div.innerHTML = `<span>${list.name}</span><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleInPlaylist(${index}, ${currentId})">`;
        modalList.appendChild(div);
    });
}

window.toggleInPlaylist = function(listIdx, songId) {
    const list = myPlaylists[listIdx];
    const idx = list.songs.indexOf(songId);
    idx > -1 ? list.songs.splice(idx, 1) : list.songs.push(songId);
    renderLibrary();
};

function loadSong(index, shouldPlay = true) {
    currentSongIndex = index;
    const song = songs[currentSongIndex];
    audio.src = song.url;
    document.getElementById('track-title').innerText = song.title;
    document.getElementById('track-artist').innerText = song.artist;
    document.getElementById('current-album-art').src = song.cover;
    if (shouldPlay) playSong();
}

function playSong() { isPlaying = true; audio.play(); playBtn.innerHTML = '<i data-lucide="pause"></i>'; lucide.createIcons(); }
function pauseSong() { isPlaying = false; audio.pause(); playBtn.innerHTML = '<i data-lucide="play"></i>'; lucide.createIcons(); }
function formatTime(s) { const m = Math.floor(s/60), sec = Math.floor(s%60); return `${m}:${sec < 10 ? '0' : ''}${sec}`; }

init();