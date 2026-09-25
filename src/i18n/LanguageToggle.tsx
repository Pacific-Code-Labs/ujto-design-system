import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useLanguage } from "./LanguageProvider";
import { CrFlag, UsFlag } from "./flags";

const FLAGS: Record<string, typeof UsFlag> = { en: UsFlag, es: CrFlag };

interface Props {
  /** Accessible label, e.g. t("language.switchTo"). */
  label: string;
  className?: string;
}

/**
 * One-click switch between the site's two languages. Shows the flag of the ACTIVE
 * language (en → United States, es → Costa Rica); the other flag rotates in on switch.
 */
export function LanguageToggle({ label, className }: Props) {
  const { language, languages, setLanguage } = useLanguage();
  const next = languages[(languages.indexOf(language) + 1) % languages.length];
  const flagClass =
    "absolute h-[14px] w-[21px] rounded-[2px] shadow-sm ring-1 ring-black/10 dark:ring-white/20 transition-all duration-300";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(next)}
      className={cn("relative h-9 w-9 rounded-md", className)}
      aria-label={label}
    >
      {languages.map((lang) => {
        const Flag = FLAGS[lang];
        if (!Flag) return null;
        const active = lang === language;
        return (
          <Flag
            key={lang}
            className={cn(flagClass, active ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")}
          />
        );
      })}
      <span className="sr-only">{label}</span>
    </Button>
  );
}

/** Segmented EN | ES buttons (admin topbar style). Switches in place. */
export function LanguageSegments({ label, className }: Props) {
  const { language, languages, setLanguage } = useLanguage();
  return (
    <div className={cn("flex items-center rounded-lg border border-border p-0.5", className)} role="group" aria-label={label}>
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={cn(
            "h-7 rounded-md px-2 text-xs font-semibold uppercase transition-colors",
            lang === language ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
