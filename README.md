# ujto-design-system

`@pacific-code-labs/ujto-ds` — the Ujtö̀ design system, shared by every app:
the landing ([ujto](https://github.com/Pacific-Code-Labs/ujto)), the dashboard
([ujto-app](https://github.com/Pacific-Code-Labs/ujto-app)), the content admin
(ujto-admin, private) and the desktop app ([ujto-desktop](https://github.com/Pacific-Code-Labs/ujto-desktop),
which shows the dashboard).

It ships **TypeScript source** (no build step). Each app's Vite compiles it and Tailwind v4
scans it through the `@source` in `styles.css`.

## What's inside

| Import | What |
|---|---|
| `@pacific-code-labs/ujto-ds/styles.css` | Tailwind v4 + `tw-animate-css` + design tokens (light/dark, `--sidebar*`, brand) + base styles, theme/language switch animations, scrollbars |
| `ThemeProvider`, `useTheme`, `ThemeToggle` | `.dark` class on `<html>`, persisted, cross-fade on switch |
| `LanguageProvider`, `useLanguage`, `LanguageToggle`, `LanguageSegments` | i18n runtime: nested `translations/<lang>.json` trees, `t(key, vars)`, `/<lang>` URL prefix (or in-place for the admin), animated switch of `#page-content` |
| `Localized`, `useLocalized`, `pickLocalized` | bilingual content values `{ en, es }` |
| `ICONS`, `ICON_NAMES`, `resolveIcon` | icons as content (`iconName` strings) |
| `parseRichText`, `RichText`, `RICH_TEXT_HINT` | XSS-safe inline formatting for editable copy |
| `applyBrandTheme`, `applyFavicon`, `hexToHsl` | runtime themes from content (`themes.json`) |
| `resolveAssetUrl`, `mediaRef`, `MediaItem` | media library helpers |
| `BrandLogo`, `BrandSymbol`, `BRAND_NAME` | approved wordmark (L1/L2) and ö̀ symbol |
| `AppShell`, `PageHeader`, `Hint` | sidebar app layout (collapsible, mobile drawer) |
| `Button`, `Card`, `Dialog`, `Tabs`, `Toast`, … | shadcn/Radix primitives painted with the tokens |

## Use it in an app

```jsonc
// package.json
"dependencies": { "@pacific-code-labs/ujto-ds": "github:Pacific-Code-Labs/ujto-design-system#v0.1.0" }
```

```css
/* src/index.css */
@import "@pacific-code-labs/ujto-ds/styles.css";
```

Apps need `react`, `react-dom`, `tailwindcss` and `@tailwindcss/vite` (Tailwind v4).

**Developing the design system alongside an app:** clone this repo next to the app
(the ujto-root workspace puts it in `design-system/`) and run
`pnpm link ../design-system` in the app; undo with `pnpm install`.

## Rules

- Colours only through tokens (`bg-primary`, `text-muted-foreground`, `bg-sidebar`…). Add a token
  in `src/styles/tokens.css` (both `:root` and `.dark`) instead of a literal colour.
- No user-visible text in components: callers pass labels (they come from each app's i18n or content).
- Release: bump `version`, commit, tag `vX.Y.Z`, push the tag; apps update their dependency to the new tag.

`pnpm typecheck` must pass before tagging.
