import { Router } from "express";
import { userControllers } from "../controllers/index.js";
import { authenticationMiddleware } from "../middleware/index.js";

const router = Router();

router.route("/").get(
    authenticationMiddleware.aurhenticateUser,
    authenticationMiddleware.checkRoleUser(),
    userControllers.getAllUsers
);
router.route("/current")
    .get(
        authenticationMiddleware.aurhenticateUser,
        userControllers.getSingleUser
    )
    .delete(
        authenticationMiddleware.aurhenticateUser,
        userControllers.deleteUser
    )
    .patch(
        authenticationMiddleware.aurhenticateUser,
        userControllers.updateUser
    );

export default router