import type { Milestone } from '../lib/forecast'

interface MilestonesProps {
  milestones: Milestone[]
}

export function Milestones({ milestones }: MilestonesProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-left text-lg font-semibold text-slate-900 dark:text-slate-100">
        Milestones
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {milestones.map((m) => (
          <li
            key={m.id}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              m.reached
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {m.reached ? '✓ ' : ''}
            {m.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
