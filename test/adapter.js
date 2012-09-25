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

    target  = require(__dirname + '/../lib/adapter.js');

/**
 * Suite
 */
async.auto({

    create: function (callback) {
        new target({
            port:       null,
            host:       null,
            pass:       null,
            options:    null
        }, callback);
    },

    test:   ['create', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(target, "function", "Component should be a function");
            t.end();
        });

        test("Create", function (t) {
            t.type(obj.create, "object", "Results should be an object");
            t.type(obj.create.stream, "object", "Result should be an object");
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