var app = require('app');
var $ = require('jquery');
var _ = require('lodash');

app.directive('eye', eye);

eye.$inject = ['$timeout', '$window'];
function eye($timeout, $window) {
	$window = $($window);

	var directive = {
		restrict: 'C',
		link: link
	};

	return directive;

	function link($scope, $element) {
		var element = $($element);
		var pupil = element.find('.pupil');
		var offset = pupil.offset();

		var centerX = offset.left + pupil.width() / 2;
		var centerY = offset.top + pupil.height() / 2;

		var animateDuration = 300;
		animate();

		var bounce = 400;

		$window.on('mousemove', function(evt) {
			var x = evt.pageX - centerX;
			var y = evt.pageY - centerY;

			var angle = Math.atan2(x, y);

			var delta = Math.sqrt(x * x + y * y);


			var maxLeft = bounce * Math.sin(angle);
			var left = delta * Math.sin(angle);

			if (Math.abs(maxLeft) < Math.abs(left)) {
				left = maxLeft;
			}

			var maxTop = bounce * Math.cos(angle);
			var top = delta * Math.cos(angle);

			if (Math.abs(maxTop) < Math.abs(top)) {
				top = maxTop;
			}

			left = (left / bounce / 2 + 0.5) * 100;
			top = (top / bounce / 2 + 0.5) * 100;

			pupil.css({
				left: left + '%',
				top: top + '%'
			});
		});

		function animate() {
			var duration = _.random(2000, 6000);
			var times = Math.random() > 0.80 ? 2 : 1;

			$timeout(function() {
				step();
			}, duration);

			function step() {
				element.addClass('animate');
				$timeout(function() {
					element.removeClass('animate');
					times--;
					if (times) {
						$timeout(step, 50);
						return;
					}

					animate();
				}, animateDuration);
			}
		}
	}
}
