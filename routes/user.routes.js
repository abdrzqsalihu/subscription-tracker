import { Router } from "express";
import {
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", authorize, getUser);
userRouter.put("/:id", authorize, updateUser);
userRouter.delete("/:id", (req, res) =>
  res.send({ title: "Delete user by id" })
);

export default userRouter;
