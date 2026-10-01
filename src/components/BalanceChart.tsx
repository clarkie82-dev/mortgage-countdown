import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint } from '../lib/types'
import { formatMoney } from '../lib/format'

interface BalanceChartProps {
  data: ChartPoint[]
  currency: string
  payoffDate: string
}

export function BalanceChart({ data, currency, payoffDate }: BalanceChartProps) {
  const actual = data.filter((p) => p.kind === 'actual')
  const forecast = data.filter((p) => p.kind === 'forecast')
  const lastActualDate = actual.at(-1)?.date
  const merged = data.map((p) => ({
    date: p.date,
    actual: p.kind === 'actual' ? p.balance : undefined,
    // Anchor forecast at the latest actual so the line starts on the real snapshot
    forecast:
      p.kind === 'forecast' || p.date === lastActualDate ? p.balance : undefined,
  }))

  // Match the green marker to where the forecast hits $0 (updates with extra-payment slider)
  const chartPayoffDate =
    [...merged].reverse().find((row) => row.forecast !== undefined)?.date ?? payoffDate

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <h2 className="mb-4 text-left text-lg font-semibold text-slate-900 dark:text-slate-100">
        Balance over time
      </h2>
      <div className="h-80 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            key={chartPayoffDate}
            data={merged}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v.slice(0, 7)}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={48}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number' ? formatMoney(value, currency) : '—'
              }
              labelFormatter={(label) => String(label)}
            />
            <Legend />
            <ReferenceLine
              key={chartPayoffDate}
              x={chartPayoffDate}
              stroke="#10b981"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{ value: 'Payoff', position: 'insideTopRight', fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-left text-xs text-slate-500">
        {`${actual.length} actual point${actual.length === 1 ? '' : 's'}, ${forecast.length} forecast point${forecast.length === 1 ? '' : 's'}`}
      </p>
    </section>
  )
}
