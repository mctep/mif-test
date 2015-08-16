var www = module.exports = require('express').Router();
var config = require('config');
var _ = require('lodash');

var books = require('server/books.json');

www.get('/', function(req, res, next) {
	res.render('index', {
		LIVERELOAD_PORT: config.LIVERELOAD_PORT
	});
});

www.get('/books.json', function(req, res, next) {
	var limit = parseInt(req.query.limit, 10) || 10;

	if (limit == 8) {
		res.send(_.slice(books, 0, 8));
	} else {
		res.send(shuffleBooks(limit));
	}

});

function shuffleBooks(limit) {
	var result = [];

	while (limit) {
		limit--;
		result.push(_.sample(books));
	}

	return result;
}
