!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.WPCOM=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
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

Batch.prototype.run = function (query, fn) {
  // add urls to query object
  if ('function' === typeof query) {
    fn = query;
    query = {};
  }
  query.urls = this.urls;

  return request.get(this.wpcom, null, '/batch', query, fn);
};

/**
 * Expose `Batch` module
 */

module.exports = Batch;
},{"./util/request":14,"debug":16}],2:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:category');

/**
 * Category methods
 *
 * @param {String} [slug]
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Category(slug, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!(this instanceof Category)) {
    return new Category(slug, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = sid;
  this._slug = slug;
}

/**
 * Set category `slug`
 *
 * @param {String} slug
 * @api public
 */

Category.prototype.slug = function (slug) {
  this._slug = slug;
};

/**
 * Get category
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Category.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/categories/slug:' + this._slug;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Add category
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Category.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/categories/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Edit category
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Category.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/categories/slug:' + this._slug;
  return request.put(this.wpcom, null, path, query, body, fn);
};

/**
 * Delete category
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Category.prototype['delete'] = Category.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/categories/slug:' + this._slug + '/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Expose `Category` module
 */

module.exports = Category;
},{"./util/request":14,"debug":16}],3:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var CommentLike = require('./commentlike');
var debug = require('debug')('wpcom:comment');

/**
 * Comment methods
 *
 * @param {String} [cid] comment id
 * @param {String} [pid] post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Comment(cid, pid, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!(this instanceof Comment)) {
    return new Comment(cid, pid, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._cid = cid;
  this._pid = pid;
  this._sid = sid;
}

/**
 * Return a single Comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Return recent comments for a post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype.replies = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/replies/';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Create a comment on a post
 *
 * @param {Object} [query]
 * @param {String|Object} body
 * @param {Function} fn
 * @api public
 */

Comment.prototype.add = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  body = 'string' === typeof body ? { content: body } : body;

  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/replies/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Edit a comment
 *
 * @param {Object} [query]
 * @param {String|Object} body
 * @param {Function} fn
 * @api public
 */

Comment.prototype.update = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  body = 'string' === typeof body ? { content: body } : body;

  var path = '/sites/' + this._sid + '/comments/' + this._cid;
  return request.put(this.wpcom, null, path, query, body, fn);
};

/**
 * Create a Comment as a reply to another Comment
 *
 * @param {Object} [query]
 * @param {String|Object} body
 * @param {Function} fn
 * @api public
 */

Comment.prototype.reply = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }
  
  body = 'string' === typeof body ? { content: body } : body;

  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/replies/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Delete a comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype['delete'] =
Comment.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Create a `CommentLike` instance
 *
 * @api public
 */

Comment.prototype.like = function() {
  return CommentLike(this._cid, this._sid, this.wpcom);
};

/**
 * Get comment likes list
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype.likesList = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Expose `Comment` module
 */

module.exports = Comment;
},{"./commentlike":4,"./util/request":14,"debug":16}],4:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:commentlike');

/**
 * CommentLike methods
 *
 * @param {String} cid comment id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function CommentLike(cid, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!cid) {
    throw new Error('`comment id` is not correctly defined');
  }

  if (!(this instanceof CommentLike)) {
    return new CommentLike(cid, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._cid = cid;
  this._sid = sid;
}

/**
 * Get your Like status for a Comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

CommentLike.prototype.state =
CommentLike.prototype.mine = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/mine';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Like a comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

CommentLike.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Remove your Like from a Comment
 *
 * @param {Function} fn
 * @api public
 */

CommentLike.prototype['delete'] =
CommentLike.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/mine/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Expose `CommentLike` module
 */

module.exports = CommentLike;
},{"./util/request":14,"debug":16}],5:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:follow');

/**
 * Follow 
 *
 * @param {String} site_id - site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Follow(site_id, wpcom) {
  if (!site_id) {
    throw new Error('`site id` is not correctly defined');
  }

  if (!(this instanceof Follow)) {
    return new Follow(site_id, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = site_id;
}

/**
 * Follow the site
 *
 * @param {Object} [query]
 * @param {Function} fn
 */

Follow.prototype.follow =
Follow.prototype.add = function (query, fn) {
  var path = '/sites/' + this._sid + '/follows/new';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Unfollow the site
 *
 * @param {Object} [query]
 * @param {Function} fn
 */

Follow.prototype.unfollow =
Follow.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine/delete';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Get the follow status for current 
 * user on current blog site
 *
 * @param {Object} [query]
 * @param {Function} fn
 */

Follow.prototype.state =
Follow.prototype.mine = function (query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Expose `Follow` module
 */

module.exports = Follow;
},{"./util/request":14,"debug":16}],6:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:like');

