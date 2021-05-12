const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; 

//tell Express to use EJS as template engine
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

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

//generate random string
const generateRandomString = function (length) {
    let randomString = '';
    let symbol = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        randomString += symbol[Math.floor(Math.random() * symbol.length)]
    }
    return randomString;
}

//add routes
app.get("/urls/new", (req, res) => {
    const loginData = { username: req.cookies["Username"] };
    res.render("urls_new");
});

app.get("/urls", (req, res) => {
    //get username and render the appropriate form
    let username = req.cookies['Username']
    console.log('username from urls:', username)
    const templateVars = {  urls: urlDatabase, username }
    res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const loginData = { username: req.cookies["Username"] };
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});  

//recieve form submission
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString()
    urlDatabase[shortURL] = req.body.longURL;
    // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    //view database to see if its being updated
    console.log('urldatabase:', urlDatabase);
    console.log('req.body:', req.body.longURL);
    res.redirect(`/urls/${shortURL}`);
});

//redirect short urls to their referenced webpage
app.get("/u/:shortURL", (req, res) => {
    //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    const longURL = urlDatabase[req.params.shortURL];
    console.log('req.params:', req.params)
    console.log('longURL:', longURL)
    res.redirect(longURL);
});

//delete urls
app.post("/urls/:shortURL/delete",  (req, res) => {
    // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
    console.log('req params:', req.params.shortURL)
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

//update urls
app.post("/urls/:id",  (req, res) => {
    //add new urls to the database
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
});

//login cookies
app.post("/login",  (req, res) => {
    let username = req.body.Username;
    //console.log(username);
    res.cookie('Username', username);
    res.redirect('/urls');
});

//logout cookies
app.post("/logout",  (req, res) => {
    let username = req.body.Username;
    //console.log(username)
    res.cookie('Username', username);
    res.clearCookie('Username', username);
    res.redirect('/urls');
});

//verify server is listening
app.listen(PORT, () => {
console.log(`App listening on port ${PORT}!`);
});
