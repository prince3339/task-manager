webpackJsonp([0],{

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(145);
module.exports = __webpack_require__(155);


/***/ }),

/***/ 145:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(146);
__webpack_require__(149);
__webpack_require__(150);
//require('./task/constant/task.constant');
__webpack_require__(152);

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
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(153);
__webpack_require__(154);

/***/ }),

/***/ 153:
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

/***/ 154:
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

/***/ 155:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},[144]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXF1aXJlZC1maWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9hcHAubW9kdWxlLmpzIiwid2VicGFjazovLy8uL3Rhc2svdGFzay5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vYXBwLnJvdXRlLmpzIiwid2VicGFjazovLy8uL3Rhc2svc2VydmljZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi90YXNrL3NlcnZpY2UvdGFzay5zZXJ2aWNlLmpzIiwid2VicGFjazovLy8uL3Rhc2svY29udHJvbGxlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi90YXNrL2NvbnRyb2xsZXIvdGFzay5jb250cm9sbGVyLmpzIiwid2VicGFjazovLy8uL3Rhc2svY29udHJvbGxlci90YXNrLWNyZWF0ZS11cGRhdGUtbW9kYWwuY29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly8vLi4vcHVibGljL3N0eWxlL3Nhc3MvbWFpbi5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Qjs7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMsa0I7Ozs7Ozs7QUNaRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxDQUFDLFc7Ozs7Ozs7QUNSRDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxrQjs7Ozs7OztBQ2pCRCx5Qjs7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdDQUF3Qzs7QUFFeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7O0FBRWI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViLGFBQWE7QUFDYjtBQUNBO0FBQ0EsQ0FBQyxrQjs7Ozs7OztBQ25GRDtBQUNBLHlCOzs7Ozs7O0FDREE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLENBQUMsa0I7Ozs7Ozs7QUM3REQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLGtCOzs7Ozs7O0FDckNELHlDIiwiZmlsZSI6ImFwcC5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKCcuL2FwcC5tb2R1bGUnKTtcclxucmVxdWlyZSgnLi9hcHAucm91dGUnKTtcclxucmVxdWlyZSgnLi90YXNrL3NlcnZpY2UnKTtcclxuLy9yZXF1aXJlKCcuL3Rhc2svY29uc3RhbnQvdGFzay5jb25zdGFudCcpO1xyXG5yZXF1aXJlKCcuL3Rhc2svY29udHJvbGxlcicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVxdWlyZWQtZmlsZXMuanNcbi8vIG1vZHVsZSBpZCA9IDE0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24oYW5ndWxhcikge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgcmVxdWlyZSgnLi90YXNrL3Rhc2subW9kdWxlJyk7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgndGFza01hbmdlckFwcCcsIFsndGFza0FwcCcsICduZ01hdGVyaWFsJywgJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKVxyXG4gICAgICAgIC5ydW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBbmd1bGFyIGJvb3RlZCcpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIGFuZ3VsYXIuZWxlbWVudChmdW5jdGlvbigpIHtcclxuICAgICAgICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWyd0YXNrTWFuZ2VyQXBwJ10pO1xyXG4gICAgfSk7XHJcbn0pKHdpbmRvdy5hbmd1bGFyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2FwcC5tb2R1bGUuanNcbi8vIG1vZHVsZSBpZCA9IDE0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYW5ndWxhciA9IHJlcXVpcmUoJ2FuZ3VsYXInKTtcclxuKGZ1bmN0aW9uKGFuZ3VsYXIpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCd0YXNrQXBwJywgW10pXHJcbiAgICAgICAgLnJ1bihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Rhc2sgQXBwIGxvYWRlZCcpO1xyXG4gICAgICAgIH0pO1xyXG59KShhbmd1bGFyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Rhc2svdGFzay5tb2R1bGUuanNcbi8vIG1vZHVsZSBpZCA9IDE0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24oYW5ndWxhcikge1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Rhc2tNYW5nZXJBcHAnKVxyXG4gICAgICAgIC5jb25maWcocm91dGVDb25maWcpO1xyXG5cclxuICAgIHJvdXRlQ29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJvdXRlQ29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuICAgICAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgICAgICAuc3RhdGUoJ2hvbWUnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL2FwcC90YXNrL3ZpZXcvdGFzay52aWV3Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3Rhc2tDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXJcclxuICAgICAgICAgICAgLm90aGVyd2lzZSgnLycpO1xyXG4gICAgfVxyXG59KSh3aW5kb3cuYW5ndWxhcik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hcHAucm91dGUuanNcbi8vIG1vZHVsZSBpZCA9IDE0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJyZXF1aXJlKCcuL3Rhc2suc2VydmljZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGFzay9zZXJ2aWNlL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uKGFuZ3VsYXIpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCd0YXNrQXBwJylcclxuICAgICAgICAuc2VydmljZSgndGFza1NlcnZpY2UnLCBUYXNrU2VydmljZSk7XHJcbiAgICBUYXNrU2VydmljZS4kaW5qZWN0ID0gWyckcScsICckZmlyZWJhc2VBcnJheScsICckbWRUb2FzdCcsICckbWREaWFsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBUYXNrU2VydmljZSgkcSwgJGZpcmViYXNlQXJyYXksICRtZFRvYXN0LCAkbWREaWFsb2cpIHtcclxuICAgICAgICB2YXIgVGFza1NlcnZpY2UgPSB0aGlzO1xyXG4gICAgICAgIFRhc2tTZXJ2aWNlLmdldEFsbFRhc2tzID0gZ2V0QWxsVGFza3M7XHJcbiAgICAgICAgVGFza1NlcnZpY2UuYWRkTmV3VGFzayA9IGFkZE5ld1Rhc2s7XHJcbiAgICAgICAgVGFza1NlcnZpY2UudXBkYXRlVGFzayA9IHVwZGF0ZVRhc2s7XHJcbiAgICAgICAgVGFza1NlcnZpY2UucmVtb3ZlVGFzayA9IHJlbW92ZVRhc2s7XHJcblxyXG4gICAgICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigndGFza3MnKTtcclxuICAgICAgICAvL3ZhciByZWYgPSByZWYuY2hpbGQoMSk7XHJcbiAgICAgICAgdmFyIHRhc2tzID0gJGZpcmViYXNlQXJyYXkocmVmKTsgLy9nZXQgZGF0YVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBbGxUYXNrcygpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgdGFza3MuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSlcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRhc2tzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVqZWN0KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE5ld1Rhc2sodGFzaykge1xyXG4gICAgICAgICAgICB0YXNrLmRhdGVDcmVhdGVkID0gZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QO1xyXG4gICAgICAgICAgICB0YXNrLmRhdGVVcGRhdGVkID0gZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QO1xyXG5cclxuICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocmVmKS4kYWRkKHRhc2spLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICAgICAgICAgICRtZFRvYXN0LnNob3coXHJcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcclxuICAgICAgICAgICAgICAgICAgICAudGV4dENvbnRlbnQoJ1Rhc2sgQWRkZWQgU3VjY2Vzc2Z1bGx5IScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnBvc2l0aW9uKCdib3R0b20gcmlnaHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oaWRlRGVsYXkoMTAwMClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVGFzayh0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciByZWZGb3JVcGRhdGUgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigndGFza3MvJyArIHRhc2suJGlkKTtcclxuICAgICAgICAgICAgcmVmRm9yVXBkYXRlLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0YXNrLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGFzay5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIGRhdGVVcGRhdGVkOiBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVBcclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICRtZERpYWxvZy5jYW5jZWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaG93KFxyXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRleHRDb250ZW50KCdUYXNrIFVwZGF0ZWQgU3VjY2Vzc2Z1bGx5IScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnBvc2l0aW9uKCdib3R0b20gcmlnaHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oaWRlRGVsYXkoMTAwMClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVUYXNrKHRhc2spIHtcclxuICAgICAgICAgICAgdGFza3MuJHJlbW92ZSh0YXNrKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RlbGV0ZWQnKTtcclxuICAgICAgICAgICAgICAgICRtZFRvYXN0LnNob3coXHJcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcclxuICAgICAgICAgICAgICAgICAgICAudGV4dENvbnRlbnQoJ1Rhc2sgUmVtb3ZlZCBTdWNjZXNzZnVsbHkhJylcclxuICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24oJ2JvdHRvbSByaWdodCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheSgxMDAwKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5hbmd1bGFyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Rhc2svc2VydmljZS90YXNrLnNlcnZpY2UuanNcbi8vIG1vZHVsZSBpZCA9IDE1MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJyZXF1aXJlKCcuL3Rhc2suY29udHJvbGxlcicpO1xyXG5yZXF1aXJlKCcuL3Rhc2stY3JlYXRlLXVwZGF0ZS1tb2RhbC5jb250cm9sbGVyJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90YXNrL2NvbnRyb2xsZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE1MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24oYW5ndWxhcikge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCd0YXNrQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcigndGFza0NvbnRyb2xsZXInLCBUYXNrQ29udHJvbGxlcik7XHJcblxyXG4gICAgVGFza0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJGZpcmViYXNlT2JqZWN0JywgJyRmaXJlYmFzZUFycmF5JywgJyRtZERpYWxvZycsICd0YXNrU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFRhc2tDb250cm9sbGVyKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksICRtZERpYWxvZywgdGFza1NlcnZpY2UpIHtcclxuICAgICAgICB2YXIgdm0gPSB0aGlzO1xyXG4gICAgICAgIHZtLnNob3dBZGRVcGRhdGVUYXNrTW9kYWwgPSBzaG93QWRkVXBkYXRlVGFza01vZGFsO1xyXG4gICAgICAgIHZtLnJlbW92ZVRhc2tNb2RhbCA9IHJlbW92ZVRhc2tNb2RhbDtcclxuICAgICAgICB2bS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBbGxUYXNrcygpIHtcclxuICAgICAgICAgICAgdm0ubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRhc2tTZXJ2aWNlLmdldEFsbFRhc2tzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgdm0udGFza3MgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGVyZSBpcyBhIHByb2JsZW0hISEnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzaG93QWRkVXBkYXRlVGFza01vZGFsKGV2ZW50LCB0YXNrKSB7XHJcbiAgICAgICAgICAgICRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICd0YXNrQ3JlYXRlVXBkYXRlQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3NyYy9hcHAvdGFzay92aWV3L3Rhc2stY3JlYXRlLXVwZGF0ZS1tb2RhbC52aWV3Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSksXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbG9jYWxzOiB0YXNrXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlVGFza01vZGFsKGV2ZW50LCB0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxyXG4gICAgICAgICAgICAgICAgLnRpdGxlKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlIHRoaXM/JylcclxuICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudCgnS2VlcCBpbiBtaW5kIHRoYXQgdGhlcmUgaXMgbm8gdW5kby4nKVxyXG4gICAgICAgICAgICAgICAgLmFyaWFMYWJlbCgnUmVtb3ZlIHRhc2snKVxyXG4gICAgICAgICAgICAgICAgLnRhcmdldEV2ZW50KGV2ZW50KVxyXG4gICAgICAgICAgICAgICAgLm9rKCdSZW1vdmUnKVxyXG4gICAgICAgICAgICAgICAgLmNhbmNlbCgnQ2FuY2VsJyk7XHJcblxyXG4gICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGFza1NlcnZpY2UucmVtb3ZlVGFzayh0YXNrKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGluZ25vcmVkIHRvIHJlbW92ZS4nKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICBnZXRBbGxUYXNrcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5pdCgpO1xyXG4gICAgfVxyXG5cclxufSkod2luZG93LmFuZ3VsYXIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGFzay9jb250cm9sbGVyL3Rhc2suY29udHJvbGxlci5qc1xuLy8gbW9kdWxlIGlkID0gMTUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIihmdW5jdGlvbihhbmd1bGFyKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3Rhc2tBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCd0YXNrQ3JlYXRlVXBkYXRlQ29udHJvbGxlcicsIFRhc2tDcmVhdGVVcGRhdGVDb250cm9sbGVyKTtcclxuXHJcbiAgICBUYXNrQ3JlYXRlVXBkYXRlQ29udHJvbGxlci4kaW5qZWN0ID0gWyckZmlyZWJhc2VPYmplY3QnLCAnJGZpcmViYXNlQXJyYXknLCAnbG9jYWxzJywgJ3Rhc2tTZXJ2aWNlJywgJyRtZERpYWxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFRhc2tDcmVhdGVVcGRhdGVDb250cm9sbGVyKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksIGxvY2FscywgdGFza1NlcnZpY2UsICRtZERpYWxvZykge1xyXG4gICAgICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZtLmFkZE5ld1Rhc2sgPSBhZGROZXdUYXNrO1xyXG4gICAgICAgIHZtLnVwZGF0ZVRhc2sgPSB1cGRhdGVUYXNrO1xyXG4gICAgICAgIHZtLmNhbmNlbE1vZGFsID0gY2FuY2VsTW9kYWw7XHJcbiAgICAgICAgdm0udGFzayA9IGFuZ3VsYXIuY29weShsb2NhbHMpO1xyXG4gICAgICAgIHZtLmVkaXRNb2RlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigndGFza3MnKTtcclxuXHJcbiAgICAgICAgaWYgKGxvY2FscylcclxuICAgICAgICAgICAgdm0uZWRpdE1vZGUgPSB0cnVlO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdm0uZWRpdE1vZGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkTmV3VGFzayh0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2tTZXJ2aWNlLmFkZE5ld1Rhc2sodGFzayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVUYXNrKHRhc2spIHtcclxuICAgICAgICAgICAgdGFza1NlcnZpY2UudXBkYXRlVGFzayh0YXNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbmNlbE1vZGFsKCkge1xyXG4gICAgICAgICAgICAkbWREaWFsb2cuY2FuY2VsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSh3aW5kb3cuYW5ndWxhcik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90YXNrL2NvbnRyb2xsZXIvdGFzay1jcmVhdGUtdXBkYXRlLW1vZGFsLmNvbnRyb2xsZXIuanNcbi8vIG1vZHVsZSBpZCA9IDE1NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL3B1YmxpYy9zdHlsZS9zYXNzL21haW4uc2Nzc1xuLy8gbW9kdWxlIGlkID0gMTU1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=