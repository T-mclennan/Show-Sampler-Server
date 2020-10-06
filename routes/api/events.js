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
        try {
          const { events } = data._embedded;

          // console.log(events[0].name);

          console.log('\n******* Attractions: *******\n');
          console.log('Searched for: ', city);
          filter_list = events.filter((e) => {
            return e._embedded.attractions !== undefined;
          });

          event_list = filter_list.map((e, i) => {
            const { name, dates, priceRanges, url, images, _embedded } = e;
            const artists = _embedded.attractions.filter(
              (artist) => artist !== undefined
            );

            console.log(i, ' : ', _embedded.attractions[0].name);

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
                // console.log(name);
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

            return {
              event_name: name,
              dates,
              price_ranges: priceRanges,
              event_url: url,
              event_images: images,
              artist_list,
              artist_data,
            };
          });
          // console.log(event_list);
          console.log('\n*********************\n');
          // res.send(event_list);
          res.json(event_list);
          // res.send('retrieved artists');
        } catch (e) {
          console.log(e);
          res.send(
            `Search for ${city} yielded no results. Please try different parameters.`
          );
        }
      });

    // console.log(data._embedded.events);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
