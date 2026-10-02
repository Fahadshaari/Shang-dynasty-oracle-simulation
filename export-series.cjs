// node examples/export-series.cjs [start ISO UTC] [row count] [minutes per row]
// Example: node examples/export-series.cjs 2026-10-01T00:00:00Z 24 120 > series.csv
const X = require('../dist/engine.js');
const { toMetrics } = require('./quantify.cjs');
const start = new Date(process.argv[2] || '2026-10-01T00:00:00Z');
const count = Number(process.argv[3] || 24);
const minutes = Number(process.argv[4] || 120);
if (!Number.isFinite(start.getTime()) || !Number.isInteger(count) || count < 1 || count > 8760 || !Number.isFinite(minutes) || minutes <= 0) {
  console.error('Use a valid ISO date, 1–8760 rows, and a positive minute interval.');
  process.exit(1);
}
const rows = Array.from({ length:count }, (_, i) => toMetrics(X.calculateTimeChart(new Date(start.getTime() + i * minutes * 60000))));
const fields = Object.keys(rows[0]);
const csv = value => '"' + String(value).replace(/"/g, '""') + '"';
console.log(fields.map(csv).join(','));
for (const row of rows) console.log(fields.map(key => csv(row[key])).join(','));
