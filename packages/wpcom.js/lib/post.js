
/**
 * Module dependencies.
 */

var req = require('./req');
var debug = require('debug')('wp-connect:action');

/**
 * Post methods
 *
 * @param {WPCONN} wpconn
 * @api public
 */

function Post(wpconn){
  this.wpconn = wpconn;
}

/**
 * Add method
 *
 * @param {String} id
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Post.prototype.get = function(id, params, fn){
  // params || fn
  fn = fn || params;
  params = 'function' == typeof params ? {} : (params || {});

  // pass token value in params object
  params.token = this.wpconn.tkn;

  // set endpoint
  var set = {
    site: this.wpconn.site._id,
    post_ID: id
  };

  req('post', set, params, fn);
};

/**
 * Add method
 *
 * @param {Object} data
 * @param {String} rid
 * @param {Object} params
 * @param {Function} fn
 * @api public
 */

Post.prototype.add = function(data, fn){
  // set endpoint
  var set = { site: this.wpconn.site._id };

  var params = {
    token: this.wpconn.tkn,
    method: 'post',
    data: data
  };

  req('post_add', set, params, fn);
};

/**
 * Expose `Post` module
 */

module.exports = Post;
