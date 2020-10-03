const express = require('express');
const router = express.Router();

// @route GET api/events
// @desc: Get all events in time frame
// @access: Public
router.get('/', (req, res) => {
  console.log('Events contacted');
});

module.exports = router;
