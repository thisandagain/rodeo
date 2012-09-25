/**
 * Test suite
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var async   = require('async'),
    test    = require('tap').test,

    target  = require(__dirname + '/../lib/util.js');

/**
 * Suite
 */
async.auto({

    stringify:  function (callback) {
        target.stringify({
            foo: "bar",
            arr: ["one", "two", "three"]
        }, callback);
    },

    parse:      function (callback) {
        target.parse('{"foo":"bar"}', callback);
    },

    err:        function (callback) {
        target.parse({
            foo: "bar",
            arr: ["one", "two", "three"]
        }, function (err, obj) {
            callback(obj, err);     // Reverse
        });
    },

    test:   ['stringify', 'parse', 'err', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(target, "object", "Component should be an object");
            t.type(target.stdout, "function", "Method should be a function");
            t.type(target.stringify, "function", "Method should be a function");
            t.type(target.parse, "function", "Method should be a function");
            t.end();
        });

        test("stringify", function (t) {
            t.type(obj.stringify, "string", "Results should be a string");
            t.end();
        });

        test("parse", function (t) {
            t.type(obj.parse, "object", "Results should be an object");
            t.end();
        });

        test("err", function (t) {
            t.type(obj.err, "string", "Results should be a string");
            t.end();
        });

        callback();
    }]

}, function (err, obj) {
    test("Catch errors", function (t) {
        t.equal(err, null, "Errors should be null");
        t.end();
        process.exit();
    });
});