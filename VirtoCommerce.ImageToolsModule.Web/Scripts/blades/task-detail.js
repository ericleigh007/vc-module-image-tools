﻿angular.module('virtoCommerce.imageToolsModule')
    .controller('virtoCommerce.imageToolsModule.taskDetailController', ['$rootScope', '$scope', 'platformWebApp.bladeNavigationService', 'virtoCommerce.imageToolsModule.taskApi', 'virtoCommerce.imageToolsModule.optionApi', 'platformWebApp.dialogService', function ($rootScope, $scope, bladeNavigationService, taskApi, optionApi, dialogService) {
        var blade = $scope.blade;
        
        blade.refresh = function (parentRefresh) {
            optionApi.search({
                skip: 0
            }, function (data) {
                blade.optionList = data.result;
            });

            if (blade.isNew) {
                initializeBlade({});
            } else {
                taskApi.get({ id: blade.currentEntityId }, function (data) {
                    initializeBlade(data);
                    if (parentRefresh) {
                        blade.parentBlade.refresh();
                    }
                });
            }
        };

        function initializeBlade(data) {
            blade.item = angular.copy(data);
            blade.currentEntity = blade.item;
            blade.origEntity = data;
            blade.isLoading = false;
        };

        function isDirty() {
            return !angular.equals(blade.currentEntity, blade.origEntity) && blade.hasUpdatePermission();
        };

        function canSave() {
            return isDirty() && blade.formScope && blade.formScope.$valid;
        }

        function saveChanges() {
            blade.isLoading = true;
            var promise = saveOrUpdate();
            promise.catch(function (error) {
                bladeNavigationService.setError('Error ' + error.status, blade);
            }).finally(function () {
                blade.isLoading = false;
            });
        };

        function saveOrUpdate() {
            if (blade.isNew) {
                return taskApi.save(blade.currentEntity,
                    function (data) {
                        blade.isNew = false;
                        blade.currentEntityId = data.id;
                        blade.refresh(true);
                    }).$promise;
            } else {
                return taskApi.update(blade.currentEntity,
                    function () {
                        blade.refresh(true);
                    }).$promise;
            }
        }

        blade.onClose = function (closeCallback) {
            bladeNavigationService.showConfirmationIfNeeded(isDirty(), canSave(), blade, saveChanges, closeCallback, "imageTools.dialogs.task-save.title", "imageTools.dialogs.task-save.message");
        };

        blade.formScope = null;
        $scope.setForm = function (form) { blade.formScope = form; }

        blade.toolbarCommands = [
            {
                name: "platform.commands.save",
                icon: 'fa fa-save',
                executeMethod: function () {
                    saveChanges();
                },
                canExecuteMethod: function () {
                    return canSave();
                }
            },
            {
                name: "platform.commands.reset",
                icon: 'fa fa-undo',
                executeMethod: function () {
                    blade.item = angular.copy(blade.origEntity);
                    blade.currentEntity = blade.item;
                },
                canExecuteMethod: function () {
                    return isDirty();
                }
            },
            {
                name: "imageTools.commands.run",
                icon: 'fa fa-exclamation',
                executeMethod: function () {
                    taskRun(blade.currentEntityId);
                },
                canExecuteMethod: function () {
                    return !blade.isNew;
                }
            },
            {
                name: "platform.commands.delete",
                icon: 'fa fa-trash-o',
                executeMethod: function () {
                    deleteTask();
                },
                canExecuteMethod: function () {
                    return !blade.isNew;
                }
            }
        ];

        function taskRun(taskId) {
            var dialog = {
                id: "confirmTaskRun",
                callback: function (regenerate) {
                    var request = {
                        taskIds: [taskId],
                        regenerate: regenerate
                    };

                    taskApi.taskRun(request, function (notification) {
                            var newBlade = {
                                id: 'thumbnailProgress',
                                notification: notification,
                                controller: 'virtoCommerce.imageToolsModule.taskRunController',
                                template: 'Modules/$(VirtoCommerce.ImageTools)/Scripts/blades/task-progress.tpl.html'
                            };

                            $scope.$on("new-notification-event", function (event, notification) {
                                if (notification && notification.id == newBlade.notification.id) {
                                    blade.canImport = notification.finished != null;
                                }
                            });

                            bladeNavigationService.showBlade(newBlade, blade.parentBlade || blade);
                        }, function (error) {
                            bladeNavigationService.setError('Error ' + error.status, blade);
                        }
                    );
                }
            }

            dialogService.showDialog(dialog, 'Modules/$(VirtoCommerce.ImageTools)/Scripts/dialogs/run-dialog.tpl.html', 'platformWebApp.confirmDialogController');
        }

        function folderPath(folderPath) {
            if (folderPath && folderPath.length === 1 && folderPath[0].type === 'folder') {
                blade.currentEntity.workPath = folderPath[0].relativeUrl;
            } else {

            }
        }

        function deleteTask() {
            var dialog = {
                id: "confirmDelete",
                title: "imageTools.dialogs.task-delete.title",
                message: "imageTools.dialogs.task-delete.message",
                callback: function (remove) {
                    if (remove) {
                        blade.isLoading = true;
                        taskApi.delete({ ids: blade.currentEntityId }, function() {
                            bladeNavigationService.closeBlade(blade, function() {
                                blade.parentBlade.refresh();
                            });
                        });
                    };
                }
            }
            dialogService.showConfirmationDialog(dialog);
        }

        blade.openFolderPath = function () {
            var newBlade = {
                title: 'imageTools.blades.setting-managment.title',
                subtitle: 'imageTools.blades.setting-managment.subtitle',
                onSelect: folderPath,
                controller: 'platformWebApp.assets.assetSelectController'
            };
            bladeNavigationService.showBlade(newBlade, blade);
        };

        blade.openSettingManagement = function () {
            var newBlade = {
                id: 'optionListDetail',
                currentEntityId: blade.currentEntityId,
                title: 'imageTools.blades.setting-managment.title',
                subtitle: 'imageTools.blades.setting-managment.subtitle',
                controller: 'virtoCommerce.imageToolsModule.optionListController',
                template: 'Modules/$(VirtoCommerce.ImageTools)/Scripts/blades/option-list.tpl.html'
            };
            bladeNavigationService.showBlade(newBlade, blade);
        };

        blade.refresh();

    }]);
