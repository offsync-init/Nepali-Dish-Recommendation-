import { useMemo, useState } from 'react'
import { ChefHat, Flame, Search, Soup, Trash2 } from 'lucide-react'
import './App.css'

function inferTags(text) {
  const t = (text ?? '').toLowerCase()
  const tags = []
  const has = (re) => re.test(t)

  if (has(/\b(veg|vegetarian|paneer|soy|tofu|mushroom|saag|spinach|dal|lentil)\b/)) tags.push('Veg')
  if (has(/\b(buff|buffalo|goat|mutton|lamb|chicken|pork|fish|egg)\b/)) tags.push('Non‑veg')
  if (has(/\b(spicy|chilli|chili|hot|fire|pepper|sekuwa|tandoori|choila)\b/)) tags.push('Spicy')
  if (has(/\b(soup|thukpa|jhol|broth)\b/)) tags.push('Soupy')
  if (has(/\b(fried|crisp|crispy|sekuwa|roasted|grilled)\b/)) tags.push('Crispy')
  if (has(/\b(sweet|dessert|kheer|laddu|ladoo|halwa)\b/)) tags.push('Sweet')

  return [...new Set(tags)].slice(0, 3)
}

function App() {
  const [userQuery, setUserQuery] = useState('')
  const [topN, setTopN] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const canSubmit = useMemo(() => userQuery.trim().length > 0 && !loading, [userQuery, loading])
  const apiBase = useMemo(() => {
    const raw = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
    return raw.endsWith('/') ? raw.slice(0, -1) : raw
  }, [])
  const suggestions = useMemo(
    () => ['momo', 'spicy', 'fried snack', 'sour soup', 'chicken', 'vegetarian', 'buff sekuwa', 'dal bhat'],
    [],
  )

  async function onSubmit(e) {
    e.preventDefault()
    const q = userQuery.trim()
    if (!q) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`${apiBase}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_query: q, top_n: topN }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed (${res.status})`)
      }

      const json = await res.json()
      setResult(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <div className="brandMark" aria-hidden="true">
              <ChefHat size={22} />
            </div>
            <div className="titleWrap">
              <h1 className="title">K Khau</h1>
              <p className="subtitle">Describe your mood — get a Nepali menu shortlist</p>
            </div>
          </div>

          <div className="pill" title="API: POST /recommend via Vite proxy">
            <Soup size={18} />
            <span className="muted">API</span>
            <strong className="muted">/recommend</strong>
          </div>
        </header>

        <section className="hero">
          <div className="heroCard">
            <div className="heroText">
              <div className="kicker">Today’s craving assistant</div>
              <div className="heroTitle">
                What should we eat
                <span className="heroAccent"> today</span>?
              </div>
              <div className="heroDesc">
                Type a vibe like <em>spicy</em>, <em>fried snack</em>, <em>sour soup</em> or a dish name. We’ll return a
                short menu you can pick from.
              </div>
            </div>

            <div className="heroPanel">
              <form className="searchCard" onSubmit={onSubmit}>
                <div className="fieldGrid">
                  <label className="label">
                    <span className="labelText">Search</span>
                    <input
                      className="input"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="e.g. momo, spicy chicken, achar, sour soup…"
                    />
                  </label>

                  <label className="label">
                    <span className="labelText">Top</span>
                    <select className="select" value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
                      {[3, 5, 7, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="chipRow" aria-label="Suggestions">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chip"
                      onClick={() => setUserQuery(s)}
                      disabled={loading}
                      title={`Use “${s}”`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="actions">
                  <button className="primaryBtn" type="submit" disabled={!canSubmit}>
                    <span className="btnInner">
                      <Search size={18} />
                      {loading ? 'Cooking up picks…' : 'Get menu'}
                    </span>
                  </button>
                  <button
                    className="ghostBtn"
                    type="button"
                    onClick={() => {
                      setUserQuery('')
                      setTopN(5)
                      setError('')
                      setResult(null)
                    }}
                    disabled={loading}
                    title="Reset"
                  >
                    <span className="btnInner">
                      <Trash2 size={18} />
                      Clear
                    </span>
                  </button>
                </div>

                {error ? <div className="message error">{error}</div> : null}
              </form>
            </div>
          </div>
        </section>

        {result?.recommendations?.length ? (
          <section className="card">
            <div className="resultsHeader">
              <h2>
                Results for <span style={{ color: 'rgba(154, 52, 18, 0.95)' }}>“{result.query}”</span>
              </h2>
              <div className="badge" title="Model output list">
                <Flame size={16} />
                {result.recommendations.length} picks
              </div>
            </div>

            <div className="grid">
              {result.recommendations.map((r, idx) => (
                <article key={`${r['Item Name'] ?? 'item'}-${idx}`} className="dishCard">
                  <div className="dishTop">
                    <div className="dishName">{r['Item Name']}</div>
                    <div className="rankPill" aria-label={`Rank ${idx + 1}`}>
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="dishDesc">{r.Description}</div>
                  <div className="tagRow" aria-label="Tags">
                    {inferTags(`${r['Item Name'] ?? ''} ${r.Description ?? ''}`).map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : result ? (
          <p className="read-the-docs">No recommendations returned.</p>
        ) : (
          <div className="emptyState">
            <div className="emptyTitle">Ready when you are.</div>
            <div className="emptyDesc">
              Start the backend at <code>http://localhost:8000</code>. This UI calls <code>/recommend</code> via the Vite
              proxy.
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
