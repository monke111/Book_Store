import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/Usermodel.js";
const route = express.Router();
const SECRET_KEY = "dhaya";
route.post("/register", async (req, res) => {
  try {
    if (!req.body.Name || !req.body.Email || !req.body.Password) {
      return res.status(400).send("Please fill all the fields");
    }
    const existuser = await User.findOne({ Email: req.body.Email });
    if (existuser) {
      return res.status(400).send("User already exists");
    }
    const hashedpassword = await bcrypt.hash(req.body.Password, 10);
    const newuser = new User({
      Name: req.body.Name,
      Email: req.body.Email,
      Password: hashedpassword,
    });
    await newuser.save();
    return res.status(200).send({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
});
route.post("/login", async (req, res) => {
  try {
    if (!req.body.Email || !req.body.Password || !req.body.Name) {
      return res.status(400).send("Please fill all the fields");
    }

    const user = await User.findOne({ Email: req.body.Email });
    if (!user) {
      return res.status(400).send("User not found");
    }
    if (!(req.body.Name === user.Name)) {
      return res.status(400).send("Name not found");
    }
    const validpassword = await bcrypt.compare(
      req.body.Password,
      user.Password
    );
    if (!validpassword) {
      return res.status(400).send("Invalid password");
    }
    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
});
export default route;
