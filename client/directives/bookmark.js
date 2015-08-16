var app = require('app');
var $ = require('jquery');

app.directive('bookmark', bookmark);

bookmark.$inject = [];
function bookmark() {
	var directive = {
		restrict: 'C',
		compile: compile
	};

	return directive;

	function compile($element) {
		$element.html('<svg viewBox="0,0,26,38"><path d="M0,0l0,38l13,-10l13,10l0,-38l-26,0" /></svg>');
		$element.addClass('svg-loaded');
	}
}
