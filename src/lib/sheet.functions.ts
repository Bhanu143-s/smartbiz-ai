import { createServerFn } from "@tanstack/react-start";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1tR_zrP98dy0mW2eN9-ZbamofdCvT76C30fgHkwu_MlY/export?format=csv&gid=0";

export type SheetRow = {
  client: string;
  revenue: number;
  industry: string;
  gmail: string;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

export const getSheetData = createServerFn({ method: "GET" }).handler(async () => {
  const res = await fetch(CSV_URL, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) {
    throw new Error(`Sheet request failed [${res.status}]: ${await res.text()}`);
  }
  const rows = parseCsv(await res.text());
  const headerRow = rows[0];
  if (!headerRow) return { rows: [] as SheetRow[], fetchedAt: Date.now() };

  const header = headerRow.map((h) => h.trim().toLowerCase());
  const idx = (...names: string[]) =>
    header.findIndex((h) => names.some((n) => h.includes(n)));

  const iClient = idx("client", "name");
  const iAmount = idx("amount", "revenue", "paid", "payed");
  const iIndustry = idx("industry", "sector");
  const iMail = idx("gmail", "email", "mail");

  const data: SheetRow[] = rows.slice(1).map((r) => ({
    client: (r[iClient] ?? "").trim() || "Unknown",
    revenue: Number(String(r[iAmount] ?? "").replace(/[^0-9.-]/g, "")) || 0,
    industry: (r[iIndustry] ?? "").trim() || "Other",
    gmail: (r[iMail] ?? "").trim(),
  }));

  return { rows: data, fetchedAt: Date.now() };
});
