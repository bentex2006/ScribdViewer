import { z } from "zod";

export const scribdUrlSchema = z.object({
  url: z.string().url().refine(
    (url) => {
      const scribdPattern = /^https:\/\/www\.scribd\.com\/document\/\d+\/.+/;
      return scribdPattern.test(url);
    },
    {
      message: "Must be a valid Scribd document URL (https://www.scribd.com/document/...)",
    }
  ),
});

export type ScribdUrlRequest = z.infer<typeof scribdUrlSchema>;

// History management schemas
export const historyItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  viewedAt: z.date(),
});

export type HistoryItem = z.infer<typeof historyItemSchema>;
export type InsertHistoryItem = Omit<HistoryItem, 'viewedAt'> & { viewedAt?: Date };
