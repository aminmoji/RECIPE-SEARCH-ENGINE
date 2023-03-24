let $inputValue;
let $resultsNo;
let cardRecipes = [];
let modalRecipes;
let modalCarsRecipes;
let isLoading = false;
let modalIds = [];
let carouselIds = [];
let visitedIds;

// The carousel loads here
$(document).ready(function () {
  $.ajax({
    async: true,
    crossDomain: true,
    url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random?tags=vegetarian%2Cdessert&number=5",
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    },
  }).then((data) => {
    // data.forEach((d) => {
    //   $('img[class="d-block w-100"]').attr("src", d.image);
    //   $('a[class="caption"]').text(d.title);
    // });
    $.each(data.recipes, function (i, recipe) {
      // console.log(recipe);
      carouselIds.push(recipe.id);
      $('div[class="carousel-indicators"]').append(
        `<button type="button" data-bs-target="#carouselApi" data-bs-slide-to="${i}" class="${
          i === 0 ? "active" : ""
        }" aria-current="${i === 0 ? "true" : "false"}" aria-label="Slide ${
          i + 1
        }"></button>`
      );

      $('div[class="carousel-inner"]').append(
        `<div class="carousel-item p-1 ${i === 0 ? "active" : ""}">
        <a href="#${recipe.id}" data-bs-toggle="modal" data-bs-target="#${
          recipe.id
        }">
          <img src="${recipe.image}" class="d-block w-100" alt="">
        </a>
        <div class="carousel-caption d-none d-md-block">
                    <a href="#${
                      recipe.id
                    }" data-bs-toggle="modal" data-bs-target="#${
          recipe.id
        }"><p>${recipe.title}</p></a>
                  </div>
                </div>`
      );
      // $('img[class="d-block w-100"]').attr("src", recipe.image);
      // $('a[class="caption"]').text(recipe.title);
      console.log(carouselIds);
    });
    addCarsModals();
  });
});

//Calls eventHandler function when the search button is clicked
$("#search-btn").on("click", eventHandler);
//Calls criteriaHandler function when search criteria is selected
$("#criterion li a").on("click", criteriaHandler);

$(document).on("hidden.bs.modal", storeModalId);

