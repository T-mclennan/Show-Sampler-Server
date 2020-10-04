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
        console.log('\n****    Attractions:    ****\n');
        event_list = events.map((e, i) => {
          const { name, dates, priceRanges, url, images, _embedded } = e;
          // console.log(i, ' : ', _embedded.attractions[0].name);]
          const artists = _embedded.attractions.filter(
            (artist) => artist != null
          );

          const artist_list = artists.map(({ name }) => name);
          const artist_data = artists.map(
            ({
              name,
              classifications,
              externalLinks,
              images,
              url,
              upcomingEvents,
            }) => {
              return {
                name: name,
                genre: classifications[0].genre.name,
                subGenre: classifications[0].subGenre.name,
                links: externalLinks,
                images: images,
                ticket_link: url,
              };
            }
          );

          console.log(artist_data);
          return {
            name,
            dates,
            priceRanges,
            url,
            images,
            artists: artist_list,
          };
        });
        // console.log(event_list[0]);
        // console.log(event_list);
        res.send('fetching');
        // res.json(event_list);
      });

    // console.log(data._embedded.events);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
