
/**
 * Module dependencies
 */

var merge = require('extend');
var debug = require('debug')('wp-connect:endpoint');

/**
 * Default endpoint option
 */

var endpoint_options = {
  "content": "default",
  "http_envelope": false,
  "pretty": false
};

/**
 * endpoints object
 */

var endpoints = {
  "me": {
    "type": "GET",
    "path": "/me"
  },

  "posts": {
    "type": "GET",
    "path": "/sites/%site%/posts",
    "options": {
      "number": 20,
      "offset": 0,
      "page": 0,
      "order": "DESC",
      "order_by": "date",
      "status": "publish"
    }
  },

  "post": {
    "type": "GET",
    "path": "/sites/%site%/posts/%post_ID%"
  }
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
    return new Error('`type` must be defined');
  }

  debug('getting endpoint for `%s`', type);
  var end = endpoints[type];

  if (!end) {
    return new Error(type + ' endpoint is not defined');
  }

  // re-build endpoint default options
  end.options = end.options || {};
  merge(end.options, endpoint_options);

  debug('endpoint found');
  return end;
}
