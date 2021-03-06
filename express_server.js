const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const {
  findUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["userId"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//add routes
//GET

app.get("/", (req, res) => {
  res.redirect(`/login`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["userId"];
  if (!userId) {
    res.redirect(`/login`);
    return;
  } else {
    const templateVars = { user: users[userId] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let userId = req.session["userId"];
  if (!userId) {
    res.redirect(`/login`);
  } else {
    // userId = req.session['userId'].id
    const userUrls = urlsForUser(userId, urlDatabase);
    const templateVars = { urls: userUrls, user: users[userId] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["userId"];
  if (!userId) {
    res.send("Please login to view your links.");
    return;
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      users: req.session["userId"],
      user: users[userId],
    };
    res.render("urls_show", templateVars);
  }
});

//redirect short urls to their referenced webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//get register page
app.get("/register", (req, res) => {
  const templateVars = { user: req.session["userId"] };
  res.render("urls_register", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: req.session["userId"] };
  res.render("urls_login", templateVars);
});

//POST

//recieve form submission
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session["userId"],
  };
  res.redirect(`/urls`);
});

//delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId1 = req.session["userId"];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === userId1) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send("Cannot delete URL. Please login.");
  }
});

//update urls
app.post("/urls/:id", (req, res) => {
  const userId1 = req.session["userId"];
  const shortURL = req.params.id;
  let longURL = req.body.longURL;
  console.log('longurl', longURL)
  if (!longURL.includes('http')) {
    longURL = 'http://' + longURL;
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId1) {
    urlDatabase[shortURL]["longURL"] = longURL;
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send("Cannot edit URL. Please login.");
  }
});

//login cookies
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (email.length === 0 || password.length === 0) {
    res.status(403).send("Error 403: Please fill out form.");
  } else if (!user || !bcrypt.compareSync(password, user.password)) {
    res
      .status(403)
      .send(
        "Error 403: User or password incorrect. Please ensure you are registered."
      );
  } else {
    req.session.userId = user.id;
    res.redirect("/urls");
  }
});

//logout cookies
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/urls");
});

//register a user
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Error 400: Please input your email or password.");
  } else if (findUserByEmail(req.body.email, users)) {
    res
      .status(400)
      .send("Error 400: Email already exists. Please use a new one.");
  } else {
    const newUser = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    users[randomID] = newUser;
    req.session.userId = newUser.id;
    res.redirect("/urls");
  }
});

//verify server is listening
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
