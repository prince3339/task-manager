webpackJsonp([0],{

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(145);
module.exports = __webpack_require__(156);


/***/ }),

/***/ 145:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(146);
__webpack_require__(149);
__webpack_require__(150);
__webpack_require__(152);
__webpack_require__(153);

/***/ }),

/***/ 146:
/***/ (function(module, exports, __webpack_require__) {

(function(angular) {
    'use strict';
    __webpack_require__(147);
    angular
        .module('taskMangerApp', ['taskApp', 'ngMaterial', 'ui.router', 'firebase'])
        .run(function() {
            console.log('Angular booted');
        });

    angular.element(function() {
        angular.bootstrap(document, ['taskMangerApp']);
    });
})(window.angular);

/***/ }),

/***/ 147:
/***/ (function(module, exports, __webpack_require__) {

var angular = __webpack_require__(25);
(function(angular) {
    'use strict';
    angular
        .module('taskApp', [])
        .run(function() {
            console.log('Task App loaded');
        });
})(angular);

/***/ }),

/***/ 149:
/***/ (function(module, exports) {

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

/***/ }),

/***/ 150:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(151);

/***/ }),

/***/ 151:
/***/ (function(module, exports) {

(function(angular) {
    'use strict';
    angular
        .module('taskApp')
        .service('taskService', TaskService);
    TaskService.$inject = ['$q', '$firebaseArray', '$mdToast', '$mdDialog'];

    function TaskService($q, $firebaseArray, $mdToast, $mdDialog) {
        var TaskService = this;
        TaskService.getAllTasks = getAllTasks;
        TaskService.addNewTask = addNewTask;
        TaskService.updateTask = updateTask;
        TaskService.removeTask = removeTask;

        var ref = firebase.database().ref('tasks');
        //var ref = ref.child(1);
        var tasks = $firebaseArray(ref); //get data

        function getAllTasks() {
            var deferred = $q.defer();
            tasks.$loaded().then(function(response) {
                if (response)
                    deferred.resolve(tasks);
            }, function(reject) {
                deferred.reject(reject);
            });

            return deferred.promise;
        }

        function addNewTask(task) {
            task.dateCreated = firebase.database.ServerValue.TIMESTAMP;
            task.dateUpdated = firebase.database.ServerValue.TIMESTAMP;

            $firebaseArray(ref).$add(task).then(function(response) {
                console.log(response);
                $mdDialog.cancel();
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Task Added Successfully!')
                    .position('bottom right')
                    .hideDelay(1000)
                );
            }, function(error) {
                console.log(error);
            });
        }

        function updateTask(task) {
            var refForUpdate = firebase.database().ref('tasks/' + task.$id);
            refForUpdate.update({
                name: task.name,
                description: task.description,
                dateUpdated: firebase.database.ServerValue.TIMESTAMP
            }).then(function(response) {
                console.log('Updated');
                $mdDialog.cancel();

                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Task Updated Successfully!')
                    .position('bottom right')
                    .hideDelay(1000)
                );
            }, function(error) {
                console.error(error);
            });
        }

        function removeTask(task) {
            tasks.$remove(task).then(function() {
                console.log('Deleted');
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Task Removed Successfully!')
                    .position('bottom right')
                    .hideDelay(1000)
                );
            }, function() {

            });
        }
    }
})(window.angular);

/***/ }),

/***/ 152:
/***/ (function(module, exports) {

(function(angular) {
    'use strict';

    angular
        .module('taskApp')
        .constant('baseUrl', 'google.com');
})(window.angular);

/***/ }),

/***/ 153:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(154);
__webpack_require__(155);

/***/ }),

