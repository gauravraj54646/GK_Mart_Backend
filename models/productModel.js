import mongoose from "mongoose";
import Category from "./categoryModel.js";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      require: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      require: true,
    },
    quantity: {
      type: Number,
      require: true,
    },
    photo: {
      contentType: String,
      data: Buffer,
    },
    shipping: {
      Type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Products", productSchema);
