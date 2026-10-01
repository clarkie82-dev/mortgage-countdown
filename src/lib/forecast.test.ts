import { describe, expect, it } from 'vitest'
import {
  buildChartData,
  calendarMonthsBetween,
  computeForecastSummary,
  computeMonthlyReductions,
  effectiveMonthlyReduction,
  monthsUntilPayoff,
  parseDate,
} from './forecast'
import type { MortgageEntry } from './types'

describe('calendarMonthsBetween', () => {
  it('returns ~1 for adjacent months', () => {
    const m = calendarMonthsBetween(parseDate('2026-03-01'), parseDate('2026-04-01'))
    expect(m).toBeCloseTo(1, 1)
  })
})

describe('computeMonthlyReductions', () => {
  it('computes drop per month for monthly entries', () => {
    const entries: MortgageEntry[] = [
      { date: '2026-03-01', balance: 100_000 },
      { date: '2026-04-01', balance: 97_000 },
    ]
    expect(computeMonthlyReductions(entries)).toEqual([3000])
  })
})

describe('effectiveMonthlyReduction', () => {
  const entries: MortgageEntry[] = [
    { date: '2026-01-01', balance: 100_000 },
    { date: '2026-02-01', balance: 97_000 },
    { date: '2026-03-01', balance: 94_000 },
  ]

  it('uses manual rate in manual mode', () => {
    const { rate, source } = effectiveMonthlyReduction(2500, 'manual', entries)
    expect(rate).toBe(2500)
    expect(source).toBe('manual')
  })

  it('uses average in auto mode', () => {
    const { rate, source } = effectiveMonthlyReduction(2500, 'auto', entries)
    expect(rate).toBe(3000)
    expect(source).toBe('auto')
  })
})

describe('monthsUntilPayoff', () => {
  it('ceil balance over rate', () => {
    expect(monthsUntilPayoff(10_001, 1000)).toBe(11)
    expect(monthsUntilPayoff(10_000, 1000)).toBe(10)
  })
})

describe('computeForecastSummary', () => {
  it('projects payoff from latest entry', () => {
    const entries: MortgageEntry[] = [
      { date: '2026-08-01', balance: 462_000 },
    ]
    const summary = computeForecastSummary(entries, 3200, 'manual')
    const expectedMonths = Math.ceil(462_000 / 3200)
    expect(summary.monthsRemaining).toBe(expectedMonths)
    expect(summary.payoffDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('buildChartData', () => {
  it('includes actual and forecast points', () => {
    const entries: MortgageEntry[] = [
      { date: '2026-09-01', balance: 50_000 },
      { date: '2026-10-01', balance: 48_000 },
    ]
    const data = buildChartData(entries, 2000)
    const forecast = data.filter((p) => p.kind === 'forecast')
    expect(data.some((p) => p.kind === 'actual')).toBe(true)
    expect(forecast.length).toBeGreaterThan(1)
    expect(forecast[forecast.length - 1].balance).toBe(0)
  })
})
