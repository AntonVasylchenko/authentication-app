import { Router } from "express";
import { authenticationControllers } from "../controllers/index.js";

const router = Router();

router.route("/register").post(authenticationControllers.register);
router.route("/login").post(authenticationControllers.login);
router.route("/logout").get(authenticationControllers.logout);

export default router