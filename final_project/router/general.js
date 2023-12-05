const { json } = require("express");
const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. You may now login." });
    } else {
      return res.status(403).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  const booklist = await new Promise((resolve, reject) => {
    resolve(books);
  });
  res.send(booklist);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  return new Promise((resolve, reject) => {
    const isbnNum = req.params.isbn;
    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: "Book not found." });
    }
  }).then(
    (result) => res.send(result),
    (error) => res.send(error.status).json({ message: error.message })
  );
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  const booklist = await new Promise((resolve, reject) => {
    resolve(books);
  });
  const keys = Object.entries(booklist);
  const filteredBookList = keys.filter(([key, book]) => book.author === author);
  res.send(filteredBookList);
});

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}
// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const booklist = await getBooks();

    const keys = Object.entries(booklist);
    const filteredBookList = keys.filter(([key, book]) => book.title === title);

    res.send(filteredBookList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
