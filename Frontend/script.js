const form = document.getElementById("expense-form");
const tableBody = document.querySelector("#expense-table tbody");
let username = localStorage.getItem("loggedInUser");

if (!username) window.location.href = "login.html";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expense = {
    username,
    title: document.getElementById("title").value,
    amount: parseFloat(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
  };

  await fetch("http://localhost:5000/api/expense/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });

  form.reset();
  loadExpenses();
});

async function loadExpenses() {
  const res = await fetch(`http://localhost:5000/api/expense/all/${username}`);
  const data = await res.json();
  tableBody.innerHTML = "";
  let total = 0;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5">No expenses yet!</td></tr>`;
  } else {
    data.forEach((exp) => {
      total += exp.amount;
      const row = `
        <tr>
          <td>${exp.title}</td>
          <td>₹${exp.amount}</td>
          <td>${exp.category}</td>
          <td>${new Date(exp.date).toLocaleDateString()}</td>
          <td><button onclick="deleteExpense('${exp.id}')">Delete</button></td>
        </tr>`;
      tableBody.innerHTML += row;
    });
  }

  document.getElementById("total-amount").textContent = total.toFixed(2);
  document.getElementById("total-items").textContent = data.length;
}

async function deleteExpense(id) {
  await fetch(`http://localhost:5000/api/expense/${username}/${id}`, { method: "DELETE" });
  loadExpenses();
}

loadExpenses();
