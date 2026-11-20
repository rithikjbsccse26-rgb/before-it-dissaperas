// Sample memories shown in the archive.
const sampleMemories = [
    {
        id: "sample-1",
        title: "The Quiet Streets",
        place: "A familiar neighbourhood",
        category: "Childhood",
        story: "The streets where evening walks felt endless and every sunset seemed special.",
        image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900",
        date: "2026-01-01"
    },
    {
        id: "sample-2",
        title: "The Old Bookshop",
        place: "A little bookshop",
        category: "Childhood",
        story: "A little shop filled with books, quiet corners and beautiful memories.",
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900",
        date: "2026-01-02"
    },
    {
        id: "sample-3",
        title: "Somewhere by the Sea",
        place: "The coast",
        category: "Nature",
        story: "The sound of waves and a thousand thoughts left behind.",
        image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900",
        date: "2026-01-03"
    },
    {
        id: "sample-4",
        title: "Mountain Morning",
        place: "The mountains",
        category: "Travel",
        story: "A peaceful morning surrounded by mountains and fresh air.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",
        date: "2026-01-04"
    },
    {
        id: "sample-5",
        title: "An Evening Together",
        place: "With friends",
        category: "Friends",
        story: "A simple evening with friends that became a special memory.",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900",
        date: "2026-01-05"
    }
];

const MEMORY_KEY = "memories";
const FAVOURITE_KEY = "favourites";

function getSavedMemories() {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
}

function saveMemories(memories) {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
}

function getFavourites() {
    return JSON.parse(localStorage.getItem(FAVOURITE_KEY) || "[]");
}

function saveFavourites(favourites) {
    localStorage.setItem(FAVOURITE_KEY, JSON.stringify(favourites));
}

// HOME PAGE: photo preview and memory form.
const memoryForm = document.getElementById("memoryForm");

if (memoryForm) {
    const photoInput = document.getElementById("photo");
    const photoPreview = document.getElementById("photoPreview");

    document.getElementById("memoryCount").textContent = getSavedMemories().length;

    photoInput.addEventListener("change", function () {
        const file = photoInput.files[0];

        if (!file) {
            photoPreview.hidden = true;
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("Please choose an image smaller than 1 MB.");
            photoInput.value = "";
            photoPreview.hidden = true;
            return;
        }

        const reader = new FileReader();
        reader.onload = function () {
            photoPreview.src = reader.result;
            photoPreview.hidden = false;
        };
        reader.readAsDataURL(file);
    });

    memoryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const file = photoInput.files[0];

        function addMemory(photoData) {
            const newMemory = {
                id: "user-" + Date.now(),
                title: document.getElementById("title").value.trim(),
                place: document.getElementById("place").value.trim(),
                category: document.getElementById("category").value,
                story: document.getElementById("story").value.trim(),
                image: photoData,
                date: new Date().toISOString()
            };

            const memories = getSavedMemories();
            memories.push(newMemory);

            try {
                saveMemories(memories);
                document.getElementById("formMessage").textContent =
                    "Your memory has been saved in this browser.";
                memoryForm.reset();
                photoPreview.hidden = true;
                document.getElementById("memoryCount").textContent = memories.length;
            } catch (error) {
                memories.pop();
                document.getElementById("formMessage").textContent =
                    "Storage is full. Try a smaller photo.";
            }
        }

        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                addMemory(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            addMemory("");
        }
    });
}

// MEMORIES PAGE: search, category filter, favourites and memory cards.
const gallery = document.getElementById("memoryGallery");

