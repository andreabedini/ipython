'use strict';

angular.module('myApp')
    .factory('Kernel', function ($http, $q, $rootScope, uuid) {
        var base_url = '/kernels',
            kernel_url = null,
            // Websocket channels
            shell_channel = null,
            iopub_channel = null,
            stdin_channel = null;

        // helper functions
        function get_kernel_url(kernel_id) {
            return base_url + "/" + kernel_id;
        }

        function get_ws_url(kernel_id) {
            return location.protocol.replace('http', 'ws')
                + "//"
                + location.host
                + base_url
                +
                '/'
                + kernel_id;
        }

        function setup_channels(ws_url) {
            shell_channel = new WebSocket(ws_url + "/shell");
            stdin_channel = new WebSocket(ws_url + "/stdin");
            iopub_channel = new WebSocket(ws_url + "/iopub");

            var promises = [ shell_channel, stdin_channel, iopub_channel ]
                    .map(function (channel) {
                        var deferred = $q.defer();

                        channel.onmessage = function (e) {
                            var message = JSON.parse(e.data);
                            $rootScope.$apply($rootScope.$broadcast(message.header.msg_type, message));
                        };

                        channel.opclose = function() {
                            console.log("Channel died");
                        };

                        channel.onopen = function () {
                            $rootScope.$apply(function () {
                                deferred.resolve(channel);
                            });
                        };

                        return deferred.promise;
                    });

            return $q.all(promises);
        };

        $rootScope.$on("status", function (event, message) {
            Kernel.status = message.content.execution_state;
        });

        // object
        var Kernel = {
            kernel_id: null,
            username: "username",
            running: false,
            session_id: uuid()
        }

        Kernel.start = function (notebook_id) {
            this.stop_channels();
            var promise = $http.post(base_url, null, {
                params: { notebook: notebook_id }
            })
            .then(function (response) {
                var kernel_id = response.data.kernel_id;
                Kernel.running = true;
                Kernel.kernel_id = kernel_id;

                kernel_url = get_kernel_url(kernel_id);
                var ws_url = get_ws_url(kernel_id);
                var promise = setup_channels(ws_url);
                return promise;
            })
            .then(function (channels) {
                // all channels are open, send session_id
                channels.forEach(function (channel) {
                    channel.send(Kernel.session_id + ":");
                })
                return Kernel;
            });
            return promise;
        }

        Kernel.stop_channels = function () {
            [ shell_channel, stdin_channel, iopub_channel ]
            .forEach(function (channel) {
                if (channel)
                    channel.close();
            })
            this.running = false;
            this.shell_channel = this.iopub_channel = this.stdin_channel = null;
        }

        Kernel.send_message = function (msg_type, content, metadata) {
            var msg = Kernel.compose_message(msg_type, content, metadata);
            return Kernel.send_shell(msg)
        };

        Kernel.compose_message = function (msg_type, content, metadata) {
            return {
                header : {
                    msg_id : uuid(),
                    username : this.username,
                    session : this.session_id,
                    msg_type : msg_type
                },
                content : content || {},
                metadata : metadata || {},
                parent_header : {}
            }
        }

        Kernel.send_shell = function (message) {
            shell_channel.send(JSON.stringify(message))
            return message.header.msg_id;
        }

        Kernel.execute = function (code, callbacks, options) {
            var content = {
                code : code,
                silent : false,
                store_history : true,
                user_variables : [],
                user_expressions : {},
                allow_stdin : false
            };
            angular.extend(content, options)
            return Kernel.send_message("execute_request", content);
        };

        Kernel.shutdown = function () {
            return Kernel.send_message("shutdown_request", { restart: false });
        };

        Kernel.restart  = function () {
            return Kernel.send_message("shutdown_request", { restart: true });
        };

        return Kernel;
    });