/**
 * Like methods
 *
 * @param {String} pid post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Like(pid, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!pid) {
    throw new Error('`post id` is not correctly defined');
  }

  if (!(this instanceof Like)) {
    return new Like(pid, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._pid = pid;
  this._sid = sid;
}

/**
 * Get your Like status for a Post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Like.prototype.state =
Like.prototype.mine = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/mine';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Like a post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Like.prototype.add = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/new';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Remove your Like from a Post
 *
 * @param {Function} fn
 * @api public
 */

Like.prototype['delete'] =
Like.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/mine/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Expose `Like` module
 */

module.exports = Like;
},{"./util/request":14,"debug":16}],7:[function(require,module,exports){

/**
 * Module dependencies.
 */
var request = require('./util/request');
var debug = require('debug')('wpcom:me');

/**
 * Create a `Me` instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Me(wpcom) {
  if (!(this instanceof Me)) {
    return new Me(wpcom);
  }

  this.wpcom = wpcom;
}

/**
 * Meta data about auth token's User
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.get = function (query, fn) {
  return request.get(this.wpcom, null, '/me', query, fn);
};

/**
 * A list of the current user's sites
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api private
 */

Me.prototype.sites = function (query, fn) {
  return request.get(this.wpcom, null, '/me/sites', query, fn);
};

/**
 * List the currently authorized user's likes
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.likes = function (query, fn) {
  return request.get(this.wpcom, null, '/me/likes', query, fn);
};

/**
 * A list of the current user's group
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.groups = function (query, fn) {
  return request.get(this.wpcom, null, '/me/groups', query, fn);
};

/**
 * A list of the current user's connections to third-party services
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.connections = function (query, fn) {
  return request.get(this.wpcom, null, '/me/connections', query, fn);
};

/**
 * Expose `Me` module
 */

module.exports = Me;
},{"./util/request":14,"debug":16}],8:[function(require,module,exports){

/**
 * Module dependencies.
 */

var fs = require('fs');
var request = require('./util/request');
var debug = require('debug')('wpcom:media');

/**
 * Default
 */

var def = {
  "apiVersion": "1.1"
};

/**
 * Media methods
 *
 * @param {String} id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Media(id, sid, wpcom) {
  if (!(this instanceof Media)) {
    return new Media(id, sid, wpcom);
  }

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

Media.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/media/' + this._id;
  return request.get(this.wpcom, def, path, query, fn);
};

/**
 * Edit media
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Media.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/media/' + this._id;
  return request.put(this.wpcom, def, path, query, body, fn);
};

/**
 * Add media file
 *
 * @param {Object} [query]
 * @param {String|Object|Array} files
 * @param {Function} fn
 */

Media.prototype.addFiles = function (query, files, fn) {
  if ('function' === typeof files) {
    fn = files;
    files = query;
    query = {};
  }

  var params = {
    path: '/sites/' + this._sid + '/media/new',
    formData: []
  };

  // process formData
  files = Array.isArray(files) ? files : [files];

  var i, f, isStream, isFile, k, param;
  for (i = 0; i < files.length; i++) {
    f = files[i];
    f = 'string' === typeof f ? fs.createReadStream(f) : f;

    isStream = !!f._readableState;
    isFile = 'undefined' !== typeof File && f instanceof File;

    debug('is stream: %s', isStream);
    debug('is file: %s', isFile);

    if (!isFile && !isStream) {
      // process file attributes like as `title`, `description`, ...
      for (k in f) {
        debug('add %o => %o', k, f[k]);
        if ('file' !== k) {
          param = 'attrs[' + i + '][' + k + ']';
          params.formData.push([param, f[k]]);
        }
      }
      // set file path
      f = f.file;
      f = 'string' === typeof f ? fs.createReadStream(f) : f;
    }

    params.formData.push(['media[]', f]);
  }

  return request.post(this.wpcom, def, params, query, null, fn);
};

/**
 * Add media files from URL
 *
 * @param {Object} [query]
 * @param {String|Array|Object} files
 * @param {Function} fn
 */

Media.prototype.addUrls = function (query, media, fn) {
  if ('function' === typeof media) {
    fn = media;
    media = query;
    query = {};
  }

  var path = '/sites/' + this._sid + '/media/new';
  var body = { media_urls: [] };

  // process formData
  var i, m, url, k;

  media = Array.isArray(media) ? media : [ media ];
  for (i = 0; i < media.length; i++) {
    m = media[i];

    if ('string' === typeof m) {
      url = m;
    } else {
      if (!body.attrs) {
        body.attrs = [];
      }

      // add attributes
      body.attrs[i] = {};
      for (k in m) {
        if ('url' !== k) {
          body.attrs[i][k] = m[k];
        }
      }
      url = m[k];
    }

    // push url into [media_url]
    body.media_urls.push(url);
  }

  return request.post(this.wpcom, def, path, query, body, fn);
};

/**
 * Delete media
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Media.prototype['delete'] = Media.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/media/' + this._id + '/delete';
  return request.del(this.wpcom, def, path, query, fn);
};

/**
 * Expose `Media` module
 */

module.exports = Media;
},{"./util/request":14,"debug":16,"fs":15}],9:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Like = require('./like');
var Reblog = require('./reblog');
var Comment = require('./comment');
var request = require('./util/request');
var debug = require('debug')('wpcom:post');

