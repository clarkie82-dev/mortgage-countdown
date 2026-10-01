export type ForecastMode = 'manual' | 'auto'

export interface MortgageEntry {
  date: string
  balance: number
}

export interface MortgageData {
  currency: string
  forecastMonthlyReduction: number
  forecastMode: ForecastMode
  entries: MortgageEntry[]
}

export interface ChartPoint {
  date: string
  balance: number
  kind: 'actual' | 'forecast'
}

export interface ForecastSummary {
  effectiveMonthlyReduction: number
  rateSource: 'manual' | 'auto' | 'manual-fallback'
  monthsRemaining: number
  payoffDate: string
  asOfDate: string
  latestBalance: number
  startingBalance: number
  progressPercent: number
  actualMonthlyReductions: number[]
  reductionStdDev: number | null
}
