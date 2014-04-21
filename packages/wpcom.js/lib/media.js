
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
 * Get media data
 *
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Media.prototype.get = function(params, fn){
  var set = { site: this._sid, media_id: this._id };
  this.wpcom.req.send('media.get', set, params, fn);
};

/**
 * Add media
 *
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

Media.prototype.add = function(data, fn){
  var set = { site: this._sid };
  this.wpcom.req.send('media.add', set, { data: data }, fn);
};

/**
 * Edit media
 *
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

Media.prototype.update = function(data, fn){
  var set = { site: this._sid, media_id: this._id };
  this.wpcom.req.send('media.update', set, { data: data }, fn);
};

/**
 * Delete media
 *
 * @param {Function} fn
 * @api public
 */

Media.prototype.delete = function(fn){
  var set = { site: this._sid, media_id: this._id };
  this.wpcom.req.send('media.delete', set, fn);
};

/**
 * Expose `Media` module
 */

module.exports = Media;
