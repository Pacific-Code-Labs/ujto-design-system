import wordmarkLight from "../../assets/brand/wordmark-light.png";
import wordmarkDark from "../../assets/brand/wordmark-dark.png";
import symbol from "../../assets/brand/symbol.png";
import { cn } from "../lib/utils";

/** The brand name as written in the wordmark (Bribri "word"; keep both marks). */
export const BRAND_NAME = "Ujtö̀";

/** Bundled brand assets, for apps that don't manage their own through content. */
export const brandAssets = { wordmarkLight, wordmarkDark, symbol };

type Props = {
  className?: string;
  /** "auto" follows the theme; "reverse" always uses the light-on-dark version. */
  variant?: "auto" | "reverse";
  /** Override the wordmark (e.g. from branding.json); defaults to the bundled L1/L2 files. */
  src?: string;
  srcDark?: string;
  alt?: string;
};

/**
 * Approved Ujtö̀ wordmark (L1 on light surfaces, L2 reverse on dark).
 * The ö̀ is part of the wordmark: never place the standalone symbol next to it.
 */
export function BrandLogo({ className, variant = "auto", src, srcDark, alt = BRAND_NAME }: Props) {
  const light = src || wordmarkLight;
  const dark = srcDark || wordmarkDark;
  if (variant === "reverse") {
    return <img src={dark} alt={alt} className={cn("h-8 w-auto", className)} />;
  }
  return (
    <>
      <img src={light} alt={alt} className={cn("h-8 w-auto dark:hidden", className)} />
      <img src={dark} alt={alt} className={cn("hidden h-8 w-auto dark:block", className)} />
    </>
  );
}

/** The standalone ö̀ symbol (app icon, collapsed sidebars). */
export function BrandSymbol({ className, alt = BRAND_NAME }: { className?: string; alt?: string }) {
  return <img src={symbol} alt={alt} className={cn("h-8 w-8 object-contain", className)} />;
}
