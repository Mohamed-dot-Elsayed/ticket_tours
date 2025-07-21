import { Router } from "express";
import {
  forgetPassword,
  verifyCode,
  resetPassword,
} from "../../../controllers/users/auth";
import { catchAsync } from "../../../utils/catchAsync";
import { validate } from "../../../middlewares/validation";
import {
  forgetPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "../../../validators/users/auth";
const router = Router();
router.post(
  "/forget-password",
  validate(forgetPasswordSchema),
  catchAsync(forgetPassword)
);

router.post("/verify-code", validate(verifyCodeSchema), catchAsync(verifyCode));

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  catchAsync(resetPassword)
);
export default router;
