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