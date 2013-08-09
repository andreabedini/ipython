'use strict';

angular.module('myApp')
    .directive('outputCell', function() {
        // utility function
        function choose_content_type(output) {
            var display_order = [
                'image/svg+xml', 'image/png', 'image/jpeg',
                'text/latex', 'text/html', 'text/plain'
            ];
            for (var type_i in display_order) {
                var type = display_order[type_i];
                if (type in output) {
                    return type;
                }
            }
        }

        // embed incoming data into a sandboxed iframe inside element
        // reading list
        // http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
        // http://weblog.bocoup.com/third-party-javascript-development-future/
        //
        // automatic sizing and tons of other stuff can be done with html5 postMessage
        //
        function create_sandbox(element, data) {
            var html = '<div class="output-area" class="output-html">'
                + data + '</div></div>';
            var iframe = angular.element('<iframe>')
                .attr('sandbox', 'allow-scripts')
                .attr('seamless', '')
                .attr('srcdoc', html);
            element.append(iframe);
        }

        // This doesn't work. At least because MathJax is doing cross-site AJAX.
        function create_sandbox_with_mathjax(element, data) {
            var mathjs = '<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js"></script>';
            create_sandbox(element, mathjs + data)            
        }

        function create_image(element, data, content_type) {
            var toinsert = angular.element("<img/>")
                .attr("src", "data:" + content_type + ";base64," + data);
            element.append(toinsert);
        }

        function create_text_box(element, data) {
            var toinsert = angular.element("<div/>")
                .addClass("output-area")
                .addClass("output-text");
            toinsert.text(data);
            element.append(toinsert);
        }

        var content_type_mapping = {
            'text/html': create_sandbox,
            'text/latex': create_sandbox_with_mathjax,
            'text/plain': create_text_box,
            'image/png': create_image,
            'image/jpeg': create_image,
        }

        // Runs during compile
        return {
            restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            link: function($scope, $element, $attributes) {
                $scope.$watch('output', function(output) {
                    if (output) {
                        var content_type = choose_content_type(output.data);
                        var data = output.data[content_type];
                        content_type_mapping[content_type]($element, data, content_type);
                    } else {
                        $element.html('');
                    }
                });
            }
        };
    });