/**
 * Post methods
 *
 * @param {String} id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Post(id, sid, wpcom) {
  if (!(this instanceof Post)) {
    return new Post(id, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = sid;

  // set `id` and/or `slug` properties
  id = id || {};
  if ('object' !== typeof id) {
    this._id = id;
  } else {
    this._id = id.id;
    this._slug = id.slug;
  }
}

/**
 * Set post `id`
 *
 * @api public
 */

Post.prototype.id = function (id) {
  this._id = id;
};

/**
 * Set post `slug`
 *
 * @param {String} slug
 * @api public
 */

Post.prototype.slug = function (slug) {
  this._slug = slug;
};

/**
 * Get post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.get = function (query, fn) {
  if (!this._id && this._slug) {
    return this.getBySlug(query, fn);
  }

  var path = '/sites/' + this._sid + '/posts/' + this._id;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Get post by slug
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.getBySlug = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/slug:' + this._slug;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Add post
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/posts/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Edit post
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id;
  return request.put(this.wpcom, null, path, query, body, fn);
};

/**
 * Delete post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype['delete'] =
Post.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Restore post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.restore = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/restore';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Get post likes list
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.likesList = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/likes';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Search within a site for related posts
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.related = function (body, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/related';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Create a `Like` instance
 *
 * @api public
 */

Post.prototype.like = function () {
  return new Like(this._id, this._sid, this.wpcom);
};

/**
 * Create a `Reblog` instance
 *
 * @api public
 */

Post.prototype.reblog = function () {
  return new Reblog(this._id, this._sid, this.wpcom);
};

/**
 * Create a `Comment` instance
 *
 * @param {String} [cid] comment id
 * @api public
 */

Post.prototype.comment = function (cid) {
  return new Comment(cid, this._id, this._sid, this.wpcom);
};

/**
 * Return recent comments
 *
 * @param {Objecy} [query]
 * @param {String} id
 * @api public
 */

Post.prototype.comments = function (query, fn) {
  var comment = new Comment(null, this._id, this._sid, this.wpcom);
  comment.replies(query, fn);
  return comment;
};

/**
 * Expose `Post` module
 */

module.exports = Post;
},{"./comment":3,"./like":6,"./reblog":10,"./util/request":14,"debug":16}],10:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:reblog');

/**
 * Reblog methods
 *
 * @param {String} pid post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Reblog(pid, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!pid) {
    throw new Error('`post id` is not correctly defined');
  }

  if (!(this instanceof Reblog)) {
    return new Reblog(pid, sid, wpcom);
  }

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
Reblog.prototype.mine = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/reblogs/mine';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Reblog a post
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Reblog.prototype.add = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  if (body && !body.destination_site_id) {
    return fn(new Error('destination_site_id is not defined'));
  }

  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/reblogs/new';
  return request.post(this.wpcom, null, path, query, body, fn);
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

Reblog.prototype.to = function (dest, note, fn) {
  if ('function' === typeof note) {
    fn = note;
    note = null;
  }

  this.add({ note: note, destination_site_id: dest }, fn);
};

/**
 * Expose `Reblog` module
 */

module.exports = Reblog;
},{"./util/request":14,"debug":16}],11:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Post = require('./post');
var Category = require('./category');
var Tag = require('./tag');
var Media = require('./media');
var Comment = require('./comment');
var Follow = require('./follow');
var request = require('./util/request');
var debug = require('debug')('wpcom:site');

