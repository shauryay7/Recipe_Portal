const express = require("express");

const mysqlConnect = require("../data_base.js");

const Router = express.Router();

Router.route("/")
    .get((req, res) => {
        mysqlConnect.query("SELECT * from recipes", (err, row, field) => {
            if (!err) {
                res.status(200).send(row);
            } else {
                console.log(err);
            }
        });
    })
    .post((req, res) => {
        const {
            recipeId,
            recipeTitle,
            recipeAuthor, // name (e.g., "Shaurya")
            createdAt,
            recipeContent,
            recipeCategory,
        } = req.body;

        const authorQuery = "SELECT authorId FROM authors WHERE authorName = ?";
        mysqlConnect.query(authorQuery, [recipeAuthor], (err, result) => {
            if (err || result.length === 0) {
                console.log(err || "Author not found");
                return res.status(400).send("Invalid author name.");
            }

            const authorId = result[0].authorId;
            const post = [
                recipeId,
                recipeTitle,
                authorId,
                createdAt,
                recipeContent,
                recipeCategory,
            ];
            const sql =
                "INSERT INTO recipes (recipeId,recipeTitle,authorId,createdAt,recipeContent,recipeCategory) VALUES (?,?,?,?,?,?)";

            mysqlConnect.query(sql, post, (err, results) => {
                if (!err) {
                    res.status(201).send(`Recipe added with ID:${recipeId}`);
                } else {
                    console.log(err);
                    res.status(500).send("Error inserting recipe.");
                }
            });
        });
    });

Router.route("/:recipeId")
    .get((req, res) => {
        const id = req.params.recipeId;
        mysqlConnect.query(
            "SELECT * FROM recipes WHERE recipeId = ?",
            [id],
            (err, results) => {
                if (!err) {
                    const [row] = results;
                    res.status(200).send(row);
                } else {
                    console.log(err);
                }
            }
        );
    })
    .put((req, res) => {
        const id = req.params.recipeId;
        const {
            recipeTitle,
            recipeAuthor,
            recipeContent,
            recipeCategory,
        } = req.body;

        const authorQuery = "SELECT authorId FROM authors WHERE authorName = ?";
        mysqlConnect.query(authorQuery, [recipeAuthor], (err, result) => {
            if (err || result.length === 0) {
                console.log(err || "Author not found");
                return res.status(400).send("Invalid author name.");
            }

            const authorId = result[0].authorId;
            const recipe = {
                recipeTitle,
                authorId,
                recipeContent,
                recipeCategory,
            };

            mysqlConnect.query(
                "UPDATE recipes SET ? WHERE recipeId = ?",
                [recipe, id],
                (err, results) => {
                    if (!err) {
                        res.send(`Recipe updated with ID: ${id}`);
                    } else {
                        console.log(err);
                        res.status(500).send("Error updating recipe.");
                    }
                }
            );
        });
    })
    .delete((req, res) => {
        const id = req.params.recipeId;
        mysqlConnect.query(
            "DELETE FROM recipes WHERE recipeId = ?",
            id,
            (err, results) => {
                if (!err) {
                    res.send(`Recipe deleted with ID:${id}`);
                } else {
                    console.log(err);
                }
            }
        );
    });

module.exports = Router;