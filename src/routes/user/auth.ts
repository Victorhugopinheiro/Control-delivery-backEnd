import { Router } from "express";
import LoginController from "../../controller/user/auth/loginController.js";
import LogoutController from "../../controller/user/auth/logoutController.js";
import RefreshController from "../../controller/user/auth/refreshController.js";

export const authRouter = Router();
const loginController = new LoginController();
const refreshController = new RefreshController();
const logoutController = new LogoutController();

authRouter.post("/login", (req, res) => loginController.handle(req, res));
authRouter.post("/refresh", (req, res) => refreshController.handle(req, res));
authRouter.post("/logout", (req, res) => logoutController.handle(req, res));