import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Activity, GripVertical, RefreshCw, Users, Wallet, Zap } from "lucide-react";
import { getSheetData, type SheetRow } from "@/lib/sheet.functions";
import {
  ClientInsights,
  ClientTable,
  ConversionFunnel,
  Engagement,
  IndustryDistribution,
  RevenueTrend,
  inr,
  inrCompact,
  useMetrics,
} from "@/components/dashboard/widgets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus Control — Live Revenue & Client Analytics" },
      {
        name: "description",
        content:
          "Real-time business control room: live revenue in ₹, client insights, industry distribution, engagement and conversion funnels streamed from Google Sheets.",
      },
      { property: "og:title", content: "Nexus Control — Live Revenue & Client Analytics" },
      {
        property: "og:description",
        content:
          "Futuristic neon dashboard streaming live KPIs from your Google Sheet: revenue in ₹, clients, industries and funnels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const DEFAULT_ORDER = [
  "trend",
  "industry",
  "clients",
  "funnel",
  "engagement",
  "table",
] as const;
type WidgetId = (typeof DEFAULT_ORDER)[number];

const SPAN: Record<WidgetId, string> = {
  trend: "lg:col-span-8",
  industry: "lg:col-span-4",
  clients: "lg:col-span-5",
  funnel: "lg:col-span-4",
  engagement: "lg:col-span-3",
  table: "lg:col-span-12",
};

function Panel({
  id,
  title,
  subtitle,
  children,
  onDragStart,
  onDrop,
  dragging,
}: {
  id: WidgetId;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onDragStart: (id: WidgetId) => void;
  onDrop: (id: WidgetId) => void;
  dragging: boolean;
}) {
  return (
    <section
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(id)}
      className={`glass scan-sweep animate-rise relative col-span-1 overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 ${SPAN[id]} ${
        dragging ? "opacity-50" : ""
      }`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.18em] text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
      </header>
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  note: string;
}) {
  return (
    <div className="glass animate-rise relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="animate-pulse-glow grid size-9 place-items-center rounded-xl bg-accent/60">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl neon-text">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function Dashboard() {
  const fetchSheet = useServerFn(getSheetData);
  const { data, isFetching, dataUpdatedAt, refetch, error } = useQuery({
    queryKey: ["sheet"],
    queryFn: () => fetchSheet(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const rows: SheetRow[] = data?.rows ?? [];
  const m = useMetrics(rows);

  const [order, setOrder] = useState<WidgetId[]>([...DEFAULT_ORDER]);
  const [dragId, setDragId] = useState<WidgetId | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("widget-order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WidgetId[];
        if (parsed.length === DEFAULT_ORDER.length) setOrder(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const move = (target: WidgetId) => {
    if (!dragId || dragId === target) return;
    setOrder((prev) => {
      const next = prev.filter((w) => w !== dragId);
      next.splice(next.indexOf(target), 0, dragId);
      localStorage.setItem("widget-order", JSON.stringify(next));
      return next;
    });
    setDragId(null);
  };

  const content: Record<WidgetId, { title: string; subtitle: string; node: React.ReactNode }> =
    useMemo(
      () => ({
        trend: {
          title: "Revenue Trajectory",
          subtitle: "Cumulative amount paid across clients (₹)",
          node: <RevenueTrend m={m} />,
        },
        industry: {
          title: "Industry Distribution",
          subtitle: "Revenue share by sector",
          node: <IndustryDistribution m={m} />,
        },
        clients: {
          title: "Client Insights",
          subtitle: "Highest paying accounts",
          node: <ClientInsights m={m} />,
        },
        funnel: {
          title: "Conversion Funnel",
          subtitle: "Pipeline to paid clients",
          node: <ConversionFunnel m={m} />,
        },
        engagement: {
          title: "User Engagement",
          subtitle: "Reach & conversion index",
          node: <Engagement m={m} />,
        },
        table: {
          title: "Live Client Ledger",
          subtitle: "Streaming rows from your sheet",
          node: <ClientTable rows={rows} />,
        },
      }),
      [m, rows],
    );

  return (
    <main className="grid-lines min-h-screen px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-primary">Nexus Control</p>
          <h1 className="font-display text-3xl sm:text-4xl">
            Business <span className="neon-text">Command Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
            <span
              className={`size-2 rounded-full ${isFetching ? "bg-primary" : "bg-cyan"} animate-pulse-glow`}
            />
            {error
              ? "Feed error"
              : `Live · synced ${dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-IN") : "—"}`}
          </span>
          <button
            onClick={() => refetch()}
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest transition-colors hover:bg-accent/50"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Sync
          </button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total Revenue"
          value={inrCompact(m.total)}
          icon={Wallet}
          note={inr(m.total)}
        />
        <Kpi
          label="Active Clients"
          value={String(m.clients)}
          icon={Users}
          note={`${m.paying} with recorded payments`}
        />
        <Kpi
          label="Avg Deal Size"
          value={inrCompact(m.avg)}
          icon={Activity}
          note="Revenue per client"
        />
        <Kpi
          label="Top Sector"
          value={m.byIndustry[0]?.name ?? "—"}
          icon={Zap}
          note={m.byIndustry[0] ? inr(m.byIndustry[0].value) : "Awaiting data"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {order.map((id) => (
          <Panel
            key={id}
            id={id}
            title={content[id].title}
            subtitle={content[id].subtitle}
            onDragStart={setDragId}
            onDrop={move}
            dragging={dragId === id}
          >
            {content[id].node}
          </Panel>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Drag any panel by its handle to rearrange your control room · auto-syncing every 5s
      </p>
    </main>
  );
}
