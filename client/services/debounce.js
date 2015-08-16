require('app').factory('debounce', debounce);

debounce.$inject = ['$timeout', '$q'];
function debounce($timeout, $q) {
	return function(func, wait, immediate) {
		var timeout = null;
		var defered = $q.defer();

		return function() {
			var args = arguments;
			var later = (function(_this) {
				return function() {
					timeout = null;

					if (!immediate) {
						defered.resolve(func.apply(_this, args));
						defered = $q.defer();
						return defered;
					}
				};
			})(this);

			var callNow = immediate && !timeout;

			if (timeout) {
				$timeout.cancel(timeout);
			}

			timeout = $timeout(later, wait);
			if (callNow) {
				defered.resolve(func.apply(this, args));
				defered = $q.defer();
			}

			return defered.promise;
		};
	};
}
