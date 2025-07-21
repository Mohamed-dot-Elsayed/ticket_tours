import { Request, Response } from "express";
import { db } from "../../models/db";
import { emailVerifications, users } from "../../models/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/auth";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { sendEmail } from "../../utils/sendEmails";
import { BadRequest } from "../../Errors/BadRequest";

export async function login(req: Request, res: Response) {
  const data = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const match = await bcrypt.compare(data.password, user.password!);
  if (!match) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    roles: ["user"],
  });

  SuccessResponse(res, { message: "login Successful", token: token }, 200);
}

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new NotFound("User Not Found");
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  await db.insert(emailVerifications).values({ code, userId: user.id });

  await sendEmail(
    email,
    "Password Reset Code",
    `Your reset code is: ${code}\nIt will expire in 2 hours.`
  );

  SuccessResponse(res, { message: "code sent succefully" }, 200);
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new NotFound("User not found");
  const [rowCode] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));
  if (!rowCode || rowCode.code !== code)
    throw new BadRequest("Invalid email or reset code");
  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));
  SuccessResponse(res, { message: "Code verified successfully" }, 200);
};

export const resetPassword = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  password = await bcrypt.hash(password, 10);
  await db.update(users).set({ password }).where(eq(users.email, email));
  SuccessResponse(res, { message: "Password Updated Successfully" });
};
