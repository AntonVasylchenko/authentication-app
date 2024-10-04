import validator from "validator";
import { StatusCodes } from "http-status-codes";
import customError from "../errors/index.js";
import { userModel } from "../models/index.js";
import { createPagination, createSort, validateField, createTokenUser, attachCookiesToResponse, toLowerCaseSafe, hasWhitespace } from "../utility/index.js";

async function getAllUsers(req, res) {
    const count = await userModel.user.count();
    const { take, skip, totalItems, currentPage, totalPages } = createPagination(req.query, count);
    const avaliableFieldsForSort = ["firstName", "lastName", "updatedAt"]
    const { property, type } = createSort(req.query, avaliableFieldsForSort);


    const queryObject = {
        skip,
        take,
        where: {
            role: "USER"
        },
        orderBy: {

        }
    };

    if (property) {
        queryObject.orderBy[property] = type
    }

    const allUsers = await userModel.user.findMany(queryObject);

    res.status(StatusCodes.OK).json({
        msg: "ok",
        users: allUsers,
        currentPage,
        totalItems,
        totalPages
    });
}
async function getSingleUser(req, res) {
    const user = req.user;
    if (!user) {
        throw new customError.NotFoundError("Not found user")
    }
    res.status(StatusCodes.OK).json({ user });
}
async function updateUser(req, res) {
    const user = req.user;
    if (!user) {
        throw new customError.NotFoundError("Not found user")
    }
    const { firstName, lastName, password, comparePassword } = req.body;

    validateField(firstName, 'first name');
    validateField(lastName, 'last name');
    validateField(password, 'password');

    if (password.length < 8) {
        throw new customError.BadRequestError('Password should be at least 8 symbols');
    }

    if (hasWhitespace(password)) {
        throw new customError.BadRequestError('The password contains spaces');
    }

    if (!comparePassword || !validator.equals(password, comparePassword)) {
        throw new customError.BadRequestError('Passwords do not match');
    }

    const userId = user.id;

    const currentUser = await userModel.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!currentUser) {
        throw new customError.NotFoundError("Not found user in bd")
    }

    const updateUser = await userModel.user.update({
        where: {
            id: currentUser.id,
        },
        data: {
            firstName: toLowerCaseSafe(firstName),
            lastName: toLowerCaseSafe(lastName),
            password: toLowerCaseSafe(password, true)
        },
    })

    const tokenUser = createTokenUser(updateUser);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ tokenUser });
}
async function deleteUser(req, res) {
    const user = req.user;
    if (!user) {
        throw new customError.NotFoundError("Not found user")
    }

    const deleteUser = await userModel.user.delete({
        where: {
            id: user.id,
        },
    });

    res.cookie("token", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });

    res.status(StatusCodes.OK).json({ msg: "User was deleted", deleteUser });
}

const userControllers = {
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser
}

export default userControllers