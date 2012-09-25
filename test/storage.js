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
    redis   = require('redis'),

    target  = require(__dirname + '/../lib/storage.js');

var client  = new target(redis.createClient());

/**
 * Utility
 */
function rand (len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i = 0; i < len; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    
    return randomstring;
}

/**
 * Suite
 */
async.auto({

    set:  function (callback) {
        client.set('test::user', 'foo', {'hello':'world'}, callback);
    },

    
    get:    ['set', function (callback) {
        client.get('test::user', 'foo', callback);
    }],
    
    load:   function (callback) {
        var a = [];

        for (var i = 0; i < 50; i++) {
            a.push({
                key:    rand(24),
                value:  {
                    'foo': rand(200)
                }
            });
        }

        async.forEach(a, function (obj, callback) {
            client.set('test::user', obj.key, obj.value, callback);
        }, callback);
    },

    all:    ['load', function (callback) {
        client.all('test::user', callback);
    }],

    del:    ['set', 'get', 'load', 'all', function (callback) {
        client.del('test::user', 'foo', callback);
    }],

    delall: ['del', function (callback) {
        client.delall('test::user', callback);
    }],

    test:   ['delall', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(client, "object", "Component should be an object");
            t.type(client.all, "function", "Method should be a function");
            t.type(client.get, "function", "Method should be a function");
            t.type(client.set, "function", "Method should be a function");
            t.type(client.del, "function", "Method should be a function");
            t.end();
        });

        test("set method", function (t) {
            t.type(obj.set, "string", "Results should be a string");
            t.equal(obj.set, "OK", "Result should be 'OK'");
            t.end();
        });

        test("get method", function (t) {
            t.type(obj.get, "object", "Results should be an object");
            t.end();
        });

        test("all method", function (t) {
            t.type(obj.all, "object", "Results should be an object");
            t.equal(obj.all.length, 51, "Results should be of the proper length");
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