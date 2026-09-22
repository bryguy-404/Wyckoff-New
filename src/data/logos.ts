import homeContent from "./pages/home.json";
import aboutContent from "./pages/about.json";
import { fromContentSlots } from "../lib/contentSlots";
export interface LogoItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const clientLogos = fromContentSlots(homeContent.clients.clientLogos) as LogoItem[];

export const guestLectureLogos = fromContentSlots(aboutContent.lectures.guestLectureLogos) as LogoItem[];
