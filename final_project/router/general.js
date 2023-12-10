const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Username or Password not provided." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    new Promise((resolve, reject) => {
        resolve(books);
    })
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        let book = books[isbn];
        resolve(book);
    })
        .then(result => res.send(result))
        .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const getBooks = () => {
        return new Promise((resolve, reject) => {
            const booksArr = [...Object.values(books)];
            const filtered_books = booksArr.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
            resolve(filtered_books);
        });
    };

    getBooks()
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Internal Server Error' }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const getBooks = () => {
        return new Promise((resolve, reject) => {
            const booksArr = [...Object.values(books)];
            const filtered_books = booksArr.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
            resolve(filtered_books);
        })
    }

    getBooks()
        .then(result => res.send(result))
        .catch(error => res.status(500).send({ error: 'Internal Server Error' }));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    let book = books[isbn];
    res.send(book.reviews);
});

module.exports.general = public_users;