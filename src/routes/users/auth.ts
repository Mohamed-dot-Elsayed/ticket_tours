import express from "express";
import passport from "passport";
import "../../config/passport";
import { generateToken } from "../../utils/auth";

const router = express.Router();

// Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as { id: number };
    const token = generateToken({ id: user?.id, roles: ["user"] });
    res.json({ token });
  }
);

// Facebook Login
// router.get(
//   "/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { session: false }),
//   (req, res) => {
//     const user = req.user as { id: number };
//     const token = generateToken({ id: user?.id, roles: ["user"] });
//     res.json({ token });
//   }
// );

export default router;