//This functions handles the API query based on search criteria
function eventHandler(e) {
  $resultsNo = $("#result-no").val();
  $resultsNo =
    $resultsNo === 0 || $resultsNo === "" || $resultsNo === "undefined"
      ? 10
      : $resultsNo;
  console.log($resultsNo);
  console.log($('button[id="criteria"]').text());
  //Function if search is based on Ingredients
  if ($('button[id="criteria"]').text() === "Ingredients") {
    e.preventDefault();
    $inputValue = $("#input").val();
    console.log($inputValue);
    displayLoading(true);
    $.ajax({
      async: true,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?ingredients=${$inputValue}&number=${$resultsNo}&ignorePantry=true&ranking=1`,
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
        "X-RapidAPI-Host":
          "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      },
    })
      .then((data) => {
        if (!data.length) {
          // show no result message and return
        }
        cardRecipes = data;
        console.log(cardRecipes);
        $.each(cardRecipes, function (_, cardRecipe) {
          modalIds.push(cardRecipe.id);
        });
        console.log(modalIds);
        addCards();
        // getModalInfo();
        addModals();
      })
      .catch((e) => console.log(e))
      .then(() => displayLoading(false));

    //
    //Function if search is based on Recipe
  } else if ($('button[id="criteria"]').text() === "Recipe") {
    e.preventDefault();
    $inputValue = $("#input").val();
    displayLoading(true);
    console.log($('button[id="criteria"]').text());
    $.ajax({
      async: true,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/searchComplex?limitLicense=false&offset=0&number=${$resultsNo}&minIron=0&minCalcium=0&maxVitaminB2=1000&maxMagnesium=1000&minPotassium=0&maxVitaminB6=1000&intolerances=peanut%2C%20shellfish&maxVitaminB5=1000&minFolicAcid=0&minVitaminA=0&maxSodium=1000&maxSugar=1000&maxVitaminA=5000&maxFluoride=1000&minFluoride=0&minVitaminB1=0&minCholine=0&ranking=2&minFat=5&maxVitaminB1=1000&minVitaminB12=0&maxSelenium=1000&minZinc=0&minFolate=0&maxManganese=1000&maxVitaminB12=1000&maxPotassium=1000&maxIron=1000&minSelenium=0&minVitaminK=0&maxFiber=1000&minSodium=0&maxCopper=1000&minCalories=150&maxCholine=1000&minCholesterol=0&maxVitaminE=1000&minProtein=5&minVitaminB3=0&minVitaminB6=0&maxIodine=1000&excludeIngredients=coconut%2C%20mango&maxProtein=100&minMagnesium=0&minCarbs=5&cuisine=american&maxCaffeine=1000&maxSaturatedFat=50&maxVitaminK=1000&minAlcohol=0&minIodine=0&query=${$inputValue}&minSaturatedFat=0&includeIngredients=onions%2C%20lettuce%2C%20tomato&minVitaminE=0&maxCalcium=1000&minFiber=0&minVitaminC=0&maxZinc=1000&maxCalories=1500&maxAlcohol=1000&minPhosphorus=0&minVitaminD=0&minVitaminB2=0&minSugar=0&maxFolate=1000&type=main%20course&maxCholesterol=1000&maxVitaminB3=1000&minCaffeine=0&minVitaminB5=0&maxFolicAcid=1000&maxCarbs=100&maxVitaminD=1000&equipment=pan&maxFat=100&minCopper=0&maxVitaminC=1000&maxPhosphorus=1000&minManganese=0`,
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
        "X-RapidAPI-Host":
          "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      },
    })
      .then((data) => {
        if (!data.length) {
          // show no result message and return
        }
        cardRecipes = data.results;
        console.log(cardRecipes);
        $.each(cardRecipes, function (_, cardRecipe) {
          modalIds.push(cardRecipe.id);
        });
        console.log(modalIds);
        addCards();
        // getModalInfo();
        addModals();
      })
      .catch((e) => console.log(e))
      .then(() => displayLoading(false));
    //Function if search is based on Nutritional Value
  } else if ($('button[id="criteria"]').text() === "Nutritional Value") {
    e.preventDefault();
    $inputValue = $("#input").val();
    displayLoading(true);
    console.log($('button[id="criteria"]').text());
    $.ajax({
      async: true,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByNutrients?limitLicense=false&minProtein=0&minVitaminC=0&minSelenium=0&maxFluoride=50&maxVitaminB5=50&maxVitaminB3=50&maxIodine=50&minCarbs=0&maxCalories=${$inputValue}&minAlcohol=0&maxCopper=50&maxCholine=50&maxVitaminB6=50&minIron=0&maxManganese=50&minSodium=0&minSugar=0&maxFat=20&minCholine=0&maxVitaminC=50&maxVitaminB2=50&minVitaminB12=0&maxFolicAcid=50&minZinc=0&offset=0&maxProtein=100&minCalories=0&minCaffeine=0&minVitaminD=0&maxVitaminE=50&minVitaminB2=0&minFiber=0&minFolate=0&minManganese=0&maxPotassium=50&maxSugar=50&maxCaffeine=50&maxCholesterol=50&maxSaturatedFat=50&minVitaminB3=0&maxFiber=50&maxPhosphorus=50&minPotassium=0&maxSelenium=50&maxCarbs=100&minCalcium=0&minCholesterol=0&minFluoride=0&maxVitaminD=50&maxVitaminB12=50&minIodine=0&maxZinc=50&minSaturatedFat=0&minVitaminB1=0&maxFolate=50&minFolicAcid=0&maxMagnesium=50&minVitaminK=0&maxSodium=50&maxAlcohol=50&maxCalcium=50&maxVitaminA=50&maxVitaminK=50&minVitaminB5=0&maxIron=50&minCopper=0&maxVitaminB1=50&number=${$resultsNo}&minVitaminA=0&minPhosphorus=0&minVitaminB6=0&minFat=5&minVitaminE=0`,
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
        "X-RapidAPI-Host":
          "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      },
    })
      .then((data) => {
        if (!data.length) {
          // show no result message and return
        }
        cardRecipes = data;
        console.log(cardRecipes);
        $.each(cardRecipes, function (_, cardRecipe) {
          modalIds.push(cardRecipe.id);
        });
        console.log(modalIds);
        addCards();
        // getModalInfo();
        addModals();
      })
      .catch((e) => console.log(e))
      .then(() => displayLoading(false));
  } else {
    return;
  }
}

//Display loading while awaiting the response
function displayLoading(isLoading) {
  if (isLoading) {
    $("#main").append(`<div id="loading" class="text-center">
                   Loading... 
                      </div>`);
  } else {
    $('div[id="loading"]').remove();
  }
}

//Function to populate the cards
function addCards() {
  //Clears the precious cards when a new search parameter is inserted
  $("#main").empty();
  //Iterates the response
  $.each(cardRecipes, function (_, cardRecipe) {
    //Appends the recipes in cards to main element
    $("#main").append(`<div class="card text-center col p-1">
                            <img src="${cardRecipe.image}" class="card-img-top" alt="${cardRecipe.title}" />
                            <div class="card-body">
                              <div class="card-title">
                              ${cardRecipe.title}
                              </div>
                              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${cardRecipe.id}">
                                View Recipe
                              </button>
                            </div>
                        </div>`);
  });
}

//This function requests data from API using IDs stored in modalIds
function getModalInfo() {
  return new Promise((resolve, reject) => {
    let modalIdsStr = modalIds.join(",");
    console.log(modalIdsStr);
    $.ajax({
      async: false,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk?ids=${modalIdsStr}`,
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
        "X-RapidAPI-Host":
          "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      },
    })
      .then((data) => {
        if (!data.length) {
          // show no result message and return
        }
        modalRecipes = data;
        console.log(modalRecipes);
        resolve();
      })
      .catch((e) => {
        console.log(e);
        reject();
      })
      .then(() => displayLoading(false));
  });
}

