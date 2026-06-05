  document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box input");
  const searchIcon = document.querySelector(".search-icon");

  const suggestionBox = document.createElement("div");
  suggestionBox.className = "suggestion-box";
  searchBox.parentNode.appendChild(suggestionBox);

  const pages = {
    "dzikir pagi": "dzikir-pagi.html",
    "dzikir petang": "dzikir-petang.html",
    "dzikir shalat": "dzikir-setelah-solat.html",
    "doa harian": "doa-harian.html",
    "kumpulan doa": "kumpulan-doa.html",
    "bacaan shalat": "bacaan-shalat.html",
    "juz amma": "juz-amma.html",
    "kalender hijriah": "kalender-hijriah.html",
    "hafalan": "hafalan.html",
    "tasbih": "tasbih.html",
    "kisah nabi": "kisah-nabi.html",
    "hadits": "intent://#Intent;package=com.saltanera.hadits;end",
    "kiblat": "arah-kiblat.html"
  };

  let currentFocus = -1;
  let history = JSON.parse(localStorage.getItem("searchHistory")) || {};

  // tampilkan suggestion saat mengetik
  searchBox.addEventListener("input", () => {
    const query = searchBox.value.trim().toLowerCase();
    suggestionBox.innerHTML = "";
    currentFocus = -1;

    if (!query) {
      showHistory();
      return;
    }

    const historyMatches = Object.keys(history)
      .filter(item => item.includes(query))
      .sort((a, b) => history[b].count - history[a].count);

    const pageMatches = Object.keys(pages).filter(key => key.includes(query));

    if (historyMatches.length > 0) {
      historyMatches.forEach(itemText => {
        const item = document.createElement("div");
        item.className = "suggestion-item history";

        const regex = new RegExp(`(${query})`, "gi");
        const lastTime = timeAgo(history[itemText].last);
        item.innerHTML = `🕘 ${itemText.replace(regex, "<b>$1</b>")} (${history[itemText].count}x, terakhir ${lastTime})`;

        item.addEventListener("click", () => {
          runSearch(itemText);
        });

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "❌";
        deleteBtn.className = "delete-history";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          delete history[itemText];
          localStorage.setItem("searchHistory", JSON.stringify(history));
          searchBox.dispatchEvent(new Event("input"));
        });

        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.appendChild(deleteBtn);

        suggestionBox.appendChild(item);
      });
    }

    if (pageMatches.length > 0) {
      pageMatches.forEach(match => {
        const item = document.createElement("div");
        item.className = "suggestion-item";

        const regex = new RegExp(`(${query})`, "gi");
        item.innerHTML = match.replace(regex, "<b>$1</b>");

        item.addEventListener("click", () => {
          goToPage(pages[match], match);
        });
        suggestionBox.appendChild(item);
      });
    }

    if (historyMatches.length === 0 && pageMatches.length === 0) {
      const errorMsg = document.createElement("div");
errorMsg.className = "search-error";
errorMsg.innerHTML = `
<span class="search-error-icon">❌</span>
<span>Kata kunci salah</span>
`;

suggestionBox.appendChild(errorMsg);
    }
  });

  // navigasi dengan keyboard
  searchBox.addEventListener("keydown", e => {
    let items = suggestionBox.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      currentFocus++;
      addActive(items);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      addActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1 && items[currentFocus]) {
        items[currentFocus].click();
      } else {
        runSearch(searchBox.value.trim().toLowerCase());
      }
    }
  });

  function addActive(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("active");
  }

  function removeActive(items) {
    items.forEach(item => item.classList.remove("active"));
  }

  if (searchIcon) {
    searchIcon.addEventListener("click", () => {
      runSearch(searchBox.value.trim().toLowerCase());
    });
  }

  function runSearch(query) {
    console.log("Mencari:", query);
    if (pages[query]) {
      goToPage(pages[query], query);
    } else {
      suggestionBox.innerHTML = "<small style='color:red; padding-left: 10px;'>❌ Kata kunci salah</small>";


    }
  }

  function goToPage(url, query) {
    searchBox.value = "";
    suggestionBox.innerHTML = "";

    if (query) {
      if (!history[query]) {
        history[query] = { count: 0, last: Date.now() };
      }
      history[query].count++;
      history[query].last = Date.now();
      localStorage.setItem("searchHistory", JSON.stringify(history));
    }

    window.location.href = url;
  }

  function showHistory() {
    suggestionBox.innerHTML = "";
    const sortedHistory = Object.keys(history).sort((a, b) => history[b].count - history[a].count);

    if (sortedHistory.length > 0) {
      sortedHistory.slice(0, 5).forEach(itemText => {
        const item = document.createElement("div");
        item.className = "suggestion-item history";
        const lastTime = timeAgo(history[itemText].last);
        item.textContent = `🕘 ${itemText} (${history[itemText].count}x, terakhir ${lastTime})`;

        item.addEventListener("click", () => {
          runSearch(itemText);
        });

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "❌";
        deleteBtn.className = "delete-history";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          delete history[itemText];
          localStorage.setItem("searchHistory", JSON.stringify(history));
          showHistory();
        });

        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.appendChild(deleteBtn);

        suggestionBox.appendChild(item);
      });

      const clearBtn = document.createElement("div");
      clearBtn.className = "clear-history";
      clearBtn.innerHTML =
'<i class="fa-solid fa-broom"></i> Bersihkan Riwayat';
      clearBtn.addEventListener("click", () => {
        history = {};
        localStorage.removeItem("searchHistory");
        suggestionBox.innerHTML = "<small style='color:gray'>Riwayat telah dihapus</small>";
      });
      suggestionBox.appendChild(clearBtn);
    }
  }

  // fungsi untuk menampilkan "2 hari lalu", "5 menit lalu", dll
  function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (minutes > 0) return `${minutes} menit lalu`;
    return "baru saja";
  }
});