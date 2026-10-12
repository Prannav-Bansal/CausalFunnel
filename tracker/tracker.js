(function() {
  'use strict';

  const CONFIG = {
    endpoint: 'http://localhost:5000/api/events',
    batchSize: 5,
    flushInterval: 5000, // ms
  };

  // Generate or retrieve session ID from localStorage
  function getSessionId() {
    let sessionId = localStorage.getItem('cf_session_id');
    const sessionExpiry = localStorage.getItem('cf_session_expiry');
    const now = Date.now();
    
    // Session expires after 30 minutes of inactivity
    if (!sessionId || !sessionExpiry || now > parseInt(sessionExpiry)) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('cf_session_id', sessionId);
    }
    
    // Reset expiry on each interaction
    localStorage.setItem('cf_session_expiry', (now + 30 * 60 * 1000).toString());
    return sessionId;
  }

  let eventQueue = [];

  function createBaseEvent(eventType) {
    return {
      session_id: getSessionId(),
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };
  }

  function trackPageView() {
    const event = createBaseEvent('page_view');
    queueEvent(event);
  }

  function trackClick(e) {
    const event = createBaseEvent('click');
    event.click_x = e.clientX;
    event.click_y = e.clientY;
    event.element_tag = e.target.tagName;
    event.element_text = (e.target.textContent || '').trim().substring(0, 100);
    queueEvent(event);
  }

  function queueEvent(event) {
    eventQueue.push(event);
    if (eventQueue.length >= CONFIG.batchSize) {
      flush();
    }
  }

  function flush() {
    if (eventQueue.length === 0) return;
    const events = eventQueue.splice(0);
    
    fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    }).catch(err => {
      console.warn('[CausalFunnel] Failed to send events:', err.message);
      // Re-queue failed events
      eventQueue.unshift(...events);
    });
  }

  // Auto-track page view
  trackPageView();

  // Track all clicks
  document.addEventListener('click', trackClick, true);

  // Periodic flush
  setInterval(flush, CONFIG.flushInterval);

  // Flush on page unload
  window.addEventListener('beforeunload', flush);

  // Expose for debugging
  window.__CausalFunnel = { flush, getSessionId };

  console.log('[CausalFunnel] Tracker initialized | Session:', getSessionId());
})();
