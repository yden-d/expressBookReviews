const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  })
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data : password
    }, "access", {expiresIn : 3600});

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({message : "User successfully logged in"});
  } else {
    return res.status(404).json({message : "Invalid login. Check username and/or password."});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  console.log(username);
  const review = req.query.review;
  const isbn = req.params.isbn;

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).send(`Review for ${books[isbn].title} updated by ${username}!`);
  } else {
    return res.status(403).send("Unable to post review.");
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
      let book = books[isbn];
      delete book.reviews[username];
      return res.status(200).send("Review successfully deleted");
  }
  else {
      return res.status(404).json({message: "Book not found!"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
