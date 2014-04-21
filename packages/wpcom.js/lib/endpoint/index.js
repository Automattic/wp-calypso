
/**
 * Module dependencies
 */

var merge = require('extend');
var debug = require('debug')('wp-connect:endpoint');
var dot = require('dot-component');

var me = require('./me');
var sites = require('./sites');
var post = require('./post');
var media = require('./media');

/**
 * Endpoint default options
 */

var endpoint_options = {};

/**
 * endpoints object
 */

var endpoints = {
  me: me,
  sites: sites,
  post: post,
  media: media
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
