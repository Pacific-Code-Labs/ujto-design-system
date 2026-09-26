import { cn } from "../../lib/utils"

/**
 * Indeterminate progress bar: for work that has no measurable percentage (a job running on a
 * server). Use <Progress value> whenever real progress is known (bytes uploaded). Loading of a
 * page or list uses skeletons (skeleton-layouts), not bars or spinners.
 */
export function ActivityBar({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label={label}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <div className="ujto-activity-bar absolute inset-y-0 left-0 w-2/5 rounded-full bg-primary" />
    </div>
  )
}
