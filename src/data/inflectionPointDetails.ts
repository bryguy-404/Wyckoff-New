import pageContent from "./pages/inflectionPoints.json";
const content = pageContent.details;
import { fromContentSlots } from "../lib/contentSlots";
import type { InflectionPointSlug } from "./inflectionPoints";

export type InflectionPointDetailSlug = InflectionPointSlug;

export interface InflectionPointDetailParagraph {
  type: "paragraph";
  text: string;
  emphasis?: "lead";
}

export interface InflectionPointDetailList {
  type: "list";
  heading?: string;
  intro?: string;
  items: readonly string[];
  outro?: string;
}

export interface InflectionPointDetailServiceItem {
  title: string;
  description: string;
}

export interface InflectionPointDetailServices {
  type: "services";
  heading: string;
  items: readonly InflectionPointDetailServiceItem[];
}

export interface InflectionPointDetailCallout {
  type: "callout";
  eyebrow?: string;
  text: string;
}

export type InflectionPointFinalSectionContent =
  | InflectionPointDetailParagraph
  | InflectionPointDetailList
  | InflectionPointDetailCallout;

export interface InflectionPointDetailFinalSection {
  type: "final-section";
  heading: string;
  content: readonly InflectionPointFinalSectionContent[];
}

export type InflectionPointDetailBlock =
  | InflectionPointDetailParagraph
  | InflectionPointDetailList
  | InflectionPointDetailServices
  | InflectionPointDetailCallout
  | InflectionPointDetailFinalSection;

export interface InflectionPointDetail {
  slug: InflectionPointDetailSlug;
  headline: string;
  subtitle?: string;
  blocks: readonly InflectionPointDetailBlock[];
}

export const inflectionPointDetails = fromContentSlots(content.inflectionPointDetails) as Record<InflectionPointSlug, InflectionPointDetail>;
