import { formatMoney } from '../lib/format'

interface ExtraPaymentSliderProps {
  currency: string
  extraPerMonth: number
  onChange: (value: number) => void
  adjustedRate: number
  monthsRemaining: number
  payoffDate: string
}

export function ExtraPaymentSlider({
  currency,
  extraPerMonth,
  onChange,
  adjustedRate,
  monthsRemaining,
  payoffDate,
}: ExtraPaymentSliderProps) {
  return (
    <section className="rounded-2xl border border-dashed border-violet-300/80 bg-violet-50/50 p-6 dark:border-violet-700 dark:bg-violet-950/20">
      <h2 className="text-left text-lg font-semibold text-slate-900 dark:text-slate-100">
        What if extra payments?
      </h2>
      <p className="mt-1 text-left text-sm text-slate-600 dark:text-slate-400">
        UI-only — does not change <code className="text-xs">mortgage.json</code>.
      </p>
      <label className="mt-4 block text-left text-sm font-medium text-slate-700 dark:text-slate-300">
        Extra per month: {formatMoney(extraPerMonth, currency)}
      </label>
      <input
        type="range"
        min={0}
        max={4000}
        step={50}
        value={extraPerMonth}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-violet-600"
      />
      <div className="mt-4 grid gap-2 text-left text-sm sm:grid-cols-3">
        <p>
          <span className="text-slate-500">Effective rate </span>
          <span className="font-medium tabular-nums">
            {formatMoney(adjustedRate, currency)}/mo
          </span>
        </p>
        <p>
          <span className="text-slate-500">Months left </span>
          <span className="font-medium tabular-nums">{monthsRemaining}</span>
        </p>
        <p>
          <span className="text-slate-500">Payoff </span>
          <span className="font-medium">{payoffDate}</span>
        </p>
      </div>
    </section>
  )
}
