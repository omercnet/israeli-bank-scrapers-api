var compression = require('compression')
var express = require('express');
var logger = require('morgan');
var scrapers = require('israeli-bank-scrapers');

var app = express();
var SCRAPERS = scrapers.SCRAPERS;

const PORT = parseInt(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(logger('combined'));
app.use(express.json());
app.use(compression())

app.all('/', function(req, res, next) {
  res.json(SCRAPERS);
});

app.all('/:company', function(req, res, next) {
  if (req.params.company in SCRAPERS) {
    SCRAPERS[req.params.company].loginFields.forEach( field => {
    	if (!(field in req.body)) {
    		throw Error(field + ' is missing')
    	}
    })

    const options = {
      companyId: req.params.company,
      startDate: req.body.startDate && new Date(req.body.startDate)
    }

    const scraper = scrapers.createScraper(options)
    scraper.scrape(req.body)
    .then( scrapeResult => {
      if (scrapeResult.success) {
        res.json(scrapeResult);
      } else {
        throw new Error(scrapeResult.errorType);
      }
    }).catch( e => { throw Error(e) })
  } else {
    throw Error('No such company.')
  }
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json(res.locals);
});

server = app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

var signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    server.close(() => {
      process.exit(128 + signals[signal]);
    });
  });
});