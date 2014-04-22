!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.WPCOM=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var Me = _dereq_('./lib/me');
var Sites = _dereq_('./lib/sites');
var ends = _dereq_('./lib/endpoint');
var debug = _dereq_('debug')('wpcom');

/**
 * WordPress.com REST API class.
 *
 * @api public
 */

function WPCOM(request){
  if (!(this instanceof WPCOM)) return new WPCOM(request);
  if ('function' !== typeof request) {
    throw new TypeError('a `request` WP.com function must be passed in');
  }
  this.request = request;
}

/**
 * Get me object instance
 *
 * @api public
 */

WPCOM.prototype.me = function(){
  return new Me(this);
};

/**
 * Get site object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.sites = function(id){
  return new Sites(id, this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} params (optional)
 * @param {Function} fn callback function
 * @api public
 */

WPCOM.prototype.freshlyPressed = function(params, fn){
  this.sendRequest('freshly-pressed.get', null, params, fn);
};

/**
 * Request to WordPress REST API
 *
 * @param {String} type endpoint type
 * @param {Object} vars to build endpoint
 * @param {Object} params
 * @param {Function} fn
 * @api private
 */

WPCOM.prototype.sendRequest = function (type, vars, params, fn){
  debug('sendRequest("%s")', type);

  // params.query || callback function
  if ('function' == typeof params.query) {
    fn = params.query;
    params.query = {};
  }

  if (!fn) fn = function(err){ if (err) throw err; };

  // endpoint config object
  var end = ends(type);

  // request method
  params.method = (params.method || end.method || 'GET').toUpperCase();

  // build endpoint url
  var endpoint = end.path;
  if (vars) {
    for (var k in vars) {
      var rg = new RegExp("%" + k + "%");
      endpoint = endpoint.replace(rg, vars[k]);
    }
  }
  params.path = endpoint;
  debug('endpoint: `%s`', endpoint);

  this.request(params, fn);
};

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;

},{"./lib/endpoint":3,"./lib/me":8,"./lib/sites":11,"debug":12}],2:[function(_dereq_,module,exports){
module.exports={
  "get": {
    "method": "GET",
    "path": "/freshly-pressed"
  }
}

},{}],3:[function(_dereq_,module,exports){

/**
 * Module dependencies
 */

var merge = _dereq_('extend');
var debug = _dereq_('debug')('wpcom:endpoint');
var dot = _dereq_('dot-component');

/**
 * Endpoint default options
 */

var endpoint_options = {};

/**
 * endpoints object
 */

var endpoints = {
  me: _dereq_('./me'),
  post: _dereq_('./post'),
  media: _dereq_('./media'),
  sites: _dereq_('./sites'),
  'freshly-pressed': _dereq_('./freshly-pressed')
};

/**
 * Expose module
 */

module.exports = endpoint;

/**
 * Return the endpoint object given the endpoint type
 *
 * @param {String} type
 * @return {Object}
 * @api public
 */

function endpoint(type){
  if (!type) {
    throw new Error('`type` must be defined');
  }

  debug('getting endpoint for `%s`', type);
  var end = dot.get(endpoints, type);

  if (!end) {
    throw new Error(type + ' endpoint is not defined');
  }

  // re-build endpoint default options
  end.options = end.options || {};
  merge(end.options, endpoint_options);

  debug('endpoint found');
  return end;
}

},{"./freshly-pressed":2,"./me":4,"./media":5,"./post":6,"./sites":7,"debug":12,"dot-component":13,"extend":15}],4:[function(_dereq_,module,exports){
module.exports={
  "get": {
    "method": "GET",
    "path": "/me"
  },

  "sites": {
    "method": "GET",
    "path": "/me/sites"
  },

  "likes": {
    "method": "GET",
    "path": "/me/likes"
  },

  "groups": {
    "method": "GET",
    "path": "/me/groups"
  },

  "connections": {
    "method": "GET",
    "path": "/me/connections"
  }
}

},{}],5:[function(_dereq_,module,exports){
module.exports=
{
  "get": {
    "method": "GET",
    "path": "/sites/%site%/media/%media_id%"
  },

  "add": {
    "method": "POST",
    "path": "/sites/%site%/media/new"
  },

  "update": {
    "method": "POST",
    "path": "/sites/%site%/media/%media_id%"
  },

  "delete": {
    "method": "POST",
    "path": "/sites/%site%/media/%media_id%/delete"
  }
}

},{}],6:[function(_dereq_,module,exports){
module.exports={
  "get": {
    "method": "GET",
    "path": "/sites/%site%/posts/%post_id%"
  },

  "get_by_slug": {
    "method": "GET",
    "path": "/sites/%site%/posts/slug:%post_slug%"
  },

  "add": {
    "method": "POST",
    "path": "/sites/%site%/posts/new"
  },

  "update": {
    "method": "POST",
    "path": "/sites/%site%/posts/%post_id%"
  },

  "delete": {
    "method": "POST",
    "path": "/sites/%site%/posts/%post_id%/delete"
  },

  "likes": {
    "method": "GET",
    "path": "/sites/%site%/posts/%post_id%/likes"
  }
}

},{}],7:[function(_dereq_,module,exports){
module.exports={
  "get": {
    "method": "GET",
    "path": "/sites/%site%"
  },

  "posts": {
    "get": {
      "method": "GET",
      "path": "/sites/%site%/posts"
    }
  },

  "medias": {
    "get": {
      "method": "GET",
      "path": "/sites/%site%/media"
    }
  }
}

},{}],8:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('wpcom:me');

