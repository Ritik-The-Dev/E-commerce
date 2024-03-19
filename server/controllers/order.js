import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../index.js";
export const addToCart = TryCatch(async (req, res, next) => {
    const { userId, name, photo, price, stock, productId, quantity } = req.body;
    // Check if the required fields are present in the request body
    if (!userId || !productId || !quantity) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        // Check if the product is already in the user's cart
        const existingProductIndex = user.cart.findIndex((item) => item.productId === productId);
        if (existingProductIndex !== -1) {
            // If the product is already in the cart, update its quantity
            user.cart[existingProductIndex].quantity += quantity;
        }
        else {
            // If the product is not in the cart, add it to the cart
            user.cart.push({ productId, quantity, name, photo, price, stock });
        }
        // Save the updated user document
        await user.save();
        // Return the updated cart as the response
        return res.status(200).json({ success: true, cart: user.cart });
    }
    catch (error) {
        // Handle any errors that occur during the process
        console.error("Error adding to cart:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
export const cartItems = TryCatch(async (req, res, next) => {
    try {
        const { userId } = req.body;
        // Check if the required fields are present in the request body
        if (!userId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        // Return the updated cart as the response
        return res.status(200).json({ success: true, cart: user.cart });
    }
    catch (error) {
        // Handle any errors that occur during the process
        console.error("Error removing from cart:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
export const emptyCart = TryCatch(async (req, res, next) => {
    const { userId } = req.body;
    // Check if the required fields are present in the request body
    if (!userId) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const updatedData = await User.findByIdAndUpdate(userId, { cart: [] }, { new: true });
        // Save the updated user document
        await updatedData?.save();
        // Return the updated cart as the response
        return res.status(200).json({ success: true });
    }
    catch (error) {
        // Handle any errors that occur during the process
        console.error("Error removing from cart:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
export const removeFromCart = TryCatch(async (req, res, next) => {
    const { userId, productId, quantity } = req.body;
    // Check if the required fields are present in the request body
    if (!userId || !productId || !quantity) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        // Check if the product is in the user's cart
        const existingProductIndex = user.cart.findIndex((item) => item.productId === productId);
        if (existingProductIndex !== -1) {
            // If the product is in the cart, decrease its quantity or remove it if the quantity becomes zero
            if (user.cart[existingProductIndex].quantity <= quantity) {
                user.cart.splice(existingProductIndex, 1); // Remove the item from the cart
            }
            else {
                user.cart[existingProductIndex].quantity -= quantity; // Decrease the quantity
            }
            // Save the updated user document
            await user.save();
            // Return the updated cart as the response
            return res.status(200).json({ success: true, cart: user.cart });
        }
        else {
            // If the product is not in the cart, return a message indicating it
            return res
                .status(404)
                .json({
                success: false,
                message: "Product not found in the user's cart",
            });
        }
    }
    catch (error) {
        // Handle any errors that occur during the process
        console.error("Error removing from cart:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
export const myOrders = TryCatch(async (req, res, next) => {
    const { id: user } = req.query;
    const key = `my-orders-${user}`;
    let orders = [];
    if (myCache.has(key))
        orders = JSON.parse(myCache.get(key));
    else {
        orders = await Order.find({ user });
        myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const allOrders = TryCatch(async (req, res, next) => {
    const key = `all-orders`;
    let orders = [];
    if (myCache.has(key))
        orders = JSON.parse(myCache.get(key));
    else {
        orders = await Order.find().populate("user", "name");
        myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const key = `order-${id}`;
    let order;
    if (myCache.has(key))
        order = JSON.parse(myCache.get(key));
    else {
        order = await Order.findById(id).populate("user", "name");
        if (!order)
            return next(new ErrorHandler("Order Not Found", 404));
        myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({
        success: true,
        order,
    });
});
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, shippingCharges, discount, total, } = req.body;
    if (!shippingInfo || !orderItems || !user || !subtotal || !total)
        return next(new ErrorHandler("Please Enter All Fields", 400));
    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        shippingCharges,
        discount,
        total,
    });
    await reduceStock(orderItems);
    invalidateCache({
        product: true,
        order: true,
        admin: true,
        userId: user,
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
});
export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });
    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    await order.deleteOne();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });
    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
