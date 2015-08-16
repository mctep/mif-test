var app = require('app');
var _ = require('lodash');
var $ = require('jquery');

app.directive('draggable', draggable);

draggable.$inject = ['$window', '$timeout', '$interval'];
function draggable($window, $timeout, $interval) {
	$window = $($window);

	var directive = {
		restrict: 'A',
		link: link,
		scope: {
			model: '=draggable'
		}
	};

	return directive;

	function link($scope, $element) {
		var element = $($element);
		var anchor = element.find('[draggable-anchor]');

		var clone = null;

		anchor.on('mousedown', dragStart);

		function dragStart(evt) {
			if (evt.button !== 0) { return; }

			// массив областей, где будут храниться
			// места для дропа
			var dropPlaces = [];

			// границы вокруг лежащих элементов,
			// при котором будет показываться дроп место
			var horizontalDropDelta = 120;
			var verticalDropDelta = 30;

			// последнее показанное дроп место,
			// сделано для кеширования
			var lastDropPlace;

			// интервал для скролла, при приближении к краю окна
			var scrollInterval;
			// минимальное расстояние от перетаскиваемого элемента
			// до края экрана, при котором включается скролл
			var scrollDelta = 100;
			// шаг или скорость изменения скролла
			var scrollStep = 3;

			// таскать мы будем клон элемента
			clone = element.clone();
			// в то время как оригинальный элемент будет скрыт
			element.css({ visibility: 'hidden' });

			// этот класс нужен, чтобы отключить возможность выделения
			// текста на странице
			$('body').addClass('dragging');

			clone
				.addClass('draggable')
				.appendTo('body');

			var width, height;

			// все элементы, которые можно двигать
			var siblings = element.parent().find('[draggable]');

			$timeout(function() {
				resetSizes();
				moveClone(evt);
			}, 0);

			$window.on('mouseup', throwClone);
			$window.on('mousemove', moveClone);

			// бросаем элемент
			function throwClone() {
				// возвращаемся к изначальному виду
				clone.remove();
				clone = null;

				$('body').removeClass('dragging');
				element.css({ visibility: 'visible' });

				$window.off('mouseup', throwClone);
				$window.off('mousemove', moveClone);

				clearScrollInterval();
				updateModel();
			}

			function moveClone(evt) {
				// обработка скролла
				clearScrollInterval();

				// нижняя граница экрана
				if ($window.innerHeight() - evt.clientY < scrollDelta) {
					createScrollInterval(scrollStep);
				}

				// верхняя граница экрана
				if (evt.clientY < scrollDelta) {
					createScrollInterval(-scrollStep);
				}

				// вычисляем куда сдвинуть элемент
				var x = evt.clientX - width;
				var y = evt.clientY - height;

				clone.css({ left: x, top: y });

				var founded = false;

				// проверка дроп-мест
				var c = dropPlaces.length;
				for (var i = 0; i < c; i++) {
					var coords = dropPlaces[i];
					if (
						evt.pageX > coords.first[0] &&
						evt.pageX < coords.second[0] &&
						evt.pageY > coords.first[1] &&
						evt.pageY < coords.second[1]
					) {
						founded = true;

						if (lastDropPlace === coords.elm) { break; }

						$('.drop-place').remove();
						lastDropPlace = coords.elm;

						if (!coords.ignore) {
							$(lastDropPlace).prepend('<div class="drop-place"></div>');
						}

						break;
					}
				}

				if (!founded && lastDropPlace) {
					$('.drop-place').remove();
					lastDropPlace = null;
				}
			}

			function resetSizes() {
				width = clone.width() / 2;
				// тут что-то непраильно, надо пересчитать
				height = clone.height() / 2;

				var next = element.next('[draggable]');

				// соберем дроп-места
				siblings.each(function(index, sibling) {
					var offset = $(sibling).offset();

					dropPlaces.push({
						// верхняя левая координата
						first: [
							offset.left - horizontalDropDelta,
							offset.top - verticalDropDelta
						],
						// нижняя права координата
						second: [
							offset.left + horizontalDropDelta,
							offset.top + height * 2 + verticalDropDelta
						],
						// элемент, куда мы положим полоску
						elm: sibling,
						// в случае, если мы возвращаем елемент на место,
						// мы не будем показывать полоску для дропа
						ignore: (next[0] == sibling)
					});
				});
			}

			function clearScrollInterval() {
				if (scrollInterval) { $interval.cancel(scrollInterval); }
			}

			function createScrollInterval(step) {
				scrollInterval = $interval(function() {
					$window.scrollTop($window.scrollTop() + step);
				}, 0);
			}

			function updateModel() {
				// найдем последнее активное место для дропа
				var activeDropPlace = $('.drop-place');

				// если его нет, ничего не меняем
				if (!activeDropPlace.length) { return; }

				// индекс элемента, перед которым мы расположим активный
				var index = siblings.index(activeDropPlace.parent());
				// больше на дроп-место не нужно
				activeDropPlace.remove();
				// индекс активного элемента
				var selfIndex = siblings.index(element);

				// в случе, если мы перекладываем элемент вперед,
				// то его будущий индекс будет меньше на единицу
				if (index > selfIndex) { index--; }

				// вырезаем из модели-списка активный элемент
				var modelItem = $scope.model.splice(selfIndex, 1);
				// и вставляем его на новое место
				$scope.model.splice(index, 0, modelItem[0]);
				// и вызываем перерисовку
				$scope.$apply();
			}
		}
	}
}
