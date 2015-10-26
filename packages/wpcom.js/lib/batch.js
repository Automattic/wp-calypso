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

  this.urls = [];
}

/**
 * Add url to batch requests
 *
 * @param {String} url
 * @api public
 */

Batch.prototype.add = function (url) {
  this.urls.push(url);
  return this;
};

/**
 * Run the batch request
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Batch.prototype.run = function (query={}, fn) {
  if ('function' === typeof query) {
    fn = query;
    query = {};
  }

  // add urls to query object
  query['urls'] = this.urls;

  return this.wpcom.req.get('/batch', query, fn);
};

/**
 * Expose `Batch` module
 */

module.exports = Batch;
