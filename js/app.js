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
  dialog: document.querySelector("#recipe-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector("#dialog-close"),
};

let activeSearch;
let activeDetail;

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
  const meta = document.createElement("p");
  const values = [meal.category, meal.area].filter(Boolean);
  meta.className = "recipe-meta";
  meta.textContent = values.length ? values.join(" · ") : "Recipe";
  return meta;
}

function createRecipeCard(meal) {
  const article = document.createElement("article");
  const image = document.createElement("img");
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const button = document.createElement("button");

  article.className = "recipe-card";
  image.src = meal.image;
  image.alt = "";
  image.loading = "lazy";
  image.width = 640;
  image.height = 480;
  content.className = "recipe-card__content";
  title.textContent = meal.title;
  button.type = "button";
  button.className = "button button--small";
  button.textContent = "View recipe";
  button.addEventListener("click", () => openMeal(meal.id));

  content.append(createMeta(meal), title, button);
  article.append(image, content);
  return article;
}

function renderResults(meals, heading) {
  elements.results.replaceChildren();
  elements.resultsHeading.textContent = heading;

  if (!meals.length) {
    setStatus("No recipes matched that search. Try a broader term.", "empty");
    return;
  }

  const fragment = document.createDocumentFragment();
  meals.forEach((meal) => fragment.append(createRecipeCard(meal)));
  elements.results.append(fragment);
  setStatus(`${meals.length} recipe${meals.length === 1 ? "" : "s"} found.`, "success");
  elements.resultsHeading.scrollIntoView({ behavior: "smooth", block: "start" });
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
  image.alt = "";
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
  elements.dialogContent.textContent = "Loading recipe…";
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
    elements.dialogContent.textContent = "This recipe is temporarily unavailable. Please try again.";
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
  image.alt = "";
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
  activeSearch = new AbortController();
  setStatus("Searching recipes…", "loading");
  elements.searchForm.setAttribute("aria-busy", "true");

  try {
    const meals = await searchMeals({
      mode: elements.mode.value,
      query,
      signal: activeSearch.signal,
    });
    const limit = Number(elements.limit.value) || 12;
    renderResults(meals.slice(0, limit), `Results for “${query}”`);
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus("The recipe service could not complete this search. Try again shortly.", "error");
    }
  } finally {
    elements.searchForm.removeAttribute("aria-busy");
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
    setStatus("Recipes you open will appear here on this device.", "empty");
    return;
  }

  const fragment = document.createDocumentFragment();
  history.forEach((meal) => fragment.append(createRecipeCard(meal)));
  elements.results.append(fragment);
  setStatus(`${history.length} saved recipe${history.length === 1 ? "" : "s"}.`, "success");
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
} else if (elements.page === "recent") {
  renderHistory();
}
