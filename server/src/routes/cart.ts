import express from "express";
import {emptyCart, addToCart,cartItems,removeFromCart } from "../controllers/order.js";

const app = express.Router();

app.post("/addToCart", addToCart);
app.post("/getCart", cartItems);
app.post("/removeFromCart", removeFromCart);
app.post("/emptyCart",emptyCart)

export default app;