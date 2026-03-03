// 1. Shuruat mein songs array khali rahega
let songs = []; 

// --- APNI DETAILS YAHAN BHARO ---
const GITHUB_USERNAME = "sachin35544"; // Apna GitHub username dalo
const REPO_NAME = "my-spotify";     // Apni Repo ka naam dalo
// -------------------------------

let myPlaylists = [{ name: "Liked Songs", songs: [], isLiked: true }];
let currentSongIndex = 0;
let isPlaying = false;
const audio = new Audio();

// DOM Elements
const playlistGrid = document.getElementById('playlist-grid');
const playlistListUI = document.getElementById('playlist-list');
const playBtn = document.getElementById('play-btn');
const songModal = document.getElementById('playlist-modal');
const createModal = document.getElementById('create-playlist-modal');

// 2. GitHub se Gaane Load karne ka Function
async function loadSongsFromGitHub() {
    const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/songs.json`;
    
    try {
        // cache: no-store taaki naya gaana add karte hi turant dikhe
        const response = await fetch(`${url}?t=${new Date().getTime()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("File nahi mili");
        
        songs = await response.json();
        console.log("Songs Loaded:", songs);

        // Gaane aane ke baad hi App shuru karein
        init(); 
    } catch (error) {
        console.error("Error loading songs:", error);
        // Agar GitHub fail ho jaye to purana hardcoded data backup ke liye
        songs = [{ id: 0, title: "Error Loading", cover: "", url: "" }];
        init();
    }
}

function init() {
    renderSongs();
    renderLibrary();
    if (songs.length > 0) {
        loadSong(0, false);
    }
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
    document.getElementById('create-playlist').onclick = () => createModal.style.display = "flex";

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
    document.getElementById('open-modal-btn').onclick = () => {
        songModal.style.display = "flex";
        renderModalContent();
    };

    document.getElementById('close-modal').onclick = () => songModal.style.display = "none";
    document.getElementById('done-btn').onclick = () => songModal.style.display = "none";

    playBtn.onclick = () => isPlaying ? pauseSong() : playSong();
    document.getElementById('next-btn').onclick = () => loadSong((currentSongIndex + 1) % songs.length);
    document.getElementById('prev-btn').onclick = () => loadSong((currentSongIndex - 1 + songs.length) % songs.length);

    audio.ontimeupdate = () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById('progress-bar').value = progress;
            document.getElementById('current-time').innerText = formatTime(audio.currentTime);
            document.getElementById('duration').innerText = formatTime(audio.duration);
        }
    };
    
    // Auto-next song when finished
    audio.onended = () => loadSong((currentSongIndex + 1) % songs.length);

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
    if (songs.length === 0) return;
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
    if (songs.length === 0) return;
    currentSongIndex = index;
    const song = songs[currentSongIndex];
    audio.src = song.url;
    document.getElementById('track-title').innerText = song.title;
    
    // Artist field fix (agar JSON mein artist nahi hai to empty rakhega)
    const artistUI = document.getElementById('track-artist');
    if(artistUI) artistUI.innerText = song.artist || "Unknown Artist";
    
    document.getElementById('current-album-art').src = song.cover;
    if (shouldPlay) playSong();
}

function playSong() { 
    isPlaying = true; 
    audio.play().catch(e => console.log("User interaction required")); 
    playBtn.innerHTML = '<i data-lucide="pause"></i>'; 
    if (window.lucide) lucide.createIcons(); 
}

function pauseSong() { 
    isPlaying = false; 
    audio.pause(); 
    playBtn.innerHTML = '<i data-lucide="play"></i>'; 
    if (window.lucide) lucide.createIcons(); 
}

function formatTime(s) { 
    const m = Math.floor(s/60), sec = Math.floor(s%60); 
    return `${m}:${sec < 10 ? '0' : ''}${sec}`; 
}

// 3. Sabse pehle GitHub se data mangwao
loadSongsFromGitHub();