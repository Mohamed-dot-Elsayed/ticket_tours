import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { createTourSchema } from "../../validators/admins/tours";
import {
  addData,
  createTour,
  getAllTours,
  getTourById,
} from "../../controllers/admins/tours";
import { idParams } from "../../validators/admins/users";

const router = Router();
router
  .route("/")
  .get(catchAsync(getAllTours))
  .post(validate(createTourSchema), catchAsync(createTour));

router.get("/add-date", catchAsync(addData));
router.route("/:id").get(validate(idParams), catchAsync(getTourById));

export default router;