/***/ 154:
/***/ (function(module, exports) {

(function(angular) {
    'use strict';

    angular
        .module('taskApp')
        .controller('taskController', TaskController);

    TaskController.$inject = ['$firebaseObject', '$firebaseArray', '$mdDialog', 'taskService'];

    function TaskController($firebaseObject, $firebaseArray, $mdDialog, taskService) {
        var vm = this;
        vm.showAddUpdateTaskModal = showAddUpdateTaskModal;
        vm.removeTaskModal = removeTaskModal;
        vm.loading = false;


        function getAllTasks() {
            vm.loading = true;
            taskService.getAllTasks().then(function(response) {
                vm.tasks = response;
                vm.loading = false;
            }, function(error) {
                console.log('There is a problem!!!');
            });
        }

        function showAddUpdateTaskModal(event, task) {
            $mdDialog.show({
                controller: 'taskCreateUpdateController',
                controllerAs: 'vm',
                templateUrl: 'src/app/task/view/task-create-update-modal.view.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                locals: task
            });
        }

        function removeTaskModal(event, task) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to remove this?')
                .textContent('Keep in mind that there is no undo.')
                .ariaLabel('Remove task')
                .targetEvent(event)
                .ok('Remove')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                taskService.removeTask(task);
            }, function() {
                console.log('You ingnored to remove.');
            });
        }

        function init() {
            getAllTasks();
        }

        init();
    }

})(window.angular);

/***/ }),

/***/ 155:
/***/ (function(module, exports) {

(function(angular) {
    'use strict';

    angular
        .module('taskApp')
        .controller('taskCreateUpdateController', TaskCreateUpdateController);

    TaskCreateUpdateController.$inject = ['$firebaseObject', '$firebaseArray', 'locals', 'taskService', '$mdDialog'];

    function TaskCreateUpdateController($firebaseObject, $firebaseArray, locals, taskService, $mdDialog) {
        var vm = this;

        vm.addNewTask = addNewTask;
        vm.updateTask = updateTask;
        vm.cancelModal = cancelModal;
        vm.task = angular.copy(locals);
        vm.editMode = false;

        var ref = firebase.database().ref('tasks');

        if (locals)
            vm.editMode = true;
        else
            vm.editMode = false;

        function addNewTask(task) {
            taskService.addNewTask(task);
        }

        function updateTask(task) {
            taskService.updateTask(task);
        }

        function cancelModal() {
            $mdDialog.cancel();
        }
    }
})(window.angular);

/***/ }),

