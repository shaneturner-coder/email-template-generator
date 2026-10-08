import { useMemo, useState } from 'react'
import './App.css'
import { SAMPLE_TEMPLATES } from './sampleTemplates'
import { extractVariables, renderSegments, renderToText } from './templateUtils'
import { CATEGORIES, type Category, type Template } from './types'

function App() {
  const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES)

  // Add-template form
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('General')
  const [body, setBody] = useState('')

  // Generator panel
  const [activeId, setActiveId] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const activeTemplate = templates.find((t) => t.id === activeId) ?? null
  const activeVariables = useMemo(
    () => (activeTemplate ? extractVariables(activeTemplate.body) : []),
    [activeTemplate],
  )

  const previewSegments = useMemo(
    () => (activeTemplate ? renderSegments(activeTemplate.body, values) : []),
    [activeTemplate, values],
  )

  const blankCount = activeVariables.filter((name) => !(values[name] ?? '').trim()).length

  function addTemplate(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) return
    setTemplates((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: title.trim(), category, body },
    ])
    setTitle('')
    setCategory('General')
    setBody('')
  }

  function openPanel(template: Template) {
    setActiveId(template.id)
    setValues({})
    setCopied(false)
  }

  function closePanel() {
    setActiveId(null)
    setValues({})
    setCopied(false)
  }

  async function copyOutput() {
    if (!activeTemplate) return
    try {
      await navigator.clipboard.writeText(renderToText(activeTemplate.body, values))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Email Template Generator</h1>
        <p>
          Store reusable email templates with <code>{'{{variables}}'}</code>, then fill them in and
          copy the finished email.
        </p>
      </header>

      <section className="card">
        <h2>Add a template</h2>
        <form onSubmit={addTemplate} className="template-form">
          <label className="field">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Team Release — Texas"
              required
            />
          </label>
          <label className="field">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field field-wide">
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={'Hi {{Agent Full Name}},\n\nThis confirms your release from {{Team Name}}…'}
              required
            />
          </label>
          <div className="form-hint field-wide">
            {body.trim()
              ? `${extractVariables(body).length} variable(s) detected`
              : 'Use {{double braces}} for variables, e.g. {{Agent Full Name}}.'}
          </div>
          <button type="submit" className="btn btn-primary">
            Add template
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Templates ({templates.length})</h2>
        {templates.length === 0 ? (
          <p className="empty-state">No templates yet — add one above.</p>
        ) : (
          <table className="template-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Variables</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className={t.id === activeId ? 'row-active' : ''}>
                  <td>{t.title}</td>
                  <td>
                    <span className="category-tag">{t.category}</span>
                  </td>
                  <td>{extractVariables(t.body).length}</td>
                  <td className="cell-action">
                    <button className="btn" onClick={() => openPanel(t)}>
                      Use
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {activeTemplate && (
        <section className="card generator">
          <div className="generator-header">
            <h2>
              Generate: {activeTemplate.title}
              <span className="category-tag">{activeTemplate.category}</span>
            </h2>
            <button className="btn btn-ghost" onClick={closePanel}>
              Close
            </button>
          </div>
          <div className="generator-grid">
            <div className="generator-inputs">
              <h3>Variables</h3>
              {activeVariables.length === 0 ? (
                <p className="empty-state">This template has no variables.</p>
              ) : (
                activeVariables.map((name) => (
                  <label key={name} className="field">
                    {name}
                    <input
                      value={values[name] ?? ''}
                      onChange={(e) => {
                        setValues((prev) => ({ ...prev, [name]: e.target.value }))
                        setCopied(false)
                      }}
                      placeholder={name}
                    />
                  </label>
                ))
              )}
            </div>
            <div className="generator-preview">
              <h3>
                Preview
                {blankCount > 0 && (
                  <span className="blank-badge">
                    {blankCount} blank
                  </span>
                )}
              </h3>
              <pre className="preview">
                {previewSegments.map((segment, i) =>
                  segment.kind === 'text' ? (
                    <span key={i}>{segment.text}</span>
                  ) : (
                    <span key={i} className={segment.filled ? 'var-filled' : 'var-blank'}>
                      {segment.filled ? segment.value : `⟨${segment.name}⟩`}
                    </span>
                  ),
                )}
              </pre>
              <button
                className="btn btn-primary"
                onClick={copyOutput}
                disabled={activeVariables.length === 0}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