//This adds Modals with data fetched from API
function addModals() {
  getModalInfo().then(() => {
    $.each(modalRecipes, function (_, modalRecipe) {
      $("#main").append(`<!-- The Modal -->
                        <div class="modal shadow-lg" id="${modalRecipe.id}">
                          <div class="modal-dialog">
                            <div class="modal-content">

                              <!-- Modal Header -->
                              <div class="modal-header">
                                <h4 class="modal-title">${modalRecipe.title}</h4>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                              </div>

                              <!-- Modal body -->
                              <div class="modal-body"">
                                <p>${modalRecipe.instructions}</p>

                              </div>

                              <!-- Modal footer -->
                              <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                              </div>

                            </div>
                          </div>
                        </div>`);
    });
  });
}

//This function requests carousel items info from API
function getModalCarsInfo() {
  return new Promise((resolve, reject) => {
    let carouselIdsStr = carouselIds.join(",");
    console.log(carouselIdsStr);
    $.ajax({
      async: false,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk?ids=${carouselIdsStr}`,
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
        "X-RapidAPI-Host":
          "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      },
    })
      .then((data) => {
        if (!data.length) {
          // show no result message and return
        }
        modalCarsRecipes = data;
        console.log(modalCarsRecipes);
        resolve();
      })
      .catch((e) => {
        console.log(e);
        reject();
      })
      .then(() => displayLoading(false));
  });
}

//This function creates modals for carousel recipes
function addCarsModals() {
  getModalCarsInfo().then(() => {
    $.each(modalCarsRecipes, function (_, modalCarsRecipe) {
      $("#carousel-div").append(`<!-- The Modal -->
                        <div class="modal shadow-lg" id="${modalCarsRecipe.id}">
                          <div class="modal-dialog">
                            <div class="modal-content">

                              <!-- Modal Header -->
                              <div class="modal-header">
                                <h4 class="modal-title">${modalCarsRecipe.title}</h4>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                              </div>

                              <!-- Modal body -->
                              <div class="modal-body"">
                                <p>${modalCarsRecipe.instructions}</p>

                              </div>

                              <!-- Modal footer -->
                              <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                              </div>

                            </div>
                          </div>
                        </div>`);
    });
  });
}

//Changes the values of button and input placeholder on selection
function criteriaHandler() {
  $("#input").val("");
  const text = $(this).text();
  $('button[id="criteria"]').text(text);
  const placeHolder =
    text === "Recipe"
      ? $("#input").attr("placeholder", "Name of your recipe")
      : text === "Ingredients"
      ? $("#input").attr("placeholder", "Separate by Comma")
      : text === "Nutritional Value"
      ? $("#input").attr("placeholder", "in Calories")
      : $("#input").attr("placeholder", "Search Here");
}

function storeModalId() {
  console.log("yes!");
  let modalId = $(this).attr("id");
  console.log(modalId.val());
  visitedIds = JSON.parse(localStorage.getItem(visitedIds)) || [];
  if (visitedIds.indexOf(modalId) === -1) {
    visitedIds.push(modalId);
    localStorage.setItem("visitedIds", JSON.stringify(visitedIds));
  }
}
