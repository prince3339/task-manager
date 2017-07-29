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