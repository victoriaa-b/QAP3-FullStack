const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");


const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "fullStack",
        resave: false,
        saveUninitialized: true,
    })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const USERS = [
    {
        id: 1,
        username: "AdminUser",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin123", SALT_ROUNDS), //In a database, you'd just store the hashes, but for 
                                                            // our purposes we'll hash these existing users when the 
                                                            // app loads
        role: "admin",
    },
    {
        id: 2,
        username: "RegularUser",
        email: "user@example.com",
        password: bcrypt.hashSync("user123", SALT_ROUNDS),
        role: "user", // Regular user
    },
];

// GET /login - Render login form
app.get("/login", (request, response) => {
    response.render("login");
});

// POST /login - Allows a user to login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // need to check for the user email 
    const user = USERS.find(user => user.email === email);

    // reminder to use bcrypt when checking!!!
    // throw an error if there isnt a user or password is wrong
    if (!user || !bcrypt.compareSync(password, user.password)) {
      
        return res.render("login", {errorMessage: "Incorrect Email or Password. Try Again.",
      });
    }

    req.session.user = user; // this will store everything in the session 
    // note to double check when logic is done
    res.redirect("/landing");

});

// GET /signup - Render signup form
app.get("/signup", (request, response) => {
    response.render("signup");
});

// POST /signup - Allows a user to signup
app.post("/signup", (request, response) => {
  const { username, email, password, role } = request.body;

  // want to check if the email or the user is available or already taken
  // dont want to specify which one
  const availableUserInfo = USERS.find(
    (user) => user.email === email || user.username === username
  );
  if (availableUserInfo) {
    return response.render("signup", {
      errorMessage:
        "Email or Username is already in use. Please try another one.",
    });
  }

  // check the passowrd for the use of bcrypt
  const passwordCheck = bcrypt.hashSync(password, SALT_ROUNDS);

  // need a new user object
  const addedUser = {
    id: USERS.length + 1,
    username,
    email,
    password: passwordCheck, // checks the password that was hashed
    role: role || "user", // if role isn't picked we will make it a user
  };

  // store the user info
  USERS.push(addedUser);

  // need to sotre the user in session with REQUEST -- missing
  request.session.user = {
    id: addedUser.id,
    username: addedUser.username,
    role: addedUser.role,
  };
  // directs to the landing page if the sign up was successful
  response.redirect("/landing"); // CHECK
});

// GET / - Render index page or redirect to landing if logged in
app.get("/", (request, response) => {
    if (request.session.user) {
        return response.redirect("/landing");
    }
    response.render("index");
});

// GET /landing - Shows a welcome page for users, shows the names of all users if an admin
app.get("/landing", (request, response) => {
    
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
