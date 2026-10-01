/// <reference types="vite/client" />

declare module '../../data/mortgage.json' {
  import type { MortgageData } from './lib/types'
  const value: MortgageData
  export default value
}
