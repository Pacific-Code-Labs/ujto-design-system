import type { Localized } from "./localized";

/** One entry of a site's media library (src/content/media.json → items[]). */
export type MediaKind = "image" | "video" | "audio";
export const MEDIA_KINDS: readonly MediaKind[] = ["image", "video", "audio"];

export interface MediaItem {
  id: string;
  kind: MediaKind;
  source: "local" | "external";
  /** Root-relative path under public/ for local items, e.g. "/media/hero.webp". */
  path?: string;
  /** Absolute URL for external items. */
  url?: string;
  filename: string;
  mime: string;
  size: number;
  alt: Localized;
  createdAt: string;
}

export interface MediaLibrary {
  items: MediaItem[];
}

// Vite base without trailing slash: "" for "/", "/repo" for "/repo/".
const basePrefix = () => ((import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/").replace(/\/$/, "");

/** Any stored ref (media path/url or a branding field) → usable src/href. */
export function resolveAssetUrl(ref?: string | null): string {
  if (!ref) return "";
  if (/^(https?:)?\/\//i.test(ref) || ref.startsWith("data:") || ref.startsWith("blob:")) return ref;
  return ref.startsWith("/") ? basePrefix() + ref : ref;
}

export const resolveMediaUrl = (item: MediaItem) =>
  resolveAssetUrl(item.source === "external" ? item.url : item.path);

/** The value to store in a content field when an item is picked (never undefined). */
export const mediaRef = (item: MediaItem): string =>
  (item.source === "external" ? item.url : item.path) || item.url || item.path || "";

/** Absolute URL for OG/Twitter/sitemap tags: siteUrl + base + path. */
export function absoluteAssetUrl(ref: string | undefined | null, siteUrl: string): string {
  if (!ref) return "";
  if (/^https?:\/\//i.test(ref) || ref.startsWith("data:")) return ref;
  return siteUrl.replace(/\/$/, "") + basePrefix() + (ref.startsWith("/") ? ref : `/${ref}`);
}
