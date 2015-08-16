var server = module.exports = require('express')();
var bodyParser = require('body-parser');
var swig = require('swig');
var config = require('config');
var path = require('path');
var VIEWS_PATH = path.join(__dirname, 'views');
var STATIC_PATH = path.resolve(__dirname, '..', 'client', 'public');

// enable cache for development
if (config.ENVIRONMENT == 'development') {
	server.set('view cache', false);
	swig.setDefaults({ cache: false });
}

server.set('view engine', 'swig.html');
server.engine('swig.html', swig.renderFile);
server.set('views', VIEWS_PATH);

server.disable('x-powered-by');

server.use(bodyParser.urlencoded({ extended: true }));

server.use(require('routes'));
console.log(STATIC_PATH);
server.use(require('express').static(STATIC_PATH));
