const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/userdb");

const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String
});


app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email
  });
});


app.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});


app.get("/users/search", async (req, res) => {
  const search = req.query.name || "";

  const users = await User.find({
    name: { $regex: search, $options: "i" }
  }).select("-password");

  res.json(users);
});


app.delete("/users/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});