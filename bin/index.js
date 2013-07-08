#!/usr/bin/env node

/**
 * Command line interface for rodeo.
 *
 * @package rodeo
 * @author Andrew Sliwinski
 */

/**
 * Dependencies
 */
var rodeo   = require('../lib/index');

var _       = require('lodash'),
    argv    = require('optimist')
                    .usage('Pipes a message body to a rodeo notification.\nUsage: cat message.json | $0 --target [string] --persist')
                    .alias('t', 'target')
                    .describe('t', 'Notification target. Defaults to null.')
                    .default('t', null)
                    .alias('p', 'persist')
                    .describe('p', 'Notification persistence flag. Defaults to false.')
                    .boolean('p')
                    .argv;

/**
 * Environment defaults
 */
_.defaults(process.env, {
    'RODEO_CLI_HOST': '127.0.0.1',
    'RODEO_CLI_PORT': '6379',
    'RODEO_CLI_PASS': ''
});

/**
 * Pipe (buffer) handler
 */
var stdin = '';
process.stdin.resume();

process.stdin.on('data', function (data) { 
    stdin += data;
});

process.stdout.on('error', function (err) {
    if (err.code === 'EPIPE') return process.exit();
    process.emit('error', err);
});

/**
 * Rodeo interface
 */
process.stdin.on('end', function () {
    // Attempt to parse buffer as JSON
    try {
        stdin = JSON.parse(stdin);
    } catch (e) {}

    // Target safety outside of localhost
    if (process.env.RODEO_CLI_HOST !== '127.0.0.1' && argv.target === null) {
        console.log('A target of "null" is not permitted when using the CLI on host ' + process.env.RODEO_CLI_HOST);
        return setTimeout(process.exit, 100);
    }

    // Bind to redis pub/sub and submit notification
    rodeo.listen({
        host: process.env.RODEO_CLI_HOST,
        port: Number(process.env.RODEO_CLI_PORT),
        pass: (process.env.RODEO_CLI_PASS === '') ? null : process.env.RODEO_CLI_PASS
    }, function (err) {
        if (err) throw new Error(err);

        // Submit notification
        rodeo.submit({
            target:     argv.target,
            persist:    argv.persist,
            message:    stdin
        }, function (err) {
            if (err) throw new Error(err);
            console.log('Notification sent!');
            setTimeout(process.exit, 100);
        });
    });
});