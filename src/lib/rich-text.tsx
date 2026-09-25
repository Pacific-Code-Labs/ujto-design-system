import { Fragment, type ReactNode } from "react";

/*
 * Light inline formatting for editable copy, rendered as React nodes (never HTML, so it is
 * XSS-safe by construction). Markers nest: [[**accent and bold**]].
 *   \n        line break           {{text}}  brand gradient
 *   [[text]]  accent (clay)        ((text))  primary (river)
 *   <<text>>  success (forest)     **text**  bold
 */
type Style = "gradient" | "accentA" | "accentB" | "accentC" | "bold";

// Theme tokens only, so highlights follow light/dark and brand changes.
const STYLE_CLASS: Record<Style, string> = {
  gradient: "text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent",
  accentA: "text-accent",
  accentB: "text-primary",
  accentC: "text-success",
  bold: "font-bold",
};

const PATTERNS: Array<{ regex: RegExp; style: Style }> = [
  { regex: /\{\{([\s\S]+?)\}\}/, style: "gradient" },
  { regex: /\[\[([\s\S]+?)\]\]/, style: "accentA" },
  { regex: /\(\(([\s\S]+?)\)\)/, style: "accentB" },
  { regex: /<<([\s\S]+?)>>/, style: "accentC" },
  { regex: /\*\*([\s\S]+?)\*\*/, style: "bold" },
];

function renderLine(line: string, keyPrefix: string): ReactNode[] {
  let best: { index: number; length: number; text: string; style: Style } | null = null;
  for (const { regex, style } of PATTERNS) {
    const m = regex.exec(line);
    if (m && (best === null || m.index < best.index)) best = { index: m.index, length: m[0].length, text: m[1], style };
  }
  if (!best) return line ? [line] : [];
  const out: ReactNode[] = [];
  if (best.index > 0) out.push(line.slice(0, best.index));
  out.push(
    <span key={keyPrefix} className={STYLE_CLASS[best.style]}>
      {renderLine(best.text, `${keyPrefix}i`)}
    </span>,
  );
  const rest = line.slice(best.index + best.length);
  if (rest) out.push(...renderLine(rest, `${keyPrefix}r`));
  return out;
}

export function parseRichText(value: string | undefined | null): ReactNode {
  if (!value) return value ?? null;
  return value.split("\\n").map((line, i, arr) => (
    <Fragment key={i}>
      {renderLine(line, String(i))}
      {i < arr.length - 1 && <br />}
    </Fragment>
  ));
}

export function RichText({ children }: { children: string | undefined | null }) {
  return <>{parseRichText(children)}</>;
}

/** Shown under admin fields that accept rich text. Keyed by language for the admin chrome. */
export const RICH_TEXT_HINT = {
  en: "Format: \\n line break · {{gradient}} · [[accent]] · ((primary)) · <<forest>> · **bold** · they combine: [[**accent bold**]]",
  es: "Formato: \\n salto de línea · {{degradado}} · [[acento]] · ((primario)) · <<bosque>> · **negrita** · se combinan: [[**acento negrita**]]",
};
