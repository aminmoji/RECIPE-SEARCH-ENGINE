let $ingredients;
let cardRecipes = [];
let modalRecipes;

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
        }" aria-current="${i === 0 ? "true" : "false"}" aria-label="Slide ${
          i + 1
        }"></button>`
      );

      $('div[class="carousel-inner"]').append(
        `<div class="carousel-item p-1 ${i === 0 ? "active" : ""}">
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
$("#criterium li a").on("click", criteriaHandler);

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
  // $('div[class="card"]').remove();
  $("#main").empty();
  // $(`#${cardRecipe}`).empty();
  $.each(cardRecipes, function (_, cardRecipe) {
    $("#main").append(`<div class="card text-center col p-1">
                            <img src="${cardRecipe.image}" class="card-img-top" alt="${cardRecipe.title}" />
                            <div class="card-body">
                              <div class="card-title">
                              ${cardRecipe.title}
                              </div>
                              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${cardRecipe.id}">
                                Open modal
                              </button>
                            </div>
                          </div>`);
    let recipeId = cardRecipe.id;
    displayLoading(true);
    $.ajax({
      async: true,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/information`,
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "57efcb2c17msh4a98997aba86fecp185c0ejsn271ea46ec6ee",
        "X-RapidAPI-Host":
          "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      },
    }).then((data) => {
      if (!data.length) {
        // show no result message and return
      }
      modalRecipes = data;
      console.log(modalRecipes);
    });

    $("#main").append(`<!-- The Modal -->
                        <div class="modal" id="${cardRecipe.id}">
                          <div class="modal-dialog">
                            <div class="modal-content">

                              <!-- Modal Header -->
                              <div class="modal-header">
                                <h4 class="modal-title">${modalRecipes.title}</h4>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                              </div>

                              <!-- Modal body -->
                              <div class="modal-body">
                              <p>${modalRecipes.extendedIngredients.original}</p>
                              <p>${modalRecipes.analyzedInstructions.steps}</p>
                              </div>

                              <!-- Modal footer -->
                              <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                              </div>

                            </div>
                          </div>
                        </div>`);
  });
}

function criteriaHandler() {
  let text = $(this).text();
  $('button[id="criteria"]').text(text);
}
