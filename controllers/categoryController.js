import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "name is Required!" });
    }
    const existingCategory = await categoryModel.findOne({ name });

    if (existingCategory)
      return res.status(200).send({
        success: true,
        message: "category Already Exists!",
      });

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      //sataus 201 means successfull create hua hai
      success: true,
      message: "new Category Created",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      meggage: "error in Category!",
      error,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = await req.params; //url se le kar ayege
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      message: "category Updated",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating category",
      error,
    });
  }
};

//get all category
export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All cayegories list - ",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all category!",
      error,
    });
  }
};

//single category
export const singleCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "get the single category succesfully!",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting single category!",
      error,
    });
  }
};

//delete category
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = await req.params;
    const category = await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "category deleted Successfully!",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while Handeling Category!",
      error,
    });
  }
};
