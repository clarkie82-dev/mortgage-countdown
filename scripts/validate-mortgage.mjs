import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(root, 'data', 'mortgage.json')

let data
try {
  data = JSON.parse(readFileSync(dataPath, 'utf8'))
} catch (e) {
  console.error('Failed to read or parse data/mortgage.json:', e.message)
  process.exit(1)
}

const errors = []

if (!data.currency || typeof data.currency !== 'string') {
  errors.push('currency must be a non-empty string')
}
if (typeof data.forecastMonthlyReduction !== 'number' || data.forecastMonthlyReduction <= 0) {
  errors.push('forecastMonthlyReduction must be a positive number')
}
if (!['manual', 'auto'].includes(data.forecastMode)) {
  errors.push('forecastMode must be "manual" or "auto"')
}
if (!Array.isArray(data.entries) || data.entries.length === 0) {
  errors.push('entries must be a non-empty array')
} else {
  for (const [i, e] of data.entries.entries()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
      errors.push(`entries[${i}].date must be YYYY-MM-DD`)
    }
    if (typeof e.balance !== 'number' || e.balance < 0) {
      errors.push(`entries[${i}].balance must be a non-negative number`)
    }
  }
}

if (errors.length) {
  console.error('mortgage.json validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

console.log('mortgage.json OK')
