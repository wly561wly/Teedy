'use strict';

/**
 * File modal edit controller.
 */
angular.module('docs').controller('FileModalEdit', function ($uibModalInstance, $scope, $rootScope, $state, $stateParams, $sce, Restangular, $transitions, $timeout, $location, $translate, Upload) {
  const setFile = function(files) {
    // Search current file
    _.each(files, function (value) {
      if (value.id === $stateParams.fileId) {
        $scope.file = value;
        $scope.trustedFileUrl = $sce.trustAsResourceUrl('../api/file/' + $stateParams.fileId + '/data');
      }
    });
  };

  // Load files
  Restangular.one('file/list').get({ id: $stateParams.id }).then(function (data) {
    $scope.files = data.files;
    setFile(data.files);

    // File not found, maybe it's a version
    if (!$scope.file) {
      Restangular.one('file/' + $stateParams.fileId + '/versions').get().then(function (data) {
        setFile(data.files);
      });
    }
  }).then(function() {
    $timeout(function() {
      /* adapted from mozilla/pdf.js/examples/components/simpleviewer.mjs  */
      const container = document.getElementById('viewerContainer');
      const eventBus = new pdfjsViewer.EventBus();
      const pdfViewer = new pdfjsViewer.PDFViewer({
        container: container,
        eventBus: eventBus,
        annotationEditorHighlightColors: 'yellow=#FFFF98,green=#53FFBC,blue=#80EBFF,pink=#FFCBE6,red=#FF4F5F',
      });
      eventBus.on("pagesinit", function () {
        pdfViewer.currentScaleValue = "page-width";
      });
      const loadingTask = pdfjsLib.getDocument($scope.trustedFileUrl.toString());
      loadingTask.promise.then(function(pdfDocument) {
        pdfViewer.setDocument(pdfDocument);
      });
      const resizeObserver = new ResizeObserver(function(entries) {
        if (entries) {
          pdfViewer.currentScaleValue = 'page-width';
        }
      });
      resizeObserver.observe(document.getElementById('editArea'));
      $scope.$on('$destroy', function() {
        resizeObserver.disconnect();
      })

      $scope.Type = {
        NONE: 0,
        INK: 1,
        HIGHLIGHT: 2,
        FREETEXT: 3,
      };

      $scope.mode = $scope.Type.NONE;

      /**
       * Switch to none mode.
       */
      $scope.noneMode = function() {
        $scope.mode = $scope.Type.NONE;
        pdfViewer.annotationEditorMode = {mode: pdfjsLib.AnnotationEditorType.NONE};
      };

      /**
       * Switch to ink mode.
       */
      $scope.inkMode = function() {
        $scope.mode = $scope.Type.INK;
        pdfViewer.annotationEditorMode = {mode: pdfjsLib.AnnotationEditorType.INK};
      };

      /**
       * Switch to highlight mode.
       */
      $scope.highlightMode = function() {
        $scope.mode = $scope.Type.HIGHLIGHT;
        pdfViewer.annotationEditorMode = {mode: pdfjsLib.AnnotationEditorType.HIGHLIGHT};
      };

      /**
       * Switch to freetext mode.
       */
      $scope.freetextMode = function() {
        $scope.mode = $scope.Type.FREETEXT;
        pdfViewer.annotationEditorMode = {mode: pdfjsLib.AnnotationEditorType.FREETEXT};
      };

      /**
       * Discard the edited file.
       */
      $scope.cancel = function () {
        $uibModalInstance.close($stateParams.fileId);
      };

      /**
       * Submit the file as a new version.
       */
      $scope.submit = function() {
        pdfViewer.pdfDocument.saveDocument().then(function(data) {
          const editedFile = new File([data], $scope.file.name, {type: $scope.file.mimetype});
          const file = $scope.file;
          const previousFileId = file.id;
          file.id = undefined;
          file.progress = 0;
          file.create_date = new Date().getTime();
          file.version++;
          // Upload the file
          file.status = $translate.instant('document.view.content.upload_progress');
          return Upload.upload({
            method: 'PUT',
            url: '../api/file',
            file: editedFile,
            fields: {
              id: $stateParams.id,
              previousFileId: previousFileId
            }
          })
          .progress(function(e) {
            file.progress = parseInt(100.0 * e.loaded / e.total);
          })
          .success(function(data) {
            // Update local model with real data
            file.id = data.id;
            file.size = data.size;
            // New file uploaded, increase used quota
            $rootScope.userInfo.storage_current += data.size;
            $uibModalInstance.close(file.id);
          })
          .error(function(data) {
            file.status = $translate.instant('document.view.content.upload_error');
            if (data.type === 'QuotaReached') {
              file.status += ' - ' + $translate.instant('document.view.content.upload_error_quota');
            }
            $uibModalInstance.close($stateParams.fileId);
          });
        });
      };
    });
  });

  /**
   * Return true if we can display the preview image.
   */
  $scope.canDisplayPreview = function () {
    return $scope.file && $scope.file.mimetype !== 'application/pdf';
  };
});