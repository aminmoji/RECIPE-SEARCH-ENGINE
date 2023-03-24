let visitedModalRecipes;
let visitedCardRecipes = [];

$(document).ready(function () {
  addVisitedCards();
  addVisitedModals();
});

function getVisitedModalInfo() {
  return new Promise((resolve, reject) => {
    let visitedModalIdsStr = localStorage.getItem("id");
    console.log(visitedModalIdsStr);
    $.ajax({
      async: false,
      crossDomain: true,
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk?ids=${visitedModalIdsStr}`,
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
        visitedModalRecipes = data;
        console.log(visitedModalRecipes);
        resolve();
      })
      .catch((e) => {
        console.log(e);
        reject();
      })
      .then(() => displayLoading(false));
  });
}

function addVisitedCards() {
  //Clears the precious cards when a new search parameter is inserted
  $("#recent").empty();
  //Iterates the response
  $.each(visitedModalRecipes, function (_, visitedModalRecipe) {
    //Appends the recipes in cards to main element
    $("#recent").append(`<div class="card text-center col p-1">
                            <img src="${visitedModalRecipe.image}" class="card-img-top" alt="${visitedModalRecipe.title}" />
                            <div class="card-body">
                              <div class="card-title">
                              ${visitedModalRecipe.title}
                              </div>
                              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${visitedModalRecipe.id}">
                                View Recipe
                              </button>
                            </div>
                        </div>`);
  });
}

function addVisitedModals() {
  getVisitedModalInfo().then(() => {
    $.each(visitedModalRecipes, function (_, visitedModalRecipe) {
      $("#main").append(`<!-- The Modal -->
                        <div class="modal shadow-lg" id="${visitedModalRecipe.id}">
                          <div class="modal-dialog">
                            <div class="modal-content">

                              <!-- Modal Header -->
                              <div class="modal-header">
                                <h4 class="modal-title">${visitedModalRecipe.title}</h4>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                              </div>

                              <!-- Modal body -->
                              <div class="modal-body"">
                                <p>${visitedModalRecipe.instructions}</p>

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
