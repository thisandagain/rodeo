/**
 * Notifications service core.
 *
 * @package rodeo
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var _       = require('lodash'),
    async   = require('async'),
    events  = require('events'),
    uuid    = require('node-uuid');

var Adapter = require('./adapter'),
    Util    = require('./util'),
    Storage = require('./storage');

/**
 * Constructor
 */
function Rodeo () {
    var self = this;

    // Setup
    self.ns         = 'rodeo';
    self.pub        = null;
    self.sub        = null;
    self.store      = null;

    /**
     * Creates redis connection clients.
     *
     * @param {Object} Connection arguments
     *
     * @return {Err}
     */
    self.connect    = function (arg, callback) {
        _.defaults(arg, {
            port:       null,
            host:       null,
            pass:       null,
            options:    null
        });

        async.auto({
            connect:        function (callback) {
                var a = [];
                async.forEach([0,1,2], function (obj, callback) {
                    new Adapter(arg, function (err, b) {
                        a[obj] = b;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, a);
                });
            },

            assign:         ['connect', function (callback, obj) {
                self.store  = new Storage(obj.connect[0]);
                self.pub    = obj.connect[1];
                self.sub    = obj.connect[2];
                callback(null);
            }],
        }, callback);
    };

    /**
     * Subscription "message" event handler.
     *
     * @param {String} Channel
     * @param {String} Notice (JSON String)
     *
     * @return {void}
     */
    self.listener   = function (channel, data) {
        Util.parse(data, function (err, obj) {
            if (err) return Util.stdout(err);

            try {
                self.emit('message', obj);
            } catch (err) {
                Util.stdout(err);
            }
        });
    };
};

/**
 * Inherit event emitter.
 */
require('util').inherits(Rodeo, events.EventEmitter);

/**
 * Start listening for connections with the specified connection arguments.
 *
 * @param {Object} Connection arguments
 *
 * @return {Error}
 */
Rodeo.prototype.listen = function (arg, callback) {
    var self = this;

    if (_.isUndefined(callback)) {
        callback    = arg;
        arg         = {};
    };

    async.auto({
        connect:    function (callback) {
            if (self.pub === null || self.sub === null || self.store === null) {
                self.connect(arg, callback);
            } else {
                callback();
            }
        },

        pubsub:     ['connect', function (callback) {
            self.sub.subscribe(self.ns);
            self.sub.on('message', self.listener);
            callback(null);
        }]
    }, callback);
};

/**
 * Destroy the redis subscription(s).
 *
 * @return {Error}
 */
Rodeo.prototype.destroy = function (callback) {
    var self = this;

    try {
        self.sub.unsubscribe();
        self.pub.end();
        self.sub.end();
        callback(null);
    } catch (err) {
        Util.stdout(err);
    }
};

/**
 * Submits a new notification.
 *
 * @param {Object} Notification
 *                  - persist {Boolean, Default=false}
 *                  - target {String, Default=null}
 *                  - message {String, Required}
 * @param {Object, Optional} Connection arguments
 *
 * @return {Error}
 */
Rodeo.prototype.submit = function (notice, arg, callback) {
    var self = this;

    if (_.isUndefined(callback)) {
        callback    = arg;
        arg         = {};
    };

    async.auto({
        connect:     function (callback) {
            if (self.pub === null || self.sub === null || self.store === null) {
                self.connect(arg, callback);
            } else {
                callback();
            }
        },
        submit:     ['connect', function (callback) {
            // Defaults
            _.defaults(notice, {
                id:         uuid.v4(),                  // Assign uuid
                stamp:      new Date().toJSON(),        // Timestamp
                persist:    false,
                read:       false,
                target:     null,
                message:    null
            });

            // Normalize typing
            notice.persist  = (notice.persist === 'true' || notice.persist === true) ? true : false;
            notice.target   = (notice.target === '') ? null : notice.target;

            // Persist
            if (notice.persist && notice.target !== null) {
                self.store.set(notice.target, notice.id, notice, Util.stdout);
            }

            // If no message is specified, drop the request
            if (notice.message === null || notice.message === '') {
                return callback('No message was specified.');
            }

            // Hash notice and publish to redis store
            async.auto({
                encode:     function (callback) {
                    Util.stringify(notice, callback);
                },

                publish:    ['encode', function (callback, obj) {
                    self.pub.publish(self.ns, obj.encode);
                    callback(null);
                }]
            }, callback);
        }]
    }, callback);
};

/**
 * Returns all notifications for a specified target.
 *
 * @param {String} User id (ie: target)
 *
 * @return {Array}
 */
Rodeo.prototype.all = function (uid, callback) {
    var self = this;
    self.store.all(uid, callback);
};

/**
 * Modifies the "read" flag of a notification.
 *
 * @param {String} User id (ie: target)
 * @param {String} Notification id
 *
 * @return {Error}
 */
Rodeo.prototype.read = function (uid, id, callback) {
    var self = this;
    self.store.get(uid, id, function (err, obj) {
        if (err) {
            return callback(err);
        } else {
            obj.read = true;
            self.store.set(uid, id, obj, callback);
        }
    });
};

/**
 * Dismisses (deletes) a persistent notification.
 *
 * @param {String} User id (ie: target)
 * @param {String} Notification id
 *
 * @return {Error}
 */
Rodeo.prototype.dismiss = function (uid, id, callback) {
    var self = this;
    self.store.del(uid, id, callback);
};

/**
 * Export
 */
module.exports = new Rodeo();
