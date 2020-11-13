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
        // genreId: 'KnvZfZ7vAvF'
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

          console.log(name)
          const artists = _embedded.attractions.filter(
            (artist) => artist !== undefined 
          );

          // const event_images = images.map((data) => data.url);
          // console.log(images.url[8])

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
                image: images[8].url,
                ticket_link: url,
              };
            }
          );

          return {
            event_name: name,
            dates: [dates],
            price_ranges: priceRanges,
            event_url: url,
            image: images[8].url,
            artist_list,
            artist_data,
          };
        });
        console.log('\n*********************\n');

        //Filter events with duplicate names, add additional date to the original object
        const names_array = []
        const delete_index = []
        event_list.forEach((e, i) => {
          const {event_name, dates} = e
          const curr_index = names_array.findIndex(({name}) => name === event_name);
          if (curr_index < 0) {
            names_array.push({name: event_name, index: i})
          } else {
            const last_index = names_array[curr_index].index
            event_list[last_index].dates.push(dates[0])
            delete_index.push(i)
          }
        })

        //works backwards through delete list, deleting duplicate objects
        delete_index.slice().reverse().forEach(index => event_list.splice(index, 1))
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
