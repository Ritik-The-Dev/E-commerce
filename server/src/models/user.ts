import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

interface CartItem {
  productId: string;
  quantity: number;
  name: string; // Add name property
  photo: string; // Add photo property
  price: number; // Add price property
  stock: number; // Add stock property
}


interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  cart: CartItem[]; // Corrected type for cart
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  age: number;
}

const cartItemSchema = new Schema<CartItem>({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  name: {type: String, required:true}, 
  photo: {type: String, required:true},
  price: {type: Number, required:true},
  stock: {type: Number, required:true},
});

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter ID"],
    },
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    email: {
      type: String,
      unique: [true, "Email already Exist"],
      required: [true, "Please enter Name"],
      validate: validator.default.isEmail,
    },
    cart: {
      type: [cartItemSchema], // Updated type for cart
      default: [],
    },
    photo: {
      type: String,
      required: [true, "Please add Photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter Gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter Date of birth"],
    },
  },
  {
    timestamps: true,
  }
);

schema.virtual("age").get(function () {
  const today = new Date();
  const dob:any = this.dob;
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
});

export const User = mongoose.model<IUser>("User", schema);
