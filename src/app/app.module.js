(function(angular) {
    'use strict';
    require('./task/task.module');
    angular
        .module('taskMangerApp', ['taskApp', 'ngMaterial', 'ui.router', 'firebase'])
        .run(function() {
            console.log('Angular booted');
        });

    angular.element(function() {
        angular.bootstrap(document, ['taskMangerApp']);
    });
})(window.angular);