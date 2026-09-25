// Inline SVG flags (3:2 canvas) for the language toggle.
type FlagProps = { className?: string; title?: string };

/** United States — 13 stripes and the canton, simplified stars for small sizes. */
export function UsFlag({ className, title }: FlagProps) {
  const stripes = Array.from({ length: 13 }, (_, i) => i);
  return (
    <svg viewBox="0 0 30 20" className={className} role="img" aria-label={title} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {stripes.map((i) => (
        <rect key={i} x="0" y={(i * 20) / 13} width="30" height={20 / 13 + 0.05} fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"} />
      ))}
      <rect x="0" y="0" width="12" height={(20 / 13) * 7} fill="#3C3B6E" />
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: r % 2 === 0 ? 6 : 5 }, (_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={r % 2 === 0 ? 1 + c * 2 : 2 + c * 2}
            cy={1.2 + r * 2.2}
            r="0.42"
            fill="#FFFFFF"
          />
        )),
      )}
    </svg>
  );
}

/** Costa Rica — blue, white, red (double), white, blue bands (1:1:2:1:1). */
export function CrFlag({ className, title }: FlagProps) {
  const band = 20 / 6;
  return (
    <svg viewBox="0 0 30 20" className={className} role="img" aria-label={title} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <rect x="0" y="0" width="30" height="20" fill="#002B7F" />
      <rect x="0" y={band} width="30" height={band * 4} fill="#FFFFFF" />
      <rect x="0" y={band * 2} width="30" height={band * 2} fill="#CE1126" />
    </svg>
  );
}
