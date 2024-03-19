import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItemCard from "../components/cart-item";
import {
  addToCart,
  calculatePrice,
  discountApplied,
  removeCartItem,
} from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";
import { CartItem } from "../types/types";
import { useRecoilState } from "recoil";
import {cart, discounts, subtotals} from '../redux/reducer/Recoil'

const Cart = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const dispatch = useDispatch();
  const [subtotal,setSubTotal] = useRecoilState(subtotals)
  const[discount,setDiscount] = useRecoilState(discounts)
  const [cartItems,setCartitems] = useRecoilState(cart)
  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(false);

  const incrementHandler = async (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    const {name,photo,price,productId,quantity,stock} = cartItem
    const newItem = {name,photo,price,productId,quantity,stock,userId:user?._id,}
    dispatch(addToCart(newItem));
    toast.success("Added to cart");
    getCartItem();
     setTimeout(()=>getCartItem(),1000);
  };
  
  const decrementHandler = async (quantity:Number, userId: any, productId: string) => {
    await dispatch(removeCartItem({ quantity, userId,productId}));
    getCartItem();
     setTimeout(()=>getCartItem(),1000);
  };
  
  const removeHandler = async (quantity:Number, userId: any, productId: string) => {
    await dispatch(removeCartItem({ quantity, userId,productId}));
    getCartItem();
     setTimeout(()=>getCartItem(),1000);
  };
  
  useEffect(() => { 
    const { token: cancelToken, cancel } = axios.CancelToken.source();

    const timeOutID = setTimeout(() => {
      axios
        .get(`${server}/api/v1/payment/discount?coupon=${couponCode}`, {
          cancelToken,
        })
        .then((res) => {
          setDiscount(res.data.discount)
          dispatch(discountApplied(res.data.discount));
          setIsValidCouponCode(true);
          dispatch(calculatePrice());
        })
        .catch(() => {
          dispatch(discountApplied(0));
          setIsValidCouponCode(false);
          dispatch(calculatePrice());
        });
    }, 1000);

    return () => {
      clearTimeout(timeOutID);
      cancel();
      setIsValidCouponCode(false);
    };
  }, [couponCode]);

  const getCartItem = async()=>{
    try{ 
    const response = await axios.post(`${import.meta.env.VITE_SERVER}/api/v1/cart/getCart`,{userId:user?._id});
    const data = response.data
    if(data.success){
      setCartitems(data.cart)
      let total = 0
      for(let i=0;i<data.cart.length;i++){
        total+=data.cart[i].price *  data.cart[i].quantity
      }
      setSubTotal(total)
    }
    else{
      console.log("Something Went Wrong !!!")
    }
  }
  catch(err){
    console.log(err)
  }
  }

  useEffect(()=>{
    getCartItem()
  },[setCartitems,removeCartItem,addToCart,dispatch])


  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems,dispatch]);

  return (
    <div className="cart">
      <main>
        {cartItems?.length > 0 ? (
          cartItems?.map((i, idx) => (
            <CartItemCard
              getCartItem= {getCartItem}
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              removeHandler={removeHandler}
              key={idx}
              cartItem={i}
            />
          ))
        ) : (
          <h1>No Items Added</h1>
        )}
      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹0</p>
        <p>
          Discount: <em className="red"> - ₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹{subtotal - discount}</b>
        </p>

        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        {couponCode &&
          (isValidCouponCode ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              Invalid Coupon <VscError />
            </span>
          ))}

        {cartItems.length > 0 && <Link to="/shipping">Checkout</Link>}
      </aside>
    </div>
  );
};

export default Cart;
