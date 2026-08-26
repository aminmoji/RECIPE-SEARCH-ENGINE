import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSearchUrl,
  extractIngredients,
  normalizeMeal,
  toMealSummary,
} from "../js/recipe-api.js";

const sampleMeal = {
  idMeal: "52772",
  strMeal: "Teriyaki Chicken Casserole",
  strMealThumb: "https://example.com/meal.jpg",
  strCategory: "Chicken",
  strArea: "Japanese",
  strInstructions: "Cook and serve.",
  strIngredient1: "Chicken",
  strMeasure1: "500 g",
  strIngredient2: "Rice",
  strMeasure2: "2 cups",
  strIngredient3: " ",
  strMeasure3: " ",
};

test("buildSearchUrl uses the endpoint for each supported mode", () => {
  assert.equal(
    buildSearchUrl("name", "chicken soup"),
    "https://www.themealdb.com/api/json/v1/1/search.php?s=chicken+soup"
  );
  assert.equal(
    buildSearchUrl("ingredient", "salmon"),
    "https://www.themealdb.com/api/json/v1/1/filter.php?i=salmon"
  );
  assert.equal(
    buildSearchUrl("category", "Seafood"),
    "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood"
  );
  assert.equal(
    buildSearchUrl("area", "Canadian"),
    "https://www.themealdb.com/api/json/v1/1/filter.php?a=Canadian"
  );
});

test("buildSearchUrl rejects unsupported or empty searches", () => {
  assert.throws(() => buildSearchUrl("nutrition", "protein"), /Unsupported/);
  assert.throws(() => buildSearchUrl("name", "  "), /search term/);
});

test("extractIngredients skips empty ingredient slots", () => {
  assert.deepEqual(extractIngredients(sampleMeal), [
    { name: "Chicken", measure: "500 g" },
    { name: "Rice", measure: "2 cups" },
  ]);
});

test("normalizeMeal creates a stable application model", () => {
  const meal = normalizeMeal(sampleMeal);

  assert.equal(meal.id, "52772");
  assert.equal(meal.title, "Teriyaki Chicken Casserole");
  assert.equal(meal.ingredients.length, 2);
  assert.deepEqual(toMealSummary(meal), {
    id: "52772",
    title: "Teriyaki Chicken Casserole",
    image: "https://example.com/meal.jpg",
    category: "Chicken",
    area: "Japanese",
  });
});

test("normalizeMeal ignores incomplete API records", () => {
  assert.equal(normalizeMeal(null), null);
  assert.equal(normalizeMeal({ idMeal: "1" }), null);
});
