var app = require('app');
var $ = require('jquery');

app.directive('loadSrc', loadSrc);

loadSrc.$inject = ['$window', '$rootScope', 'debounce'];
function loadSrc($window, $rootScope, debounce) {
	var directive = {
		restriction: 'A',
		scope: { src: '@loadSrc' },
		link: link
	};

	var bottomX;

	function calc() {
		var old = bottomX;
		bottomX = $window.scrollY + $window.innerHeight;
		if (old != bottomX) {
			$rootScope.$broadcast('bottomX.changed', bottomX);
		}
	}

	calc();
	$($window)
		.on('scroll', calc)
		.on('resize', debounce(function() {
			$rootScope.$broadcast('window.resize');
		}, 400));


	return directive;

	function link($scope, $element) {
		var element = $($element);

		var hasSrc = !!element.attr('src');

		if (hasSrc) { return; }

		var unbindUpdate = $scope.$on('bottomX.changed', update);
		var unbindResize = $scope.$on('window.resize', hadleResize);

		element.hide();

		var fake = element.siblings('*[load-src-fake]');
		var top = fake.offset().top;

		function update() {
			hasSrc = !!element.attr('src');

			if (hasSrc || top > bottomX) { return; }

			var img = new Image();
			$(img).on('load', function() {
				element
					.attr('src', $scope.src)
					.show();

				fake.remove();
			});

			img.src = $scope.src;


			unbindUpdate();
			unbindResize();
		}

		update();

		function hadleResize() {
			element.show();
			top = element.offset().top;
			update();
		}
	}
}
