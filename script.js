const desktop = document.querySelector("#desktop");
const windowElement = document.querySelector("#explorerWindow");
const taskApp = document.querySelector("#taskApp");
const globalSearch = document.querySelector("#globalSearch");
const archive = document.querySelector(".archive");
const emptyState = document.querySelector("#emptyState");
const selectionStatus = document.querySelector("#selectionStatus");
const activityRail = document.querySelector("#activityRail");
const railToggle = document.querySelector("#railToggle");
const startMenu = document.querySelector("#startMenu");
const startButton = document.querySelector("#startButton");
const playButton = document.querySelector("#playButton");
const clock = document.querySelector("#clock");
const wallpaperCredit = document.querySelector("#wallpaperCredit");
const appearanceWindow = document.querySelector("#appearanceWindow");
const appearanceTaskApp = document.querySelector("#appearanceTaskApp");
const controlCenterButton = document.querySelector("#controlCenterButton");
const appearanceDone = document.querySelector("#appearanceDone");
const appearanceStatus = document.querySelector("#appearanceStatus");
const wallpaperOptions = [...document.querySelectorAll("[data-wallpaper-option]")];
const schemeOptions = [...document.querySelectorAll("[data-scheme-option]")];
const accentOptions = [...document.querySelectorAll("[data-accent-option]")];
const customAccent = document.querySelector("#customAccent");
const customAccentLabel = document.querySelector("#customAccentLabel");
const systemScheme = window.matchMedia("(prefers-color-scheme: dark)");

let windowState = "normal";
let selectedItem = null;
let playing = false;
let appearanceWindowState = "closed";
let activeWallpaper = "field";
let schemePreference = "light";
let activeAccent = "blue";

const wallpapers = {
  field: {
    name: "Amber Field",
    credit: "AURORA / FIELD 01"
  },
  pearl: {
    name: "Pearl Current",
    credit: "AURORA / PEARL 02"
  }
};

const accentThemes = {
  blue: { name: "Aurora Blue", hex: "#3488d4", hue: 207, saturation: 64 },
  green: { name: "Plex Green", hex: "#4a9f63", hue: 139, saturation: 36 },
  red: { name: "Signal Red", hex: "#c55454", hue: 0, saturation: 51 },
  orange: { name: "Ember Orange", hex: "#d17a2f", hue: 28, saturation: 64 },
  pink: { name: "Orchid Pink", hex: "#c55789", hue: 332, saturation: 49 },
  purple: { name: "Violet Dusk", hex: "#7b62c4", hue: 257, saturation: 46 }
};

const updateAppearanceStatus = () => {
  const wallpaper = wallpapers[activeWallpaper];
  const accentName =
    activeAccent === "custom" ? "Custom" : accentThemes[activeAccent].name;
  const resolvedScheme = desktop.dataset.colorScheme;
  const schemeLabel =
    schemePreference === "system"
      ? `System (${resolvedScheme})`
      : `${resolvedScheme[0].toUpperCase()}${resolvedScheme.slice(1)}`;
  appearanceStatus.textContent = `${wallpaper.name} · ${accentName} · ${schemeLabel}`;
};

const setWallpaper = (wallpaperId, persist = true) => {
  const wallpaper = wallpapers[wallpaperId] || wallpapers.field;
  const resolvedId = wallpapers[wallpaperId] ? wallpaperId : "field";

  desktop.dataset.wallpaper = resolvedId;
  activeWallpaper = resolvedId;
  wallpaperCredit.textContent = wallpaper.credit;
  updateAppearanceStatus();

  wallpaperOptions.forEach((option) => {
    const selected = option.dataset.wallpaperOption === resolvedId;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });

  if (persist) {
    try {
      localStorage.setItem("aurora-wallpaper", resolvedId);
    } catch {
      // The visual switch still works when storage is unavailable.
    }
  }
};

const resolveScheme = (preference) =>
  preference === "system" ? (systemScheme.matches ? "dark" : "light") : preference;

const hexToHsl = (hex) => {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;

  if (delta) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    if (max === green) hue = (blue - red) / delta + 2;
    if (max === blue) hue = (red - green) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { hue, saturation: Math.round(saturation * 100) };
};

