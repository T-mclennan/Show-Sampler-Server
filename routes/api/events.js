const express = require('express');
const axios = require('axios').default;
const router = express.Router();

// @route GET api/events
// @desc: Get all events in time frame
// @access: Public
router.get('/', (req, res) => {
  const { city } = req.query;
  const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
  const currentDate = (new Date()).toISOString().slice(0,-5)+"Z";
  console.log(currentDate)
  axios
    .get(url, {
      params: {
        city: city,
        classificationName: 'music',
        // genreId: 'KnvZfZ7vAvF', electronic
        // genreId: 'KnvZfZ7vAvt', 
        startDateTime: currentDate,
        size: 30,
        apikey: process.env.TICKET_CONSUMER_KEY,
      },
    })
    .then(({ data }) => {
      if (data.page.totalElements < 1) {
        console.log('Search Error: city not found.');
        res.send({
          error: {
            status: 304,
            msg: `Search for ${city} yielded no results. Please try different parameters.`,
          },
        });
      } else {
        const { events } = data._embedded;
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
        console.log('\n*********************\n');
        res.json(event_list);
      }
    })
    .catch((e) => {
      console.error(e);
      res.send({
        error: {
          msg: 'Error found in search. Please try agian.',
          status: e,
        },
      });
    });
});

module.exports = router;
