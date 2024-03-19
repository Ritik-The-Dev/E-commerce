import { FaPlus } from "react-icons/fa";
import { server } from "../redux/store";
import { CartItem } from "../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

type ProductsProps = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  stock: number;
  handler: (cartItem: CartItem) => string | undefined;
};

const ProductCard = ({
  productId,
  price,
  name,
  photo,
  stock,
  handler,
}: ProductsProps) => {

  const showProductDetails = (productId:any, price:any, name:any, photo:any, stock:any)=>{
    console.log(productId,price,name,photo,stock)
  }

  const { user } = useSelector((state: RootState) => state.userReducer);

  return (
    <div className="product-card">
      <img src={`${server}/${photo}`} alt={name} />
      <pre className="hover:text-blue-500 mt-5 hover:font-bold cursor-pointer flex items-center justify-center flex-col" onClick={()=>showProductDetails(productId, price, name, photo, stock)}>
      <p>{name}</p>
      <span>₹{price}</span>
      </pre>

      <div>
        <button
          onClick={() =>
            handler({userId:user?._id, productId, price, name, photo, stock, quantity: 1 })
          }
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
