
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:media');

/**
 * Media methods
 *
 * @param {String} id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Media(id, sid, wpcom){
  if (!(this instanceof Media)) return new Media(id, sid, wpcom);

  this.wpcom = wpcom;
  this._sid = sid;
  this._id = id;

  if (!this._id) {
    debug('WARN: media id is not defined');
  }
}

/**
 * Get media
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Media.prototype.get = function(query, fn){
  var path = '/sites/' + this._sid + '/media/' + this._id;
  this.wpcom.sendRequest(path, query, null, fn);
};

/**
 * Add media
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Media.prototype.add = function(body, fn){
  var path = '/sites/' + this._sid + '/media/new';
  this.wpcom.sendRequest({ path: path, method: 'post' }, null, body, fn);
};

/**
 * Edit media
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Media.prototype.update = function(body, fn){
  var path = '/sites/' + this._sid + '/media/' + this._id;
  this.wpcom.sendRequest({ path: path, method: 'post' }, null, body, fn);
};

/**
 * Delete media
 *
 * @param {Function} fn
 * @api public
 */

Media.prototype['delete'] =
Media.prototype.del = function(fn){
  var path = '/sites/' + this._sid + '/media/' + this._id + '/delete';
  this.wpcom.sendRequest({ path: path, method: 'post' }, null, body, fn);
};

/**
 * Expose `Media` module
 */

module.exports = Media;
