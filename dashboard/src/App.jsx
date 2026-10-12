import { Routes, Route, NavLink } from 'react-router-dom'
import SessionsList from './components/SessionsList'
import SessionDetail from './components/SessionDetail'
import HeatmapView from './components/HeatmapView'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">◉</span>
          <span className="nav-title">CausalFunnel Analytics</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Sessions
          </NavLink>
          <NavLink to="/heatmap" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Heatmap
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<SessionsList />} />
          <Route path="/session/:sessionId" element={<SessionDetail />} />
          <Route path="/heatmap" element={<HeatmapView />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
