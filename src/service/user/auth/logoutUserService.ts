import { prisma } from "../../../lib/prisma.js";
import { hashToken } from "../../../lib/tokenHash.js";

class LogoutUserService {
  async handle(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await prisma.refreshSession.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export default LogoutUserService;