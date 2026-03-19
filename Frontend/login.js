document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (res.ok) {
    // ✅ Login success
    localStorage.setItem("loggedInUser", username);
    alert("Login successful!");
    window.location.href = "index.html"; // redirect to main expense tracker
  } else {
    // ❌ Login failed
    alert(data.message || "Invalid username or password");
  }
});