/**
 * Resources array
 * A list of endpoints with the same structure
 */

var resources = [
  'categories',
  'comments',
  'follows',
  'media',
  'posts',
  [ 'stats', 'stats' ],
  [ 'statsVisits', 'stats/visits' ],
  [ 'statsReferrers', 'stats/referrers' ],
  [ 'statsTopPosts', 'stats/top-posts' ],
  [ 'statsCountryViews', 'stats/country-views' ],
  [ 'statsClicks', 'stats/clicks' ],
  [ 'statsSearchTerms', 'stats/search-terms' ],
  'tags',
  'users'
];

/**
 * Create a Site instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Site(id, wpcom) {
  if (!(this instanceof Site)) {
    return new Site(id, wpcom);
  }

  this.wpcom = wpcom;

  debug('set %o site id', id);
  this._id = encodeURIComponent(id);
}

/**
 * Require site information
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Site.prototype.get = function (query, fn) {
  return request.get(this.wpcom, null, '/sites/' + this._id, query, fn);
};

/**
 * List method builder
 *
 * @param {String} subpath
 * @param {Function}
 * @api private
 */

var list = function (subpath, apiVersion) {

  /**
   * Return the <names>List method
   *
   * @param {Object} [query]
   * @param {Function} fn
   * @api public
   */

  return function (query, fn) {
    var path = '/sites/' + this._id + '/' + subpath;
    return request.get(this.wpcom, { apiVersion: apiVersion }, path, query, fn);
  };
};

// walk for each resource and create related method
var i, res, isarr, name, subpath, apiVersion;
for (i = 0; i < resources.length; i++) {
  res = resources[i];
  isarr = Array.isArray(res);

  name =  isarr ? res[0] : res + 'List';
  subpath = isarr ? res[1] : res;
  apiVersion = isarr && 'string' === typeof res[2] ? res[2] : '1';

  debug('adding %o method in %o sub-path (v%o)', 'site.' + name + '()', subpath, apiVersion);
  Site.prototype[name] = list(subpath, apiVersion);
}

/**
 * :POST:
 * Create a `Post` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.post = function (id) {
  return new Post(id, this._id, this.wpcom);
};

/**
 * :POST:
 * Add a new blog post
 *
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addPost = function (body, fn) {
  var post = new Post(null, this._id, this.wpcom);
  return post.add(body, fn);
};

/**
 * :POST:
 * Delete a blog post
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} remove Post instance
 */

Site.prototype.deletePost = function (id, fn) {
  var post = new Post(id, this._id, this.wpcom);
  return post.delete(fn);
};

/**
 * Create a `Media` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.media = function (id) {
  return new Media(id, this._id, this.wpcom);
};

/**
 * Add a media from a file
 *
 * @param {Object} [query]
 * @param {Array|String} files
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addMediaFiles = function (query, files, fn) {
  var media = new Media(null, this._id, this.wpcom);
  return media.addFiles(query, files, fn);
};

/**
 * Add a new media from url
 *
 * @param {Object} [query]
 * @param {Array|String} files
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addMediaUrls = function (query, files, fn) {
  var media = new Media(null, this._id, this.wpcom);
  return media.addUrls(query, files, fn);
};

/**
 * Delete a blog media
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} removed Media instance
 */

Site.prototype.deleteMedia = function (id, fn) {
  var media = new Media(id, this._id, this.wpcom);
  return media.del(fn);
};

/**
 * Create a `Comment` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.comment = function (id) {
  return new Comment(id, null, this._id, this.wpcom);
};

/**
 * Create a `Follow` instance
 *
 * @api public
 */

Site.prototype.follow = function () {
  return new Follow(this._id, this.wpcom);
};

/**
 * Create a `Category` instance
 * Set `cat` alias
 *
 * @param {String} [slug]
 * @api public
 */

Site.prototype.cat = Site.prototype.category = function (slug) {
  return new Category(slug, this._id, this.wpcom);
};

/**
 * Create a `Tag` instance
 *
 * @param {String} [slug]
 * @api public
 */

Site.prototype.tag = function (slug) {
  return new Tag(slug, this._id, this.wpcom);
};

/**
 * Expose `Site` module
 */

module.exports = Site;

},{"./category":2,"./comment":3,"./follow":5,"./media":8,"./post":9,"./tag":12,"./util/request":14,"debug":16}],12:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:tag');

