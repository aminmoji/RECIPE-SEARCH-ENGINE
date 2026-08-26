const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const SEARCH_MODES = {
  name: { endpoint: "search.php", parameter: "s" },
  ingredient: { endpoint: "filter.php", parameter: "i" },
  category: { endpoint: "filter.php", parameter: "c" },
  area: { endpoint: "filter.php", parameter: "a" },
};

export function extractIngredients(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const name = meal?.[`strIngredient${index}`]?.trim();
    const measure = meal?.[`strMeasure${index}`]?.trim();

    if (name) {
      ingredients.push({ name, measure: measure || "" });
    }
  }

  return ingredients;
}

export function normalizeMeal(meal) {
  if (!meal?.idMeal || !meal?.strMeal) {
    return null;
  }

  return {
    id: String(meal.idMeal),
    title: meal.strMeal.trim(),
    image: meal.strMealThumb || "",
    category: meal.strCategory?.trim() || "",
    area: meal.strArea?.trim() || "",
    instructions: meal.strInstructions?.trim() || "",
    source: meal.strSource?.trim() || "",
    video: meal.strYoutube?.trim() || "",
    tags: meal.strTags
      ? meal.strTags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [],
    ingredients: extractIngredients(meal),
  };
}

export function buildSearchUrl(mode, query) {
  const searchMode = SEARCH_MODES[mode];
  const cleanQuery = typeof query === "string" ? query.trim() : "";

  if (!searchMode) {
    throw new Error("Unsupported search mode");
  }
  if (!cleanQuery) {
    throw new Error("Enter a search term");
  }

  const url = new URL(`${API_BASE}/${searchMode.endpoint}`);
  url.searchParams.set(searchMode.parameter, cleanQuery);
  return url.toString();
}

async function fetchJson(url, { signal } = {}) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Recipe service returned ${response.status}`);
  }

  return response.json();
}

function normalizeMeals(data) {
  return (data?.meals || []).map(normalizeMeal).filter(Boolean);
}

export async function searchMeals({ mode, query, signal }) {
  const data = await fetchJson(buildSearchUrl(mode, query), { signal });
  return normalizeMeals(data);
}

export async function fetchMeal(id, { signal } = {}) {
  const cleanId = String(id || "").trim();
  if (!/^\d+$/.test(cleanId)) {
    throw new Error("Invalid recipe identifier");
  }

  const data = await fetchJson(`${API_BASE}/lookup.php?i=${encodeURIComponent(cleanId)}`, {
    signal,
  });
  return normalizeMeals(data)[0] || null;
}

export async function fetchRandomMeal({ signal } = {}) {
  const data = await fetchJson(`${API_BASE}/random.php`, { signal });
  return normalizeMeals(data)[0] || null;
}

export function toMealSummary(meal) {
  return {
    id: meal.id,
    title: meal.title,
    image: meal.image,
    category: meal.category,
    area: meal.area,
  };
}
