"use strict";

const elLogoutBtn = document.querySelector(".header__logout-btn");
const elHeaderInput = document.querySelector(".header__input");
const elSearchResultCounts = document.querySelector(".search-result");
const elCardsList = document.querySelector(".cards__list");
const elBookmarksList = document.querySelector(".bookmarks__list");
const elPaginationList = document.querySelector(".pagination__list");
const elTemplate = document.querySelector(".template").content;
const elPaginationTemplate = document.querySelector(
  ".template-pagination"
).content;
const elBookmarksTemplate =
  document.querySelector(".bookmark-template").content;
const elModal = document.querySelector(".modal");
const elOverlay = document.querySelector(".overlay");
const elCloseBtn = document.querySelector(".modal__close");
const elNewestBtn = document.querySelector(".hero__btn");
const elPagination = document.querySelector(".pagination");

const localToken = window.localStorage.getItem("token");
let booksArr = [];
let order = "relevance";
let page = 2;
let maxPage;
let totalBooks;
let elHeaderInputValue;

let bookmarkLocalStorage = JSON.parse(window.localStorage.getItem("bookmarks"));
let bookmarksArr = bookmarkLocalStorage || [];

if (!localToken) {
  window.location.replace("login.html");
}

elLogoutBtn.addEventListener("click", function () {
  window.localStorage.removeItem("token");

  window.location.replace("login.html");
});

const renderBooks = function (arr, node) {
  const booksFragment = document.createDocumentFragment();
  node.innerHtml = null;

  arr.forEach((item) => {
    const clonedBookTemplate = elTemplate.cloneNode(true);

    clonedBookTemplate.querySelector(".cards__item-img").src =
      item.volumeInfo.imageLinks?.thumbnail;
    clonedBookTemplate.querySelector(".cards__item-title").textContent =
      item.volumeInfo?.title;
    clonedBookTemplate.querySelector(".cards__item-desc").textContent =
      item.volumeInfo?.authors[0];
    clonedBookTemplate.querySelector(".cards__item-year").textContent =
      item.volumeInfo?.publishedDate;
    clonedBookTemplate.querySelector(
      ".cards__item-bookmark-btn"
    ).dataset.bookmarkId = item.id;
    clonedBookTemplate.querySelector(
      ".cards__item-moreinfo-btn"
    ).dataset.moreinfoId = item.id;
    clonedBookTemplate.querySelector(".cards__item-read-btn").dataset.readId =
      item.id;

    clonedBookTemplate.querySelector(".cards__item-read-btn").href =
      item.volumeInfo.previewLink;

    booksFragment.appendChild(clonedBookTemplate);
  });

  node.innerHTML = null;
  node.appendChild(booksFragment);
};

const renderBookmarks = function (arr, node) {
  const booksFragment = document.createDocumentFragment();
  node.innerHTML = null;

  arr.forEach((item) => {
    const clonedBookTemplate = elBookmarksTemplate.cloneNode(true);

    clonedBookTemplate.querySelector(".bookmarks__item-title").textContent =
      item.volumeInfo?.title;

    clonedBookTemplate.querySelector(".bookmarks__item-desc").textContent =
      item.volumeInfo?.authors[0];

    clonedBookTemplate.querySelector(".bookmarks__item-read-btn").href =
      item.volumeInfo.previewLink;

    clonedBookTemplate.querySelector(
      ".bookmarks__item-delete-img"
    ).dataset.bookmarkDeleteId = item.id;

    clonedBookTemplate.querySelector(
      ".bookmarks__item-read-img"
    ).dataset.bookmarkReadId = item.id;

    booksFragment.appendChild(clonedBookTemplate);
  });

  node.appendChild(booksFragment);
  window.localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
};

const renderPagination = function (totalBooks, node, page) {
  const paginationFragment = document.createDocumentFragment();
  node.innerHTML = null;
  maxPage = Math.ceil(totalBooks / 10);

  for (let i = 1; i <= maxPage; i++) {
    const clonedPaginationTemplate = elPaginationTemplate.cloneNode(true);

    clonedPaginationTemplate.querySelector(
      ".pagination__item-btn"
    ).textContent = i;

    clonedPaginationTemplate.querySelector(
      ".pagination__item-btn"
    ).dataset.pageId = i;

    if (i === page) {
      clonedPaginationTemplate
        .querySelector(".pagination__item-btn")
        .classList.add("focus");

      if (page === 1) {
        document
          .querySelector(".pagination__prev-btn")
          .classList.add("disabled");
      } else {
        document
          .querySelector(".pagination__prev-btn")
          .classList.remove("disabled");
      }
    }

    if (page === maxPage && i === maxPage) {
      document.querySelector(".pagination__next-btn").classList.add("disabled");
    } else {
      document
        .querySelector(".pagination__next-btn")
        .classList.remove("disabled");
    }

    paginationFragment.appendChild(clonedPaginationTemplate);
  }

  node.appendChild(paginationFragment);
};

