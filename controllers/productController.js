import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "product Name is Required!" });
      case !description:
        return res
          .status(500)
          .send({ error: "Product description is Required!" });
      case !price:
        return res.status(500).send({ error: "product price is Required!" });
      case !category:
        return res.status(500).send({ error: "must category is Required!" });
      case !quantity:
        return res.status(500).send({ error: "quantity is Required!" });
      case photo && photo.size > 2000000:
        return res
          .status(500)
          .send({ error: "phote field is must be less then 1 mb !" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product created successfully!",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating Product!",
      error,
    });
  }
};

export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      totat_count: products.length,
      message: "All Prducts",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting product!",
      error: error.message,
    });
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "single Product fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable/error to get any one of your product",
      error,
    });
  }
};
//get photos
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    // const letImage = await product?.photo.data;
    if (product && product.photo.data) {
      res.set("content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
      // , {
      //   success: true,
      //   message: "image get successfully!",
      // });
    }
    else {
      console.log("not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in while getting images!",
      error,
    });
  }
};

//delete product photo

export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel
      .findByIdAndDelete(req.params.pid)
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "product Deleted Successfully!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      sucess: false,
      message: "Error while deleteing the Image",
      error,
    });
  }
};

//update product

export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "product Name is Required!" });
      case !description:
        return res
          .status(500)
          .send({ error: "Product description is Required!" });
      case !price:
        return res.status(500).send({ error: "product price is Required!" });
      case !category:
        return res.status(500).send({ error: "must category is Required!" });
      case !quantity:
        return res.status(500).send({ error: "quantity is Required!" });
      case photo && photo.size > 2000000:
        return res
          .status(500)
          .send({ error: "phote field is must be less then 1 mb !" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated successfully!",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Updating Product!",
      error,
    });
  }
};

export const productFilersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.fnd(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Filtering Products",
      error,
    });
  }
};

//product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in produnt count!",
      success: false,
      error,
    });
  }
};

//product per page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: `error in page control!`,
      error,
    });
  }
};

//seach product

export const searchProductController = async (req, res) => {
  
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: `Error in Search Product API`,
      error,
    });
  }
};

export const releatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.body;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error while getting releated product!",
      success: true,
    });
  }
};

//get product by Category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while getting Product!",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    await gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err, { message: "token problem is there!" });
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payments
export const brainTreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res
            .json({ ok: true })
            .send({ message: "payment succcessfully happens!" });
        } else {
          res.status(500).send(error, { message: "got troubled in payment !" });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
