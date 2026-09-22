import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { imageMetadata } from "astro/assets/utils";

const publicRoot = resolve("public");
const cache = new Map<string, ReturnType<typeof imageMetadata>>();

/** Read the actual uploaded file at build time; editors never maintain dimensions. */
export async function contentImage(src: string) {
  if (!src.startsWith("/images/") || src.includes("?") || src.includes("#")) {
    throw new Error(`Content images must use a local /images/ path: ${src}`);
  }
  const file = resolve(publicRoot, `.${decodeURIComponent(src)}`);
  if (!file.startsWith(`${publicRoot}${sep}images${sep}`)) {
    throw new Error(`Content image is outside public/images: ${src}`);
  }
  let metadata = cache.get(src);
  if (!metadata) {
    metadata = readFile(file).then((bytes) => imageMetadata(bytes, src));
    cache.set(src, metadata);
  }
  const { width, height, format } = await metadata;
  return { width, height, format };
}

export async function contentImageSize(src: string) {
  const { width, height } = await contentImage(src);
  return { width, height };
}
