import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSessions } from '../api'

function SessionsList() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await fetchSessions()
      setSessions(data)
    } catch (err) {
      setError(err.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const truncateId = (id) => {
    if (!id) return '—'
    return id.length > 20 ? id.slice(0, 20) + '…' : id
  }

  if (loading) {
    return <div className="loading">Loading sessions…</div>
  }

  if (error) {
    return (
      <div className="error-state">
        <p>⚠️ {error}</p>
        <p style={{ fontSize: 13, marginTop: 8, color: '#9ca0b0' }}>
          Make sure the backend server and MongoDB are running.
        </p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <span className="emoji">📭</span>
        <h3>No Sessions Yet</h3>
        <p>
          Open the demo page (tracker/demo.html) and interact with it to generate tracking events.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Sessions</h1>
        <p>{sessions.length} session{sessions.length !== 1 ? 's' : ''} tracked</p>
      </div>

      <div className="card">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Events</th>
              <th>Pages</th>
              <th>First Event</th>
              <th>Last Event</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.session_id}
                onClick={() => navigate(`/session/${encodeURIComponent(session.session_id)}`)}
              >
                <td className="session-id-cell">{truncateId(session.session_id)}</td>
                <td>
                  <span className="event-count-badge">{session.event_count}</span>
                </td>
                <td>{session.pages_visited?.length || 0}</td>
                <td>{formatDate(session.first_event)}</td>
                <td>{formatDate(session.last_event)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SessionsList
