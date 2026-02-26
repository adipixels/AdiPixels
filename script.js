// ==========================================
// 1. MASTER API KEYS 🔥
// ==========================================
const PEXELS_API_KEY = 'UxQv14FQkZKYn7KXFy9L1sM0Cf2ri5dCbDAzq8ODhhGhTjcChO9tKiGv'; 
const IMGBB_API_KEY = '09c18550e5cf82654630cbcc1c17d076'; 

const imageGrid = document.getElementById('image-grid');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('search-input');

let currentPage = Math.floor(Math.random() * 50) + 1; 
let isFetching = false; 
let currentSearch = ''; 
let activeImgUrl = ''; 
let customWallpapers = JSON.parse(localStorage.getItem('myCustomWalls')) || [];
let seenImages = new Set(); 

// ==========================================
// 2. SECRET ADMIN & MINI GALLERY ☁️
// ==========================================
let clickCount = 0;
function openSecretAdmin() {
    clickCount++;
    if(clickCount >= 3) { 
        document.getElementById('admin-panel').style.display = 'block'; 
        renderAdminGallery(); 
        clickCount = 0; 
    }
}

// Mini Gallery Banane ka Engine
function renderAdminGallery() {
    const adminGallery = document.getElementById('admin-gallery');
    adminGallery.innerHTML = '';
    
    if(customWallpapers.length === 0) {
        adminGallery.innerHTML = '<p style="color:#94a3b8; font-size:12px;">No uploads yet.</p>';
        return;
    }

    customWallpapers.forEach((url, index) => {
        const div = document.createElement('div');
        div.style = "position: relative; min-width: 80px; height: 120px; flex-shrink: 0;";
        div.innerHTML = `
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
            <button onclick="deleteSingleWallpaper(${index})" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">✖</button>
        `;
        adminGallery.appendChild(div);
    });
}

// Sirf 1 Photo Delete Karne Wala Engine
function deleteSingleWallpaper(index) {
    if(confirm("Kya tum sirf is photo ko delete karna chahte ho?")) {
        customWallpapers.splice(index, 1); 
        localStorage.setItem('myCustomWalls', JSON.stringify(customWallpapers)); 
        renderAdminGallery(); 
        alert("Photo Delete ho gayi! 🗑️");
        location.reload(); 
    }
}

// Bulk Upload Engine
async function uploadToCloud() {
    const fileInput = document.getElementById('image-upload');
    const statusText = document.getElementById('upload-status');

    if (fileInput.files.length === 0) {
        alert("Pehle gallery se photos select karo! 😅");
        return;
    }

    const files = Array.from(fileInput.files);
    statusText.style.display = "block";
    statusText.innerText = `🚀 Uploading ${files.length} photos at once... Please wait ⏳`;

    const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST", body: formData
            });
            const data = await response.json();
            if (data.success) return data.data.url;
        } catch (e) { console.error("Upload error"); }
        return null;
    });

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter(url => url !== null);

    if (successfulUrls.length > 0) {
        customWallpapers = [...successfulUrls.reverse(), ...customWallpapers];
        localStorage.setItem('myCustomWalls', JSON.stringify(customWallpapers));
        statusText.innerText = `✅ ${successfulUrls.length} Photos Uploaded! 🎉`;
        location.reload(); // Code khud reload karega, tum mat karna!
    } else {
        statusText.innerText = "Upload failed! ❌ Network check karo.";
    }
}

// ==========================================
// 3. MAIN ENGINE & OTHER LOGIC
// ==========================================
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentSearch = searchInput.value.trim();
        if (currentSearch) {
            currentPage = 1; seenImages.clear(); imageGrid.innerHTML = ''; 
            fetchWallpapers(currentPage, currentSearch); 
        }
    }
});

const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        currentSearch = tag.innerText; searchInput.value = currentSearch; 
        currentPage = 1; seenImages.clear(); imageGrid.innerHTML = ''; 
        fetchWallpapers(currentPage, currentSearch);
    });
});

