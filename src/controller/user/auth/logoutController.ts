import type { Request, Response } from "express";
import { clearCookieOptions } from "../../../lib/authCookies.js";
import LogoutUserService from "../../../service/user/auth/logoutUserService.js";

class LogoutController {
  private readonly service = new LogoutUserService();

  async handle(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    await this.service.handle(refreshToken);

    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);

    return res.status(200).json({ message: "Logged out" });
  }
}

export default LogoutController;