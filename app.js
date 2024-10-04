// Server
import express from "express";
import "dotenv/config";
import "express-async-errors";

// Cookie
import cookieParser from 'cookie-parser';

import { notFoundMiddleware, errorHandlerMiddleware } from "./middleware/index.js";
import { authenticationRoutes, userRoutes } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_KEY));


app.use("/api/v1/customer", authenticationRoutes);
app.use("/api/v1/user", userRoutes);

app.get('/', (req, res) => {
    res.json({ msg: "ok" })
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

async function startApp() {
    try {
        app.listen(PORT, function () {
            console.log(`Server was started on ${PORT} Port`);
        });
    } catch (error) {
        console.log(error);
    }
}

startApp();