const openMoreInfo = function (book) {
  document.querySelector(".modal__title").textContent = book.volumeInfo?.title;
  document.querySelector(".modal__main-img").src =
    book.volumeInfo.imageLinks?.thumbnail;
  document.querySelector(".modal__desc").textContent =
    book.volumeInfo?.description;
  document.querySelector(".person").textContent = book.volumeInfo?.authors[0];
  document.querySelector(".year").textContent = book.volumeInfo?.publishedDate;
  document.querySelector(".publishers").textContent =
    book.volumeInfo?.publisher;
  document.querySelector(".catigories").textContent =
    book.volumeInfo?.categories[0];
  document.querySelector(".page-count").textContent =
    book.volumeInfo?.pageCount;
  document.querySelector(".modal__btn").href = book.volumeInfo.previewLink;

  elOverlay.classList.remove("hidden");
  elModal.classList.remove("hidden");
};

elCloseBtn.addEventListener("click", function () {
  elModal.classList.add("hidden");
  elOverlay.classList.add("hidden");
});

elOverlay.addEventListener("click", function () {
  elModal.classList.add("hidden");
  elOverlay.classList.add("hidden");
});

document.addEventListener("keydown", function (evt) {
  if (evt.key === "Escape") {
    elModal.classList.add("hidden");
    elOverlay.classList.add("hidden");
  }
});

elNewestBtn.addEventListener("click", () => {
  order = "newest";
  getBooks(booksArr, page, order);
});

renderBookmarks(bookmarksArr, elBookmarksList);

const getBooks = async function (book, page, order) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${book}&startIndex=${page}&orderBy=${order}`
    );

    const data = await response.json();

    totalBooks = data.totalItems;

    booksArr = data.items;

    renderPagination(totalBooks, elPaginationList, page);

    elSearchResultCounts.textContent = maxPage;

    if (booksArr.length > 0) {
      renderBooks(data.items, elCardsList);
    } else {
      elCardsList.innerHTML = "Book not found";
    }
  } catch (err) {
    alert(err);
  }
};

getBooks("python", page, order);

elHeaderInput.addEventListener("change", function () {
  elHeaderInputValue = elHeaderInput.value;

  getBooks(elHeaderInputValue, page, order);
});

elCardsList.addEventListener("click", (evt) => {
  if (evt.target.matches(".cards__item-bookmark-btn")) {
    const bookmarkBtnId = evt.target.dataset.bookmarkId;

    const foundBookmarkBook = booksArr.find((book) => {
      return book.id === bookmarkBtnId;
    });

    if (!bookmarksArr.includes(foundBookmarkBook)) {
      bookmarksArr.push(foundBookmarkBook);
    }

    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
    renderBookmarks(bookmarksArr, elBookmarksList);
  } else if (evt.target.matches(".cards__item-moreinfo-btn")) {
    const moreinfoBtnId = evt.target.dataset.moreinfoId;

    const foundMoreInfoBook = booksArr.find((book) => {
      return book.id === moreinfoBtnId;
    });

    openMoreInfo(foundMoreInfoBook);
  }
});

elBookmarksList.addEventListener("click", (evt) => {
  if (evt.target.matches(".bookmarks__item-delete-img")) {
    const bookmarkDeleteBtnId = evt.target.dataset.bookmarkDeleteId;

    const foundBookmarkBook = bookmarksArr.findIndex((bookmark) => {
      return bookmark.id === bookmarkDeleteBtnId;
    });

    bookmarksArr.splice(foundBookmarkBook, 1);

    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
    renderBookmarks(bookmarksArr, elBookmarksList);
  } else if (evt.target.matches(".bookmarks__item-read-img")) {
    const bookmarkReadBtnId = evt.target.dataset.bookmarkReadId;

    const foundBookmarkBook = bookmarksArr.find((bookmark) => {
      return bookmark.id === bookmarkReadBtnId;
    });
  }
});

elPagination.addEventListener("click", (evt) => {
  if (evt.target.matches(".pagination__prev-img") && page !== 1) {
    page--;
    getBooks(elHeaderInputValue, page, order);
  } else if (evt.target.matches(".pagination__next-img") && page !== maxPage) {
    renderPagination(totalBooks, elPaginationList, ++page);
    getBooks(elHeaderInputValue, page, order);
  } else if (evt.target.matches(".pagination__item-btn")) {
    page = evt.target.dataset.pageId * 1;
    getBooks(elHeaderInputValue, page, order);
  }
});