/**
 * Create a `Me` instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Me(wpcom){
  if (!(this instanceof Me)) return new Me(wpcom);
  this.wpcom = wpcom;
}

/**
 * Meta data about auth token's User
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.get = function(query, fn){
  this.wpcom.sendRequest('me.get', null, { query: query }, fn);
};

/**
 * A list of the current user's sites
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api private
 */

Me.prototype.sites = function(query, fn){
  this.wpcom.sendRequest('me.sites', null, { query: query }, fn);
};

/**
 * List the currently authorized user's likes
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.likes = function(query, fn){
  this.wpcom.sendRequest('me.likes', null, { query: query }, fn);
};

/**
 * A list of the current user's group
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.groups = function(query, fn){
  this.wpcom.sendRequest('me.groups', null, { query: query }, fn);
};

/**
 * A list of the current user's connections to third-party services
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.connections = function(query, fn){
  this.wpcom.sendRequest('me.connections', null, { query: query }, fn);
};

/**
 * Expose `Me` module
 */

module.exports = Me;

},{"debug":12}],9:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('wpcom:media');

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

},{"debug":12}],10:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('wpcom:post');

/**
 * Post methods
 *
 * @param {String} id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Post(id, sid, wpcom){
  if (!(this instanceof Post)) return new Post(id, sid, wpcom);

  this.wpcom = wpcom;
  this._sid = sid;

  // set `id` and/or `slug` properties
  id = id || {};
  if ('object' != typeof id) {
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

Post.prototype.id = function(id){
  this._id = id;
};

/**
 * Set post `slug`
 *
 * @param {String} slug
 * @api public
 */

Post.prototype.slug = function(slug){
  this._slug = slug;
};

/**
 * Get post
 *
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Post.prototype.get = function(params, fn){
  if (!this._id && this._slug) {
    return this.getbyslug(params, fn);
  }

  var set = { site: this._sid, post_id: this._id };
  this.wpcom.sendRequest('post.get', set, params, fn);
};

/**
 * Get post by slug
 *
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Post.prototype.getbyslug =
Post.prototype.getBySlug = function(params, fn){
  var set = { site: this._sid, post_slug: this._slug };
  this.wpcom.sendRequest('post.get_by_slug', set, params, fn);
};

/**
 * Add post
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.add = function(body, fn){
  var set = { site: this._sid };
  this.wpcom.sendRequest('post.add', set, { body: body }, fn);
};

/**
 * Edit post
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.update = function(body, fn){
  var set = { site: this._sid, post_id: this._id };
  this.wpcom.sendRequest('post.update', set, { body: body }, fn);
};

/**
 * Delete post
 *
 * @param {Function} fn
 * @api public
 */

