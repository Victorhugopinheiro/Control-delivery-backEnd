import type { Express } from "express";
import { prisma } from "../../lib/prisma.js";
import { uploadImageToCloudinary } from "../../lib/cloudinary.js";
import { AuthServiceError } from "../user/auth/authErrors.js";
import type { AuthUser } from "../../middleware/requireAuth.js";

type AddWorkerInput = {
    name: string;
    phone: string | undefined;
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

        let imageUrl: string | null = null;

        if (input.imageFile) {
            imageUrl = await uploadImageToCloudinary(input.imageFile);
        }

        const image = imageUrl ? { image: imageUrl } : {};

        const phone = input.phone ? { phone: input.phone } : {};

        const worker = await prisma.worker.create({
            data: {
                name: input.name,
                pricePerPackage: input.pricePerPackage,
                adminId: input.authUser.userId,
                ...(input.phone ? { phone: input.phone } : {}),
                ...(imageUrl ? { image: imageUrl } : {}),
            },
        });

        return worker;
    }
}

export default AddWorkerService;
