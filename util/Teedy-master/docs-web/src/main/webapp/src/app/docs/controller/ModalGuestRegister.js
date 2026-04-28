'use strict';

/**
 * Modal guest register controller.
 */
angular.module('docs').controller('ModalGuestRegister', function ($scope, $uibModalInstance) {
  $scope.user = null;
  $scope.close = function(user) {
    $uibModalInstance.close(user);
  };
});