async function fetchWallpapers(page, query = '') {
    if (isFetching) return;
    isFetching = true; loader.style.display = 'block'; 

    try {
        // VIP ENTRY: Website khulte hi sabse pehle tumhari photos top par aayengi
        if(imageGrid.innerHTML === '' && customWallpapers.length > 0) {
            customWallpapers.forEach(url => {
                if(!seenImages.has(url)) {
                    seenImages.add(url);
                    createPhotoCard(url, url, 1080, 1920);
                }
            });
        }

        let pexelsData = [];
        try {
            let pexelsUrl = query 
                ? `https://api.pexels.com/v1/search?query=${query}&per_page=15&page=${page}` 
                : `https://api.pexels.com/v1/curated?per_page=15&page=${page}`;
            const pRes = await fetch(pexelsUrl, { headers: { Authorization: PEXELS_API_KEY } });
            const pJson = await pRes.json();
            if(pJson.photos) {
                pexelsData = pJson.photos.map(p => ({
                    thumb: p.src.portrait, original: p.src.original, w: p.width, h: p.height
                }));
            }
        } catch (e) {}

        let mixedPhotos = [...pexelsData];
        mixedPhotos.sort(() => Math.random() - 0.5); 

        // SMART FILTER: Duplicate photos ko rokna
        mixedPhotos.forEach(photo => {
            if (!seenImages.has(photo.original)) {
                seenImages.add(photo.original); 
                createPhotoCard(photo.thumb, photo.original, photo.w, photo.h);
            }
        });

    } catch (error) {}
    loader.style.display = 'none'; isFetching = false; 
}

// ==========================================
// 4. DOWNLOAD LOGIC
// ==========================================
async function forceDownload(imageUrl, fileName) {
    try {
        const btn = document.getElementById('btn-original');
        const oldText = btn.innerHTML; btn.innerHTML = "⏳ Downloading...";
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = blobUrl; a.download = fileName || "AdiPixels.jpg"; 
        document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(blobUrl);
        btn.innerHTML = oldText;
    } catch (error) { window.open(imageUrl, '_blank'); }
}

function createPhotoCard(imgSrc, originalSrc, originalW, originalH) {
    const card = document.createElement('div'); card.className = 'photo-card';
    card.onclick = () => openModal(originalSrc, originalW, originalH);
    card.innerHTML = `<img src="${imgSrc}" loading="lazy" alt="4K HD Wallpaper">`;
    imageGrid.appendChild(card);
}

function openModal(imgUrl, w, h) {
    const modal = document.getElementById('download-modal'); activeImgUrl = imgUrl; 
    modal.style.display = 'flex'; setTimeout(() => { modal.classList.add('show'); }, 10);
    document.getElementById('resize-w').value = w || 1080; document.getElementById('resize-h').value = h || 1920;
    
    document.getElementById('btn-original').onclick = () => { forceDownload(imgUrl, `AdiPixels_Original_${Date.now()}.jpg`); };
    const screenWidth = window.screen.width * window.devicePixelRatio;
    const screenHeight = window.screen.height * window.devicePixelRatio;
    document.getElementById('my-screen-res').innerText = `${Math.round(screenWidth)}x${Math.round(screenHeight)}px`;
    document.getElementById('btn-screen-download').onclick = () => { forceDownload(imgUrl, `AdiPixels_PhoneFit_${Date.now()}.jpg`); };
}

function closeModal() {
    const modal = document.getElementById('download-modal'); modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function downloadCustomSize() {
    const w = document.getElementById('resize-w').value; const h = document.getElementById('resize-h').value;
    if(!w || !h) return;
    const customUrl = `${activeImgUrl}?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
    forceDownload(customUrl, `AdiPixels_Custom_${w}x${h}.jpg`);
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (!isFetching) { currentPage++; fetchWallpapers(currentPage, currentSearch); }
    }
});

fetchWallpapers(currentPage, currentSearch);
