import jwt from "jsonwebtoken";
import customError from "../errors/index.js";


export const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
};

export const validateField = (field, fieldName) => {
    if (!field) {
        throw new customError.BadRequestError(`Please provide ${fieldName}`);
    }
};

export const toLowerCaseSafe = (input, trim = false) => {
    if (typeof input !== 'string') {
        throw new Error(`${input} is not a string`);
    }

    let result = input.toLowerCase();
    return trim ? result.trim() : result;
};

export const hasWhitespace = (input) => {
    if (typeof input !== 'string') {
        throw new Error(`${input} is not a string`);
    }
    return /\s/.test(input);
};


export const createTokenUser = (user) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.user,
        role: user.role,
    };
};

export const attachCookiesToResponse = ({ res, user }) => {
    const token = createJWT({ payload: user });

    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === "production",
        signed: true,
    });
};

export const isTokenValid = ({ token }) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};


