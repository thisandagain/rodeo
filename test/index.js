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

    target  = require(__dirname + '/../lib/index.js');

var id, uid;

/**
 * Suite
 */
async.auto({

    event:  function (callback) {
        target.on('message', function (data) {
            id  = data.id;
            uid = data.target;
            callback(null, data);
        });
    },

    listen: function (callback) {
        target.listen({}, callback);
    },

    submit: ['listen', function (callback) {
        setTimeout(function () {
            target.submit({
                target: 'test::1',
                persist: true,
                message: 'This is only a test.'
            }, callback);
        }, 100);
    }],

    read:   ['event', function (callback) {
        target.read(uid, id, callback);
    }],

    remove: ['read', function (callback) {
        target.dismiss(uid, id, callback);
    }],

    test:   ['listen', 'event', 'submit', 'read', 'remove', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(target, "object", "Component should be an object");
            t.type(target.listen, "function", "Method should be a function");
            t.type(target.submit, "function", "Method should be a function");
            t.type(target.destroy, "function", "Method should be a function");
            t.end();
        });

        test("Listen", function (t) {
            t.type(obj.listen, "object", "Response is an object.");
            t.end();
        });

        test("Event", function (t) {
            t.type(obj.event, "object", "Response is an object.");
            t.equal(obj.event.message, "This is only a test.", "Expected result");
            t.end();
        });

        test("Submit", function (t) {
            t.type(obj.submit, "object", "Response is an object.");
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