import { z } from "zod";

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    status: z.boolean().optional(),
    name: z.string().optional(),
    imagePath: z.string().optional(),
  }),
});
