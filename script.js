// ==========================================
// 1. MASTER API KEYS 🔥
// ==========================================
const PEXELS_API_KEY = 'UxQv14FQkZKYn7KXFy9L1sM0Cf2ri5dCbDAzq8ODhhGhTjcChO9tKiGv';
const UNSPLASH_API_KEY = 'XHxACtjS2cDy-N6u-6re40OR2HN0de6YjPY1ZqAm1sE'; // (Optional)
const IMGBB_API_KEY = '09c18550e5cf82654630cbcc1c17d076'; // Tumhari ImgBB Chabi

const imageGrid = document.getElementById('image-grid');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('search-input');

let currentPage = 1; 
let isFetching = false; 
let currentSearch = ''; 
let activeImgUrl = ''; 
let customWallpapers = JSON.parse(localStorage.getItem('myCustomWalls')) || [];

// ==========================================
// 2. SECRET CLOUD UPLOADER ☁️
// ==========================================
let clickCount = 0;
function openSecretAdmin() {
    clickCount++;
    if(clickCount >= 3) { 
        document.getElementById('admin-panel').style.display = 'block'; 
        clickCount = 0; 
    }
}

async function uploadToCloud() {
    const fileInput = document.getElementById('image-upload');
    const statusText = document.getElementById('upload-status');

    if (fileInput.files.length === 0) {
        alert("Bhai, pehle gallery se ek photo toh select karo! 😅");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("image", file);

    statusText.style.display = "block";
    statusText.innerText = "Photo Cloud par ja rahi hai... Please wait ⏳";

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();

        if (data.success) {
            const imageUrl = data.data.url; 
            customWallpapers.unshift(imageUrl); 
            localStorage.setItem('myCustomWalls', JSON.stringify(customWallpapers));
            
            statusText.innerText = "Upload Successful! 🎉";
            alert("Khatarnak! 🔥 Tumhari photo successfully cloud par save ho gayi.");
            location.reload(); 
        } else {
            statusText.innerText = "Upload failed! ❌";
            alert("Kuch gadbad hui bhai. Fir se try karo.");
        }
    } catch (error) {
        console.error("Upload error:", error);
        statusText.innerText = "Network Error! ❌";
        alert("Internet connection check karo bhai.");
    }
}

function clearCustomWallpapers() {
    let confirmDelete = confirm("Kya aap sach mein apni daali hui saari photos hatana chahte hain?");
    if(confirmDelete) {
        localStorage.removeItem('myCustomWalls');
        alert("Saari custom photos delete ho gayin! Page refresh ho raha hai...");
        location.reload();
    }
}

// ==========================================
// 3. SEARCH & TAGS LOGIC
// ==========================================
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let query = searchInput.value.trim();
        if (query) {
            currentSearch = query;
            currentPage = 1;
            imageGrid.innerHTML = ''; 
            fetchWallpapers(currentPage, currentSearch); 
        }
    }
});

const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        currentSearch = tag.innerText; 
        searchInput.value = currentSearch; 
        currentPage = 1;
        imageGrid.innerHTML = ''; 
        fetchWallpapers(currentPage, currentSearch);
    });
});

// ==========================================
// 4. THE MIX ENGINE (Custom + Pexels + Unsplash)
// ==========================================
async function fetchWallpapers(page, query = '') {
    if (isFetching) return;
    isFetching = true; 
    loader.style.display = 'block'; 

    try {
        if(page === 1 && !query && customWallpapers.length > 0) {
            customWallpapers.forEach(url => createPhotoCard(url, url, 1080, 1920));
        }

        let pexelsData = [];
        let unsplashData = [];

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
        } catch (e) { console.log("Pexels load nahi hua"); }

        try {
            if(UNSPLASH_API_KEY !== 'YAHAN_APNI_UNSPLASH_ACCESS_KEY_DALNA') {
                let unsplashUrl = query 
                    ? `https://api.unsplash.com/search/photos?query=${query}&per_page=15&page=${page}&client_id=${UNSPLASH_API_KEY}`
                    : `https://api.unsplash.com/photos?per_page=15&page=${page}&client_id=${UNSPLASH_API_KEY}`;
                
                const uRes = await fetch(unsplashUrl);
                const uJson = await uRes.json();
                
                let uPhotos = query ? uJson.results : uJson;
                if(uPhotos && uPhotos.length) {
                    unsplashData = uPhotos.map(u => ({
                        thumb: u.urls.small, original: u.urls.full, w: u.width, h: u.height
                    }));
                }
            }
        } catch (e) { console.log("Unsplash skip hua"); }

        let mixedPhotos = [...pexelsData, ...unsplashData];
        mixedPhotos.sort(() => Math.random() - 0.5); 

        mixedPhotos.forEach(photo => {
            createPhotoCard(photo.thumb, photo.original, photo.w, photo.h);
        });

    } catch (error) {
        console.error("Engine Error:", error);
    }
    loader.style.display = 'none'; 
    isFetching = false; 
}

// ==========================================
// 5. ASLI FORCE DOWNLOAD LOGIC (BLOB) 🚀
// ==========================================

async function forceDownload(imageUrl, fileName) {
    try {
        const btn = document.getElementById('btn-original');
        const oldText = btn.innerHTML;
        btn.innerHTML = "⏳ Downloading...";

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || "AdiPixels_Premium.jpg"; 
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        btn.innerHTML = oldText;
    } catch (error) {
        console.error("Force download fail hua:", error);
        alert("Direct download me error aayi. Photo naye tab me khul rahi hai.");
        window.open(imageUrl, '_blank'); 
    }
}

function createPhotoCard(imgSrc, originalSrc, originalW, originalH) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.onclick = () => openModal(originalSrc, originalW, originalH);
    card.innerHTML = `<img src="${imgSrc}" loading="lazy" alt="4K HD Wallpaper">`;
    imageGrid.appendChild(card);
}

function openModal(imgUrl, w, h) {
    const modal = document.getElementById('download-modal');
    activeImgUrl = imgUrl; 
    modal.style.display = 'flex'; 
    setTimeout(() => { modal.classList.add('show'); }, 10);
    
    document.getElementById('resize-w').value = w || 1080;
    document.getElementById('resize-h').value = h || 1920;
    
    // Download hone par AdiPixels ka naam aayega
    document.getElementById('btn-original').onclick = () => {
        forceDownload(imgUrl, `AdiPixels_Original_${Date.now()}.jpg`);
    };
    
    const screenWidth = window.screen.width * window.devicePixelRatio;
    const screenHeight = window.screen.height * window.devicePixelRatio;
    document.getElementById('my-screen-res').innerText = `${Math.round(screenWidth)}x${Math.round(screenHeight)}px`;

    document.getElementById('btn-screen-download').onclick = () => {
        forceDownload(imgUrl, `AdiPixels_PhoneFit_${Date.now()}.jpg`);
    };
}

function closeModal() {
    const modal = document.getElementById('download-modal');
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function downloadCustomSize() {
    const w = document.getElementById('resize-w').value;
    const h = document.getElementById('resize-h').value;
    if(!w || !h) { alert("Pehle width aur height dalo!"); return; }
    
    const customUrl = `${activeImgUrl}?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
    forceDownload(customUrl, `AdiPixels_Custom_${w}x${h}.jpg`);
}

// ==========================================
// 6. INFINITE SCROLL
// ==========================================
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (!isFetching) { 
            currentPage++; 
            fetchWallpapers(currentPage, currentSearch); 
        }
    }
});

// INITIALIZE APP
fetchWallpapers(currentPage, currentSearch);
