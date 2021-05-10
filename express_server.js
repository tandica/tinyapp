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

//verify server is listening
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
