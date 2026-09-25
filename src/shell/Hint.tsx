import type { ReactElement, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";

/**
 * Styled tooltip (never the native `title`). Needs one <TooltipProvider> at the app root.
 * The child MUST be a native <button>/<a> (asChild), not a router <Link>.
 */
export function Hint({
  label,
  side = "top",
  disabled,
  children,
}: {
  label: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
  children: ReactElement;
}) {
  if (disabled) return children;
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
