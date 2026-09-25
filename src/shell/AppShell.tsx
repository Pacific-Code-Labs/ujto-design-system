import { ChevronDown, ChevronLeft, ChevronRight, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Hint } from "./Hint";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export interface AppShellProps {
  /** Current path (from the router), used for the active state. */
  location: string;
  /** Navigate to a sidebar target. Return true when the click was handled/blocked elsewhere. */
  onNavigate: (href: string) => void;
  /** Stand-alone links above the groups (e.g. the dashboard). */
  topItems?: NavItem[];
  groups?: NavGroup[];
  /** Brand row content; receives whether the sidebar is collapsed. */
  brand: (collapsed: boolean) => ReactNode;
  /** Sticky top bar; call `openMenu` from its mobile menu button. */
  topbar: (openMenu: () => void) => ReactNode;
  /** Optional footer link row (e.g. "back to site"). */
  footer?: (collapsed: boolean) => ReactNode;
  /** Accessible labels for the collapse/close controls. */
  labels: { collapse: string; expand: string; close: string };
  children: ReactNode;
}

const isActive = (location: string, href: string) => location === href || location.startsWith(`${href}/`);

// The one shared "selected" treatment: dashboard link, active item and open group header.
const SELECTED = "bg-sidebar-primary text-sidebar-primary-foreground";
const IDLE = "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent";

function Sidebar({
  location,
  onNavigate,
  topItems = [],
  groups = [],
  brand,
  footer,
  labels,
  collapsed,
  onToggle,
  onClose,
}: Omit<AppShellProps, "topbar" | "children"> & { collapsed: boolean; onToggle?: () => void; onClose?: () => void }) {
  const activeGroup = groups.find((g) => g.items.some((i) => isActive(location, i.href)))?.key ?? "";
  const [openGroup, setOpenGroup] = useState(activeGroup);
  // Landing on a sub-page opens its section.
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  const go = (href: string) => {
    onNavigate(href);
    onClose?.();
  };

  const link = (item: NavItem, nested: boolean) => {
    const Icon = item.icon;
    const active = isActive(location, item.href);
    return (
      <Hint key={item.href} label={item.label} side="right" disabled={!collapsed}>
        <button
          type="button"
          onClick={() => go(item.href)}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg py-2 text-sm transition-all",
            collapsed ? "justify-center px-2" : nested ? "pl-6 pr-3" : "px-3",
            active ? SELECTED : IDLE,
          )}
        >
          <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {collapsed && <span className="sr-only">{item.label}</span>}
        </button>
      </Hint>
    );
  };

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-4")}>
        {brand(collapsed)}
        {onClose && (
          <button type="button" onClick={onClose} className="ml-auto rounded-md p-1.5 hover:bg-sidebar-accent" aria-label={labels.close}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? labels.expand : labels.collapse}
          className="absolute -right-3 top-16 z-20 hidden h-6 w-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-md ring-2 ring-background hover:bg-sidebar-primary/90 lg:flex"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {topItems.map((item) => link(item, false))}
        {groups.map((group) => {
          const open = collapsed || openGroup === group.key;
          const GroupIcon = group.icon;
          return (
            <div key={group.key} className="pt-2">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setOpenGroup(openGroup === group.key ? "" : group.key)}
                  aria-expanded={open}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                    open || group.key === activeGroup ? SELECTED : IDLE,
                  )}
                >
                  <GroupIcon className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} />
                </button>
              )}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="space-y-1 overflow-hidden pt-1">{group.items.map((item) => link(item, true))}</div>
              </div>
            </div>
          );
        })}
      </nav>

      {footer && <div className="border-t border-sidebar-border p-2">{footer(collapsed)}</div>}
    </aside>
  );
}

/**
 * Sidebar application layout: collapsible desktop sidebar (w-16 ↔ w-64), animated mobile
 * drawer, sticky top bar and a scrollable <main id="page-content"> that returns to the top
 * on every route change. Painted with the --sidebar* tokens.
 */
export function AppShell(props: AppShellProps) {
  const { topbar, children, location } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileRender, setMobileRender] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location]);

  const openMobile = () => {
    setMobileRender(true);
    requestAnimationFrame(() => setMobileOpen(true));
  };
  const closeMobile = () => {
    setMobileOpen(false);
    window.setTimeout(() => setMobileRender(false), 300);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden shrink-0 lg:flex">
        <Sidebar {...props} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {mobileRender && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className={cn("absolute inset-0 bg-black/60 transition-opacity duration-300", mobileOpen ? "opacity-100" : "opacity-0")}
            onClick={closeMobile}
          />
          <div
            className={cn(
              "relative z-10 h-full w-64 transition-transform duration-300 ease-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <Sidebar {...props} collapsed={false} onClose={closeMobile} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {topbar(openMobile)}
        <main ref={mainRef} id="page-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
