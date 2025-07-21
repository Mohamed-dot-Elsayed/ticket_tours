import express from "express";
import passport from "passport";
import "../../../config/passport";
import { generateToken } from "../../../utils/auth";

const router = express.Router();

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as { id: number };
    const token = generateToken({ id: user?.id, roles: ["user"] });
    res.json({ token });
  }
);

export default router;
