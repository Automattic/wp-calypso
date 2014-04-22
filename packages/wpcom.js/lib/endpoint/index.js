
/**
 * Module dependencies
 */

var merge = require('extend');
var debug = require('debug')('wpcom:endpoint');
var dot = require('dot-component');

/**
 * Endpoint default options
 */

var endpoint_options = {};

/**
 * endpoints object
 */

var endpoints = {
  me: require('./me'),
  post: require('./post'),
  media: require('./media'),
  sites: require('./sites'),
  'freshly-pressed': require('./freshly-pressed')
};

/**
 * Expose module
 */

module.exports = endpoint;

/**
 * Return the endpoint object given the endpoint type
 *
 * @param {String} type
 * @return {Object}
 * @api public
 */

function endpoint(type){
  if (!type) {
    throw new Error('`type` must be defined');
  }

  debug('getting endpoint for `%s`', type);
  var end = dot.get(endpoints, type);

  if (!end) {
    throw new Error(type + ' endpoint is not defined');
  }

  // re-build endpoint default options
  end.options = end.options || {};
  merge(end.options, endpoint_options);

  debug('endpoint found');
  return end;
}
