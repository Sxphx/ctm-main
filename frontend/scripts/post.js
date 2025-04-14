const API_BASE_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:3000"
    : "https://ctm-main.vercel.app/";

function showAlertServer(type, topic, message) {
  toastr.options = {
    positionClass: "toast-top-center",
    preventDuplicates: true,
    timeOut: 3000,
  };
  console.log(`[${type.toUpperCase()}] ${topic}: ${message}`);
  toastr[type](message, topic);
}

async function loadLeaderboard(url, updateFn) {
  try {
    const response = await fetch(`${API_BASE_URL}/${url}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      data.sort((a, b) => b.score - a.score);
      updateFn(data);
    } else {
      throw new Error("Failed to load leaderboard");
    }
  } catch (error) {
    showAlertServer("error", "Leaderboard Error", error.message);
  }
}

function updateLeaderboardUI(data) {
  data.slice(0, 3).forEach((player, index) => {
    document.getElementById(`player${index + 1}-name`).textContent =
      player.username;
    document.getElementById(`player${index + 1}-score`).textContent =
      player.score;
  });
}

async function authenticate(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      showAlertServer("success", `${endpoint} Successful`, data.message);
      $(".modal").modal("hide");
      if (endpoint === "login") {
        updateAuthUI(data.user);
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showAlertServer("error", `${endpoint} Failed`, error.message);
  }
}

function register() {
  authenticate("register", {
    username: document.getElementById("registerUsername").value.trim(),
    password: document.getElementById("registerPassword").value.trim(),
  });
}

function login() {
  authenticate("login", {
    username: document.getElementById("loginUsername").value.trim(),
    password: document.getElementById("loginPassword").value.trim(),
  });
}

async function logout() {
  await fetch("/logout", {
    method: "POST",
    credentials: "include",
  });

  showAlertServer("success", "Logged Out", "You have successfully logged out.");
  updateAuthUI(null);
}

async function checkSession() {
  const response = await fetch(`${API_BASE_URL}/session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    const data = await response.json();
    updateAuthUI(data.user);
  } else {
    updateAuthUI(null);
  }
}

function updateAuthUI(user) {
  const usernameDisplaySet = user?.email?.split?.("@")[0] ?? "Guest";
  document.getElementById("login-btn").style.display = user ? "none" : "unset";
  document.getElementById("logout-btn").style.display = user ? "unset" : "none";
  document.getElementById("register-btn").style.display = user
    ? "none"
    : "unset";
  document.getElementById("usernameDisplay").textContent = usernameDisplaySet;
}

async function sendScore(score) {
  console.log(`Sending score: ${score}`);
  try {
    const response = await fetch(`${API_BASE_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      showAlertServer("success", "Score Submitted", data.message);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlertServer("error", "Score Submission Error", error.message);
  }
}

window.onload = () => {
  loadLeaderboard("leaderboard", updateLeaderboardUI);
  checkSession();
};
