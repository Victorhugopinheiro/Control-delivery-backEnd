import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../lib/jwt.js";
import { prisma } from "../../../lib/prisma.js";
import { hashToken } from "../../../lib/tokenHash.js";
import { AuthServiceError } from "./authErrors.js";
import type { AuthenticatedUser } from "./loginUserService.js";

export type RefreshUserResult = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};

class RefreshUserService {
  async handle(refreshToken: string): Promise<RefreshUserResult> {
    try {
      const { userId } = await verifyRefreshToken(refreshToken);
      const incomingTokenHash = hashToken(refreshToken);

      const existingSession = await prisma.refreshSession.findUnique({
        where: { tokenHash: incomingTokenHash },
      });

      if (!existingSession) {
        await prisma.refreshSession.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new AuthServiceError("Unauthorized", 401);
      }

      if (existingSession.revokedAt || existingSession.expiresAt <= new Date()) {
        throw new AuthServiceError("Unauthorized", 401);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new AuthServiceError("Unauthorized", 401);
      }

      const newRefreshBundle = await signRefreshToken(user.id);
      const newTokenHash = hashToken(newRefreshBundle.token);

      await prisma.$transaction(async (tx) => {
        const createdSession = await tx.refreshSession.create({
          data: {
            userId: user.id,
            tokenHash: newTokenHash,
            expiresAt: newRefreshBundle.expiresAt,
          },
        });

        await tx.refreshSession.update({
          where: { id: existingSession.id },
          data: {
            revokedAt: new Date(),
            replacedBySessionId: createdSession.id,
          },
        });
      });

      const accessToken = await signAccessToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        accessToken,
        refreshToken: newRefreshBundle.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch {
      throw new AuthServiceError("Unauthorized", 401);
    }
  }
}

export default RefreshUserService;