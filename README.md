# 🚀 AdiPixels - Premium 4K Wallpaper Engine

AdiPixels is a modern, fully responsive web application that provides high-quality 4K wallpapers. It is built with a serverless architecture, integrating external APIs for a seamless photo-fetching and cloud-uploading experience.

### ✨ Key Features
* **🌍 Infinite 4K Feed:** Fetches stunning, high-resolution wallpapers dynamically using the Pexels REST API.
* **☁️ Serverless Cloud Uploader:** Includes a hidden admin panel that allows the owner to upload images directly from their device gallery to the cloud using the ImgBB API.
* **💾 Direct Force Download:** Uses Blob object manipulation to bypass browser "new tab" behavior, forcing images to download directly to the user's local storage/gallery.
* **🎨 Premium Glassmorphism UI:** Designed with a modern, sleek, and translucent user interface using advanced CSS3.
* **📱 100% Mobile Responsive:** Perfectly optimized for mobile devices with a masonry grid layout.

### 🛠️ Tech Stack Used
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **APIs & Backend Logic:** * Pexels API (Image fetching)
  * ImgBB API (Cloud storage & image hosting)
* **Architecture:** Serverless, DOM Manipulation, Async/Await Fetch API

### 💡 How it works
1. The web app fetches a randomized feed of HD wallpapers.
2. Users can search for specific categories (AMOLED, Cars, Anime, etc.).
3. The custom download engine processes the image URL into a Blob and triggers an automatic local download.
4. The site owner can triple-tap the logo to reveal a secret cloud-uploader to add custom images to the top of the feed.

---
*Built with ❤️ by Aditya Kumar.*
