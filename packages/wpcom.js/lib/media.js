
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:media');

/**
 * Default api version
 */

var api_version = '1.1';

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
    debug('WARN: media `id` is not defined');
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
  var params = {
    apiVersion: query.apiVersion || api_version,
    path: '/sites/' + this._sid + '/media/' + this._id
  };

  return this.wpcom.sendRequest(params, query, null, fn);
};

/**
 * Edit media
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Media.prototype.update = function(query, body, fn){
  if ('function' == typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  var params = {
    apiVersion: query.apiVersion || api_version,
    path: '/sites/' + this._sid + '/media/' + this._id,
    method: 'post'
  };

  return this.wpcom.sendRequest(params, query, body, fn);
};

/**
 * Add media file
 *
 * @param {Object} [query]
 * @param {String|Object|Array} files
 * @param {Function} fn
 */

Media.prototype.addFiles = function(query, files, fn){
  if ('function' == typeof files) {
    fn = files;
    files = query;
    query = {};
  }

  var params = {
    apiVersion: query.apiVersion || api_version,
    path: '/sites/' + this._sid + '/media/new',
    method: 'post',
    formData: []
  };

  // process formData
  files = Array.isArray(files) ? files : [files];

  for (var i = 0; i < files.length; i++) {
    var f = files[i];

    var isStream = !!f._readableState;
    var isFile = 'undefined' != typeof File && f instanceof File;

    debug('is stream: %s', isStream);
    debug('is file: %s', isFile);

    if (!isFile && !isStream) {
      // process file attributes like as `title`, `description`, ...
      for (var k in f) {
        debug('add %o => %o', k, f[k]);
        if ('file' != k) {
          var param = 'attrs[' + i + '][' + k + ']';
          params.formData.push([param, f[k]]);
        }
      }
      // set file
      f = f.file;
    }

    params.formData.push(['media[]', f]);
  }

  return this.wpcom.sendRequest(params, query, null, fn);
};

/**
 * Add media files from URL
 *
 * @param {Object} [query]
 * @param {String|Array|Object} files
 * @param {Function} fn
 */

Media.prototype.addUrls = function(query, media, fn){
  if ('function' == typeof media) {
    fn = media;
    media = query;
    query = {};
  }

  var params = {
    apiVersion: query.apiVersion || api_version,
    path: '/sites/' + this._sid + '/media/new',
    method: 'post'
  };

  var body = { media_urls: [] };

  // process formData
  media = Array.isArray(media) ? media : [ media ];
  for (var i = 0; i < media.length; i++) {
    var m = media[i];
    var url;

    if ('string' == typeof m) {
      url = m;
    } else {
      if (!body.attrs) body.attrs = [];

      // add attributes
      body.attrs[i] = {};
      for (var k in m) {
        if ('url' != k) {
          body.attrs[i][k] = m[k];
        }
      }
      url = m[k];
    }

    // push url into [media_url]
    body.media_urls.push(url);
  }

  return this.wpcom.sendRequest(params, query, body, fn);
};

/**
 * Delete media
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Media.prototype['delete'] =
Media.prototype.del = function(query, fn){
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  var params = {
    apiVersion: query.apiVersion || api_version,
    path: '/sites/' + this._sid + '/media/' + this._id + '/delete',
    method: 'post'
  };

  return this.wpcom.sendRequest(params, query, null, fn);
};

/**
 * Expose `Media` module
 */

module.exports = Media;
