import {
  fetchMeal,
  fetchRandomMeal,
  searchMeals,
  toMealSummary,
} from "./recipe-api.js";

const HISTORY_KEY = "recipe-search-history-v2";
const HISTORY_LIMIT = 12;

const elements = {
  page: document.body.dataset.page,
  searchForm: document.querySelector("#recipe-search"),
  query: document.querySelector("#query"),
  mode: document.querySelector("#mode"),
  limit: document.querySelector("#limit"),
  results: document.querySelector("#results"),
  resultsHeading: document.querySelector("#results-heading"),
  status: document.querySelector("#status"),
  surprise: document.querySelector("#surprise"),
  featured: document.querySelector("#featured"),
  quickSearches: document.querySelectorAll(".quick-search"),
  dialog: document.querySelector("#recipe-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector("#dialog-close"),
};

let activeSearch;
let activeDetail;
let lastResults = [];
let lastHeading = "";

function getHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(history)
      ? history.filter((meal) => meal?.id && meal?.title).slice(0, HISTORY_LIMIT)
      : [];
  } catch {
    return [];
  }
}

function saveToHistory(meal) {
  const summary = toMealSummary(meal);
  const history = getHistory().filter((item) => item.id !== summary.id);
  history.unshift(summary);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
  } catch {
    // Browsing with blocked storage should not prevent recipe viewing.
  }
}

function setStatus(message, type = "") {
  if (!elements.status) {
    return;
  }

  elements.status.textContent = message;
  elements.status.dataset.type = type;
}

function createMeta(meal) {
  const meta = document.createElement("div");
  const values = [meal.category, meal.area].filter(Boolean);
  meta.className = "recipe-meta";

  (values.length ? values : ["Recipe"]).forEach((value) => {
    const item = document.createElement("span");
    item.textContent = value;
    meta.append(item);
  });

  return meta;
}

function createRecipeCard(meal) {
  const article = document.createElement("article");
  const visual = document.createElement("div");
  const image = document.createElement("img");
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const button = document.createElement("button");

  article.className = "recipe-card";
  visual.className = "recipe-card__visual";
  image.src = meal.image;
  image.alt = `${meal.title} recipe`;
  image.loading = "lazy";
  image.decoding = "async";
  image.width = 640;
  image.height = 480;
  image.addEventListener("error", () => image.remove());
  content.className = "recipe-card__content";
  title.textContent = meal.title;
  button.type = "button";
  button.className = "recipe-card__link";
  button.textContent = "View recipe";
  button.setAttribute("aria-label", `View recipe: ${meal.title}`);
  button.addEventListener("click", () => openMeal(meal.id));

  visual.append(image);
  content.append(createMeta(meal), title, button);
  article.append(visual, content);
  return article;
}

function renderLoadingCards(count = 6) {
  elements.results.replaceChildren();
  const fragment = document.createDocumentFragment();

  Array.from({ length: count }, () => {
    const card = document.createElement("article");
    const line = document.createElement("span");
    card.className = "recipe-card loading-grid-card";
    card.setAttribute("aria-hidden", "true");
    card.append(line);
    return card;
  }).forEach((card) => fragment.append(card));

  elements.results.append(fragment);
}

function renderEmptyState(title, copy, includeLink = false) {
  const empty = document.createElement("div");
  const icon = document.createElement("span");
  const heading = document.createElement("h3");
  const message = document.createElement("p");

  empty.className = "empty-state";
  icon.className = "empty-state__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "⌕";
  heading.textContent = title;
  message.textContent = copy;
  empty.append(icon, heading, message);

  if (includeLink) {
    const link = document.createElement("a");
    link.className = "button button--accent";
    link.href = "./index.html";
    link.textContent = "Discover recipes";
    empty.append(link);
  }

  elements.results.replaceChildren(empty);
}

