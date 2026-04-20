const API_BASE = "http://localhost:5000/api";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const rememberMe = document.getElementById("rememberMe");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Hide" : "Show";
});

window.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("rememberedUsername");
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberMe.checked = true;
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  loginMessage.style.color = "#d62828";
  loginMessage.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (rememberMe.checked) {
      localStorage.setItem("rememberedUsername", username);
    } else {
      localStorage.removeItem("rememberedUsername");
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    loginMessage.style.color = "green";
    loginMessage.textContent = "Login successful";

    setTimeout(() => {
      // use relative paths to match current Frontend folder structure
     if (data.user.role === "admin") {
  window.location.href = "../admin_portal/admindashboard.html";
} else if (data.user.role === "faculty") {
  window.location.href = "../faculty_portal/faculty.html";
} else if (data.user.role === "student") {
  window.location.href = "../student_portal/student.html";
} else {
  window.location.href = "../login_portal/login.html";
}
    }, 200);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});