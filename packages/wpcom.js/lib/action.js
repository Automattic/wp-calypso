
/**
 * Module dependencies.
 */

var req = require('request');
var qs = require('querystring');
var debug = require('debug')('wp-connect:action');

/**
 * Action methods
 *
 * @param {String} type
 * @param {Object} options
 * @param {WPCONN} wpconn
 * @api public
 */

function Action(type, options, wpconn){
  this.options = options = {};
  this.wpconn = wpconn;
}

/**
 * Add method
 *
 * @param {String} pid
 * @api public
 */

Action.prototype.get = function(pid, rid, opts, fn){
  var set = {
    site: rid,
    post_ID: pid
  };

  this.wpconn.req('post', set, opts, fn);
};

/**
 * Add method
 *
 * @param {Object} data
 * @param {String} rid
 * @param {Object} opts
 * @param {Function} fn
 * @api public
 */

Action.prototype.add = function(data, rid, fn){
  this.wpconn.req('post_add', { site: rid }, { method: 'post', data: data }, fn);
};

/**
 * Expose `Action` module
 */

module.exports = Action;