if (gallery) {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("filterCategory");
    const sortOrder = document.getElementById("sortOrder");
    const favouritesOnly = document.getElementById("favouritesOnly");

    function showMemories() {
        let memories = sampleMemories.concat(getSavedMemories());
        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const favourites = getFavourites();

        memories = memories.filter(function (memory) {
            const matchesSearch =
                memory.title.toLowerCase().includes(searchText) ||
                memory.place.toLowerCase().includes(searchText) ||
                memory.story.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "All" || memory.category === selectedCategory;

            const matchesFavourite =
                !favouritesOnly.checked || favourites.includes(memory.id);

            return matchesSearch && matchesCategory && matchesFavourite;
        });

        memories.sort(function (a, b) {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder.value === "newest" ? dateB - dateA : dateA - dateB;
        });

        gallery.innerHTML = "";

        if (memories.length === 0) {
            gallery.textContent = "No memories found.";
            return;
        }

        memories.forEach(function (memory) {
            const card = document.createElement("article");
            card.className = "memory-card";

            const image = document.createElement("img");
            image.src = memory.image || "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900";
            image.alt = "Photograph for " + memory.title;

            const content = document.createElement("div");
            content.className = "card-content";

            const title = document.createElement("h3");
            title.textContent = memory.title;

            const category = document.createElement("p");
            category.textContent = memory.category + " · " + memory.place;

            const story = document.createElement("p");
            story.textContent = memory.story.length > 100
                ? memory.story.substring(0, 100) + "..."
                : memory.story;

            const actions = document.createElement("div");
            actions.className = "card-actions";

            const readButton = document.createElement("button");
            readButton.className = "small-button";
            readButton.textContent = "Read more";
            readButton.addEventListener("click", function () {
                openDetails(memory);
            });

            const favouriteButton = document.createElement("button");
            favouriteButton.className = "small-button";
            favouriteButton.textContent = favourites.includes(memory.id)
                ? "♥ Saved"
                : "♡ Favourite";
            favouriteButton.addEventListener("click", function () {
                toggleFavourite(memory.id);
            });

            actions.append(readButton, favouriteButton);

            if (memory.id.startsWith("user-")) {
                const deleteButton = document.createElement("button");
                deleteButton.className = "small-button";
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", function () {
                    deleteMemory(memory.id);
                });
                actions.appendChild(deleteButton);
            }

            content.append(title, category, story, actions);
            card.append(image, content);
            gallery.appendChild(card);
        });
    }

    function toggleFavourite(id) {
        let favourites = getFavourites();

        if (favourites.includes(id)) {
            favourites = favourites.filter(function (item) {
                return item !== id;
            });
        } else {
            favourites.push(id);
        }

        saveFavourites(favourites);
        showMemories();
    }

    function deleteMemory(id) {
        if (!confirm("Do you want to delete this memory?")) {
            return;
        }

        const memories = getSavedMemories().filter(function (memory) {
            return memory.id !== id;
        });

        const favourites = getFavourites().filter(function (item) {
            return item !== id;
        });

        saveMemories(memories);
        saveFavourites(favourites);
        showMemories();
    }

    function openDetails(memory) {
        document.getElementById("detailTitle").textContent = memory.title;
        document.getElementById("detailPlace").textContent =
            memory.category + " · " + memory.place;
        document.getElementById("detailStory").textContent = memory.story;

        const detailImage = document.getElementById("detailImage");
        if (memory.image) {
            detailImage.src = memory.image;
            detailImage.hidden = false;
        } else {
            detailImage.hidden = true;
        }

        document.getElementById("memoryDetails").hidden = false;
        document.getElementById("memoryDetails").scrollIntoView({ behavior: "smooth" });
    }

    searchInput.addEventListener("input", showMemories);
    categoryFilter.addEventListener("change", showMemories);
    sortOrder.addEventListener("change", showMemories);
    favouritesOnly.addEventListener("change", showMemories);

    document.getElementById("closeDetails").addEventListener("click", function () {
        document.getElementById("memoryDetails").hidden = true;
    });

    document.getElementById("exportButton").addEventListener("click", function () {
        const data = JSON.stringify(getSavedMemories(), null, 2);
        const file = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "my-memories.json";
        link.click();
        URL.revokeObjectURL(url);
    });

    showMemories();
}
