import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSessionEvents } from '../api'

function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [sessionId])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await fetchSessionEvents(decodeURIComponent(sessionId))
      setEvents(data)
    } catch (err) {
      setError(err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const pageViewCount = events.filter(e => e.event_type === 'page_view').length
  const clickCount = events.filter(e => e.event_type === 'click').length

  if (loading) {
    return <div className="loading">Loading session events…</div>
  }

  if (error) {
    return <div className="error-state"><p>⚠️ {error}</p></div>
  }

  return (
    <div>
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Sessions
      </button>

      <div className="page-header">
        <h1>Session Journey</h1>
        <p style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {decodeURIComponent(sessionId)}
        </p>
      </div>

      <div className="session-meta">
        <div className="meta-item">
          <div className="label">Total Events</div>
          <div className="value">{events.length}</div>
        </div>
        <div className="meta-item">
          <div className="label">Page Views</div>
          <div className="value">{pageViewCount}</div>
        </div>
        <div className="meta-item">
          <div className="label">Clicks</div>
          <div className="value">{clickCount}</div>
        </div>
        {events.length > 0 && (
          <div className="meta-item">
            <div className="label">Date</div>
            <div className="value" style={{ fontSize: 16 }}>
              {formatDate(events[0].timestamp)}
            </div>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🔍</span>
          <h3>No Events Found</h3>
          <p>This session has no recorded events.</p>
        </div>
      ) : (
        <div className="timeline">
          {events.map((event, index) => (
            <div key={event._id || index} className={`timeline-event ${event.event_type}`}>
              <div className="event-header">
                <span className={`event-type-badge ${event.event_type}`}>
                  {event.event_type === 'page_view' ? '🔍' : '🖱️'}
                  {event.event_type === 'page_view' ? ' Page View' : ' Click'}
                </span>
                <span className="event-time">{formatTime(event.timestamp)}</span>
              </div>
              <div className="event-url">{event.page_url}</div>
              {event.event_type === 'click' && (
                <div className="event-details">
                  <span>📍 ({event.click_x}, {event.click_y})</span>
                  {event.element_tag && (
                    <span>🏷️ &lt;{event.element_tag.toLowerCase()}&gt;</span>
                  )}
                  {event.element_text && (
                    <span>📝 "{event.element_text}"</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SessionDetail