function renderResults(meals, heading, { scroll = true, statusMessage = "", cache = true } = {}) {
  if (cache) {
    lastResults = meals;
    lastHeading = heading;
  }

  elements.results.replaceChildren();
  elements.resultsHeading.textContent = heading;

  if (!meals.length) {
    setStatus("No recipes matched that search. Try a broader term.", "empty");
    renderEmptyState(
      "Nothing on the menu yet",
      "Try a shorter recipe name, a common ingredient, or one of the popular searches above."
    );
    return;
  }

  const limit = Number(elements.limit?.value) || meals.length;
  const visibleMeals = meals.slice(0, limit);
  const fragment = document.createDocumentFragment();
  visibleMeals.forEach((meal) => fragment.append(createRecipeCard(meal)));
  elements.results.append(fragment);
  setStatus(
    statusMessage || `${visibleMeals.length} recipe${visibleMeals.length === 1 ? "" : "s"} found.`,
    "success"
  );

  if (scroll) {
    elements.resultsHeading.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function safeExternalLink(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function renderMealDetails(meal) {
  const layout = document.createElement("div");
  const image = document.createElement("img");
  const body = document.createElement("div");
  const eyebrow = createMeta(meal);
  const title = document.createElement("h2");
  const ingredientHeading = document.createElement("h3");
  const ingredientList = document.createElement("ul");
  const instructionHeading = document.createElement("h3");
  const instructions = document.createElement("div");
  const links = document.createElement("div");

  layout.className = "recipe-detail";
  image.src = meal.image;
  image.alt = `${meal.title} recipe`;
  image.width = 720;
  image.height = 540;
  body.className = "recipe-detail__body";
  title.id = "dialog-title";
  title.textContent = meal.title;
  ingredientHeading.textContent = "Ingredients";
  ingredientList.className = "ingredient-list";

  meal.ingredients.forEach(({ name, measure }) => {
    const item = document.createElement("li");
    const ingredient = document.createElement("span");
    const amount = document.createElement("span");
    ingredient.textContent = name;
    amount.textContent = measure;
    item.append(ingredient, amount);
    ingredientList.append(item);
  });

  instructionHeading.textContent = "Method";
  instructions.className = "instructions";
  const instructionBlocks = meal.instructions.split(/\r?\n/).filter((line) => line.trim());
  (instructionBlocks.length ? instructionBlocks : [meal.instructions]).forEach((block) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = block;
    instructions.append(paragraph);
  });

  links.className = "recipe-links";
  [
    ["Original source", safeExternalLink(meal.source)],
    ["Watch video", safeExternalLink(meal.video)],
  ].forEach(([label, href]) => {
    if (!href) {
      return;
    }
    const link = document.createElement("a");
    link.className = "button button--secondary button--small";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    links.append(link);
  });

  body.append(
    eyebrow,
    title,
    ingredientHeading,
    ingredientList,
    instructionHeading,
    instructions,
    links
  );
  layout.append(image, body);
  elements.dialogContent.replaceChildren(layout);
}

async function openMeal(id) {
  activeDetail?.abort();
  activeDetail = new AbortController();
  const loading = document.createElement("div");
  const spinner = document.createElement("span");
  const message = document.createElement("span");
  loading.className = "dialog-state";
  spinner.className = "loading-spinner";
  spinner.setAttribute("aria-hidden", "true");
  message.id = "dialog-title";
  message.textContent = "Preparing the recipe…";
  loading.append(spinner, message);
  elements.dialogContent.replaceChildren(loading);
  if (!elements.dialog.open) {
    elements.dialog.showModal();
  }

  try {
    const meal = await fetchMeal(id, { signal: activeDetail.signal });
    if (!meal) {
      throw new Error("Recipe not found");
    }
    renderMealDetails(meal);
    saveToHistory(meal);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    const unavailable = document.createElement("div");
    unavailable.className = "dialog-state";
    unavailable.id = "dialog-title";
    unavailable.textContent = "This recipe is temporarily unavailable. Please try again.";
    elements.dialogContent.replaceChildren(unavailable);
  }
}

function renderFeatured(meal) {
  if (!elements.featured) {
    return;
  }

  const image = document.createElement("img");
  const content = document.createElement("div");
  const label = document.createElement("p");
  const title = document.createElement("h2");
  const button = document.createElement("button");

  image.src = meal.image;
  image.alt = `${meal.title} recipe`;
  image.width = 960;
  image.height = 720;
  content.className = "featured__content";
  label.className = "eyebrow";
  label.textContent = "Something worth cooking";
  title.textContent = meal.title;
  button.type = "button";
  button.className = "button";
  button.textContent = "View recipe";
  button.addEventListener("click", () => openMeal(meal.id));
  content.append(label, title, createMeta(meal), button);
  elements.featured.replaceChildren(image, content);
}

async function loadFeatured() {
  if (!elements.featured) {
    return;
  }

  try {
    const meal = await fetchRandomMeal({});
    if (meal) {
      renderFeatured(meal);
    }
  } catch {
    elements.featured.textContent = "Featured recipe is temporarily unavailable.";
  }
}

async function handleSearch(event) {
  event.preventDefault();
  const query = elements.query.value.trim();
  if (!query) {
    setStatus("Enter a recipe, ingredient, category, or cuisine.", "error");
    elements.query.focus();
    return;
  }

  activeSearch?.abort();
  const searchController = new AbortController();
  activeSearch = searchController;
  lastResults = [];
  lastHeading = "";
  setStatus("Searching recipes…", "loading");
  renderLoadingCards(Math.min(Number(elements.limit.value) || 6, 6));
  elements.searchForm.setAttribute("aria-busy", "true");

  try {
    const meals = await searchMeals({
      mode: elements.mode.value,
      query,
      signal: searchController.signal,
    });
    renderResults(meals, `Results for “${query}”`);
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus("The recipe service could not complete this search. Try again shortly.", "error");
      renderEmptyState(
        "The kitchen is taking a moment",
        "The recipe service could not complete that search. Please try again shortly."
      );
    }
  } finally {
    if (activeSearch === searchController) {
      elements.searchForm.removeAttribute("aria-busy");
    }
  }
}

function updateSearchHint() {
  const hints = {
    name: "Try “pasta” or “chicken soup”",
    ingredient: "Try “salmon” or “chickpeas”",
    category: "Try “Vegetarian” or “Seafood”",
    area: "Try “Canadian” or “Italian”",
  };
  elements.query.placeholder = hints[elements.mode.value];
}

function renderHistory() {
  const history = getHistory();
  elements.resultsHeading.textContent = "Recently viewed";
  elements.results.replaceChildren();

  if (!history.length) {
    setStatus("No recipes saved yet.", "empty");
    renderEmptyState(
      "Your shortlist is empty",
      "Open any recipe and it will be saved here automatically on this device.",
      true
    );
    return;
  }

  const fragment = document.createDocumentFragment();
  history.forEach((meal) => fragment.append(createRecipeCard(meal)));
  elements.results.append(fragment);
  setStatus(`${history.length} saved recipe${history.length === 1 ? "" : "s"}.`, "success");
}

async function loadInitialRecipes() {
  renderLoadingCards(6);

  try {
    const meals = await searchMeals({ mode: "category", query: "Vegetarian" });
    renderResults(meals, "Dinner inspiration", {
      scroll: false,
      statusMessage: "A few dependable ideas to get you started.",
    });
  } catch {
    setStatus("Starter recipes are temporarily unavailable. Search for something you love.", "error");
    renderEmptyState(
      "What are you hungry for?",
      "Use the search above to find a recipe by name, ingredient, category, or cuisine."
    );
  }
}

elements.dialogClose?.addEventListener("click", () => elements.dialog.close());
elements.dialog?.addEventListener("close", () => activeDetail?.abort());
elements.dialog?.addEventListener("click", (event) => {
  if (event.target === elements.dialog) {
    elements.dialog.close();
  }
});

if (elements.page === "home") {
  elements.searchForm.addEventListener("submit", handleSearch);
  elements.mode.addEventListener("change", updateSearchHint);
  elements.limit.addEventListener("change", () => {
    if (lastResults.length) {
      renderResults(lastResults, lastHeading, { scroll: false, cache: false });
    }
  });
  elements.quickSearches.forEach((button) => {
    button.addEventListener("click", () => {
      elements.mode.value = button.dataset.mode;
      elements.query.value = button.dataset.query;
      updateSearchHint();
      elements.searchForm.requestSubmit();
    });
  });
  elements.surprise.addEventListener("click", async () => {
    setStatus("Choosing a recipe…", "loading");
    try {
      const meal = await fetchRandomMeal({});
      if (meal) {
        await openMeal(meal.id);
        setStatus("");
      }
    } catch {
      setStatus("A surprise recipe is unavailable right now.", "error");
    }
  });
  updateSearchHint();
  loadFeatured();
  loadInitialRecipes();
} else if (elements.page === "recent") {
  renderHistory();
}
