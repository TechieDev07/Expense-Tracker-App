import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend");
const USERS_FILE = path.join(__dirname, "users.json");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(frontendPath));

// ✅ Load users from file if it exists
let users = [];
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

// ✅ Store expenses per user (in-memory for now)
let expenses = {};



// 🟢 Signup
app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: "Signup successful!" });
});

// 🟢 Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Initialize user expenses if not already
  if (!expenses[username]) expenses[username] = [];
  res.json({ message: "Login successful" });
});

// ---------------------- EXPENSE ROUTES ----------------------

// 🟢 Add Expense
app.post("/api/expense/add", (req, res) => {
  const { username, title, amount, category, date } = req.body;
  if (!username || !title || !amount || !category || !date)
    return res.status(400).json({ message: "Missing fields" });

  const newExpense = {
    id: Date.now().toString(),
    title,
    amount,
    category,
    date,
  };

  if (!expenses[username]) expenses[username] = [];
  expenses[username].push(newExpense);

  res.json({ message: "Expense added successfully", expense: newExpense });
});

// 🟢 Get All Expenses
app.get("/api/expense/all/:username", (req, res) => {
  const username = req.params.username;
  res.json(expenses[username] || []);
});

// 🟢 Delete Expense
app.delete("/api/expense/:username/:id", (req, res) => {
  const { username, id } = req.params;
  if (!expenses[username])
    return res.status(404).json({ message: "User not found" });

  expenses[username] = expenses[username].filter((exp) => exp.id !== id);
  res.json({ message: "Expense deleted successfully" });
});

// ---------------------- SERVE FRONTEND ----------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