/**
 * Tag methods
 *
 * @param {String} [slug]
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Tag(slug, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!(this instanceof Tag)) {
    return new Tag(slug, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = sid;
  this._slug = slug;
}

/**
 * Set tag `slug`
 *
 * @param {String} slug
 * @api public
 */

Tag.prototype.slug = function (slug) {
  this._slug = slug;
};

/**
 * Get tag
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Tag.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Add tag
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Tag.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/tags/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Edit tag
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Tag.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
  return request.put(this.wpcom, null, path, query, body, fn);
};

/**
 * Delete tag
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Tag.prototype['delete'] = Tag.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug + '/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Expose `Tag` module
 */

module.exports = Tag;
},{"./util/request":14,"debug":16}],13:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('./util/request');
var debug = require('debug')('wpcom:users');

/**
 * Create a `Users` instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Users(wpcom) {
  if (!(this instanceof Users)) {
    return new Users(wpcom);
  }

  this.wpcom = wpcom;
}

/**
 * A list of @mention suggestions for the current user
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Users.prototype.suggest = function (query, fn) {
  return request.get(this.wpcom, null, '/users/suggest', query, fn);
};

/**
 * Expose `Users` module
 */

module.exports = Users;
},{"./util/request":14,"debug":16}],14:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:request');

/**
 * Expose `Request` module
 */

exports = module.exports = {};

/**
 * Request methods
 *
 * @param {WPCOM} wpcom
 * @param {Object} def
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

exports.get = function (wpcom, def, params, query, fn) {
  // `query` is optional
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }
  
  defaultValues(def, query);

  return wpcom.sendRequest(params, query, null, fn);
};

/**
 * Make `update` request
 *
 * @param {WPCOM} wpcom
 * @param {Object} def
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

exports.put = 
exports.post = function (wpcom, def, params, query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  defaultValues(def, query);

  // params can be s string
  params = 'string' === typeof params ? { path : params } : params;

  // request method
  params.method = 'post';

  return wpcom.sendRequest(params, query, body, fn);
};

/**
 * Make a `delete` request
 *
 * @param {WPCOM} wpcom
 * @param {Object} def
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

exports.del = function (wpcom, def, params, query, fn) {  
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  return exports.post(wpcom, def, params, query, null, fn);
};

/**
 * Set query object using the given parameters
 *
 * @api private
 */

function defaultValues (def, query) {
  def = def || {};
  query = query || {};

  // `apiVersion`
  if (def.apiVersion) {
    query.apiVersion = query.apiVersion || def.apiVersion;
  }
};
},{"debug":16}],15:[function(require,module,exports){

},{}],16:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      localStorage.removeItem('debug');
    } else {
      localStorage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":17}],17:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":18}],18:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],19:[function(require,module,exports){

/**
 * Module dependencies.
 */

var superagent = require('superagent');
var debug = require('debug')('wpcom-xhr-request');

/**
 * Export a single `request` function.
 */

module.exports = request;

/**
 * WordPress.com REST API base endpoint.
 */

var proxyOrigin = 'https://public-api.wordpress.com';

/**
 * Default WordPress.com REST API Version.
 */

var defaultApiVersion = '1';

/**
 * Performs an XMLHttpRequest against the WordPress.com REST API.
 *
 * @param {Object|String} params
 * @param {Function} fn
 * @api public
 */

function request (params, fn) {

  if ('string' == typeof params) {
    params = { path: params };
  }

  var method = (params.method || 'GET').toLowerCase();
  debug('API HTTP Method: %o', method);
  delete params.method;

  var apiVersion = params.apiVersion || defaultApiVersion;
  delete params.apiVersion;

  var url = proxyOrigin + '/rest/v' + apiVersion + params.path;
  debug('API URL: %o', url);
  delete params.path;

  // create HTTP Request object
  var req = superagent[method](url);

  // Token authentication
  if (params.authToken) {
    req.set('Authorization', 'Bearer ' + params.authToken);
    delete params.authToken;
  }

  // URL querystring values
  if (params.query) {
    req.query(params.query);
    debug('API send URL querystring: %o', params.query);
    delete params.query;
  }

  // POST API request body
  if (params.body) {
    req.send(params.body);
    debug('API send POST body: ', params.body);
    delete params.body;
  }

  // POST FormData (for `multipart/form-data`, usually a file upload)
  if (params.formData) {
    for (var i = 0; i < params.formData.length; i++) {
      var data = params.formData[i];
      var key = data[0];
      var value = data[1];
      debug('adding FormData field %o', key);
      req.field(key, value);
    }
  }

  // start the request
  req.end(function (err, res){
    if (err) return fn(err);
    var body = res.body;
    var headers = res.headers;
    var statusCode = res.status;
    debug('%o -> %o status code', url, statusCode);

    if (body && headers) {
      body._headers = headers;
    }

    if (2 === Math.floor(statusCode / 100)) {
      // 2xx status code, success
      fn(null, body);
    } else {
      // any other status code is a failure
      err = new Error();
      err.statusCode = statusCode;
      for (var i in body) err[i] = body[i];
      if (body && body.error) err.name = toTitle(body.error) + 'Error';
      fn(err);
    }
  });

  return req.xhr;
}

function toTitle (str) {
  if (!str || 'string' !== typeof str) return '';
  return str.replace(/((^|_)[a-z])/g, function ($1) {
    return $1.toUpperCase().replace('_', '');
  });
}

},{"debug":16,"superagent":20}],20:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    try {
      var res = new Response(self);
      if ('HEAD' == method) res.text = null;
      self.callback(null, res);
    } catch(e) {
      var err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      self.callback(err);
    }
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":21,"reduce":22}],21:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],22:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],23:[function(require,module,exports){

