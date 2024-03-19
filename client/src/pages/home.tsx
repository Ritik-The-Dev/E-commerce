import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Skeleton } from "../components/loader";
import ProductCard from "../components/product-card";
import { useLatestProductsQuery } from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import { CartItem } from "../types/types";
import { useEffect,useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Home = () => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ["/slide1.jpg", "/slide2.jpg", "/slide3.jpg", "/slide4.jpg"];

  // Function to handle forward button click
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Function to handle backward button click
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Function to automatically change image after 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(intervalId);
  }, [currentIndex, images.length]);

  const { data, isLoading, isError } = useLatestProductsQuery("");

  const dispatch = useDispatch();

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  if (isError) toast.error("Cannot Fetch the Products");

  return (
    <div className="home">
      <div className="flex items-center justify-center w-full">
        <div className="relative lg:h-[50vh] h-[30vh] md:h-[40vh] w-full  shadow-lg rounded-lg overflow-hidden">
          {/* Image Slider */}
          <div className="flex items-center justify-center h-full select-none">
            { images.length < 2 ? (<Skeleton width="80vw" />)
            : (images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index}`}
                className={`absolute top-0 left-0 w-full h-full p-2 lg:object-cover md:object-cover object-cover transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            )))}
          </div>
          {/* Forward and backward buttons */}
          <IoIosArrowBack
            onClick={prevSlide}
            className=" cursor-pointer absolute top-1/2 left-0 transform -translate-y-1/2 text-white bg-transparent text-6xl rounded-full px-4 py-2 rounded-l focus:outline-none"
          />
          <IoIosArrowForward 
            onClick={nextSlide}
            className=" cursor-pointer absolute top-1/2 right-0 transform -translate-y-1/2 text-white bg-transparent rounded-full text-6xl px-4 py-2 rounded-r focus:outline-none"
            />
        </div>
      </div>
    {/*  */}
      <h1>
        Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>

      <main className=" lg:overflow-visible overflow-x-auto ">
        {isLoading ? (
          <Skeleton width="80vw" />
        ) : (
          data?.products.map((i) => (
            <ProductCard
              key={i._id}
              productId={i._id}
              name={i.name}
              price={i.price}
              stock={i.stock}
              handler={addToCartHandler}
              photo={i.photo}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Home;
