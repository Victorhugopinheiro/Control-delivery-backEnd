import type { Request, Response } from "express";
import type { AuthUser } from "../../../middleware/requireAuth.js";

type MeRequest = Request & {
  authUser?: AuthUser;
};

class MeController {
  async handle(req: Request, res: Response) {
    const meRequest = req as MeRequest;

    if (!meRequest.authUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ user: meRequest.authUser });
  }
}

export default MeController;