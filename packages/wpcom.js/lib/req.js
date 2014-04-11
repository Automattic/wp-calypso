
/**
 * Module dependencies.
 */

var request = require('superagent');
var merge = require('extend');
var qs = require('querystring');

var ends = require('./endpoint');
var debug = require('debug')('wpcom:req');

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
 * @param {WPCOM} wpcom
 * @api public
 */

function Req(wpcom){
  this.wpcom = wpcom;
}

/**
 * Request to WordPress REST API
 * 
 * @param {String} type endpoint type
 * @param {Object} vars to build endpoint
 * @param {Object} params
 * @param {Function} fn
 * @api private
 */

Req.prototype.send = function (type, vars, params, fn){
  debug('type: `%s`', type);

  // token
  var token = params.token || this.wpcom.tkn;
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

  // request method
  var method = (end.method || params.method || 'get').toLowerCase();
  delete params.method;
  debug('method: `%s`', method);

  // build endpoint url
  var endpoint = end.path;

  if (vars) {
    for (var k in vars) {
      var rg = new RegExp("%" + k + "%");
      endpoint = endpoint.replace(rg, vars[k]);
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

  var req =
    request[method](url)
    .set('authorization', headers.authorization);

  if ('post' == method && params.data) {
    req.send(params.data);
  }

  // start the request
  req.end(function (err, res){
    if (err) return fn(err);

    // check wpcom server error response
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
