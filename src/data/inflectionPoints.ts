import pageContent from "./pages/inflectionPoints.json";
const content = pageContent.summaries;
import { fromContentSlots } from "../lib/contentSlots";
export type InflectionPointSlug =
  | "growth-has-stalled"
  | "marketing-leadership-gap"
  | "entering-a-new-market"
  | "no-marketing-function"
  | "rebranding-or-repositioning"
  | "preparing-for-sale"
  | "merger-or-acquisition"
  | "private-equity-venture-backed-companies";

export interface InflectionPoint {
  num: string;
  slug: InflectionPointSlug;
  title: string;
  challenge: string;
  needed: string;
}

export const inflectionPoints = fromContentSlots(content.inflectionPoints) as InflectionPoint[];
