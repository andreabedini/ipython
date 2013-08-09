'use strict';

angular.module('myApp')
    .filter('fixCarriageReturn', function() {
        // Remove chunks that should be overridden by the effect of
        // carriage return characters
        return function (txt) {
            var tmp = txt || "";
            do {
                txt = tmp;
                tmp = txt.replace(/\r+\n/gm, '\n'); // \r followed by \n --> newline
                tmp = tmp.replace(/^.*\r+/gm, '');  // Other \r --> clear line
            } while (tmp.length < txt.length);
            return txt;
        }            
    });