/***/ 156:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},[144]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXF1aXJlZC1maWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9hcHAubW9kdWxlLmpzIiwid2VicGFjazovLy8uL3Rhc2svdGFzay5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vYXBwLnJvdXRlLmpzIiwid2VicGFjazovLy8uL3Rhc2svc2VydmljZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi90YXNrL3NlcnZpY2UvdGFzay5zZXJ2aWNlLmpzIiwid2VicGFjazovLy8uL3Rhc2svY29uc3RhbnQvdGFzay5jb25zdGFudC5qcyIsIndlYnBhY2s6Ly8vLi90YXNrL2NvbnRyb2xsZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vdGFzay9jb250cm9sbGVyL3Rhc2suY29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly8vLi90YXNrL2NvbnRyb2xsZXIvdGFzay1jcmVhdGUtdXBkYXRlLW1vZGFsLmNvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vLy4uL3B1YmxpYy9zdHlsZS9zYXNzL21haW4uc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUI7Ozs7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDLGtCOzs7Ozs7O0FDWkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsQ0FBQyxXOzs7Ozs7O0FDUkQ7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLENBQUMsa0I7Ozs7Ozs7QUNqQkQseUI7Ozs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3Q0FBd0M7O0FBRXhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhOztBQUViO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYixhQUFhO0FBQ2I7QUFDQTtBQUNBLENBQUMsa0I7Ozs7Ozs7QUNuRkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLGtCOzs7Ozs7O0FDTkQ7QUFDQSx5Qjs7Ozs7OztBQ0RBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxDQUFDLGtCOzs7Ozs7O0FDN0REO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxrQjs7Ozs7OztBQ3JDRCx5QyIsImZpbGUiOiJhcHAuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSgnLi9hcHAubW9kdWxlJyk7XHJcbnJlcXVpcmUoJy4vYXBwLnJvdXRlJyk7XHJcbnJlcXVpcmUoJy4vdGFzay9zZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vdGFzay9jb25zdGFudC90YXNrLmNvbnN0YW50Jyk7XHJcbnJlcXVpcmUoJy4vdGFzay9jb250cm9sbGVyJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXF1aXJlZC1maWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gMTQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbihhbmd1bGFyKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICByZXF1aXJlKCcuL3Rhc2svdGFzay5tb2R1bGUnKTtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCd0YXNrTWFuZ2VyQXBwJywgWyd0YXNrQXBwJywgJ25nTWF0ZXJpYWwnLCAndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pXHJcbiAgICAgICAgLnJ1bihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FuZ3VsYXIgYm9vdGVkJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgYW5ndWxhci5lbGVtZW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ3Rhc2tNYW5nZXJBcHAnXSk7XHJcbiAgICB9KTtcclxufSkod2luZG93LmFuZ3VsYXIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXBwLm1vZHVsZS5qc1xuLy8gbW9kdWxlIGlkID0gMTQ2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhbmd1bGFyID0gcmVxdWlyZSgnYW5ndWxhcicpO1xyXG4oZnVuY3Rpb24oYW5ndWxhcikge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3Rhc2tBcHAnLCBbXSlcclxuICAgICAgICAucnVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVGFzayBBcHAgbG9hZGVkJyk7XHJcbiAgICAgICAgfSk7XHJcbn0pKGFuZ3VsYXIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGFzay90YXNrLm1vZHVsZS5qc1xuLy8gbW9kdWxlIGlkID0gMTQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbihhbmd1bGFyKSB7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgndGFza01hbmdlckFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhyb3V0ZUNvbmZpZyk7XHJcblxyXG4gICAgcm91dGVDb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcm91dGVDb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnaG9tZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy8nLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvYXBwL3Rhc2svdmlldy90YXNrLnZpZXcuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAndGFza0NvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlclxyXG4gICAgICAgICAgICAub3RoZXJ3aXNlKCcvJyk7XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5hbmd1bGFyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2FwcC5yb3V0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInJlcXVpcmUoJy4vdGFzay5zZXJ2aWNlJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90YXNrL3NlcnZpY2UvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE1MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24oYW5ndWxhcikge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3Rhc2tBcHAnKVxyXG4gICAgICAgIC5zZXJ2aWNlKCd0YXNrU2VydmljZScsIFRhc2tTZXJ2aWNlKTtcclxuICAgIFRhc2tTZXJ2aWNlLiRpbmplY3QgPSBbJyRxJywgJyRmaXJlYmFzZUFycmF5JywgJyRtZFRvYXN0JywgJyRtZERpYWxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFRhc2tTZXJ2aWNlKCRxLCAkZmlyZWJhc2VBcnJheSwgJG1kVG9hc3QsICRtZERpYWxvZykge1xyXG4gICAgICAgIHZhciBUYXNrU2VydmljZSA9IHRoaXM7XHJcbiAgICAgICAgVGFza1NlcnZpY2UuZ2V0QWxsVGFza3MgPSBnZXRBbGxUYXNrcztcclxuICAgICAgICBUYXNrU2VydmljZS5hZGROZXdUYXNrID0gYWRkTmV3VGFzaztcclxuICAgICAgICBUYXNrU2VydmljZS51cGRhdGVUYXNrID0gdXBkYXRlVGFzaztcclxuICAgICAgICBUYXNrU2VydmljZS5yZW1vdmVUYXNrID0gcmVtb3ZlVGFzaztcclxuXHJcbiAgICAgICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCd0YXNrcycpO1xyXG4gICAgICAgIC8vdmFyIHJlZiA9IHJlZi5jaGlsZCgxKTtcclxuICAgICAgICB2YXIgdGFza3MgPSAkZmlyZWJhc2VBcnJheShyZWYpOyAvL2dldCBkYXRhXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEFsbFRhc2tzKCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICB0YXNrcy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodGFza3MpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihyZWplY3QpIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZWplY3QpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkTmV3VGFzayh0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2suZGF0ZUNyZWF0ZWQgPSBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVA7XHJcbiAgICAgICAgICAgIHRhc2suZGF0ZVVwZGF0ZWQgPSBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVA7XHJcblxyXG4gICAgICAgICAgICAkZmlyZWJhc2VBcnJheShyZWYpLiRhZGQodGFzaykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgICAgICAgICAgJG1kVG9hc3Quc2hvdyhcclxuICAgICAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaW1wbGUoKVxyXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudCgnVGFzayBBZGRlZCBTdWNjZXNzZnVsbHkhJylcclxuICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24oJ2JvdHRvbSByaWdodCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheSgxMDAwKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVUYXNrKHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIHJlZkZvclVwZGF0ZSA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCd0YXNrcy8nICsgdGFzay4kaWQpO1xyXG4gICAgICAgICAgICByZWZGb3JVcGRhdGUudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRhc2submFtZSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0YXNrLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgZGF0ZVVwZGF0ZWQ6IGZpcmViYXNlLmRhdGFiYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUFxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICRtZFRvYXN0LnNob3coXHJcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcclxuICAgICAgICAgICAgICAgICAgICAudGV4dENvbnRlbnQoJ1Rhc2sgVXBkYXRlZCBTdWNjZXNzZnVsbHkhJylcclxuICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24oJ2JvdHRvbSByaWdodCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheSgxMDAwKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZVRhc2sodGFzaykge1xyXG4gICAgICAgICAgICB0YXNrcy4kcmVtb3ZlKHRhc2spLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVsZXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgJG1kVG9hc3Quc2hvdyhcclxuICAgICAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaW1wbGUoKVxyXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudCgnVGFzayBSZW1vdmVkIFN1Y2Nlc3NmdWxseSEnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbignYm90dG9tIHJpZ2h0JylcclxuICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KDEwMDApXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkod2luZG93LmFuZ3VsYXIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGFzay9zZXJ2aWNlL3Rhc2suc2VydmljZS5qc1xuLy8gbW9kdWxlIGlkID0gMTUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbihhbmd1bGFyKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3Rhc2tBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnYmFzZVVybCcsICdnb29nbGUuY29tJyk7XHJcbn0pKHdpbmRvdy5hbmd1bGFyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Rhc2svY29uc3RhbnQvdGFzay5jb25zdGFudC5qc1xuLy8gbW9kdWxlIGlkID0gMTUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInJlcXVpcmUoJy4vdGFzay5jb250cm9sbGVyJyk7XHJcbnJlcXVpcmUoJy4vdGFzay1jcmVhdGUtdXBkYXRlLW1vZGFsLmNvbnRyb2xsZXInKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Rhc2svY29udHJvbGxlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbihhbmd1bGFyKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3Rhc2tBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCd0YXNrQ29udHJvbGxlcicsIFRhc2tDb250cm9sbGVyKTtcclxuXHJcbiAgICBUYXNrQ29udHJvbGxlci4kaW5qZWN0ID0gWyckZmlyZWJhc2VPYmplY3QnLCAnJGZpcmViYXNlQXJyYXknLCAnJG1kRGlhbG9nJywgJ3Rhc2tTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gVGFza0NvbnRyb2xsZXIoJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgJG1kRGlhbG9nLCB0YXNrU2VydmljZSkge1xyXG4gICAgICAgIHZhciB2bSA9IHRoaXM7XHJcbiAgICAgICAgdm0uc2hvd0FkZFVwZGF0ZVRhc2tNb2RhbCA9IHNob3dBZGRVcGRhdGVUYXNrTW9kYWw7XHJcbiAgICAgICAgdm0ucmVtb3ZlVGFza01vZGFsID0gcmVtb3ZlVGFza01vZGFsO1xyXG4gICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEFsbFRhc2tzKCkge1xyXG4gICAgICAgICAgICB2bS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGFza1NlcnZpY2UuZ2V0QWxsVGFza3MoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICB2bS50YXNrcyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdm0ubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZXJlIGlzIGEgcHJvYmxlbSEhIScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNob3dBZGRVcGRhdGVUYXNrTW9kYWwoZXZlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3Rhc2tDcmVhdGVVcGRhdGVDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL2FwcC90YXNrL3ZpZXcvdGFzay1jcmVhdGUtdXBkYXRlLW1vZGFsLnZpZXcuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSxcclxuICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBsb2NhbHM6IHRhc2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVUYXNrTW9kYWwoZXZlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXHJcbiAgICAgICAgICAgICAgICAudGl0bGUoJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgdGhpcz8nKVxyXG4gICAgICAgICAgICAgICAgLnRleHRDb250ZW50KCdLZWVwIGluIG1pbmQgdGhhdCB0aGVyZSBpcyBubyB1bmRvLicpXHJcbiAgICAgICAgICAgICAgICAuYXJpYUxhYmVsKCdSZW1vdmUgdGFzaycpXHJcbiAgICAgICAgICAgICAgICAudGFyZ2V0RXZlbnQoZXZlbnQpXHJcbiAgICAgICAgICAgICAgICAub2soJ1JlbW92ZScpXHJcbiAgICAgICAgICAgICAgICAuY2FuY2VsKCdDYW5jZWwnKTtcclxuXHJcbiAgICAgICAgICAgICRtZERpYWxvZy5zaG93KGNvbmZpcm0pLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrU2VydmljZS5yZW1vdmVUYXNrKHRhc2spO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgaW5nbm9yZWQgdG8gcmVtb3ZlLicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgIGdldEFsbFRhc2tzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbml0KCk7XHJcbiAgICB9XHJcblxyXG59KSh3aW5kb3cuYW5ndWxhcik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90YXNrL2NvbnRyb2xsZXIvdGFzay5jb250cm9sbGVyLmpzXG4vLyBtb2R1bGUgaWQgPSAxNTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uKGFuZ3VsYXIpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgndGFza0FwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ3Rhc2tDcmVhdGVVcGRhdGVDb250cm9sbGVyJywgVGFza0NyZWF0ZVVwZGF0ZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIFRhc2tDcmVhdGVVcGRhdGVDb250cm9sbGVyLiRpbmplY3QgPSBbJyRmaXJlYmFzZU9iamVjdCcsICckZmlyZWJhc2VBcnJheScsICdsb2NhbHMnLCAndGFza1NlcnZpY2UnLCAnJG1kRGlhbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gVGFza0NyZWF0ZVVwZGF0ZUNvbnRyb2xsZXIoJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgbG9jYWxzLCB0YXNrU2VydmljZSwgJG1kRGlhbG9nKSB7XHJcbiAgICAgICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICAgICAgdm0uYWRkTmV3VGFzayA9IGFkZE5ld1Rhc2s7XHJcbiAgICAgICAgdm0udXBkYXRlVGFzayA9IHVwZGF0ZVRhc2s7XHJcbiAgICAgICAgdm0uY2FuY2VsTW9kYWwgPSBjYW5jZWxNb2RhbDtcclxuICAgICAgICB2bS50YXNrID0gYW5ndWxhci5jb3B5KGxvY2Fscyk7XHJcbiAgICAgICAgdm0uZWRpdE1vZGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCd0YXNrcycpO1xyXG5cclxuICAgICAgICBpZiAobG9jYWxzKVxyXG4gICAgICAgICAgICB2bS5lZGl0TW9kZSA9IHRydWU7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB2bS5lZGl0TW9kZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGROZXdUYXNrKHRhc2spIHtcclxuICAgICAgICAgICAgdGFza1NlcnZpY2UuYWRkTmV3VGFzayh0YXNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVRhc2sodGFzaykge1xyXG4gICAgICAgICAgICB0YXNrU2VydmljZS51cGRhdGVUYXNrKHRhc2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuY2VsTW9kYWwoKSB7XHJcbiAgICAgICAgICAgICRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5hbmd1bGFyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Rhc2svY29udHJvbGxlci90YXNrLWNyZWF0ZS11cGRhdGUtbW9kYWwuY29udHJvbGxlci5qc1xuLy8gbW9kdWxlIGlkID0gMTU1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi4vcHVibGljL3N0eWxlL3Nhc3MvbWFpbi5zY3NzXG4vLyBtb2R1bGUgaWQgPSAxNTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==