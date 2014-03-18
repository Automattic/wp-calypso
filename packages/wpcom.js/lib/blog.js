
/**
 * Module dependencies.
 */

var req = require('./req');
var debug = require('debug')('wp-connect:blog');

/**
 * Create a Blog instance
 *
 * @param {String} token (optional)
 * @param {WPCONN} wpconn
 * @api public
 */

function Blog(token, wpconn){
  if (!(this instanceof Blog)) return new Blog(token, wpconn);

  if (!token) {
    debug('WARN: token is not defined');
  }

  this.token = token;
}

/**
 * Expose `Blog` module
 */

module.exports = Blog;
