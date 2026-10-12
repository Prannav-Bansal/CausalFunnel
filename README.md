# CausalFunnel - User Analytics Application

A full-stack application that tracks user interactions on a webpage and displays them in an analytics dashboard. Built as part of the CausalFunnel Full Stack Engineer assessment.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb&logoColor=white)

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────┐
│  Demo Webpage   │────▶│  Backend API     │────▶│  MongoDB  │
│  (tracker.js)   │     │  (Express/Node)  │     │           │
└─────────────────┘     └──────────────────┘     └───────────┘
                              ▲
                              │
                        ┌──────────────────┐
                        │  React Dashboard │
                        │  (Vite)          │
                        └──────────────────┘
```

## 📦 Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| **Tracker** | Vanilla JavaScript (IIFE)         |
| **Backend** | Node.js, Express.js               |
| **Database**| MongoDB, Mongoose ODM             |
| **Dashboard** | React 18, Vite, React Router, Axios |

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** running locally on `mongodb://localhost:27017`
  - Install: https://www.mongodb.com/docs/manual/installation/
  - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:7`

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/CausalFunnel.git
cd CausalFunnel
```

### 2. Start MongoDB

Make sure MongoDB is running on `localhost:27017`. The database `causalfunnel` will be created automatically.

### 3. Setup Backend

```bash
cd backend
npm install
npm run dev    # Starts on http://localhost:5000
```

### 4. Setup Dashboard

```bash
cd dashboard
npm install
npm run dev    # Starts on http://localhost:5173
```

### 5. Open the Demo Page

Open `tracker/demo.html` directly in a browser (or serve it via a local server):

```bash
# Option 1: Open directly
start tracker/demo.html          # Windows
open tracker/demo.html           # macOS

# Option 2: Use a simple HTTP server
npx serve tracker -p 3000
```

Click around the demo page to generate events, then visit the dashboard at `http://localhost:5173`.

---

## 🔧 API Endpoints

| Method | Endpoint                        | Description                                |
|--------|----------------------------------|--------------------------------------------|
| POST   | `/api/events`                   | Ingest single or batch events              |
| GET    | `/api/sessions`                 | List all sessions with event counts        |
| GET    | `/api/sessions/:id/events`      | Get all events for a specific session      |
| GET    | `/api/heatmap?page_url=<url>`   | Get click positions for a page             |
| GET    | `/api/pages`                    | Get distinct tracked page URLs             |
| GET    | `/health`                       | Health check endpoint                      |

### Event Payload

```json
{
  "session_id": "sess_abc123_lx9k2",
  "event_type": "click",
  "page_url": "http://localhost:3000/demo.html",
  "timestamp": "2026-10-12T10:30:00.000Z",
  "click_x": 450,
  "click_y": 320,
  "viewport_width": 1920,
  "viewport_height": 1080,
  "element_tag": "BUTTON",
  "element_text": "Add to Cart"
}
```

### Batch Ingestion

```json
{
  "events": [
    { "session_id": "...", "event_type": "page_view", "page_url": "...", "timestamp": "..." },
    { "session_id": "...", "event_type": "click", "page_url": "...", "timestamp": "...", "click_x": 100, "click_y": 200 }
  ]
}
```

---

## 📊 Dashboard Features

### Sessions View
- Lists all tracked sessions in a table
- Shows event count, pages visited, first/last event timestamps
- Click any session to drill into the user journey

### Session Detail (User Journey)
- Vertical timeline of all events in chronological order
- Visual distinction between page views (green) and clicks (orange)
- Shows click coordinates, element tag, and element text for click events

### Heatmap View
- Dropdown to select any tracked page URL
- Visual representation of click positions as heat dots
- Normalized coordinates to handle different viewport sizes
- Semi-transparent dots that create a heat effect when overlapping

---

## 🧩 Tracker Script (`tracker.js`)

Drop-in tracking script that can be added to any webpage:

```html
<script src="path/to/tracker.js"></script>
```

**Features:**
- Auto-generates `session_id` stored in `localStorage`
- 30-minute session expiry on inactivity
- Automatically tracks `page_view` on load
- Captures all `click` events with coordinates and element info
- Event batching (batch size: 5) with periodic flush (every 5s)
- Flushes on page unload via `beforeunload` event
- Re-queues failed events for retry
- Debug access via `window.__CausalFunnel`

---

## ⚖️ Assumptions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **localStorage for session ID** | Simpler than cookies; works across same-origin pages. No cross-domain tracking needed for this demo. |
| **30-minute session expiry** | Industry standard for session timeout. After inactivity, a new session ID is generated. |
| **Client-side batching** | Reduces network requests. Events are batched (5 events or 5-second intervals) before sending. |
| **No authentication on API** | Out of scope for this assessment. In production, API keys or JWT tokens would secure endpoints. |
| **CORS open to all origins** | For development convenience. Production would restrict to specific domains. |
| **Simple dot-based heatmap** | A production heatmap would use canvas rendering with Gaussian blur for smoother visualization. CSS dots with `mix-blend-mode` provide a good approximation. |
| **Viewport normalization** | Click coordinates are normalized by viewport dimensions to handle different screen sizes. |
| **MongoDB** | Well-suited for event data — flexible schema, good aggregation pipeline, and handles time-series data efficiently. |
| **No scroll tracking** | Only viewport-relative click positions are tracked. Scroll position tracking would require additional complexity. |

---

## 📁 Project Structure

```
CausalFunnel/
├── backend/                    # Express.js API server
│   ├── models/
│   │   └── Event.js           # Mongoose event schema
│   ├── routes/
│   │   └── events.js          # API route handlers
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point
│
├── dashboard/                  # React analytics dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── SessionsList.jsx
│   │   │   ├── SessionDetail.jsx
│   │   │   └── HeatmapView.jsx
│   │   ├── api.js             # API client
│   │   ├── App.jsx            # Main app with routing
│   │   ├── App.css            # Styles
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── tracker/                    # Client-side tracking
│   ├── tracker.js             # Tracking script (IIFE)
│   └── demo.html              # Demo e-commerce page
│
└── README.md
```

---

## 🧪 Quick Test

1. Start MongoDB, backend, and dashboard (see Setup above)
2. Open `tracker/demo.html` in your browser
3. Click on various products, buttons, and links
4. Open the dashboard at `http://localhost:5173`
5. You should see your session in the Sessions view
6. Click the session to see your journey timeline
7. Switch to Heatmap view to see click positions

---

## 📝 License

MIT
