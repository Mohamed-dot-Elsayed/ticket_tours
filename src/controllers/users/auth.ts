import { Request, Response } from "express";
import { db } from "../../models/db";
import { users } from "../../models/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/auth";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

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
