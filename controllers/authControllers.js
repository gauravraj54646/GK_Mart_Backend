import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { response } from "express";
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validation
    if (!name) return res.send({ message: "Name is Required" });
    if (!email) return res.send({ message: "email is Required" });
    if (!password) return res.send({ message: "password is Required" });
    if (!phone) return res.send({ message: "mobile no. is Required" });
    if (!address) return res.send({ message: "address is Required" });
    if (!answer) return res.send({ message: "answer is Required" });

    //check user
    const existingUser = await userModel.findOne({ email });
    //check existing users kyuki same emails se multiple account nahi banane hai
    if (existingUser) {
      return res.status(200).send({
        success: false,
        messgae: "Already Registered so please login!",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: `user Registered Successfully!`,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration! ",
      error,
    });
  }
};

//LOGIN POST
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(404).send({
        sucess: false,
        message: `Invalid email or password`,
      });
    }

    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: `Email is not registered!`,
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: `Invalid Password!`,
      });
    }

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: `login successfully!`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login! ",
      error,
    });
  }
};

//forgotPasswordController
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "email is reqired" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer filed is reqired" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is reqired" });
    }

    //check email and password

    const user = await userModel.findOne({ email, answer });
    if (!user) {
      res.status(404).send({
        success: false,
        message: "wrong Email or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUdate(user._id, { password: hashed });

    res.status(200).send({
      success: true,
      message: "Password Reset Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "someThing went Wrong!",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected route");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = await userModel.findOne(req.user._id);

    //password
    if (password && password.length < 6) {
      return res.json({ error: "password is required and 6 character long" });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "profile updated successfully!",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).status({
      message: "Error while updating profile !",
      success: false,
      error,
    });
  }
};

//orders
export const getOrderController = async (req, response) => {
  try {
    const orders = await orderModel
      .find({ buyers: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    response.json(orders);
  } catch (error) {
    console.log(error);

    res.status(200).send({
      success: false,
      message: "Error while Gettinng Orders",
      error,
    });
  }
};

//get all orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    response.json(orders);
  } catch (error) {
    console.log(error);

    res.status(200).send({
      success: false,
      message: "Error while Gettinng Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating Order",
      error,
    });
  }
};
