
import Router from 'express';
import { authRouter } from './user/auth.js';
const router = Router();

router.use("/user", authRouter);



export default router;