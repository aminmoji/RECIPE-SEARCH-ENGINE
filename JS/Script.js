let $ingredients;
let cardRecipes = [];
// let isLoading = false;

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
      console.log(recipe);

      $('div[class="carousel-indicators"]').append(
        `<button type="button" data-bs-target="#carouselApi" data-bs-slide-to="${i}" class="${
          i === 0 ? "active" : ""
        }" aria-current="${
          "class" === "active" ? "true" : "false"
        }" aria-label="Slide ${i + 1}"></button>`
      );

      $('div[class="carousel-inner"]').append(
        `<div class="carousel-item ${i === 0 ? "active" : ""}">
        <img src="${recipe.image}" class="d-block w-100" alt="">
        <div class="carousel-caption d-none d-md-block">
                    <p>${recipe.title}</p>
                  </div>
                </div>`
      );
      // $('img[class="d-block w-100"]').attr("src", recipe.image);
      // $('a[class="caption"]').text(recipe.title);
    });
  });
});

$("#search-btn").on("click", eventHandlerNutri);

function eventHandlerNutri(e) {
  e.preventDefault();
  $ingredients = $("#input").val();
  displayLoading(true);
  $.ajax({
    async: true,
    crossDomain: true,
    url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?ingredients=${$ingredients}&number=5&ignorePantry=true&ranking=1`,

    method: "GET",
    headers: {
      "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    },
  })
    .then((data) => {
      if (!data.length) {
        // show no result message and return
      }
      cardRecipes = data;
      console.log(data);
      addCards();
    })
    .catch((e) => console.log(e))
    .then(() => displayLoading(false));
}

function displayLoading(isLoading) {
  if (isLoading) {
    $("#form").append(`<div id="loading">
                   Loading... 
                      </div>`);
  } else {
    $('div[id="loading"]').remove();
  }
}

function addCards() {
  console.log(cardRecipes);
  // $('div[class="card"]').remove();
  $("#cardGrid").empty();
  $.each(cardRecipes, function (_, cardRecipe) {
    $("#cardGrid").append(`<div class="card col">
                        <img src="${cardRecipe.image}" class="card-img-top" alt="${cardRecipe.title}" />
                        <div class="card-body">
                        ${cardRecipe.title}
                        </div>
                      </div>
    `);
  });
}
