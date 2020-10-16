const express = require('express');
const axios = require('axios').default;
const router = express.Router();

// @route GET api/events
// @desc: Get all events in time frame
// @access: Public
router.get('/', (req, res) => {
  const { city } = req.query;
  const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
  // try {
  axios
    .get(url, {
      params: {
        city: city,
        classificationName: 'music',
        // genreId: 'KnvZfZ7vAvF',
        genreId: 'KnvZfZ7vAvt',
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

          const event_images = images.map((data) => data.url);
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
              return {
                name: name,
                genre: classifications[0].genre.name,
                classication: classifications[0],
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
            images: event_images,
            artist_list,
            artist_data,
          };
        });
        // console.log(event_list);
        console.log('\n*********************\n');
        res.json(event_list);
      } catch (e) {
        console.log(e);
        res.send(
          `Search for ${city} yielded no results. Please try different parameters.`
        );
      }
    })
    .catch((e) => {
      console.error(e);
      res.send('error: ' + e);
    });

  // console.log(data._embedded.events);
  // } catch (error) {
  //   console.log(error);
  // }
});

module.exports = router;
