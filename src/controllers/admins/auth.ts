import { Request, Response } from "express";
import { db } from "../../models/db";
import { adminPrivileges, admins, privileges } from "../../models/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/auth";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export async function login(req: Request, res: Response) {
  const data = req.body;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, data.email));

  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const match = await bcrypt.compare(data.password, admin.password);
  if (!match) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const result = await db
    .select({
      privilegeName: privileges.name,
    })
    .from(adminPrivileges)
    .innerJoin(privileges, eq(adminPrivileges.privilegeId, privileges.id))
    .where(eq(adminPrivileges.adminId, admin.id));

  const privilegeNames = result.map((r) => r.privilegeName);

  const token = generateToken({
    id: admin.id,
    roles: privilegeNames,
  });

  SuccessResponse(
    res,
    { message: "login Successful", token: token, privileges: privilegeNames },
    200
  );
}