Post.prototype.delete = function(fn){
  var set = { site: this._sid, post_id: this._id };
  this.wpcom.sendRequest('post.delete', set, fn);
};

/**
 * Get post likes
 *
 * @param {Function} fn
 * @api public
 */

Post.prototype.likes = function(fn){
  var set = { site: this._sid, post_id: this._id };
  this.wpcom.sendRequest('post.likes', set, fn);
};

/**
 * Expose `Post` module
 */

module.exports = Post;

},{"debug":12}],11:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var Post = _dereq_('./post');
var Media = _dereq_('./media');
var debug = _dereq_('debug')('wpcom:sites');

/**
 * Create a Sites instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Sites(id, wpcom){
  if (!(this instanceof Sites)) return new Sites(id, wpcom);
  this.wpcom = wpcom;

  debug('set `%s` site id', id);
  this._id = id;
}

/**
 * Require site information
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.get = function(query, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  var set = { site: this._id };
  this.wpcom.sendRequest('sites.get', set, { query: query }, fn);
};

/**
 * Require posts site
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.posts = function(query, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  var set = { site: this._id };
  this.wpcom.sendRequest('sites.posts.get', set, { query: query }, fn);
};

/**
 * Require the media library
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.medias = function(query, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  var set = { site: this._id };
  this.wpcom.sendRequest('sites.medias.get', set, { query: query }, fn);
};

/**
 * Create a `Post` instance
 *
 * @param {String} id
 * @api public
 */

Sites.prototype.post = function(id){
  return Post(id, this._id, this.wpcom);
};

/**
 * Add a new blog post
 *
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Sites.prototype.addPost = function(body, fn){
  var post = Post(null, this._id, this.wpcom);
  post.add(body, fn);
  return post;
};

/**
 * Delete a blog post
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} remove Post instance
 */

Sites.prototype.deletePost = function(id, fn){
  var post = Post(id, this._id, this.wpcom);
  post.delete(fn);
  return post;
};

/**
 * Create a `Media` instance
 *
 * @param {String} id
 * @api public
 */

Sites.prototype.media = function(id){
  return Media(id, this._id, this.wpcom);
};

/**
 * Add a new blog media body
 *
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Sites.prototype.addMedia = function(body, fn){
  var media = Media(null, this._id, this.wpcom);
  media.add(body, fn);
  return media;
};

/**
 * Expose `Sites` module
 */

