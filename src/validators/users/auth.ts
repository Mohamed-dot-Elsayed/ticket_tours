import { z } from "zod";

export const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const verifyCodeSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
