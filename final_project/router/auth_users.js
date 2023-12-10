const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    };
};

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    };
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Username or Password not provided." });
    };
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    };
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.body.review;
    if (review) {
        const username = req.session.authorization.username;
        const isbn = req.params.isbn;
        let book = books[isbn];
        book.reviews[username] = review;
        return res.send(`Review has been updated on book with title ${book.title}.`);
    }
    return res.status(404).json({ message: "Review not provided" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    let book = books[isbn];

    if (book.reviews[username]) {
        delete book.reviews[username]
        return res.send(`Review of user ${username} deleted.`);
    }
    return res.status(404).json({ message: `Review not found for ${username} in book ${book.title}` })
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;