import type {
  ChartPoint,
  ForecastMode,
  ForecastSummary,
  MortgageEntry,
} from './types'

const MS_PER_DAY = 86_400_000

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole calendar months between dates (fractional when day-of-month differs). */
export function calendarMonthsBetween(start: Date, end: Date): number {
  if (end < start) return 0
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  const dayFraction = (end.getDate() - start.getDate()) / 30
  return Math.max(months + dayFraction, 1 / 30)
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  result.setMonth(result.getMonth() + months)
  return result
}

export function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
}

export function sortEntries(entries: MortgageEntry[]): MortgageEntry[] {
  return [...entries].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  )
}

/** Per-entry monthly reduction normalized by calendar months between snapshots. */
export function computeMonthlyReductions(
  entries: MortgageEntry[],
): number[] {
  const sorted = sortEntries(entries)
  const reductions: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    const months = calendarMonthsBetween(
      parseDate(prev.date),
      parseDate(curr.date),
    )
    const drop = prev.balance - curr.balance
    reductions.push(drop / months)
  }
  return reductions
}

export function rollingAverageLast12(reductions: number[]): number | null {
  if (reductions.length === 0) return null
  const slice = reductions.slice(-12)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

export function stdDev(values: number[]): number | null {
  if (values.length < 2) return null
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function effectiveMonthlyReduction(
  forecastMonthlyReduction: number,
  forecastMode: ForecastMode,
  entries: MortgageEntry[],
): { rate: number; source: ForecastSummary['rateSource'] } {
  const reductions = computeMonthlyReductions(entries)
  const autoAvg = rollingAverageLast12(reductions)

  if (forecastMode === 'auto' && autoAvg !== null && reductions.length >= 1) {
    return { rate: autoAvg, source: 'auto' }
  }
  if (forecastMode === 'auto' && reductions.length < 1) {
    return { rate: forecastMonthlyReduction, source: 'manual-fallback' }
  }
  return { rate: forecastMonthlyReduction, source: 'manual' }
}

export function monthsUntilPayoff(balance: number, monthlyReduction: number): number {
  if (balance <= 0) return 0
  if (monthlyReduction <= 0) return Infinity
  return Math.ceil(balance / monthlyReduction)
}

export function buildForecastSeries(
  latestEntry: MortgageEntry,
  monthlyReduction: number,
): ChartPoint[] {
  const points: ChartPoint[] = []
  let balance = latestEntry.balance
  let date = parseDate(latestEntry.date)
  const maxMonths = monthsUntilPayoff(balance, monthlyReduction)
  if (!Number.isFinite(maxMonths)) return points

  for (let i = 0; i <= maxMonths; i++) {
    points.push({
      date: formatDateISO(date),
      balance: Math.max(0, Math.round(balance)),
      kind: 'forecast',
    })
    if (balance <= 0) break
    balance -= monthlyReduction
    date = addMonths(date, 1)
  }
  return points
}

export function buildActualSeries(entries: MortgageEntry[]): ChartPoint[] {
  return sortEntries(entries).map((e) => ({
    date: e.date,
    balance: e.balance,
    kind: 'actual' as const,
  }))
}

export function buildChartData(
  entries: MortgageEntry[],
  monthlyReduction: number,
): ChartPoint[] {
  const sorted = sortEntries(entries)
  if (sorted.length === 0) return []
  const latest = sorted[sorted.length - 1]
  const actual = buildActualSeries(sorted)
  const forecast = buildForecastSeries(latest, monthlyReduction)
  // Skip duplicate first forecast point (same date as latest actual)
  return [...actual, ...forecast.slice(1)]
}

export function computeForecastSummary(
  entries: MortgageEntry[],
  forecastMonthlyReduction: number,
  forecastMode: ForecastMode,
): ForecastSummary {
  const sorted = sortEntries(entries)
  const latest = sorted[sorted.length - 1]
  const starting = sorted[0]
  const { rate, source } = effectiveMonthlyReduction(
    forecastMonthlyReduction,
    forecastMode,
    sorted,
  )
  const reductions = computeMonthlyReductions(sorted)
  const monthsRemaining = monthsUntilPayoff(latest.balance, rate)
  const payoffDate =
    monthsRemaining === Infinity
      ? latest.date
      : formatDateISO(addMonths(parseDate(latest.date), monthsRemaining))

  const paidDown = starting.balance - latest.balance
  const totalToPay = starting.balance
  const progressPercent =
    totalToPay > 0 ? Math.min(100, Math.max(0, (paidDown / totalToPay) * 100)) : 0

  return {
    effectiveMonthlyReduction: rate,
    rateSource: source,
    monthsRemaining: Number.isFinite(monthsRemaining) ? monthsRemaining : 0,
    payoffDate,
    asOfDate: latest.date,
    latestBalance: latest.balance,
    startingBalance: starting.balance,
    progressPercent,
    actualMonthlyReductions: reductions,
    reductionStdDev: stdDev(reductions.slice(-12)),
  }
}

export function applyExtraPayment(
  baseMonthlyReduction: number,
  extraPerMonth: number,
): number {
  return baseMonthlyReduction + extraPerMonth
}

export interface Milestone {
  id: string
  label: string
  reached: boolean
  targetBalance: number
}

export function computeMilestones(
  startingBalance: number,
  latestBalance: number,
): Milestone[] {
  const defs = [
    { id: '75', label: '75% paid down', fraction: 0.25 },
    { id: '50', label: '50% paid down', fraction: 0.5 },
    { id: '25', label: '25% remaining', fraction: 0.25 },
    { id: '100k', label: 'Under $100k', fraction: null as number | null },
  ]

  return defs.map((d) => {
    const targetBalance =
      d.fraction !== null ? startingBalance * d.fraction : 100_000
    return {
      id: d.id,
      label: d.label,
      targetBalance,
      reached: latestBalance <= targetBalance,
    }
  })
}
