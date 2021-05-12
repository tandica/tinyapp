const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; 

//tell Express to use EJS as template engine
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

//generate random string
const generateRandomString = function (length) {
    let randomString = '';
    let symbol = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        randomString += symbol[Math.floor(Math.random() * symbol.length)]
    }
    return randomString;
}

//create url database with specified websites
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//store and access users in the app
const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
}

//access user emails
const findUserByEmail = (email) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user];
        }
    }
    return null;
}

//add routes
//GET

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

app.get("/urls/new", (req, res) => {
    //const loginData = { username: req.cookies["userId"] };
    const templateVars = { user: req.cookies['userId'] }
    res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
    //get username and render the appropriate form
    //let username = req.cookies['userId']
    //console.log('username from urls:', username)
    const templateVars = {  urls: urlDatabase, user: users[req.cookies['userId']] }
    //console.log('req.cookies:', req.cookies['userId'].id)
    res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    //const loginData = { username: req.cookies["userId"] };
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies['userId'] };
    res.render("urls_show", templateVars);
});  

//redirect short urls to their referenced webpage
app.get("/u/:shortURL", (req, res) => {
    //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    const longURL = urlDatabase[req.params.shortURL];
    console.log('req.params:', req.params)
    console.log('longURL:', longURL)
    res.redirect(longURL);
});

//get register page
app.get("/register",  (req, res) => {
    //let username = req.cookies['userId'] 
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies['userId']};
    res.render('urls_register', templateVars);
})

//login page
app.get("/login",  (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies['userId'] };
    res.render('urls_login', templateVars);
})


//POST

//recieve form submission
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString()
    urlDatabase[shortURL] = req.body.longURL;
    //view database to see if its being updated
    console.log('urldatabase:', urlDatabase);
    console.log('req.body:', req.body.longURL);
    res.redirect(`/urls/${shortURL}`);
});

//delete urls
app.post("/urls/:shortURL/delete",  (req, res) => {
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
    //console.log('first:', users[user])
    if (!findUserByEmail(req.body.email)) {
        res.status(403).send('Error 403: Email not found. Please register.');
    } else if (findUserByEmail(req.body.email)['password'] !== req.body.password) {
        res.status(403).send('Error 403: Password incorrect.');
    } else {
        const foundUserID = findUserByEmail(req.body.email).id;
        res.cookies('userId', foundUserID);
    }
//console.log(users[user])
    //let username = req.body.Username;
    //console.log(username);
    //res.cookie('Username', username);
    res.redirect('/urls');
});

//logout cookies
app.post("/logout",  (req, res) => {
    //let username = req.body.Username;
 
    res.clearCookie('userId');
    res.redirect('/urls');
});

//register a user 
app.post("/register",  (req, res) => {
    let user = generateRandomString();
    if (req.body.email === '' || req.body.password === '') {
        res.status(400).send('Error 400: Please input your email.');
    } else if (findUserByEmail(req.body.email)) {
        res.status(400).send('Error 400: Email already exists. Please use a new one.');
    }
    const newUser = {
        id: user, 
        email: req.body.email, 
        password: req.body.password }
        users[user] = newUser;
    res.cookie('userId', newUser.id)
    res.redirect('/urls');
});

//verify server is listening
app.listen(PORT, () => {
console.log(`App listening on port ${PORT}!`);
});
