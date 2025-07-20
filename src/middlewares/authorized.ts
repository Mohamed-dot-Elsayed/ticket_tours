import { NextFunction, Request, Response, RequestHandler } from "express";
import { UnauthorizedError } from "../Errors";

export const authorizePermissions = (
  ...requiredPermissions: string[]
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { id: number; roles: string[] };

    if (!user.roles) {
      throw new UnauthorizedError("No permissions loaded");
    }

    const hasPermission = requiredPermissions.every((p) =>
      user.roles.includes(p)
    );

    if (!hasPermission) {
      throw new UnauthorizedError("Permission denied");
    }

    next();
  };
};
