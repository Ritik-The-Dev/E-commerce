import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingInfo } from "../redux/reducer/cartReducer";
import { server } from "../redux/store";
import { RootState } from "@reduxjs/toolkit/query";
import { useRecoilState } from "recoil";
import { cart, discounts, subtotals } from "../redux/reducer/Recoil";

const Shipping = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const [subtotal,setSubTotal] = useRecoilState(subtotals)
  const[discount,setDiscount] = useRecoilState(discounts)
  const [cartItems,setCartitems] = useRecoilState(cart)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(saveShippingInfo(shippingInfo));
    try {
      const { data } = await axios.post(`${server}/api/v1/order/new`,{
          shippingInfo,
          orderItems: cartItems,
          user: user._id,
          subtotal,
          shippingCharges: 0,
          discount,
          total: subtotal - discount,
        });
        if(data.success){
          await axios.post(`${server}/api/v1/cart/emptyCart`,{userId: user._id,})
          setCartitems([])
          setDiscount(0)
          setSubTotal(0)
          toast.success(data.message);
          navigate("/orders")
        }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (cartItems.length <= 0 || !subtotal || subtotal === 0) return navigate("/cart");
  }, []);

  return (
    <div className="shipping">
      <button className="back-btn" onClick={() => navigate("/cart")}>
        <BiArrowBack />
      </button>

      <form onSubmit={submitHandler}>
        <h1>Shipping Address</h1>

        <input
          required
          type="text"
          placeholder="Address"
          name="address"
          value={shippingInfo.address}
          onChange={changeHandler}
        />

        <input
          required
          type="text"
          placeholder="City"
          name="city"
          value={shippingInfo.city}
          onChange={changeHandler}
        />

        <input
          required
          type="text"
          placeholder="State"
          name="state"
          value={shippingInfo.state}
          onChange={changeHandler}
        />

        <select
          name="country"
          required
          value={shippingInfo.country}
          onChange={changeHandler}
        >
          <option value="">Choose Country</option>
          <option value="india">India</option>
        </select>

        <input
          required
          type="number"
          placeholder="Pin Code"
          name="pinCode"
          value={shippingInfo.pinCode}
          onChange={changeHandler}
        />

        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
};

export default Shipping;
