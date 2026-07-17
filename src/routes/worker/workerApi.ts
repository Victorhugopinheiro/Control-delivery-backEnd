import { Router } from "express";
import multer from "multer";
import AddWorkerController from "../../controller/worker/addWorkerController.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const workerRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const addWorkerController = new AddWorkerController();

workerRouter.post(
    "/addWorker",
    requireAuth,
    upload.single("image"),
    (req, res) => addWorkerController.handle(req, res),
);


export default workerRouter;