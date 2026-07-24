import { Router } from "express";
import multer from "multer";
import AddWorkerController from "../../controller/worker/addWorkerController.js";
import AddWorkerDeliveryController from "../../controller/worker/addWorkerDeliveryController.js";
import ListWorkerDeliveriesController from "../../controller/worker/listWorkerDeliveriesController.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

const workerRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const addWorkerController = new AddWorkerController();
const addWorkerDeliveryController = new AddWorkerDeliveryController();
const listWorkerDeliveriesController = new ListWorkerDeliveriesController();

workerRouter.post(
    "/addWorker",
    requireAuth,
    requireRole("ADMIN"),
    upload.single("image"),
    (req, res) => addWorkerController.handle(req, res),
);

workerRouter.post(
    "/workerDelivery",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => addWorkerDeliveryController.handle(req, res),
);

workerRouter.get(
    "/workerDelivery",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => listWorkerDeliveriesController.handle(req, res),
);

export default workerRouter;