const BASE_URL = "https://movie-list.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/v1/movies/";
const IMG_URL = BASE_URL + "posters/";

const moviePerPage = 12;
const movies = [];
let filteredMovied = [];
let currentPage = 1;
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const displayMode = document.querySelector("#display-mode");

//把物件資料顯示成卡片
function displayMovieByCard(data) {
  let rawHtml = "";
  data.forEach((item) => {
    // title , image
    rawHtml += `        <div class="col-sm-3">
    <div class="mb-2">
    <div class="card">
    <img
    src="${IMG_URL + item.image}"
    class="card-img-top"
    alt="Movie Poster"
    />
    <div class="card-body">
    <h5 class="card-title">${item.title}</h5>
    </div>
    <div class="card-footer">
    <button
    class="btn btn-primary btn-show-movie"
    data-bs-toggle="modal"
    data-bs-target="#movie-modal"
    data-id="${item.id}"
                >
                More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${
                  item.id
                }">+</button>
                </div>
                </div>
                </div>
                </div>`;
  });

  dataPanel.innerHTML = rawHtml;
}

// 使用列表呈現
function displayMovieByList(data) {
  let rawHtml = '<ul class="list-group list-group-flush">';
  data.forEach((item) => {
    // title , image
    rawHtml += `
              <li class="list-group-item">
                <h5 class="col-9 d-inline-flex">${item.title}</h5> 
                <button
                  class="btn btn-primary col-1 btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >More</button>
                <button class="btn btn-info col-1 btn-add-favorite" data-id="${item.id}">+</button></li>
            `;
  });
  rawHtml += "</ul>";
  dataPanel.innerHTML = rawHtml;
}
//display movie by view mode
function renderMovies(data) {
  const cardBTN = document.querySelector("#card-mode-btn.active");
  if (cardBTN) {
    displayMovieByCard(data);
  } else {
    displayMovieByList(data);
  }
}

//依據資料總數及每頁顯示多少來決定會有多少分頁
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / moviePerPage);
  let rawHtml = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHtml;
}

// 決定要顯示多少內容(裁切MOVIE的資料)
function getMovieByPage(page) {
  // movie? "movie" : "filteredMovies"
  const startPage = (page - 1) * moviePerPage;
  // 三源符號。 條件 ? TRUE的話  : FLASE
  const data = filteredMovied.length ? filteredMovied : movies;
  return data.slice(startPage, startPage + moviePerPage);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release Date:" + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img class="img-fluid" src="${
      IMG_URL + data.image
    }" alt="poster">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  console.log(movies);
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  paginator.firstElementChild.classList.add("active");
  renderMovies(getMovieByPage(currentPage));
});

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmited(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovied = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovied.length === 0) {
    searchInput.value = "";
    return alert("Cannot find movie with keyword:" + keyword);
  }
  renderPaginator(filteredMovied.length);
  // 把搜尋結果導回第一頁
  currentPage = 1;
  renderMovies(getMovieByPage(currentPage));
});

searchInput.addEventListener("keyup", (e) => {
  const keyword = searchInput.value.trim();
  if (keyword === "") {
    renderPaginator(movies.length);
    filteredMovied = [];
    renderMovies(getMovieByPage(currentPage));
  }
});

paginator.addEventListener("click", function paginatorClick(event) {
  // 點擊確認
  if (event.target.tagName !== "A") return;
  // 分頁器active狀態改變
  const activeItem = document.querySelector("#paginator .active");
  if (activeItem) {
    activeItem.classList.remove("active");
  }
  event.target.parentElement.classList.add("active");
  //更改頁數
  currentPage = Number(event.target.dataset.page);

  // 依據頁數 重新顯示
  renderMovies(getMovieByPage(currentPage));
});

displayMode.addEventListener("click", (e) => {
  const activeItem = document.querySelector("#display-mode .active");
  if (activeItem) {
    activeItem.classList.remove("active");
  }
  if (e.target.matches("#card-mode-btn")) {
    const cardBTN = document.querySelector("#card-mode-btn");
    cardBTN.classList.add("active");
  } else {
    const listBTN = document.querySelector("#list-mode-btn");
    listBTN.classList.add("active");
  }
  renderMovies(getMovieByPage(currentPage));
});
