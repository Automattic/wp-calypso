
/**
 * Module dependencies.
 */

var req = require('./req');
var debug = require('debug')('wp-connect:blog');

/**
 * Create a Blog instance
 *
 * @param {String} token
 * @param {WPCONN} wpconn
 * @api public
 */

function Blog(token, wpconn){
  if (!(this instanceof Blog)) return new Blog(token, wpconn);

  if (!token) {
    return new Error("`token` parameter must be defined");
  }

  this.token = token;

  return this;
}
