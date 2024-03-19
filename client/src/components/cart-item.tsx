import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { server } from "../redux/store";
import { CartItem,CartService } from "../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface RemoveItem {
  quantity:Number,
  userId: any;
  productId: any;
}

type CartItemProps = {
  cartItem: CartItem;
  getCartItem:(cartItem: CartService) => void;
  incrementHandler: (cartItem: CartItem) => void;
  decrementHandler: (removeItem: RemoveItem) => void;
  removeHandler: (removeItem: RemoveItem) => void;
};

const CartItem = ({
  cartItem,
  incrementHandler,
  decrementHandler,
  removeHandler,
}: CartItemProps) => {
  const { photo, productId, name, price, quantity } = cartItem;
  const { user } = useSelector((state: RootState) => state.userReducer);
  const userId = user?._id

  return (
    <div className="cart-item">
      <img src={`${server}/${photo}`} alt={name} />
      <article>
        <Link to={`/product/${productId}`}>{name}</Link>
        <span>₹{price}</span>
      </article>

      <div>
        <button onClick={() => decrementHandler(1,userId,productId)}>-</button>
        <p>{quantity}</p>
        <button onClick={() => incrementHandler(cartItem)}>+</button>
      </div>

      <button onClick={() => removeHandler(quantity,userId,productId)}>
        <FaTrash />
      </button>
    </div>
  );
};

export default CartItem;
