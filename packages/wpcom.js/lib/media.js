
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
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Media.prototype.get = function(params, fn){
  var set = { site: this._sid, media_id: this._id };
  this.wpcom.sendRequest('media.get', set, params, fn);
};

/**
 * Add media
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Media.prototype.add = function(body, fn){
  var set = { site: this._sid };
  this.wpcom.sendRequest('media.add', set, { body: body }, fn);
};

/**
 * Edit media
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Media.prototype.update = function(body, fn){
  var set = { site: this._sid, media_id: this._id };
  this.wpcom.sendRequest('media.update', set, { body: body }, fn);
};

/**
 * Delete media
 *
 * @param {Function} fn
 * @api public
 */

Media.prototype.delete = function(fn){
  var set = { site: this._sid, media_id: this._id };
  this.wpcom.sendRequest('media.delete', set, fn);
};

/**
 * Expose `Media` module
 */

module.exports = Media;
