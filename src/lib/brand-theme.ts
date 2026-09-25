/**
 * Runtime theme applier: turns a content theme ({ colors: hex }) into the HSL tokens the
 * design system paints with. Overrides go in ONE managed <style> element and only touch
 * light mode (`:root:not(.dark)`), so the .dark palette keeps precedence.
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  background: string;
  foreground: string;
}

export interface BrandTheme {
  id: string;
  name: string;
  isActive: boolean;
  colors: ThemeColors;
}

/** "#1F5F63" → "183 52% 25%" (the bare triplet the tokens use). */
export function hexToHsl(hex: string): string {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return "";
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0;
  let sat = 0;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%`;
}

function buildCss(colors: ThemeColors): string {
  const tokens: Record<string, string | undefined> = {
    "--primary": colors.primary,
    "--ring": colors.primary,
    "--sidebar-primary": colors.primary,
    "--brand-river": colors.primary,
    "--secondary": colors.secondary,
    "--brand-earth": colors.secondary,
    "--accent": colors.accent,
    "--brand-clay": colors.accent,
    "--success": colors.success,
    "--brand-forest": colors.success,
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card-foreground": colors.foreground,
    "--popover-foreground": colors.foreground,
  };
  const body = Object.entries(tokens)
    .map(([k, v]) => (v ? hexToHsl(v) : ""))
    .map((hsl, i) => (hsl ? `  ${Object.keys(tokens)[i]}: ${hsl};` : ""))
    .filter(Boolean)
    .join("\n");
  return `:root:not(.dark) {\n${body}\n}`;
}

export function applyBrandTheme(theme: BrandTheme | undefined | null): void {
  if (typeof document === "undefined" || !theme) return;
  let el = document.getElementById("brand-theme") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "brand-theme";
    document.head.appendChild(el);
  }
  el.textContent = buildCss(theme.colors);
}

export function activeTheme(themes: BrandTheme[]): BrandTheme | undefined {
  return themes.find((t) => t.isActive) ?? themes[0];
}

/** Point <link rel="icon"> at a (resolved) favicon URL. */
export function applyFavicon(href: string | undefined | null): void {
  if (typeof document === "undefined" || !href) return;
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}
