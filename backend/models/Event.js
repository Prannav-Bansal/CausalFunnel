const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      index: true,
      trim: true
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: '{VALUE} is not a valid event_type'
      }
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    click_x: {
      type: Number,
      default: null
    },
    click_y: {
      type: Number,
      default: null
    },
    viewport_width: {
      type: Number,
      default: null
    },
    viewport_height: {
      type: Number,
      default: null
    },
    element_tag: {
      type: String,
      trim: true,
      default: null
    },
    element_text: {
      type: String,
      trim: true,
      maxlength: [100, 'element_text cannot exceed 100 characters'],
      default: null
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Compound indexes
eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ page_url: 1, event_type: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
