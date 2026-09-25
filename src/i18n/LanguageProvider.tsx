import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** A nested translation tree, e.g. the contents of src/translations/en.json. */
export type TranslationTree = { [key: string]: string | TranslationTree };

/** Flatten `{ nav: { home: "Home" } }` to `{ "nav.home": "Home" }`. */
export function flattenTranslations(tree: TranslationTree, prefix = "", out: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else flattenTranslations(value, path, out);
  }
  return out;
}

export interface LanguageContextValue<L extends string = string> {
  language: L;
  languages: readonly L[];
  /** Switch language; with URL prefixes the page animates and the /<lang> prefix is swapped. */
  setLanguage: (lang: L) => void;
  /** Translate a key; `{{name}}` placeholders are filled from `vars`. Missing keys return the key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export interface LanguageProviderProps<L extends string> {
  children: ReactNode;
  /** One nested tree per language (src/translations/<lang>.json). */
  translations: Record<L, TranslationTree>;
  languages: readonly L[];
  defaultLanguage: L;
  /** localStorage key for the chosen language. */
  storageKey?: string;
  /**
   * true: the URL carries the language (/en/..., /es/...) and drives it (public sites, the
   * dashboard). false: the language only lives in state + storage (the admin, desktop views).
   */
  urlPrefix?: boolean;
  /** Called after every change (e.g. to update <title>). */
  onChange?: (lang: L) => void;
}

const PREFIX_RE = /^\/([a-z]{2})(?=\/|$)/;

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

/** The language a URL path carries, if any. */
export function languageFromPath<L extends string>(path: string, languages: readonly L[]): L | null {
  const code = PREFIX_RE.exec(path)?.[1];
  return code && (languages as readonly string[]).includes(code) ? (code as L) : null;
}

/** Replace (or add) the /<lang> prefix of a path, keeping the rest. */
export function withLanguage(path: string, lang: string): string {
  const rest = path.replace(PREFIX_RE, "") || "/";
  return rest === "/" ? `/${lang}` : `/${lang}${rest}`;
}

function animateSwap(apply: () => void) {
  const el = typeof document !== "undefined" ? document.getElementById("page-content") : null;
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!el || reduce) {
    apply();
    return;
  }
  el.classList.add("lang-anim-out");
  window.setTimeout(() => {
    apply();
    el.classList.remove("lang-anim-out");
    el.classList.add("lang-anim-in");
    window.setTimeout(() => el.classList.remove("lang-anim-in"), 340);
  }, 220);
}

export function LanguageProvider<L extends string>({
  children,
  translations,
  languages,
  defaultLanguage,
  storageKey = "ujto-lang",
  urlPrefix = true,
  onChange,
}: LanguageProviderProps<L>) {
  const flat = useMemo(
    () =>
      Object.fromEntries(languages.map((l) => [l, flattenTranslations(translations[l] ?? {})])) as Record<
        L,
        Record<string, string>
      >,
    [translations, languages],
  );

  const detect = useCallback((): L => {
    if (typeof window === "undefined") return defaultLanguage;
    if (urlPrefix) {
      const fromUrl = languageFromPath(window.location.pathname, languages);
      if (fromUrl) return fromUrl;
    }
    const stored = readStored(storageKey);
    if (stored && (languages as readonly string[]).includes(stored)) return stored as L;
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    return (languages as readonly string[]).includes(browser) ? (browser as L) : defaultLanguage;
  }, [defaultLanguage, languages, storageKey, urlPrefix]);

  const [language, setLanguageState] = useState<L>(detect);

  // Follow the URL when the router changes it (back/forward, links to /<lang>/...).
  useEffect(() => {
    if (!urlPrefix) return;
    const sync = () => {
      const fromUrl = languageFromPath(window.location.pathname, languages);
      if (fromUrl) setLanguageState(fromUrl);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [urlPrefix, languages]);

  useEffect(() => {
    document.documentElement.lang = language;
    writeStored(storageKey, language);
    onChange?.(language);
  }, [language, storageKey, onChange]);

  const setLanguage = useCallback(
    (next: L) => {
      if (next === language) return;
      if (!urlPrefix) {
        setLanguageState(next); // in place: no navigation, no page animation
        return;
      }
      animateSwap(() => {
        setLanguageState(next);
        const { pathname, search, hash } = window.location;
        window.history.pushState({}, "", withLanguage(pathname, next) + search + hash);
        // Routers (wouter) listen to popstate; this keeps them in sync with the new URL.
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    },
    [language, urlPrefix],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let value = flat[language]?.[key] ?? flat[defaultLanguage]?.[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) value = value.split(`{{${k}}}`).join(String(v));
      return value;
    },
    [flat, language, defaultLanguage],
  );

  const value = useMemo(
    () => ({ language, languages, setLanguage, t }) as unknown as LanguageContextValue,
    [language, languages, setLanguage, t],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage<L extends string = string>(): LanguageContextValue<L> {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx as unknown as LanguageContextValue<L>;
}
