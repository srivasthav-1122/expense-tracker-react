
import { useState } from "react";
import "./App.css";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

function getUsers() {
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if (!users.some((u) => u.email === ADMIN_EMAIL)) {
    users.push({
      id: 1,
      name: "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    localStorage.setItem("users", JSON.stringify(users));
  }

  return users;
}

function App() {
  const [users, setUsers] = useState(getUsers);
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );
  const [page, setPage] = useState("login");
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState(() =>
    JSON.parse(localStorage.getItem("transactions") || "[]")
  );

  const [login, setLogin] = useState({ email: "", password: "", role: "user" });
  const [signup, setSignup] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [form, setForm] = useState({
    description: "", amount: "", category: "Food",
    type: "expense", date: new Date().toISOString().slice(0, 10)
  });

  const saveUsers = (data) => {
    setUsers(data);
    localStorage.setItem("users", JSON.stringify(data));
  };

  const saveTransactions = (data) => {
    setTransactions(data);
    localStorage.setItem("transactions", JSON.stringify(data));
  };

  function handleSignup(e) {
    e.preventDefault();
    const email = signup.email.trim().toLowerCase();

    if (signup.password !== signup.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (signup.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (users.some((u) => u.email === email)) {
      setMessage("Email already registered.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: signup.name.trim(),
      email,
      password: signup.password,
      role: "user",
    };

    saveUsers([...users, newUser]);
    setMessage("Account created successfully!");
    setSignup({ name: "", email: "", password: "", confirmPassword: "" });
    setTimeout(() => {
      setPage("login");
      setMessage("");
    }, 1000);
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = login.email.trim().toLowerCase();

    const user = users.find(
      (u) =>
        u.email === email &&
        u.password === login.password &&
        u.role === login.role
    );

    if (!user) {
      setMessage("Invalid email, password or role.");
      return;
    }

    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setMessage("");
  }

  function logout() {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setPage("login");
    setMessage("");
  }

  function addTransaction(e) {
    e.preventDefault();

    const newTransaction = {
      id: Date.now(),
      userEmail: currentUser.email,
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      type: form.type,
      date: form.date,
    };

    if (!newTransaction.description || newTransaction.amount <= 0) {
      return;
    }

    saveTransactions([...transactions, newTransaction]);
    setForm({
      description: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function deleteTransaction(id) {
    saveTransactions(transactions.filter((t) => t.id !== id));
  }

  const myTransactions = transactions.filter(
    (t) => t.userEmail === currentUser?.email
  );

  const income = myTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = myTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const money = (value) =>
    "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // LOGIN PAGE
  if (!currentUser && page === "login") {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <h1>Expense Tracker</h1>
          <p>Login to manage your money</p>

          <label>Email</label>
          <input type="email" required
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
            placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" required
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
            placeholder="Enter your password" />

          <label>Select Role</label>
          <select value={login.role}
            onChange={(e) => setLogin({ ...login, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">Login</button>
          <p className="message">{message}</p>
          <p>Don't have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("signup"); setMessage(""); }}>
              Sign Up
            </a>
          </p>
        </form>
      </div>
    );
  }

  // SIGNUP PAGE
  if (!currentUser && page === "signup") {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleSignup}>
          <h1>Create Account</h1>
          <p>Sign up for Expense Tracker</p>

          <label>Full Name</label>
          <input required value={signup.name}
            onChange={(e) => setSignup({ ...signup, name: e.target.value })}
            placeholder="Enter your name" />

          <label>Email</label>
          <input type="email" required value={signup.email}
            onChange={(e) => setSignup({ ...signup, email: e.target.value })}
            placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" required value={signup.password}
            onChange={(e) => setSignup({ ...signup, password: e.target.value })}
            placeholder="Create password" />

          <label>Confirm Password</label>
          <input type="password" required value={signup.confirmPassword}
            onChange={(e) => setSignup({ ...signup, confirmPassword: e.target.value })}
            placeholder="Confirm password" />

          <button type="submit">Sign Up</button>
          <p className="message">{message}</p>
          <p>Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("login"); setMessage(""); }}>
              Login
            </a>
          </p>
        </form>
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (currentUser.role === "admin") {
    const allIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const allExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="app">
        <header className="topbar">
          <h2>Expense Tracker - Admin</h2>
          <button className="logout" onClick={logout}>Logout</button>
        </header>

        <main className="container">
          <h2>Welcome, {currentUser.name}!</h2>
          <p>Admin Dashboard - Manage users and monitor transactions.</p>

          <div className="stats">
            <div className="stat"><h3>Total Users</h3><h2>{users.filter(u => u.role === "user").length}</h2></div>
            <div className="stat"><h3>Total Transactions</h3><h2>{transactions.length}</h2></div>
            <div className="stat"><h3>Total Income</h3><h2>{money(allIncome)}</h2></div>
            <div className="stat"><h3>Total Expenses</h3><h2>{money(allExpenses)}</h2></div>
          </div>

          <section className="panel">
            <h2>User Management</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                      <td>{u.role === "admin" ? "Protected" :
                        <button className="danger" onClick={() => {
                          if (window.confirm("Delete this user?")) {
                            saveUsers(users.filter(x => x.id !== u.id));
                          }
                        }}>Delete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>All Transactions</h2>
            <TransactionTable items={transactions} money={money} onDelete={deleteTransaction} showUser />
          </section>
        </main>
      </div>
    );
  }

  // USER DASHBOARD
  return (
    <div className="app">
      <header className="topbar">
        <h2>Expense Tracker</h2>
        <div>Welcome, {currentUser.name} <button className="logout" onClick={logout}>Logout</button></div>
      </header>

      <main className="container">
        <h2>My Dashboard</h2>

        <div className="stats">
          <div className="stat"><h3>Total Balance</h3><h2>{money(income - expenses)}</h2></div>
          <div className="stat"><h3>Total Income</h3><h2>{money(income)}</h2></div>
          <div className="stat"><h3>Total Expenses</h3><h2>{money(expenses)}</h2></div>
        </div>

        <section className="panel">
          <h2>Add Transaction</h2>
          <form className="transaction-form" onSubmit={addTransaction}>
            <label>Transaction Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <label>Description</label>
            <input required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter description" />

            <label>Amount (₹)</label>
            <input required type="number" min="1" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Enter amount" />

            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {(form.type === "expense"
                ? ["Food", "Transport", "Shopping", "Rent", "Bills", "Education", "Healthcare", "Entertainment", "Other"]
                : ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"]
              ).map((c) => <option key={c}>{c}</option>)}
            </select>

            <label>Date</label>
            <input type="date" required value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />

            <button type="submit">Add Transaction</button>
          </form>
        </section>

        <section className="panel">
          <h2>My Transactions</h2>
          <TransactionTable items={myTransactions} money={money} onDelete={deleteTransaction} />
        </section>
      </main>
    </div>
  );
}

function TransactionTable({ items, money, onDelete, showUser = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {showUser && <th>User</th>}
            <th>Description</th><th>Category</th><th>Type</th>
            <th>Amount</th><th>Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={showUser ? 7 : 6}>No transactions found.</td></tr>
          ) : items.map((t) => (
            <tr key={t.id}>
              {showUser && <td>{t.userEmail || "Unknown"}</td>}
              <td>{t.description}</td><td>{t.category}</td><td>{t.type}</td>
              <td>{money(t.amount)}</td><td>{t.date}</td>
              <td><button className="danger" onClick={() => onDelete(t.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
