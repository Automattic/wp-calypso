/**
 * Create a `Batch` instance
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @return {null} null
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
 * @param {String} url - endpoint url
 * @return {Batch} batch instance
 * @api public
 */
Batch.prototype.add = function (url) {
  this.urls.push(url);
  return this;
};

/**
 * Run the batch request
 *
 * @param {Object} [query] - optional query parameter
 * @param {Function} fn - callback
 * @return {Function} request handler
 * @api public
 */
Batch.prototype.run = function (query, fn) {
  if (query === undefined) query = {};

  if ('function' === typeof query) {
    fn = query;
    query = {};
  }

  // add urls to query object
  query.urls = this.urls;

  return this.wpcom.req.get('/batch', query, fn);
};

/**
 * Expose `Batch` module
 */
module.exports = Batch;