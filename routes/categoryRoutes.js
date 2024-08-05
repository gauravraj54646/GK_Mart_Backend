import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js"
// } from "../controllers/categoryController.js";

const router = express.Router();

//routes
//create Category
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//update category
router.put(
  "/update-category/:id", //id chaiyea update karne ke liye req.params
  requireSignIn,
  isAdmin,
  updateCategoryController
);
//get all category

router.get("/get-category", categoryController);

//get single catogery
router.get("/single-category/:slug", singleCategoryController);

//delete category
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
