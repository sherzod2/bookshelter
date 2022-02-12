"use strict";

let elForm = document.querySelector(".login__form");
let elUsernameInput = document.querySelector(".login__username");
let elPasswordInput = document.querySelector(".login__password");
let elLoginMistake = document.querySelector(".login__mistake");

elForm.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const usernameValue = elUsernameInput.value;
  const passwordValue = elPasswordInput.value;

  fetch("https://reqres.in/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: usernameValue,
      password: passwordValue,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data?.token) {
        window.localStorage.setItem("token", data.token);

        window.location.replace("index.html");
      } else {
        elLoginMistake.textContent = "Username yoki password xato";
        elLoginMistake.style.color = "red";
        elLoginMistake.style.textAlign = "end";
      }
    });
});
