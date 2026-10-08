export const CATEGORIES = [
  'Team Release',
  'Compensation Split Release',
  'Agent Removal',
  'General',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Template {
  id: string
  title: string
  category: Category
  body: string
}
