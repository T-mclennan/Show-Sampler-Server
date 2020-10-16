const express = require('express');
const request = require('request');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const events = require('./routes/api/events');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const redirect_uri =
  process.env.REDIRECT_URI || 'http://localhost:8888/callback';

//Middlewares:
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/events', events);

// Spotify Auth-flow:
// Can possibly use state variable to redirect route"
app.get('/login', (req, res) => {
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

app.get('/callback', (req, res) => {
  const error = req.query.error ? req.query.error : null;
  if (error) {
    console.log('Callback Error: ', error);
    res.status(400);
    res.redirect('http://localhost:3000/search?error=' + error);
  }

  const code = req.query.code || null;
  const authOptions = {
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
  request.post(authOptions, (error, response, body) => {
    const uri = process.env.FRONTEND_URI || 'http://localhost:3000/search';
    res.cookie('refresh_token', body.refresh_token);
    res.redirect(uri + '?access_token=' + body.access_token);
  });
});

app.get('/refresh', (req, res) => {
  const { endpoint } = req.query;
  const refreshToken = req.cookies['refresh_token'];
  console.log('Refresh Token:');
  console.log(refreshToken);

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
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

  request.post(authOptions, (error, response, body) => {
    console.log('refresh callback: ');
    console.log(body);
    const cookie = body.refresh_token;
    if (cookie) {
      res.cookie('refresh_token', body.refresh_token);
    }
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000/search';
    res.redirect(uri + '?access_token=' + body.access_token);
  });
});

const port = process.env.PORT || 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);

app.listen(port);
