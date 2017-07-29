var angular = require('angular');
(function(angular) {
    'use strict';
    angular
        .module('taskApp', [])
        .run(function() {
            console.log('Task App loaded');
        });
})(angular);