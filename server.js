const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const app = express();
const path = require("path");

// Middleware and setup
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "https://ctm-main.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Static files for frontend
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(__dirname));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Supabase connection test
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

// Define routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "leaderboard.html"));
});

app.post("/leaderboard", async (req, res) => {
  const { data, error } = await supabase
    .from("ctm")
    .select("username, score")
    .order("score", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ message: "Database error", error });

  res.status(200).json(data);
});

// Register endpoint
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

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return res.status(401).json({ message: "Invalid credentials", error });
  }

  const token = data.session.access_token;

  res.cookie("sessionToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });

  res.json({ message: "Logged in successfully", user: data.user });
});

app.post("/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error)
    return res.status(500).json({ message: "Failed to logout", error });

  res.clearCookie("sessionToken");
  res.json({ message: "Logged out" });
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

// POST /session
app.post("/session", async (req, res) => {
  const token = req.cookies.sessionToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid session", error });
    }

    return res.status(200).json({
      message: "Session valid",
      user: {
        email: user.email,
        UID: user.id,
      },
    });
  } catch (err) {
    console.error("Session check error:", err);
    res.status(500).json({ message: "Failed to check session", error: err });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Server is running at https://ctm-main.vercel.app/:${port}`);
});
