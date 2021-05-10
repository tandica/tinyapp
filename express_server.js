const express = require("express");
const app = express();
const PORT = 8080; 

//tell Express to use EJS as template engine
app.set("view engine", "ejs");

//create url database with specified websites
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//start creating different paths to have various pages with different information
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//add routes
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.urlDatabase };
    res.render("urls_show", templateVars);
});  

//verify server is listening
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
