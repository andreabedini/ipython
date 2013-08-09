'use strict';

angular.module('myApp').
    controller('NotebookCtrl', function($scope, $routeParams, Completion, Kernel, LocalStorage) {
		var notebook_id = $routeParams.notebook_id;
        console.log("Starting a kernel for notebook_id: " + notebook_id)

        Kernel.start(notebook_id).then(function (kernel) {
            console.log("[NotebookCtrl] Kernel started");
            $scope.kernel = kernel;
        });

        // define what an empty notebook looks like
        var empty_notebook = {
            selected_cell: 0,
            cells: [ {
                input: ""
            }]
        };

        // load the notebook from the storage or use the empty one
        $scope.notebook = LocalStorage.load(notebook_id);
        if ($scope.notebook == null) {
            $scope.notebook = angular.extend({}, empty_notebook);
        }

        $scope.Save = function() {
            $scope.notebook.last_saved = new Date();
            LocalStorage.save(notebook_id, $scope.notebook);
        };

        //
        // notebook manipulation functions
        //
        function create_new_cell () {
            return angular.extend({}, {
                input: { code: null, execution_count: null },
            })
        }

        $scope.selectPreviousCell = function () {
            var index = $scope.notebook.selected_cell;
            if (index > 0) {
                index = index - 1;
            }
        }

        $scope.selectNextCell = function () {
            var index = $scope.notebook.selected_cell;
            if (index < $scope.notebook.cells.length - 1) {
                index = index + 1;
            }
        }

        $scope.moveCellUp = function () {
            var index = $scope.notebook.selected_cell;
            if (index > 0) {
                var tmp = $scope.notebook.cells[index - 1];
                $scope.notebook.cells[index - 1] = $scope.notebook.cells[index];
                $scope.notebook.cells[index] = tmp;
                $scope.notebook.selected_cell = $scope.notebook.selected_cell - 1;
            }
        };

        $scope.moveCellDown = function () {
            var index = $scope.notebook.selected_cell;
            if (index < $scope.notebook.cells.length - 1) {
                var tmp = $scope.notebook.cells[index + 1];
                $scope.notebook.cells[index + 1] = $scope.notebook.cells[index];
                $scope.notebook.cells[index] = tmp;
                $scope.notebook.selected_cell = $scope.notebook.selected_cell + 1;
            }
        };

        $scope.insertCellAbove = function () {
            var index = $scope.notebook.selected_cell;
            $scope.notebook.cells.splice(index, 0, create_new_cell());
        };

        $scope.insertCellBelow = function () {
            var index = $scope.notebook.selected_cell;
            $scope.notebook.cells.splice(index + 1, 0, create_new_cell());
            $scope.notebook.selected_cell = $scope.notebook.selected_cell + 1;
        };

        $scope.deleteCell = function () {
            var index = $scope.notebook.selected_cell;
            $scope.notebook.cells.splice(index, 1);
        };

        $scope.runCell = function () {
            var index = $scope.notebook.selected_cell;
            $scope.$broadcast('notebook_execute', { index: index });
            if (index == $scope.notebook.cells.length - 1)
                $scope.insertCellBelow();
            else   
                $scope.notebook.selected_cell ++;
        };

        //
        // CodeMirror hinter function, glued to the completion service 
        // 
        function hinter (editor, callback, options) {
            var cur = editor.getCursor();
            var line = editor.getLine(cur.line);
            var token = editor.getTokenAt(cur);
            Completion.complete({
                text: '',
                line: line,
                cursor_pos: cur.ch
            }).then(function (message) {
                var match_start = line.lastIndexOf(message.matched_text);
                if (match_start == -1)
                    throw "matched_text doesn't match!";
                var match_end = match_start + message.matched_text.length;                                
                callback({
                    list: message.matches,
                    from: { line: cur.line, ch: match_start },
                    to: { line: cur.line, ch: match_end }
                });
            });
        }

        $scope.editorOptions = {
            lineWrapping : true,
            mode: 'python',
            extraKeys: { 
                'Shift-Enter': function() { 
                    $scope.runCell();
                },
                'Tab': function(cm) {
                    CodeMirror.showHint(cm, hinter, { async: true });
                 }
             }
        };
    })
    .controller('CellCtrl', function($scope, $routeParams, Kernel) {
        $scope.message_id = null;

        function new_output(output) {
            if ($scope.cell.outputs === undefined)
                $scope.cell.outputs = [];
            $scope.cell.outputs.push(output);
        }

        function clear() {
            delete $scope.cell['stderr'];
            delete $scope.cell['stdout'];
            delete $scope.cell['outputs'];
            delete $scope.cell['error'];
        }

        $scope.execute_cell = function () {
            var code = $scope.cell.input.code;
            $scope.message_id = Kernel.execute(code);
            clear();
        }

        // message from the notebook (to start the evaluation)
        $scope.$on('notebook_execute', function (event, message) {
            if (message.index == $scope.$index) {
                $scope.execute_cell();
            }
        });

        // messages from the kernel (with output)

        $scope.$on('status', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
            }
        });

        $scope.$on('execute_reply', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
                $scope.cell.input.execution_count = message.content.execution_count; 
            }
        });

        $scope.$on('stream', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
                $scope.cell[message.content.name] = message.content.data;
            }
        });

        $scope.$on('pyin', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
            }
        });

        $scope.$on('pyout', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
                new_output(message.content);
            }
        });

        $scope.$on('pyerr', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
                $scope.cell.error = message.content;
            }
        });

        $scope.$on('display_data', function (event, message) {
            if (message.parent_header.msg_id == $scope.message_id) {
                new_output(message.content);
            }
        });
    });
