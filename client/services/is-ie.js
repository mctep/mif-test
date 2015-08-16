var $ = require('jquery');
require('app').factory('isIE', isIE);

function isIE () {
	var myNav = navigator.userAgent.toLowerCase();
	var res = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;

	if (res) {
		$('body')
			.addClass('ie')
			.addClass('ie' + res);
	}

	return function() {
		return res;
	};
}
