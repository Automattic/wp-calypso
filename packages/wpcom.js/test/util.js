
/**
 * Module dependencies
 */

var test = require('./data');
var WPCOM = require('../');

/**
 * `Util` module
 */

function Util(){}

/**
 * Create a WPCOM instance
 *
 * @api public
 */

Util.wpcom = function(){
  return WPCOM(test.token);
};

/**
 * Create a new WPCOM instance
 * setting with a public site id
 *
 * @api public
 */

Util.public_site = function(){
  var wpcom = WPCOM(test.token);
  wpcom.site.id(test.public_site);
  return wpcom;
};

/**
 * Create a new WPCOM instance
 * setting with a private site id
 *
 * @api public
 */

Util.private_site = function(){
  var wpcom = WPCOM(test.token);
  wpcom.site.id(test.private_site);
  return wpcom;
};

/**
 * Export module
 */

module.exports = Util;
