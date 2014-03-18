
/**
 * Module dependencies.
 */

var req = require('./req');
var debug = require('debug')('wp-connect:action');

/**
 * Action methods
 *
 * @param {String} type
 * @param {WPCONN} wpconn
 * @api public
 */

function Action(type, wpconn){
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

  opts.token = opts.token || this.wpconn.opts.token;
  req('post', set, opts, fn);
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
  var opts = { method: 'post', data: data };
  opts.token = opts.token || this.wpconn.opts.token;

  req('post_add', { site: rid }, opts, fn);
};

/**
 * Expose `Action` module
 */

module.exports = Action;
