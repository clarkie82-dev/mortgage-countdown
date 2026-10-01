import { useMemo, useState } from 'react'
import { BalanceChart } from './components/BalanceChart'
import { Countdown } from './components/Countdown'
import { EntryTable } from './components/EntryTable'
import { ExtraPaymentSlider } from './components/ExtraPaymentSlider'
import { Milestones } from './components/Milestones'
import { StatsBar } from './components/StatsBar'
import {
  addMonths,
  applyExtraPayment,
  buildChartData,
  computeForecastSummary,
  computeMilestones,
  formatDateISO,
  monthsUntilPayoff,
  parseDate,
} from './lib/forecast'
import { formatDateDisplay } from './lib/format'
import { loadMortgageData } from './lib/loadData'

function App() {
  const data = useMemo(() => loadMortgageData(), [])
  const [extraPerMonth, setExtraPerMonth] = useState(0)

  const baseSummary = useMemo(
    () =>
      computeForecastSummary(
        data.entries,
        data.forecastMonthlyReduction,
        data.forecastMode,
      ),
    [data],
  )

  const adjustedRate = applyExtraPayment(
    baseSummary.effectiveMonthlyReduction,
    extraPerMonth,
  )

  const sliderSummary = useMemo(() => {
    if (extraPerMonth === 0) return baseSummary
    const monthsRemaining = monthsUntilPayoff(baseSummary.latestBalance, adjustedRate)
    const payoffDate =
      monthsRemaining === Infinity
        ? baseSummary.asOfDate
        : formatDateISO(
            addMonths(parseDate(baseSummary.asOfDate), monthsRemaining),
          )
    return { ...baseSummary, monthsRemaining, payoffDate, effectiveMonthlyReduction: adjustedRate }
  }, [baseSummary, adjustedRate, extraPerMonth])

  const chartData = useMemo(
    () => buildChartData(data.entries, sliderSummary.effectiveMonthlyReduction),
    [data.entries, sliderSummary.effectiveMonthlyReduction],
  )

  const milestones = useMemo(
    () => computeMilestones(baseSummary.startingBalance, baseSummary.latestBalance),
    [baseSummary],
  )

  const lastUpdated = data.entries[data.entries.length - 1]?.date

  return (
    <div className="min-h-svh bg-gradient-to-b from-slate-100 to-slate-200/80 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8 text-left">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Mortgage countdown
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Path to payoff
          </h1>
          {lastUpdated ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Last snapshot: {formatDateDisplay(lastUpdated)}
            </p>
          ) : null}
        </header>

        <main className="flex flex-col gap-6">
          <Countdown summary={sliderSummary} />
          <StatsBar
            summary={baseSummary}
            currency={data.currency}
            forecastMode={data.forecastMode}
          />
          <BalanceChart
            data={chartData}
            currency={data.currency}
            payoffDate={sliderSummary.payoffDate}
          />
          <ExtraPaymentSlider
            currency={data.currency}
            extraPerMonth={extraPerMonth}
            onChange={setExtraPerMonth}
            adjustedRate={adjustedRate}
            monthsRemaining={
              Number.isFinite(sliderSummary.monthsRemaining)
                ? sliderSummary.monthsRemaining
                : 0
            }
            payoffDate={formatDateDisplay(sliderSummary.payoffDate)}
          />
          <Milestones milestones={milestones} />
          <EntryTable entries={data.entries} currency={data.currency} />
        </main>

        <footer className="mt-10 border-t border-slate-300/50 pt-6 text-left text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          <p>
            Update monthly: edit{' '}
            <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              data/mortgage.json
            </code>{' '}
            in this repo and push. Balances are public in git and on this site.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
