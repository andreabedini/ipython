'use strict';

angular.module('myApp').
    directive('codeMirror', function () {
        return {
            require: 'ngModel',
            link: function($scope, $element, $attributes, ngModel) {
                var opts = angular.extend({}, $scope.$eval($attributes.codeMirror));
                var codeMirror = CodeMirror($element[0], opts);

                codeMirror.on("focus", function(instance) {
                    $scope.notebook.selected_cell = $scope.$index;
                    if(!$scope.$$phase){ $scope.$apply(); }                    
                });

                $scope.$watch('notebook.selected_cell', function(newVal) {
                    if ($scope.$index == newVal) {
                        codeMirror.focus();
                    }
                })

                codeMirror.on("change", function(instance, changeObj) {
                    ngModel.$setViewValue(instance.getValue());
                    // the first change always fires during the $digest loop, idky
                    if(!$scope.$$phase){ $scope.$apply(); }
                });

                ngModel.$render = function () {
                    codeMirror.setValue(ngModel.$viewValue || '');
                };
            }
        }
    });
