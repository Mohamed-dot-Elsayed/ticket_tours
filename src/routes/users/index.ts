import { Router } from "express";
import AuthRoute from "./auth";
const router = Router();
router.use("/auth", AuthRoute);
export default router;
