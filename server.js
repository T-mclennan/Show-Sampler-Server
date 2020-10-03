const express = require('express');
const request = require('request');
const querystring = require('querystring');
// const bodyParser = require('body-parser');
const events = require('./routes/api/events');

const app = express();

const redirect_uri =
  process.env.REDIRECT_URI || 'http://localhost:8888/callback';

app.use('/api/events', events);

app.get('/login', function (req, res) {
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope:
          'streaming user-read-private user-read-email user-read-playback-state user-modify-playback-state user-library-read user-library-modify',
        redirect_uri,
      })
  );
});

//Ticketmaster event search:

app.get('/callback', function (req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID +
            ':' +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    var access_token = body.access_token;
    console.log(body);
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000/playback';
    res.redirect(uri + '?access_token=' + access_token);
  });
});

const port = process.env.PORT || 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);
app.listen(port);
