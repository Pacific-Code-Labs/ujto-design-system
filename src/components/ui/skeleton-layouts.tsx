// Loading states: skeletons shaped like the content they stand in for, never a centred spinner.
// A spinner says "wait"; a skeleton shows what is coming and keeps the layout from jumping.
// Spinners are only for an action's own control (a button while it submits) and for a
// long-running job's status. Every skeleton is aria-busy with a screen-reader label.
import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import { Skeleton } from "./skeleton"

function Busy({ label, className, children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      {label && <span className="sr-only">{label}</span>}
      {children}
    </div>
  )
}

/** A few lines of text (the last one shorter). */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  )
}

/** Rows of cards (history, tickets, notifications). */
export function ListSkeleton({ rows = 3, rowClassName, label }: { rows?: number; rowClassName?: string; label?: string }) {
  return (
    <Busy label={label} className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn("flex items-center gap-3 rounded-lg border border-border p-4", rowClassName)}>
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </Busy>
  )
}

/** A data table: header row + body rows. */
export function TableSkeleton({ rows = 6, columns = 5, label }: { rows?: number; columns?: number; label?: string }) {
  return (
    <Busy label={label} className="overflow-hidden rounded-lg border border-border">
      <div className="flex gap-3 bg-muted/50 px-3 py-3">
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-3 border-t border-border px-3 py-3">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "flex-[2]")} />
          ))}
        </div>
      ))}
    </Busy>
  )
}

/** A grid of stat tiles (label + value). */
export function StatGridSkeleton({ count = 4, label }: { count?: number; label?: string }) {
  return (
    <Busy label={label} className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border p-4">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-7 w-1/3" />
        </div>
      ))}
    </Busy>
  )
}

/** A detail page: title, meta line, a body block and a couple of sections. */
export function DetailSkeleton({ label }: { label?: string }) {
  return (
    <Busy label={label} className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
      <SkeletonText lines={4} />
      <Skeleton className="h-40 w-full rounded-lg" />
    </Busy>
  )
}

/** A form: label + input pairs and a button. */
export function FormSkeleton({ fields = 4, label }: { fields?: number; label?: string }) {
  return (
    <Busy label={label} className="space-y-5">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </Busy>
  )
}

/** The whole signed-in shell while the session resolves (sidebar, top bar, page). */
export function ShellSkeleton({ label }: { label?: string }) {
  return (
    <Busy label={label} className="flex min-h-screen bg-background">
      <div className="hidden w-64 shrink-0 space-y-4 border-r border-border p-4 lg:block">
        <Skeleton className="h-7 w-28" />
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex-1">
        <div className="flex h-14 items-center justify-end gap-2 border-b border-border px-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          <Skeleton className="h-8 w-1/3" />
          <StatGridSkeleton />
          <ListSkeleton rows={3} />
        </div>
      </div>
    </Busy>
  )
}
