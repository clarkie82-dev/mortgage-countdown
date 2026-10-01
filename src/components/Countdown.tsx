import { daysBetween, parseDate } from '../lib/forecast'
import { formatDateDisplay, formatMonthsRemaining } from '../lib/format'
import type { ForecastSummary } from '../lib/types'

interface CountdownProps {
  summary: ForecastSummary
}

export function Countdown({ summary }: CountdownProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const payoff = parseDate(summary.payoffDate)
  const daysLeft = Math.max(0, daysBetween(today, payoff))

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Estimated payoff
      </p>
      <p className="mt-2 text-4xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
        {formatDateDisplay(summary.payoffDate)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Time left</p>
          <p className="text-lg font-medium tabular-nums">
            {formatMonthsRemaining(summary.monthsRemaining)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Days from today</p>
          <p className="text-lg font-medium tabular-nums">{daysLeft.toLocaleString()}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500">As of snapshot</p>
          <p className="text-lg font-medium">{formatDateDisplay(summary.asOfDate)}</p>
        </div>
      </div>
      <p className="mt-4 text-left text-xs text-slate-500 dark:text-slate-400">
        Linear forecast from balance reduction — not a full amortization schedule.
      </p>
    </section>
  )
}
