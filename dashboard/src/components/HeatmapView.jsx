import { useState, useEffect, useRef } from 'react'
import { fetchPages, fetchHeatmapData } from '../api'

function HeatmapView() {
  const [pages, setPages] = useState([])
  const [selectedPage, setSelectedPage] = useState('')
  const [clicks, setClicks] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagesLoading, setPagesLoading] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (selectedPage) {
      loadHeatmapData(selectedPage)
    }
  }, [selectedPage])

  const loadPages = async () => {
    try {
      setPagesLoading(true)
      const data = await fetchPages()
      setPages(data)
      if (data.length > 0) {
        setSelectedPage(data[0])
      }
    } catch (err) {
      console.error('Failed to load pages:', err)
    } finally {
      setPagesLoading(false)
    }
  }

  const loadHeatmapData = async (pageUrl) => {
    try {
      setLoading(true)
      const data = await fetchHeatmapData(pageUrl)
      setClicks(data)
    } catch (err) {
      console.error('Failed to load heatmap data:', err)
      setClicks([])
    } finally {
      setLoading(false)
    }
  }

  const getNormalizedPosition = (click) => {
    const vw = click.viewport_width || 1920
    const vh = click.viewport_height || 1080
    return {
      x: (click.click_x / vw) * 100,
      y: (click.click_y / vh) * 100,
    }
  }

  if (pagesLoading) {
    return <div className="loading">Loading pages…</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1>Click Heatmap</h1>
        <p>Visualize where users click on your pages</p>
      </div>

      <div className="heatmap-controls">
        <div className="select-wrapper">
          <select
            className="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            {pages.length === 0 && <option value="">No pages tracked yet</option>}
            {pages.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
        {selectedPage && !loading && (
          <div className="click-count">
            <strong>{clicks.length}</strong> click{clicks.length !== 1 ? 's' : ''} recorded
          </div>
        )}
      </div>

      {!selectedPage ? (
        <div className="empty-state">
          <span className="emoji">🗺️</span>
          <h3>No Pages Available</h3>
          <p>
            Open the demo page and click around to generate tracking data.
          </p>
        </div>
      ) : loading ? (
        <div className="loading">Loading heatmap data…</div>
      ) : (
        <>
          <div className="heatmap-container" ref={containerRef}>
            <div className="heatmap-grid" />
            {clicks.map((click, index) => {
              const pos = getNormalizedPosition(click)
              return (
                <div
                  key={index}
                  className="heatmap-dot"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                />
              )
            })}
            {clicks.length === 0 && (
              <div className="empty-state" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="emoji">🖱️</span>
                <h3>No Clicks on This Page</h3>
                <p>Click around on the demo page to see data here.</p>
              </div>
            )}
          </div>

          <div className="heatmap-legend">
            <span>Less clicks</span>
            <div className="legend-gradient" />
            <span>More clicks</span>
          </div>
        </>
      )}
    </div>
  )
}

export default HeatmapView
