import type { Request, Response } from "express";
import { z } from "zod";
import { AuthServiceError } from "../../service/user/auth/authErrors.js";
import AddWorkerService from "../../service/worker/addWorkerService.js";
import type { AuthUser } from "../../middleware/requireAuth.js";

const addWorkerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  pricePerPackage: z.coerce.number().positive(),
});

type WorkerRequest = Request & {
  authUser?: AuthUser;
  file?: Express.Multer.File;
};

class AddWorkerController {
  private readonly service = new AddWorkerService();

  async handle(req: Request, res: Response) {
    console.log("AddWorkerController.handle called with body:", req.body);
    const parsedBody = addWorkerSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ message: "Invalid worker data" });
    }

    const workerRequest = req as WorkerRequest;

    try {
      const worker = await this.service.handle({
        name: parsedBody.data.name,
        phone: parsedBody.data.phone,
        pricePerPackage: parsedBody.data.pricePerPackage,
        imageFile: workerRequest.file,
        authUser: workerRequest.authUser,
      });

      return res.status(201).json({ worker });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AddWorkerController;