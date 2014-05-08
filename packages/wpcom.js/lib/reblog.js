
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:reblog');

/**
 * Reblog methods
 *
 * @param {String} pid post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Reblog(pid, sid, wpcom){
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!pid) {
    throw new Error('`post id` is not correctly defined');
  }

  if (!(this instanceof Reblog)) return new Reblog(pid, sid, wpcom);

  this.wpcom = wpcom;
  this._pid = pid;
  this._sid = sid;
}

/**
 * Get your reblog status for a Post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Reblog.prototype.state =
Reblog.prototype.mine = function(query, fn){
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/reblogs/mine';
  this.wpcom.sendRequest(path, query, null, fn);
};

/**
 * Reblog a post
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Reblog.prototype.add = function(body, fn){
  if (body && !body.destination_site_id) {
    return fn(new Error('destination_site_id is not defined'));
  }

  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/reblogs/new';
  this.wpcom.sendRequest({ path: path, method: 'post' }, null, body, fn);
};

/**
 * Reblog a post to
 * It's almost a alias of Reblogs#add()
 *
 * @param {Number} dest destination
 * @param {String} [note]
 * @param {Function} fn
 * @api public
 */

Reblog.prototype.to = function(dest, note, fn){
  if ('function' == typeof note) {
    fn = note;
    note = null;
  }

  this.add({ note: note, destination_site_id: dest }, fn);
};

/**
 * Expose `Reblog` module
 */

module.exports = Reblog;
