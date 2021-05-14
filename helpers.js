

//access user emails
const findUserByEmail = (email, users) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user];
        }
    }
    return null;
}

//generate random string
const generateRandomString = function (length) {
    let randomString = '';
    let symbol = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        randomString += symbol[Math.floor(Math.random() * symbol.length)]
    }
    return randomString;
}

//get specific urls pertaining to users
const urlsForUser = function(id, urlDatabase) {
    let userURL = {};
    console.log({urlDatabase}, {id})
    for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
        userURL[url] = urlDatabase[url];
    }
    }
    return userURL;
};

module.exports = {findUserByEmail, generateRandomString, urlsForUser}

