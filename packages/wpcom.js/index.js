
/**
 * Module dependencies.
 */

var Me = require('./lib/me');
var Sites = require('./lib/sites');

var req = require('./lib/req');
var debug = require('debug')('wpcom');

/**
 * WordPress REST-API class
 *
 * @param {String} [token]
 * @api public
 */

function WPCOM(token){
  if (!(this instanceof WPCOM)) return new WPCOM(token);

  this.tkn = token;

  // request instance
  this.req = new req(this);
}

/**
 * Get me object instance
 *
 * @api public
 */

WPCOM.prototype.me = function(){
  return Me(this);
};

/**
 * Get site object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.sites = function(id){
  return Sites(id, this);
};

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;
