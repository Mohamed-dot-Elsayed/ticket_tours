import { Request, Response } from "express";
import { db } from "../../models/db";
import { privileges } from "../../models/schema";
import { SuccessResponse } from "../../utils/response";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";

export const getAllPrivilegs = async (req: Request, res: Response) => {
  const privilegs = await db.select().from(privileges);
  SuccessResponse(res, { privilegs }, 200);
};

export const getPrivilegs = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [privileg] = await db
    .select()
    .from(privileges)
    .where(eq(privileges.id, id));
  if (!privileg) throw new NotFound("privileges not found");
  SuccessResponse(res, { privileg }, 200);
};

export const createPrivilegs = async (req: Request, res: Response) => {
  const { name } = req.body;
  await db.insert(privileges).values({ name });
  SuccessResponse(res, { message: "privilege created successfully" });
};

export const updatePrivilegs = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  const [privileg] = await db
    .select()
    .from(privileges)
    .where(eq(privileges.id, id));
  if (!privileg) throw new NotFound("privileges not found");
  await db.update(privileges).set({ name }).where(eq(privileges.id, id));
  SuccessResponse(res, { privileg }, 200);
};

export const deletePrivilegs = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [privileg] = await db
    .select()
    .from(privileges)
    .where(eq(privileges.id, id));
  if (!privileg) throw new NotFound("privileges not found");
  await db.delete(privileges).where(eq(privileges.id, id));
  SuccessResponse(res, { privileg }, 200);
};
