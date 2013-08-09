'use strict';

angular.module('myApp', [ 'ui.bootstrap' ]).
    config(function ($routeProvider) {
        $routeProvider
            .when('/new', {resolve: {redirect: 'NewNotebookService'}})
            .when('/:notebook_id', {templateUrl: 'partials/notebook.html', controller: 'NotebookCtrl'})
            .otherwise({redirectTo: '/new'});
    }).
    factory('NewNotebookService', function ($location, uuid) {
        $location.path('/' + uuid())
    });
