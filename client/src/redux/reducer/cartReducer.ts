import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartReducerInitialState } from "../../types/reducer-types";
import { CartItem, ShippingInfo } from "../../types/types";
import axios from "axios"
import toast from "react-hot-toast";
const initialState: CartReducerInitialState = {
  loading: false,
  cartItems: [],
  subtotal: 0,
  tax: 0,
  shippingCharges: 0,
  discount: 0,
  total: 0,
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
};

interface CartItems {
  productId: string;
  quantity: number;
  name: string;
  photo: string;
  price: number;
  stock: number;
  userId:any
}
interface removeItem {
  quantity:Number;
  userId:any;
  productId: any;
}

const AddToCart = async(item:CartItems)=>{
try{
   await axios.post(`${import.meta.env.VITE_SERVER}/api/v1/cart/addToCart`,{
    userId:item.userId,
    productId:item.productId,
    quantity:1 ,
    name:item.name ,
    photo :item.photo ,
    price:item.price ,
    stock:item.stock 
  })
}
catch(err){
  console.log(err)
}
} 

const RemoveFromCart = async(item:removeItem)=>{
  try{
    const response = await axios.post(`${import.meta.env.VITE_SERVER}/api/v1/cart/removeFromCart`,{
      userId:item.userId,
      productId:item.productId,
      quantity:item.quantity
    })
    const data = response.data
    if(data.success){
      toast("Item Deleted Successfully")  
    }
    else{
      console.log("Something Went Wrong !!!")
    }
  }
  catch(err){
    console.log(err)
  }
}

export const cartReducer = createSlice({
  name: "cartReducer",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.loading = true;

      const index = state.cartItems.findIndex(
        (i) => i.productId === action.payload.productId
      );
      AddToCart(action.payload)
      if (index !== -1) state.cartItems[index] = action.payload;
      else state.cartItems.push(action.payload);
      state.loading = false;
    },

    removeCartItem: (state, action: PayloadAction<removeItem>) => {
      state.loading = true;
      RemoveFromCart(action.payload)
      state.loading = false;
    },

    calculatePrice: (state) => {
      const subtotal = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      state.subtotal = subtotal;
      state.shippingCharges = state.subtotal > 1000 ? 0 : 200;
      state.tax = Math.round(state.subtotal * 0.18);
      state.total =
        state.subtotal + state.tax + state.shippingCharges - state.discount;
    },

    discountApplied: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    },
    saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
      state.shippingInfo = action.payload;
    },
    resetCart: () => initialState,
  },
});

export const {
  addToCart,
  removeCartItem,
  calculatePrice,
  discountApplied,
  saveShippingInfo,
  resetCart,
} = cartReducer.actions;