module.exports = Sites;

},{"./media":9,"./post":10,"debug":12}],12:[function(_dereq_,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],13:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var type = _dereq_('type-component');

/**
 * Gets a certain `path` from the `obj`.
 *
 * @param {Object} target
 * @param {String} key
 * @return {Object} found object, or `undefined
 * @api public
 */

exports.get = function(obj, path){
  if (~path.indexOf('.')) {
    var par = parent(obj, path);
    var mainKey = path.split('.').pop();
    var t = type(par);
    if ('object' == t || 'array' == t) return par[mainKey];
  } else {
    return obj[path];
  }
};

/**
 * Sets the given `path` to `val` in `obj`.
 *
 * @param {Object} target
 * @Param {String} key
 * @param {Object} value
 * @api public
 */

exports.set = function(obj, path, val){
  if (~path.indexOf('.')) {
    var par = parent(obj, path, true);
    var mainKey = path.split('.').pop();
    if (par && 'object' == type(par)) par[mainKey] = val;
  } else {
    obj[path] = val;
  }
};

/**
 * Gets the parent object for a given key (dot notation aware).
 *
 * - If a parent object doesn't exist, it's initialized.
 * - Array index lookup is supported
 *
 * @param {Object} target object
 * @param {String} key
 * @param {Boolean} true if it should initialize the path
 * @api public
 */

exports.parent = parent;

function parent(obj, key, init){
  if (~key.indexOf('.')) {
    var pieces = key.split('.');
    var ret = obj;

    for (var i = 0; i < pieces.length - 1; i++) {
      // if the key is a number string and parent is an array
      if (Number(pieces[i]) == pieces[i] && 'array' == type(ret)) {
        ret = ret[pieces[i]];
      } else if ('object' == type(ret)) {
        if (init && !ret.hasOwnProperty(pieces[i])) {
          ret[pieces[i]] = {};
        }
        if (ret) ret = ret[pieces[i]];
      }
    }

    return ret;
  } else {
    return obj;
  }
}

},{"type-component":14}],14:[function(_dereq_,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],15:[function(_dereq_,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

function isPlainObject(obj) {
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
		return false;

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
		return false;

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for ( key in obj ) {}

	return key === undefined || hasOwn.call( obj, key );
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
	    target = arguments[0] || {},
	    i = 1,
	    length = arguments.length,
	    deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],16:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],17:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Emitter = _dereq_('emitter');
var reduce = _dereq_('reduce');

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
  return parse
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
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

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
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
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
  var data = this._data;

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

},{"emitter":18,"reduce":19}],18:[function(_dereq_,module,exports){

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

Emitter.prototype.on = function(event, fn){
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

  fn._off = on;
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
Emitter.prototype.removeAllListeners = function(event, fn){
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
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
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

},{}],19:[function(_dereq_,module,exports){

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
},{}],20:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var superagent = _dereq_('superagent');
var debug = _dereq_('debug')('wpcom-xhr-request');

/**
 * Export a single `request` function.
 */

module.exports = request;

/**
 * WordPress.com REST API base endpoint.
 */

var proxyOrigin = 'https://public-api.wordpress.com';

/**
 * WordPress.com v1 REST API URL.
 */

var apiUrl = proxyOrigin + '/rest/v1';

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
  debug('API HTTP Method: `%s`', method);
  delete params.method;

  var url = apiUrl + params.path;
  debug('API URL: `%s`', url);
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
    debug('API send URL querystring: ', params.query);
    delete params.query;
  }

  // POST API request body
  if ('post' == method && params.body) {
    req.send(params.body);
    debug('API send POST body: ', params.body);
    delete params.body;
  }

  // XXX: delete this...
  debug('unused API params: ', params);

  // start the request
  req.end(function (err, res){
    if (err) return fn(err);
    var body = res.body;
    var statusCode = res.status;
    debug('%s -> %s status code', url, statusCode);

    if (2 === Math.floor(statusCode / 100)) {
      // 2xx status code, success
      fn(null, body);
    } else {
      // any other status code is a failure
      err = new Error();
      err.statusCode = statusCode;
      for (var i in body) err[i] = body[i];
      if (body.error) err.name = toTitle(body.error) + 'Error';
      fn(err);
    }
  });
}

function toTitle (str) {
  if (!str || 'string' !== typeof str) return '';
  return str.replace(/((^|_)[a-z])/g, function ($1) {
    return $1.toUpperCase().replace('_', '');
  });
}

},{"debug":12,"superagent":17}],21:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var _WPCOM = _dereq_('./index.js');
var request = _dereq_('wpcom-xhr-request');
var inherits = _dereq_('inherits');

/**
 * Module exports.
 */

module.exports = WPCOM;

/**
 * WordPress.com REST API class.
 *
 * XMLHttpRequest (and CORS) API access method.
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth (see `wpcom-oauth` on npm).
 *
 * @param {String} token (optional) OAuth API access token
 * @api public
 */

function WPCOM (token) {
  if (!(this instanceof WPCOM)) return new WPCOM(token);
  _WPCOM.call(this, request);
  this.token = token;
}
inherits(WPCOM, _WPCOM);

/**
 * Overwrite the parent `sendRequest()` function so that we can
 * add the `authToken` to every API request if it's present.
 *
 * @api private
 */

WPCOM.prototype.sendRequest = function (type, vars, params, fn){
  // options object || callback function
  if ('function' == typeof params) {
    fn = params;
    params = {};
  }

  if (!params) params = {};

  // token
  var token = params.token || this.token;
  delete params.token;

  if (token) params.authToken = token;

  return _WPCOM.prototype.sendRequest.call(this, type, vars, params, fn);
};

},{"./index.js":1,"inherits":16,"wpcom-xhr-request":20}]},{},[21])
(21)
});