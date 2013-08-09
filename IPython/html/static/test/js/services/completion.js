'use strict';

angular.module('myApp')
    .factory('Completion', function ($q, $rootScope, Kernel) {
        var deferreds = {};

        var Completion = {};

        $rootScope.$on('complete_reply', function (event, message) {
            var id = message.parent_header.msg_id;
            if (deferreds[id] !== undefined) {
                if (message.content.status == 'ok') {
                    $rootScope.$apply(deferreds[id].resolve(message.content));
                } else {
                    $rootScope.$apply(deferreds[id].reject());
                }
                delete deferreds[id];
            }
        });

        Completion.complete = function (info) {
            var message = Kernel.compose_message('complete_request', info);
            deferreds[message.header.msg_id] = $q.defer();
            Kernel.send_shell(message);
            return deferreds[message.header.msg_id].promise;
        }

        return Completion;
    });