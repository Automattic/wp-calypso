
/**
 * Module dependencies.
 */

var request = require('superagent');
var merge = require('extend');
var qs = require('querystring');

var ends = require('./endpoint');
var debug = require('debug')('wp-connect:req');

/**
 * Default options
 */

var default_opts = {
  url: {
    api_rest_v1: "https://public-api.wordpress.com/rest/v1"
  }
};

/**
 * Globals
 */

var api_url = default_opts.url.api_rest_v1;

/**
 * Request constructor
 *
 * @param {WPCONN} wpconn
 * @api public
 */

function Req(wpconn){
  this.wpconn = wpconn;
}

/**
 * GET request
 *
 * @api public
 */

Req.prototype.get = function(type, set, params, fn){
  this.exec(type, set, 'get', params, fn);
};

/**
 * POST request
 *
 * @api public
 */

Req.prototype.post = function(type, set, data, fn){
  this.exec(type, set, 'post', { data: data }, fn);
};

/**
 * Request to WordPress REST API
 * 
 * @param {String} type endpoint type
 * @param {Object} set to build endpoint
 * @param {String} mtd
 * @param {Object} params
 * @param {Function} fn
 * @api private
 */

Req.prototype.exec = function (type, set, mtd, params, fn){
  debug('type: `%s`', type);

  // token
  var token = params.token || this.wpconn.tkn;
  delete params.token;

  // headers
  var headers = {};
  if (!token) {
    debug('WARN: token is not defined');
  } else {
    headers.authorization = "Bearer " + token;
  }

  // options object || callback function
  if ('function' == typeof params) {
    fn = params;
    params = {};
  }

  params = params || {};

  // endpoint config object
  var end = ends(type);

  // build endpoint url
  var endpoint = end.path;

  if (set) {
    for (var k in set) {
      var rg = new RegExp("%" + k + "%");
      endpoint = endpoint.replace(rg, set[k]);
    }
  }
  debug('endpoint: `%s`', endpoint);

  // build query string
  var qrs = {};
  merge(qrs, end.options, params);
  qrs = qs.stringify(qrs);
  debug('qrs: `%s`', qrs);

  // build endpoint url
  var url = api_url + endpoint + '?' + qrs;
  debug('request to `%s`', url);

  var req = request[mtd](url).set('authorization', headers.authorization);
  if ('post' == mtd && params.data) {
    req.send(params.data);
  }

  req.end(function (err, res){
    if (err) return fn(err);

    // check response error
    if (res.body.error) {
      return fn(new Error(res.body.message));
    }

    // TODO: take a look to this one please
    if ((/SyntaxError/).test(String(res.body))) {
      return fn(res.body);
    }

    debug('request successful');
    fn(null, res.body);
  });
};

/**
 * Expose `Req` module
 */

module.exports = Req;
