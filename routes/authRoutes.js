import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrderController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authControllers.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
//router object
const router = express.Router();

//routing || METHOD POST
//REGISTER
router.post("/register", registerController);

//LOGIN
router.post("/login", loginController);

//forgot password
router.post("/forgot-password", forgotPasswordController);
//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected user-route authentication
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected-admin-route authentication
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put('/profile',requireSignIn,updateProfileController);

//orders
router.get("/orders" ,requireSignIn,getOrderController);

//all orders
router.get('/all-orders',requireSignIn,isAdmin,getAllOrdersController)


//order status update
router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController);

export default router;
