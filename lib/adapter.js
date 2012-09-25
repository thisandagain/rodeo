/**
 * Redis connection adapter.
 *
 * @package rodeo
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var redis   = require('redis');

/**
 * Creates a redis client using the provided connection arguments.
 *
 * @param {Object} Connection arguments
 *
 * @return {Object}
 */
function Adapter (arg, callback) {
    // Normalize types
    for (var item in arg) {
        arg[item] = (arg[item] === 'null') ? null : arg[item];
        arg[item] = (item === 'port') ? Number(arg[item]) : arg[item];
    }

    // Create client
    var client = redis.createClient(arg.port, arg.host, arg.options);

    // Authenticate
    if (arg.pass !== null) {
        client.auth(arg.pass, function (err, obj) {
            callback(err, client);
        });
    } else {
        callback(null, client);
    }
};

/**
 * Export
 */
module.exports = Adapter;