/**
 * Module dependencies.
 */

var request = require('wpcom-xhr-request');

/**
 * Local module dependencies.
 */

var Me = require('./lib/me');
var Site = require('./lib/site');
var Users = require('./lib/users');
var Batch = require('./lib/batch');
var debug = require('debug')('wpcom');

/**
 * XMLHttpRequest (and CORS) API access method.
 *
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth.
 *
 * Request Handler is optional and XHR is defined as default.
 *
 * @param {String} [token] - OAuth API access token
 * @param {Function} [reqHandler] - function Request Handler
 * @public
 */

function WPCOM(token, reqHandler) {
  if (!(this instanceof WPCOM)) {
    return new WPCOM(token, reqHandler);
  }

  // `token` is optional
  if ('function' === typeof token) {
    reqHandler = token;
    token = null;
  }

  // Set default request handler
  if (!reqHandler) {
    debug('No request handler. Adding default XHR request handler');

    this.request = function (params, fn) {
      params = params || {};

      // token is optional
      if (token) {
        params.authToken = token;
      }

      return request(params, fn);
    };
  } else {
    this.request = reqHandler;
  }
}

/**
 * Get `Me` object instance
 *
 * @api public
 */

WPCOM.prototype.me = function () {
  return new Me(this);
};

/**
 * Get `Site` object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.site = function (id) {
  return new Site(id, this);
};

/**
 * Get `Users` object instance
 *
 * @api public
 */

WPCOM.prototype.users = function () {
  return new Users(this);
};


WPCOM.prototype.batch = function () {
  return new Batch(this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} [query]
 * @param {Function} fn callback function
 * @api public
 */

WPCOM.prototype.freshlyPressed = function (query, fn) {
  return this.sendRequest('/freshly-pressed', query, null, fn);
};

/**
 * Request to WordPress REST API
 *
 * @param {String|Object} params
 * @param {Object} [query]
 * @param {Object} [body]
 * @param {Function} fn
 * @api private
 */

WPCOM.prototype.sendRequest = function (params, query, body, fn) {
  // `params` can be just the path (String)
  if ('string' === typeof params) {
    params = { path: params };
  }

  debug('sendRequest(%o)', params.path);

  // set `method` request param
  params.method = (params.method || 'get').toUpperCase();

  // `query` is optional
  if ('function' === typeof query) {
    fn = query;
    query = null;
  }

  // `body` is optional
  if ('function' === typeof body) {
    fn = body;
    body = null;
  }

  // pass `query` and/or `body` to request params
  if (query) {
    params.query = query;

    // Handle special query parameters
    // - `apiVersion`
    if (query.apiVersion) {
      params.apiVersion = query.apiVersion;
      delete query.apiVersion;
    }
  }

  if (body) {
    params.body = body;
  }

  // callback `fn` function is optional
  if (!fn) {
    fn = function (err) { if (err) { throw err; } };
  }

  // request method
  return this.request(params, fn);
};

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;

},{"./lib/batch":1,"./lib/me":7,"./lib/site":11,"./lib/users":13,"debug":16,"wpcom-xhr-request":19}]},{},[23])(23)
});