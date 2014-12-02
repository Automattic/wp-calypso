
/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:users');

/**
 * Create a `Users` instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Users(wpcom) {
  if (!(this instanceof Users)) {
    return new Users(wpcom);
  }

  this.wpcom = wpcom;
}

/**
 * A list of @mention suggestions for the current user
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Users.prototype.suggest = function (query, fn) {
  return request.get(this.wpcom, null, '/users/suggest', query, fn);
};

/**
 * Expose `Users` module
 */

module.exports = Users;