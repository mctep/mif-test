var app = require('app');
var _ = require('lodash');

app.directive('books', books);

function books() {
	var directive = {
		restrict: 'E',
		templateUrl: 'books.html',
		controller: BooksController,
		controllerAs: 'booksCtrl'
	};

	return directive;
}

BooksController.$inject = ['$http'];
function BooksController($http) {
	var view = this;
	var firstLimit = 8;
	var pageLimit = 20;

	view.loading = false;
	view.books = [];

	view.loadMore = loadMore;

	function loadMore() {
		loadBooks(pageLimit);
	}

	loadBooks(firstLimit);

	function loadBooks(limit) {
		var request = {
			method: 'GET',
			url: '/books.json',
			params: {
				limit: limit
			}
		};

		view.loading = true;

		$http(request)
		.then(function(response) {
			_.each(response.data, function(book) {
				book.id = _.uniqueId('book_');
			});

			view.books = view.books.concat(response.data);
		})
		.finally(function() {
			view.loading = false;
		});
	}
}
