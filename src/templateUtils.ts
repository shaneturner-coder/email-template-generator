// {{Variable}} helpers shared by the table, generator panel, and preview.

const VARIABLE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g

/** Unique variable names in order of first appearance, e.g. ["Agent Full Name", "Team Name"]. */
export function extractVariables(body: string): string[] {
  const names: string[] = []
  for (const match of body.matchAll(VARIABLE_PATTERN)) {
    const name = match[1]
    if (!names.includes(name)) names.push(name)
  }
  return names
}

export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'variable'; name: string; value: string; filled: boolean }

/**
 * Split a template body into text and variable segments so the preview can
 * highlight variables that are still blank.
 */
export function renderSegments(body: string, values: Record<string, string>): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  for (const match of body.matchAll(VARIABLE_PATTERN)) {
    const index = match.index ?? 0
    if (index > cursor) segments.push({ kind: 'text', text: body.slice(cursor, index) })
    const name = match[1]
    const value = values[name] ?? ''
    segments.push({ kind: 'variable', name, value, filled: value.trim().length > 0 })
    cursor = index + match[0].length
  }
  if (cursor < body.length) segments.push({ kind: 'text', text: body.slice(cursor) })
  return segments
}

/** Plain-text render for copying to the clipboard. */
export function renderToText(body: string, values: Record<string, string>): string {
  return renderSegments(body, values)
    .map((segment) =>
      segment.kind === 'text' ? segment.text : segment.filled ? segment.value : `{{${segment.name}}}`,
    )
    .join('')
}
