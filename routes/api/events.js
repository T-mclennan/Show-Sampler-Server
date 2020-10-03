const express = require('express');
const axios = require('axios').default;
const router = express.Router();

// @route GET api/events
// @desc: Get all events in time frame
// @access: Public
router.get('/', (req, res) => {
  const { city } = req.body;
  const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
  try {
    axios
      .get(url, {
        params: {
          city: city,
          classificationName: 'music',
          genreId: 'KnvZfZ7vAvF',
          size: 200,
          apikey: process.env.TICKET_CONSUMER_KEY,
        },
      })
      .then(({ data }) => {
        const { events } = data._embedded;
        event_list = events.map((e) => {
          return {
            name: e.name,
            dates: e.dates,
            price_ranges: e.priceRanges,
            event_url: e.url,
            images: e.images,
            artists: '',
          };
        });
        // console.log(events[0].name);
        console.log(event_list);
        res.send('fetching');
        // res.json(event_list);
      });

    // console.log(data._embedded.events);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
