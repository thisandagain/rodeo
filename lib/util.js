/**
 * "Safe" utility methods.
 *
 * @package rodeo
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Constructor
 */
function Util () {};

/**
 * Prints input to stdout.
 *
 * @param {Object} Input
 *
 * @return {void}
 */
Util.prototype.stdout = function (input) {
    if (input) {
        console.log('Rodeo: ' + input.toString());
    }
};

/**
 * Safe object to JSON string encoder.
 *
 * @param {Object} Input
 *
 * @return {String}
 */
Util.prototype.stringify = function (obj, callback) {
    try {
        callback(null, JSON.stringify(obj));
    } catch (err) {
        callback(err);
    }
};

/**
 * Safe JSON string to object decoder.
 *
 * @param {String} Input
 *
 * @return {Object}
 */
Util.prototype.parse = function (obj, callback) {
    try {
        callback(null, JSON.parse(obj));
    } catch (err) {
        callback('Invalid JSON');
    }
};

/**
 * Export
 */
module.exports = new Util();