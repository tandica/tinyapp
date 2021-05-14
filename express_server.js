const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const PORT = 8080; 

//tell Express to use EJS as template engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({    
    name: "session",   
    keys: ['userId'],
    maxAge: 24 * 60 * 60 * 1000   
}));

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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


//add routes
//GET

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
    const userId = req.session['userId'].id;
    if (!userId) {
        res.redirect(`/login`);
        return;
    } else {

        const templateVars = { user: users[userId] };
        res.render("urls_new", templateVars);
    }
});

app.get("/urls", (req, res) => {
    let userId = req.session['userId'];
    console.log('userid:', userId);
    console.log('users:', users)
    if (!userId) {
        //const templateVars = {  urls: userUrls, userId, user: users[userId] }
        //res.render("urls_index", templateVars);
        res.redirect(`/login`);
    } else {
        userId = req.session['userId'].id
        const userUrls = urlsForUser(userId, urlDatabase);
        console.log('userURLS:', userUrls)
        const templateVars = {  urls: userUrls, user: users[userId] }
        console.log({templateVars})
        res.render("urls_index", templateVars);
    }
});

app.get("/urls/:shortURL", (req, res) => {
    //const loginData = { username: req.cookies["userId"] };
    const userId = req.session['userId'];
    if (!userId) {
        res.send('Please login to view your links.')
        return;
    } else {
        const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user: req.session['userId'] };
        res.render("urls_show", templateVars);
    }
});  

//redirect short urls to their referenced webpage
app.get("/u/:shortURL", (req, res) => {
    //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    console.log('req.params:', req.params)
    console.log('longURL:', longURL)
    res.redirect(longURL);
});

//get register page
app.get("/register",  (req, res) => {
    //let username = req.cookies['userId'] 
    //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user: req.cookies['userId'] };
    const templateVars = { user: req.session['userId'] };
    res.render('urls_register', templateVars);
})

//login page
app.get("/login",  (req, res) => {
    const templateVars = { user: req.session['userId'] };
    res.render('urls_login', templateVars);
})


//POST

//recieve form submission
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString()
    console.log('req session:',  req.session['userId'].id)


    urlDatabase[shortURL] = {
        longURL: req.body.longURL, userID: req.session['userId'].id };
    //view database to see if its being updated
    console.log('urldatabase:', urlDatabase);
    console.log('req.body:', req.body.longURL);
    res.redirect(`/urls/${shortURL}`);
});

//delete urls
app.post("/urls/:shortURL/delete",  (req, res) => {
    const userId1 = req.session['userId'].id;
    console.log('userid1:', userId1)
    const shortURL = req.params.shortURL;
    console.log('shorturl:', shortURL, urlDatabase[shortURL].userID);
    if (urlDatabase[shortURL].userID === userId1) {
        delete urlDatabase[req.params.shortURL];
        res.redirect('/urls');
        return;
    } else {
        res.status(403).send('Cannot delete URL')
    }

});

//update urls
app.post("/urls/:id",  (req, res) => {
    const userId1 = req.session['userId'];
    const shortURL = req.params.id;
    const longURL = req.body.longURL;
    if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId1) {
        urlDatabase[shortURL]['longURL'] = longURL;
        res.redirect('/urls');
        return;
    } else {
        res.status(403).send('Cannot edit URL')
    }
    
    //add new urls to the database
});

//login cookies
app.post("/login",  (req, res) => {
    //console.log('first:', users[user])
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = findUserByEmail(email);
    console.log('email:', userEmail)
if (email.length === 0 || password.length === 0) {
    res.status(403).send('Error 403: Email not found. Please fill out form.');
} else if (!userEmail || !bcrypt.compareSync(password, userEmail.password)) {
    res.status(403).send('Error 403: User or password incorrect. Please ensure you are registered.');
} else {
    req.session.userID = userEmail;
    //res.cookie('userId', userEmail.id);
    res.redirect('/urls');
}
});

//logout cookies
app.post("/logout",  (req, res) => {
    //let username = req.body.Username;
    res.clearCookie('session');
    res.redirect('/urls');
});
        

//register a user 
app.post("/register",  (req, res) => {
    let randomID = generateRandomString();
    if (req.body.email === '' || req.body.password === '') {
        res.status(400).send('Error 400: Please input your email.');
    } else if (findUserByEmail(req.body.email)) {
        res.status(400).send('Error 400: Email already exists. Please use a new one.');
    }
    console.log("before adding", users)
    const newUser = {
        id: randomID, 
        email: req.body.email, 
        password: bcrypt.hashSync(req.body.password, 10) }
        users[randomID] = newUser;
        console.log(bcrypt.hashSync(req.body.password, 10))
        //res.cookie('userId', randomID);
    req.session.userId = newUser;
    console.log("after adding", users)
    res.redirect('/urls');
});

//verify server is listening
app.listen(PORT, () => {
console.log(`App listening on port ${PORT}!`);
});
