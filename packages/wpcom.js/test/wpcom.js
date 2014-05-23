
/**
 * WPCOM vars
 */

var WPCOM;
var wpcom;

/**
 * Detect side
 */

if ('undefined' == typeof window) {
  WPCOM = require('../');

  var test = require('./data');
  wpcom = WPCOM(test.site.private.global);
}

/**
 * Expose WPCOM instance
 */

module.exports = wpcom;
