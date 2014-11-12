
/**
 * Module dependencies.
 */

var WPCOM = require('./wpcom');
var wpcomXhrRequest = require('wpcom-xhr-request');

/**
 * XMLHttpRequest (and CORS) API access method.
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth (see `wpcom-oauth` on npm).
 *
 * @param {String} token (optional) OAuth API access token
 * @api public
 */

module.exports = function(token){
  return WPCOM(request);

  function request(params, fn){
    params.authToken = token;
    return wpcomXhrRequest(params, fn);
  }
};