const setAccentTheme = (accentId, customHex = customAccent.value, persist = true) => {
  const preset = accentThemes[accentId];
  const resolvedId = preset ? accentId : "custom";
  const color = preset || { ...hexToHsl(customHex), hex: customHex };

  activeAccent = resolvedId;
  desktop.dataset.accent = resolvedId;
  desktop.style.setProperty("--theme-h", color.hue);
  desktop.style.setProperty("--theme-s", `${color.saturation}%`);
  customAccent.value = color.hex;

  accentOptions.forEach((option) => {
    const selected = option.dataset.accentOption === resolvedId;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
  customAccentLabel.classList.toggle("is-selected", resolvedId === "custom");

  updateAppearanceStatus();

  if (persist) {
    try {
      localStorage.setItem("aurora-accent-theme", resolvedId);
      if (resolvedId === "custom") {
        localStorage.setItem("aurora-custom-accent", customHex);
      }
    } catch {
      // The accent still works when storage is unavailable.
    }
  }
};

const setColorScheme = (preference, persist = true) => {
  const resolvedPreference = ["light", "dark", "system"].includes(preference)
    ? preference
    : "light";

  schemePreference = resolvedPreference;
  desktop.dataset.schemePreference = resolvedPreference;
  desktop.dataset.colorScheme = resolveScheme(resolvedPreference);
  document.documentElement.style.colorScheme = desktop.dataset.colorScheme;

  schemeOptions.forEach((option) => {
    const selected = option.dataset.schemeOption === resolvedPreference;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });

  updateAppearanceStatus();

  if (persist) {
    try {
      localStorage.setItem("aurora-color-scheme", resolvedPreference);
    } catch {
      // The scheme still works when storage is unavailable.
    }
  }
};

const setAppearanceWindowState = (nextState) => {
  appearanceWindow.classList.remove("is-minimized");

  if (nextState === "closed") {
    appearanceWindow.hidden = true;
    appearanceTaskApp.hidden = true;
    appearanceTaskApp.classList.remove("is-active");
  } else if (nextState === "minimized") {
    appearanceWindow.classList.add("is-minimized");
    appearanceTaskApp.classList.remove("is-active");
  } else {
    appearanceWindow.hidden = false;
    appearanceTaskApp.hidden = false;
    appearanceTaskApp.classList.add("is-active");
  }

  appearanceWindowState = nextState;
};

const openAppearanceWindow = () => {
  toggleStartMenu(false);
  setAppearanceWindowState("open");
};

const setWindowState = (nextState) => {
  windowElement.classList.remove("is-minimized", "is-closed");

  if (nextState === "minimized") {
    windowElement.classList.add("is-minimized");
    taskApp.classList.remove("is-active");
  } else if (nextState === "closed") {
    windowElement.classList.add("is-closed");
    taskApp.classList.remove("is-active");
  } else {
    taskApp.classList.add("is-active");
  }

  windowState = nextState;
};

document.querySelectorAll("[data-window-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.windowAction;

    if (action === "maximize") {
      const maximized = windowElement.classList.toggle("is-maximized");
      button.setAttribute("aria-label", maximized ? "Restore window" : "Maximize window");
      windowState = maximized ? "maximized" : "normal";
      return;
    }

    setWindowState(action === "close" ? "closed" : "minimized");
  });
});

document.querySelectorAll("[data-appearance-action]").forEach((button) => {
  button.addEventListener("click", () => {
    setAppearanceWindowState(button.dataset.appearanceAction === "close" ? "closed" : "minimized");
  });
});

taskApp.addEventListener("click", () => {
  if (windowState === "normal" || windowState === "maximized") {
    setWindowState("minimized");
  } else {
    setWindowState(windowElement.classList.contains("is-maximized") ? "maximized" : "normal");
  }
});

document.querySelectorAll(".place").forEach((place) => {
  place.addEventListener("click", () => {
    document.querySelector(".place.is-active")?.classList.remove("is-active");
    place.classList.add("is-active");
    document.querySelector(".eyebrow").textContent = `${place.dataset.place.toUpperCase()} / MERIDIAN`;
  });
});

