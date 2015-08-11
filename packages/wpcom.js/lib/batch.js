
/**
 * Module dependencies.
 */

var qs = require('qs');
var debug = require('debug')('wpcom:batch');

/**
 * Create a `Batch` instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Batch(wpcom) {
  if (!(this instanceof Batch)) {
    return new Batch(wpcom);
  }

  this.wpcom = wpcom;

  this.urls = '';
}

/**
 * Add url to batch requests
 *
 * @param {String} url
 * @api public
 */

Batch.prototype.add = function (url) {
  this.urls += encodeURIComponent('urls[]') + '=' + encodeURIComponent(url) + '&';
  return this;
};

/**
 * Run the batch request
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Batch.prototype.run = function (query, fn) {
  // add urls to query object
  if ('function' === typeof query) {
    fn = query;
    query = {};
  }

  return this.wpcom.req.get('/batch', this.urls + qs.stringify(query), fn);
};

/**
 * Expose `Batch` module
 */

module.exports = Batch;
