(function(angular) {
    angular.module('taskMangerApp')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'src/app/task/view/task.view.html',
                controller: 'taskController',
                controllerAs: 'vm'
            });
        $urlRouterProvider
            .otherwise('/');
    }
})(window.angular);