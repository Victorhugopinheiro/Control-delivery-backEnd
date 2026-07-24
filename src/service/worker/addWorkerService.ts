import type { Express } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { uploadImageToCloudinary } from "../../lib/cloudinary.js";
import { AuthServiceError } from "../user/auth/authErrors.js";
import type { AuthUser } from "../../middleware/requireAuth.js";

type AddWorkerInput = {
    name: string;
    email: string;
    password: string;
    phone: string | undefined;
    address: string | undefined;
    pricePerPackage: number;
    imageFile: Express.Multer.File | undefined;
    authUser: AuthUser | undefined;
};

class AddWorkerService {
    async handle(input: AddWorkerInput) {
        if (!input.authUser) {
            throw new AuthServiceError("Unauthorized", 401);
        }

        if (input.authUser.role !== "ADMIN") {
            throw new AuthServiceError("Forbidden", 403);
        }

        const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

        if (existingUser) {
            throw new AuthServiceError("Email already in use", 409);
        }

        let imageUrl: string | null = null;

        if (input.imageFile) {
            imageUrl = await uploadImageToCloudinary(input.imageFile);
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        const worker = await prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                password: passwordHash,
                role: "WORKER",
                workerProfile: {
                    create: {
                        adminId: input.authUser.userId,
                        pricePerPackage: input.pricePerPackage,
                        ...(input.phone ? { phone: input.phone } : {}),
                        ...(input.address ? { address: input.address } : {}),
                        ...(imageUrl ? { image: imageUrl } : {}),
                    },
                },
            },
            include: { workerProfile: true },
        });

        return worker;
    }
}

export default AddWorkerService;
