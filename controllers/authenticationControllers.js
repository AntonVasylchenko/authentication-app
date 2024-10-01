import validator from "validator";
import { StatusCodes } from "http-status-codes";
import customError from "../errors/index.js";
import { validateField, toLowerCaseSafe, hasWhitespace, createTokenUser, attachCookiesToResponse } from "../utility/index.js";
import { userModel } from "../models/index.js";

const register = async (req, res) => {
    const newUser = {};
    const { firstName, lastName, email, password, comparePassword } = req.body;

    validateField(firstName, 'first name');
    validateField(lastName, 'last name');
    validateField(email, 'email');
    validateField(password, 'password');

    if (!validator.isEmail(email)) {
        throw new customError.BadRequestError('Please provide a correct email');
    }

    if (password.length < 8) {
        throw new customError.BadRequestError('Password should be at least 8 symbols');
    }

    if (hasWhitespace(password)) {
        throw new customError.BadRequestError('The password contains spaces');
    }

    if (!comparePassword || !validator.equals(password, comparePassword)) {
        throw new customError.BadRequestError('Passwords do not match');
    }

    const isUser = await userModel.user.findUnique({
        where: { email }
    })

    if (isUser) {
        throw new customError.BadRequestError(`User with email "${email}" already exists`);
    }

    newUser.firstName = toLowerCaseSafe(firstName);
    newUser.lastName = toLowerCaseSafe(lastName);
    newUser.email = toLowerCaseSafe(email, true);
    newUser.password = toLowerCaseSafe(password, true);

    const userCount = await userModel.user.count();

    newUser.role = userCount === 0 ? "ADMIN" : "USER"
    
    const user = await userModel.user.create({
        data: newUser,
    })

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.CREATED).json({ tokenUser });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    validateField(email, 'email');
    validateField(password, 'password');

    if (!validator.isEmail(email)) {
        throw new customError.BadRequestError('Please provide a correct email');
    }

    if (password.length < 8) {
        throw new customError.BadRequestError('Password should be at least 8 symbols');
    }

    if (hasWhitespace(password)) {
        throw new customError.BadRequestError('The password contains spaces');
    }

    const user = await userModel.user.findUnique({
        where: { email }
    })

    if (!user) {
        throw new customError.UnauthenticatedError("Invalid password or email");
    }

    const isComparePassword = await user.comparePassword(password);

    if (!isComparePassword) {
        throw new customError.UnauthenticatedError("Invalid password");
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ tokenUser });

}
const logout = async (req, res) => {
    res.cookie("token", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: "User logout" });
}

const authenticationControllers = {
    register,
    login,
    logout,
}

export default authenticationControllers