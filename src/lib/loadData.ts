import raw from '../../data/mortgage.json'
import { sortEntries } from './forecast'
import type { MortgageData } from './types'

export function loadMortgageData(): MortgageData {
  const data = raw as MortgageData
  if (!data.entries?.length) {
    throw new Error('mortgage.json must contain at least one entry')
  }
  if (data.forecastMonthlyReduction <= 0) {
    throw new Error('forecastMonthlyReduction must be positive')
  }
  return {
    ...data,
    entries: sortEntries(data.entries),
  }
}
