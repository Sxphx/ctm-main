const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const passwordHash = require("password-hash");
const session = require("express-session");
const { log } = require("console");
const app = express();
const path = require("path");
const port = 3001;

//connect frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "leaderboard.html"));
});

// session middleware

app.use(
  session({
    secret: process.env.SESSION_SECRET || "a7f4e9c2b1d8e3a6f5c2d9b7e4a1f8c3",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// cors middleware
app.use(
  cors({
    origin: [
      "http://127.0.0.1",
      "http://localhost",
      "http://localhost:3001",
      ,"https://ctm-main.vercel.app/"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// body-parser middleware
app.use(bodyParser.json());

//database connect
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// check connection
supabase
  .from("ctm")
  .select("*")
  .then((response) => {
    if (response.error) {
      console.error("Error connecting to Supabase:", response.error);
    } else {
      console.log("Successfully connected to Supabase:");
    }
  })
  .catch((err) => {
    console.error("Error connecting to Supabase:", err);
  });

// board
app.post("/allleaderboard", async (req, res) => {
  const { data, error } = await supabase
    .from("ctm")
    .select("username, score")
    .order("score", { ascending: false });
  console.log(data);
  if (error) return res.status(500).json({ message: "Database error", error });

  res.status(200).json(data);
});

// top
app.post("/leaderboard", async (req, res) => {
  const { data, error } = await supabase
    .from("ctm")
    .select("username, score")
    .order("score", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ message: "Database error", error });

  res.status(200).json(data);
});

// reg
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const email = `${username}@linganggu.com`;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }

  const { error: insertError } = await supabase
    .from("ctm")
    .insert([{ username: username, user_id: data.user.id, score: 0 }]);

  if (insertError) {
    console.error("Database insert error:", insertError);
    return res.status(500).json({
      message: "Failed to insert user data",
      error: insertError.message,
    });
  }

  res.status(201).json({ message: "User registered successfully", user: data });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const email = `${username}@linganggu.com`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid username or password", error: error.message });
  }

  req.session.user = {
    loggedIn: true,
    UID: data.user.id,
    username: username,
  };

  // console.log(req.session.user);

  res.status(200).json({
    message: "Login successful",
    user: req.session.user,
  });
});

app.post("/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error)
    return res.status(500).json({ message: "Failed to logout", error });

  req.session.destroy();
  // console.log(req.session);
  res.status(200).json({ message: "Logout successful" });
});

app.post("/score", async (req, res) => {
  const { score } = req.body;
  const UID = req.session.user.UID;

  // console.log(UID);

  if (!UID) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { data: oldScoreData, error: oldScoreError } = await supabase
    .from("ctm")
    .select("score")
    .eq("user_id", UID)
    .single();

  if (oldScoreError || !oldScoreData) {
    return res
      .status(500)
      .json({ message: "Database error", error: oldScoreError });
  }

  if (oldScoreData.score >= score) {
    return res.status(200).json({ message: "Score not updated" });
  }

  const { error: updateError } = await supabase
    .from("ctm")
    .update({ score: score })
    .eq("user_id", UID);

  if (updateError)
    return res
      .status(500)
      .json({ message: "Database error", error: updateError });

  res.status(200).json({ message: "Score updated successfully" });
});

app.get("/session", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    return res.status(200).json({
      loggedIn: true,
      user: req.session.user,
    });
  }
  return res.status(200).json({ loggedIn: false });
});

app.get("/checklogin", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    return res.status(200).json({
      loggedIn: true,
      user: req.session.user,
    });
  }
  return res.status(200).json({ loggedIn: false });
});

app.listen(port, () => {
  console.log(`Server is running at https://ctm-main.vercel.app/:${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
