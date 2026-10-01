import type { MortgageEntry } from '../lib/types'
import { formatDateDisplay, formatMoney } from '../lib/format'

interface EntryTableProps {
  entries: MortgageEntry[]
  currency: string
}

export function EntryTable({ entries, currency }: EntryTableProps) {
  const rows = [...entries].reverse()

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-left text-lg font-semibold text-slate-900 dark:text-slate-100">
        Snapshots
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr
                key={e.date}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-2 pr-4 tabular-nums">{formatDateDisplay(e.date)}</td>
                <td className="py-2 font-medium tabular-nums">
                  {formatMoney(e.balance, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
