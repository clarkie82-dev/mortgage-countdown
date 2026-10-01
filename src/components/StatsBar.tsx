import { formatMoney } from '../lib/format'
import type { ForecastSummary } from '../lib/types'

interface StatsBarProps {
  summary: ForecastSummary
  currency: string
  forecastMode: string
}

function rateSourceLabel(source: ForecastSummary['rateSource']): string {
  switch (source) {
    case 'auto':
      return '12-month average'
    case 'manual-fallback':
      return 'manual (need more history)'
    default:
      return 'manual'
  }
}

export function StatsBar({ summary, currency, forecastMode }: StatsBarProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Latest balance"
        value={formatMoney(summary.latestBalance, currency)}
      />
      <StatCard
        label="Forecast rate"
        value={`${formatMoney(summary.effectiveMonthlyReduction, currency)}/mo`}
        hint={`${forecastMode} · ${rateSourceLabel(summary.rateSource)}`}
      />
      <StatCard
        label="Progress"
        value={`${summary.progressPercent.toFixed(1)}%`}
        hint="vs first entry"
      />
      <StatCard
        label="Starting balance"
        value={formatMoney(summary.startingBalance, currency)}
      />
    </section>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
