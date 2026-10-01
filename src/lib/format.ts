export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

export function formatMonthsRemaining(months: number): string {
  if (months === 0) return 'Paid off'
  if (months === 1) return '1 month'
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${months} months`
  if (rem === 0) return years === 1 ? '1 year' : `${years} years`
  return `${years}y ${rem}m`
}
