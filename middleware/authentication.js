import customError from "../errors/index.js";
import { isTokenValid } from "../utility/index.js";


const aurhenticateUser = (req, res, next) => {
    const token = req.signedCookies.token;
    if (!token) {
        throw new customError.UnauthenticatedError("Authentication invalid");
    }
    try {
        const payload = isTokenValid({ token });
        req.user = { ...payload };
    } catch (error) {
        throw new customError.UnauthenticatedError("Authentication invalid");
    }
    next()
}



function checkRoleUser(role = "USER") {
    return (req, res, next) => {
        if (!req.user || req.user.role === role) {
            throw new customError.UnauthorizedError("Not unauthorized to access this route");
        }

        next()
    }
}


const authentication = {
    aurhenticateUser,
    checkRoleUser
}

export default authentication