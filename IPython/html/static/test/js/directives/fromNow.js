'use strict';

angular.module('myApp').
	directive('fromNow', function ($timeout){
		return {
			scope: { 'time': '=' },
			restrict: 'A',
			link: function($scope, iElm, iAttrs, controller) {
				$scope.$watch('time', function(value) {
					iElm.text(moment(value).fromNow());
				});

				var cancelRefresh = $timeout(function myFunction() {
					var time = $scope.$eval('time');
					iElm.text(moment(time).fromNow());
					cancelRefresh = $timeout(myFunction, 10000);
				}, 10000);

				$scope.$on('$destroy', function(event) {
					$timeout.cancel(cancelRefresh);
				});
			}
		};
	});