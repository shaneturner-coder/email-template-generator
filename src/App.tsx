import { useEffect, useMemo, useRef, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import './App.css'
import LoginScreen from './LoginScreen'
import { envError, supabase } from './supabaseClient'
import { SAMPLE_TEMPLATES } from './sampleTemplates'
import { extractVariables, renderSegments, renderToText } from './templateUtils'
import { CATEGORIES, type Category, type Template } from './types'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (envError) return <ConfigErrorScreen message={envError} />
  if (loading) return null
  if (!session) return <LoginScreen />

  return (
    <>
      <header className="app-bar">
        <span className="app-bar-title">Email Template Generator</span>
        <span className="app-bar-email">{session.user.email ?? 'Signed in'}</span>
        <button className="btn btn-ghost" onClick={() => supabase?.auth.signOut()}>
          Sign out
        </button>
      </header>
      {supabase && <TemplateApp client={supabase} />}
    </>
  )
}

function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="login-screen">
      <div className="card login-card">
        <h1>Configuration error</h1>
        <p className="login-error">{message}</p>
      </div>
    </div>
  )
}

type TemplateRow = {
  id: string
  title: string
  category: string
  body: string
  created_at: string
}

function rowToTemplate(row: TemplateRow): Template {
  return { id: row.id, title: row.title, category: row.category as Category, body: row.body }
}

function TemplateApp({ client }: { client: SupabaseClient }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Guards the check-then-insert seed window against concurrent runs
  // (StrictMode double-invokes the load effect in dev).
  const seedStartedRef = useRef(false)

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

  async function fetchTemplates() {
    const { data, error: selectError } = await client
      .from('templates')
      .select('id, title, category, body, created_at')
      .order('created_at', { ascending: true })
    if (selectError) throw new Error(selectError.message)
    return (data ?? []) as TemplateRow[]
  }

  async function loadTemplates() {
    setLoading(true)
    setError(null)
    try {
      let rows = await fetchTemplates()
      // First sign-in: seed the fake sample templates for this user (ids from the DB).
      if (rows.length === 0 && !seedStartedRef.current) {
        seedStartedRef.current = true
        const { error: seedError } = await client.from('templates').insert(SAMPLE_TEMPLATES)
        if (seedError) {
          seedStartedRef.current = false // allow a retry on the next load
          throw new Error(seedError.message)
        }
        rows = await fetchTemplates()
      }
      setTemplates(rows.map(rowToTemplate))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function addTemplate(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) return
    setError(null)
    const { error: insertError } = await client
      .from('templates')
      .insert({ title: title.trim(), category, body })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setTitle('')
    setCategory('General')
    setBody('')
    await loadTemplates()
  }

  async function deleteTemplate(id: string) {
    setError(null)
    const { error: deleteError } = await client.from('templates').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    if (id === activeId) closePanel()
    await loadTemplates()
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

      {error && <p className="error-banner">{error}</p>}

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
        {loading ? (
          <p className="empty-state">Loading templates…</p>
        ) : templates.length === 0 ? (
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
                    </button>{' '}
                    <button className="btn btn-danger" onClick={() => deleteTemplate(t.id)}>
                      Delete
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
