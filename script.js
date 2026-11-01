// IRED MEMORIES ❤️
// Permanent browser storage

const DB_NAME = "IREDMemoriesDB";
const STORE_NAME = "photos";

let db;

// OPEN DATABASE
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = function(event) {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

// SAVE PHOTO
function savePhoto(photo) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");

        transaction.objectStore(STORE_NAME).put(photo);

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
}

// LOAD PHOTOS
function loadPhotos() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");

        const request = transaction.objectStore(STORE_NAME).getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// FLOATING HEARTS
function createHeart() {
    const heart = document.createElement("div");

    heart.textContent = "❤️";
    heart.className = "floating-heart";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (15 + Math.random() * 20) + "px";

    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 6000);
}

setInterval(createHeart, 1000);


// PHOTO VIEWER
function openPhoto(src) {
    document.getElementById("fullPhoto").src = src;
    document.getElementById("photoViewer").style.display = "flex";
}

function closePhoto() {
    document.getElementById("photoViewer").style.display = "none";
}


// LIKE SYSTEM
function setupLikes() {
    document.querySelectorAll(".photo-card").forEach((card, index) => {
        const img = card.querySelector("img");
        const button = card.querySelector("button");

        if (!img || !button) return;

        const id = card.dataset.photoId || img.getAttribute("src");

        card.dataset.photoId = id;

        const count = button.querySelector("span");
        const savedLikes = JSON.parse(
            localStorage.getItem("iredLikes") || "{}"
        );

        count.textContent = savedLikes[id] || 0;

        button.onclick = function() {
            const likes = JSON.parse(
                localStorage.getItem("iredLikes") || "{}"
            );

            likes[id] = (likes[id] || 0) + 1;

            localStorage.setItem("iredLikes", JSON.stringify(likes));

            count.textContent = likes[id];
        };
    });
}


// DISPLAY UPLOADED PHOTO
function displayPhoto(photo) {
    const gallery = document.querySelector(".gallery");

    if (gallery.querySelector(`[data-photo-id="${photo.id}"]`)) {
        return;
    }

    const card = document.createElement("div");
    card.className = "photo-card";
    card.dataset.photoId = photo.id;

    const img = document.createElement("img");
    img.src = photo.data;
    img.alt = "IRED Memory";
    img.onclick = () => openPhoto(img.src);

    const title = document.createElement("h3");
    title.textContent = "Special Memory ❤️";

    const button = document.createElement("button");
    button.innerHTML = '❤️ <span>0</span>';

    card.append(img, title, button);
    gallery.appendChild(card);

    setupLikes();
}


// UPLOAD PHOTOS
async function uploadPhotos(event) {
    const files = Array.from(event.target.files);

    for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const reader = new FileReader();

        const data = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const photo = {
            id: "upload_" + Date.now() + "_" + Math.random(),
            data: data
        };

        try {
            await savePhoto(photo);
            displayPhoto(photo);
        } catch (error) {
            alert("Could not save this picture. Storage may be full.");
        }
    }

    event.target.value = "";
}


// SAVE MESSAGES
function sendMessage() {
    const name = document.getElementById("visitorName").value.trim();
    const message = document.getElementById("visitorMessage").value.trim();

    if (!name || !message) {
        alert("Please enter your name and message ❤️");
        return;
    }

    const messages = JSON.parse(
        localStorage.getItem("iredMessages") || "[]"
    );

    messages.push({
        name: name,
        message: message,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("iredMessages", JSON.stringify(messages));

    document.getElementById("visitorName").value = "";
    document.getElementById("visitorMessage").value = "";

    displayMessages();

    alert("Your memory message has been saved! ❤️");
}


// DISPLAY SAVED MESSAGES
function displayMessages() {
    const list = document.getElementById("messageList");

    list.innerHTML = "";

    const messages = JSON.parse(
        localStorage.getItem("iredMessages") || "[]"
    );

    messages.forEach(item => {
        const card = document.createElement("div");
        card.className = "message";

        const heading = document.createElement("h3");
        heading.textContent = "💌 " + item.name;

        const paragraph = document.createElement("p");
        paragraph.textContent = item.message;

        const date = document.createElement("small");
        date.textContent = item.date;

        card.append(heading, paragraph, date);
        list.appendChild(card);
    });
}


// START WEBSITE
async function startMemories() {
    try {
        db = await openDatabase();

        const photos = await loadPhotos();

        photos.forEach(displayPhoto);

        displayMessages();
        setupLikes();

        console.log("IRED Memories is ready! ❤️");

    } catch (error) {
        console.error("Storage error:", error);
        alert("Browser storage could not be opened.");
    }
}

startMemories();
