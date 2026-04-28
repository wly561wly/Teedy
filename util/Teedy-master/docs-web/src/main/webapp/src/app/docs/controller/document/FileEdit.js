'use strict';

/**
 * File edit controller.
 */
angular.module('docs').controller('FileEdit', function($uibModal, $state, $stateParams, $timeout) {
  var modal = $uibModal.open({
    windowClass: 'modal modal-file-view',
    templateUrl: 'partial/docs/file.edit.html',
    controller: 'FileModalEdit',
    size: 'lg'
  });

  // Returns to document view on file close
  modal.closed = false;
  modal.result.then(function(fileId) {
    modal.closed = true;
    $timeout(function () {
      // After all router transitions are passed,
      // if we are still on the file route, go back to the document
      if ($state.current.name === 'document.view.content.file.edit') {
        $state.go('^.view', {id: $stateParams.id, fileId: fileId});
      }
    });
  });
});