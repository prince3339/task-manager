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