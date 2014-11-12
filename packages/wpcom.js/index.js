
/**
 * Module dependencies.
 */

var WPCOM = require('./wpcom');
var request = require('wpcom-xhr-request');

/**
 * XMLHttpRequest (and CORS) API access method.
 *
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth.
 *
 * (for server-side auth, use `wpcom-oauth` on npm).
 * (for client-side auth, use `wpcom-browser-auth` on npm).
 *
 * @param {String} [token] - OAuth API access token
 * @public
 */

module.exports = function(token){
  return new WPCOM(function(params, fn){
    params.authToken = token;
    return request(params, fn);
  });
};
