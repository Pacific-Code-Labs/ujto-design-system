import { useLanguage } from "../i18n/LanguageProvider";

/** Bilingual content value as stored in content JSON: `{ "en": "…", "es": "…" }`. */
export type Localized<T = string> = { en: T; es: T };

/** Pick the active language's side, falling back to English, then Spanish. */
export function pickLocalized<T>(value: Localized<T> | undefined | null, lang: string): T | undefined {
  if (!value) return undefined;
  return (value as Record<string, T>)[lang] ?? value.en ?? value.es;
}

/** `const L = useLocalized(); L(content.title)` — reads the side for the current language. */
export function useLocalized() {
  const { language } = useLanguage();
  return <T,>(value: Localized<T> | undefined | null) => pickLocalized(value, language) as T;
}