document.querySelectorAll(".task-heading").forEach((heading) => {
  heading.addEventListener("click", () => {
    const section = heading.closest(".task-section");
    const open = section.classList.toggle("is-open");
    heading.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll(".filter-link").forEach((filter) => {
  filter.addEventListener("click", () => {
    document.querySelector(".filter-link.is-selected")?.classList.remove("is-selected");
    filter.classList.add("is-selected");
  });
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-view]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    archive.classList.toggle("is-list-view", button.dataset.view === "list");
  });
});

document.querySelectorAll(".selectable").forEach((item) => {
  item.addEventListener("click", () => {
    selectedItem?.classList.remove("is-selected");
    selectedItem = item;
    item.classList.add("is-selected");

    const label =
      item.querySelector(".item-name")?.textContent ||
      item.querySelector(".message-person strong")?.textContent ||
      "1 item";
    selectionStatus.textContent = `Selected: ${label}`;
  });
});

const filterArchive = () => {
  const query = globalSearch.value.trim().toLowerCase();
  const searchableItems = [...document.querySelectorAll("[data-search]")];
  let visibleCount = 0;

  searchableItems.forEach((item) => {
    const visible = !query || item.dataset.search.includes(query);
    item.classList.toggle("is-filtered-out", !visible);
    if (visible) visibleCount += 1;
  });

  document.querySelectorAll("[data-search-group]").forEach((group) => {
    const hasVisibleItems = group.querySelector("[data-search]:not(.is-filtered-out)");
    group.classList.toggle("is-filtered-out", Boolean(query) && !hasVisibleItems);
  });

  emptyState.hidden = visibleCount !== 0;
  selectionStatus.textContent = query ? `${visibleCount} matching items` : "42 items";
};

globalSearch.addEventListener("input", filterArchive);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    globalSearch.focus();
    globalSearch.select();
  }

  if (event.key === "Escape") {
    if (!startMenu.hidden) toggleStartMenu(false);
    globalSearch.blur();
  }
});

const updateRailState = (open) => {
  activityRail.classList.toggle("is-open", open);
  railToggle.setAttribute("aria-expanded", String(open));
};

railToggle.addEventListener("click", () => {
  updateRailState(!activityRail.classList.contains("is-open"));
});

const toggleStartMenu = (open) => {
  startMenu.hidden = !open;
  startButton.setAttribute("aria-expanded", String(open));
  if (open) startMenu.querySelector("input").focus();
};

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleStartMenu(startMenu.hidden);
});

startMenu.addEventListener("click", (event) => event.stopPropagation());
desktop.addEventListener("click", () => {
  if (!startMenu.hidden) toggleStartMenu(false);
});

controlCenterButton.addEventListener("click", openAppearanceWindow);
appearanceDone.addEventListener("click", () => setAppearanceWindowState("closed"));

appearanceTaskApp.addEventListener("click", () => {
  setAppearanceWindowState(appearanceWindowState === "open" ? "minimized" : "open");
});

wallpaperOptions.forEach((option) => {
  option.addEventListener("click", () => setWallpaper(option.dataset.wallpaperOption));
});

schemeOptions.forEach((option) => {
  option.addEventListener("click", () => setColorScheme(option.dataset.schemeOption));
});

accentOptions.forEach((option) => {
  option.addEventListener("click", () => setAccentTheme(option.dataset.accentOption));
});

customAccent.addEventListener("input", () => {
  setAccentTheme("custom", customAccent.value);
});

systemScheme.addEventListener("change", () => {
  if (schemePreference === "system") setColorScheme("system", false);
});

playButton.addEventListener("click", () => {
  playing = !playing;
  playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
  playButton.querySelector("use").setAttribute("href", playing ? "#i-pause" : "#i-play");
});

const updateClock = () => {
  clock.textContent = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
};

updateClock();
setInterval(updateClock, 30_000);

const syncResponsiveRail = () => {
  if (window.matchMedia("(min-width: 1025px)").matches) {
    updateRailState(true);
  } else if (!activityRail.matches(":focus-within")) {
    updateRailState(false);
  }
};

syncResponsiveRail();
window.addEventListener("resize", syncResponsiveRail);

let savedWallpaper = "field";
let savedScheme = "light";
let savedAccent = "blue";
let savedCustomAccent = "#3488d4";
try {
  savedWallpaper = localStorage.getItem("aurora-wallpaper") || "field";
  savedScheme = localStorage.getItem("aurora-color-scheme") || "light";
  savedAccent = localStorage.getItem("aurora-accent-theme") || "blue";
  savedCustomAccent = localStorage.getItem("aurora-custom-accent") || "#3488d4";
} catch {
  savedWallpaper = "field";
  savedScheme = "light";
  savedAccent = "blue";
  savedCustomAccent = "#3488d4";
}
setAccentTheme(savedAccent, savedCustomAccent, false);
setColorScheme(savedScheme, false);
setWallpaper(savedWallpaper, false);
