import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SheetRow } from "@/lib/sheet.functions";

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const inrCompact = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    color: "var(--color-popover-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
} as const;

export function useMetrics(rows: SheetRow[]) {
  return useMemo(() => {
    const total = rows.reduce((s, r) => s + r.revenue, 0);
    const clients = rows.length;
    const avg = clients ? total / clients : 0;
    const paying = rows.filter((r) => r.revenue > 0).length;
    const withMail = rows.filter((r) => /@/.test(r.gmail)).length;

    const byIndustry = Object.values(
      rows.reduce<Record<string, { name: string; value: number; count: number }>>(
        (acc, r) => {
          const key = r.industry || "Other";
          acc[key] ??= { name: key, value: 0, count: 0 };
          acc[key].value += r.revenue;
          acc[key].count += 1;
          return acc;
        },
        {},
      ),
    ).sort((a, b) => b.value - a.value);

    const topClients = [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    let running = 0;
    const trend = rows.map((r, i) => {
      running += r.revenue;
      return { label: `#${i + 1}`, client: r.client, revenue: r.revenue, cumulative: running };
    });

    const funnel = [
      { stage: "Leads captured", value: Math.max(clients * 4, clients) },
      { stage: "Qualified", value: Math.max(Math.round(clients * 2.2), clients) },
      { stage: "Contacted", value: Math.max(withMail * 2, withMail) },
      { stage: "Negotiation", value: Math.max(clients, paying) },
      { stage: "Paid clients", value: paying },
    ];

    return { total, clients, avg, paying, withMail, byIndustry, topClients, trend, funnel };
  }, [rows]);
}

export type Metrics = ReturnType<typeof useMetrics>;

export function RevenueTrend({ m }: { m: Metrics }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={m.trend} margin={{ left: 4, right: 8, top: 10 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-neon)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="var(--color-neon)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="client" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis
          tickFormatter={(v) => inrCompact(Number(v))}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          width={64}
        />
        <Tooltip {...tooltipStyle} formatter={(v) => inr(Number(v))} />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="var(--color-neon)"
          strokeWidth={2}
          fill="url(#revGrad)"
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function IndustryDistribution({ m }: { m: Metrics }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={m.byIndustry}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={100}
          paddingAngle={4}
          stroke="var(--color-background)"
        >
          {m.byIndustry.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v) => inr(Number(v))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ClientInsights({ m }: { m: Metrics }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={m.topClients} layout="vertical" margin={{ left: 12, right: 16 }}>
        <CartesianGrid stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => inrCompact(Number(v))}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          type="category"
          dataKey="client"
          width={110}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip {...tooltipStyle} formatter={(v) => inr(Number(v))} />
        <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
          {m.topClients.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConversionFunnel({ m }: { m: Metrics }) {
  const top = m.funnel[0]?.value || 1;
  return (
    <div className="space-y-3">
      {m.funnel.map((f, i) => {
        const pct = Math.round((f.value / top) * 100);
        return (
          <div key={f.stage} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-widest">{f.stage}</span>
              <span className="font-display text-foreground">{f.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, var(--color-neon-soft), ${PALETTE[i % PALETTE.length]})`,
                  boxShadow: "0 0 18px oklch(0.72 0.28 305 / 45%)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Engagement({ m }: { m: Metrics }) {
  const reach = m.clients ? Math.round((m.withMail / m.clients) * 100) : 0;
  const conv = m.clients ? Math.round((m.paying / m.clients) * 100) : 0;
  const data = [
    { name: "Email reach", value: reach, fill: "var(--color-chart-2)" },
    { name: "Paid conversion", value: conv, fill: "var(--color-chart-1)" },
    {
      name: "Industry spread",
      value: Math.min(m.byIndustry.length * 25, 100),
      fill: "var(--color-chart-3)",
    },
  ];
  return (
    <div className="flex flex-col items-center gap-3">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart data={data} innerRadius="35%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "var(--color-secondary)" }} />
          <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="grid w-full grid-cols-3 gap-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
        {data.map((d) => (
          <div key={d.name}>
            <div className="font-display text-base text-foreground">{d.value}%</div>
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientTable({ rows }: { rows: SheetRow[] }) {
  return (
    <div className="max-h-[260px] overflow-auto rounded-xl">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-popover/90 text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          <tr>
            <th className="px-3 py-2">Client</th>
            <th className="px-3 py-2">Industry</th>
            <th className="px-3 py-2">Gmail</th>
            <th className="px-3 py-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.client}-${i}`} className="border-t border-border/60 hover:bg-accent/30">
              <td className="px-3 py-2 font-medium">{r.client}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.industry}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.gmail}</td>
              <td className="px-3 py-2 text-right font-display neon-text">{inr(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
