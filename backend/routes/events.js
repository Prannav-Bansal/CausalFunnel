const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

/**
 * Helper to sanitize and normalize event object
 */
const formatEventData = (data) => {
  const formatted = {
    session_id: data.session_id,
    event_type: data.event_type,
    page_url: data.page_url,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    click_x: data.click_x !== undefined ? data.click_x : null,
    click_y: data.click_y !== undefined ? data.click_y : null,
    viewport_width: data.viewport_width !== undefined ? data.viewport_width : null,
    viewport_height: data.viewport_height !== undefined ? data.viewport_height : null,
    element_tag: data.element_tag || null,
    element_text: data.element_text ? String(data.element_text).slice(0, 100) : null
  };
  return formatted;
};

/**
 * Validate a single event payload
 */
const validateEvent = (event) => {
  if (!event || typeof event !== 'object') {
    return 'Invalid event data format';
  }
  if (!event.session_id) {
    return 'session_id is required';
  }
  if (!event.event_type || !['page_view', 'click'].includes(event.event_type)) {
    return "event_type is required and must be either 'page_view' or 'click'";
  }
  if (!event.page_url) {
    return 'page_url is required';
  }
  return null;
};

/**
 * POST /api/events
 * Ingest single or batch events
 */
router.post('/events', async (req, res, next) => {
  try {
    const rawEvents = req.body.events && Array.isArray(req.body.events)
      ? req.body.events
      : [req.body];

    if (!rawEvents.length) {
      return res.status(400).json({ error: 'No events provided' });
    }

    const eventsToInsert = [];
    for (let i = 0; i < rawEvents.length; i++) {
      const item = rawEvents[i];
      const errorMsg = validateEvent(item);
      if (errorMsg) {
        return res.status(400).json({ error: `Event at index ${i}: ${errorMsg}` });
      }
      eventsToInsert.push(formatEventData(item));
    }

    if (req.body.events && Array.isArray(req.body.events)) {
      const savedEvents = await Event.insertMany(eventsToInsert);
      return res.status(201).json({
        message: `Successfully created ${savedEvents.length} events`,
        events: savedEvents
      });
    } else {
      const savedEvent = await Event.create(eventsToInsert[0]);
      return res.status(201).json(savedEvent);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions
 * Fetch aggregated session list with event counts, first/last timestamps, and pages visited
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

    const pipeline = [
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          first_event: { $min: '$timestamp' },
          last_event: { $max: '$timestamp' },
          pages_visited: { $addToSet: '$page_url' }
        }
      },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          event_count: 1,
          first_event: 1,
          last_event: 1,
          pages_visited: 1
        }
      },
      {
        $sort: { last_event: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    const sessions = await Event.aggregate(pipeline);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:sessionId/events
 * Fetch all events for a given session sorted by timestamp ascending
 */
router.get('/sessions/:sessionId/events', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const events = await Event.find({ session_id: sessionId })
      .sort({ timestamp: 1 })
      .lean();

    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/heatmap
 * Fetch click data for a specific page_url
 */
router.get('/heatmap', async (req, res, next) => {
  try {
    const { page_url } = req.query;
    const query = { event_type: 'click' };

    if (page_url) {
      query.page_url = page_url;
    }

    const clicks = await Event.find(query)
      .select('click_x click_y viewport_width viewport_height timestamp -_id')
      .lean();

    res.json(clicks);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pages
 * Fetch distinct page URLs
 */
router.get('/pages', async (req, res, next) => {
  try {
    const pages = await Event.distinct('page_url');
    res.json(pages.filter(Boolean));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
