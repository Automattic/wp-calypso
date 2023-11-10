var isarray =
	Array.isArray ||
	function ( arr ) {
		return Object.prototype.toString.call( arr ) == '[object Array]';
	};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp(
	[
		// Match escaped characters that would otherwise appear in future matches.
		// This allows the user to escape special characters that won't transform.
		'(\\\\.)',
		// Match Express-style parameters and un-named parameters with a prefix
		// and optional suffixes. Matches appear as:
		//
		// "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
		// "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
		// "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
		'([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))',
	].join( '|' ),
	'g'
);

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse( str ) {
	var tokens = [];
	var key = 0;
	var index = 0;
	var path = '';
	var res;

	while ( ( res = PATH_REGEXP.exec( str ) ) != null ) {
		var m = res[ 0 ];
		var escaped = res[ 1 ];
		var offset = res.index;
		path += str.slice( index, offset );
		index = offset + m.length;

		// Ignore already escaped sequences.
		if ( escaped ) {
			path += escaped[ 1 ];
			continue;
		}

		// Push the current path onto the tokens.
		if ( path ) {
			tokens.push( path );
			path = '';
		}

		var prefix = res[ 2 ];
		var name = res[ 3 ];
		var capture = res[ 4 ];
		var group = res[ 5 ];
		var suffix = res[ 6 ];
		var asterisk = res[ 7 ];

		var repeat = suffix === '+' || suffix === '*';
		var optional = suffix === '?' || suffix === '*';
		var delimiter = prefix || '/';
		var pattern = capture || group || ( asterisk ? '.*' : '[^' + delimiter + ']+?' );

		tokens.push( {
			name: name || key++,
			prefix: prefix || '',
			delimiter: delimiter,
			optional: optional,
			repeat: repeat,
			pattern: escapeGroup( pattern ),
		} );
	}

	// Match any characters still remaining.
	if ( index < str.length ) {
		path += str.substr( index );
	}

	// If the path exists, push it onto the end.
	if ( path ) {
		tokens.push( path );
	}

	return tokens;
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile( str ) {
	return tokensToFunction( parse( str ) );
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction( tokens ) {
	// Compile all the tokens into regexps.
	var matches = new Array( tokens.length );

	// Compile all the patterns before compilation.
	for ( var i = 0; i < tokens.length; i++ ) {
		if ( typeof tokens[ i ] === 'object' ) {
			matches[ i ] = new RegExp( '^' + tokens[ i ].pattern + '$' );
		}
	}

	return function ( obj ) {
		var path = '';
		var data = obj || {};

		for ( var i = 0; i < tokens.length; i++ ) {
			var token = tokens[ i ];

			if ( typeof token === 'string' ) {
				path += token;

				continue;
			}

			var value = data[ token.name ];
			var segment;

			if ( value == null ) {
				if ( token.optional ) {
					continue;
				} else {
					throw new TypeError( 'Expected "' + token.name + '" to be defined' );
				}
			}

			if ( isarray( value ) ) {
				if ( ! token.repeat ) {
					throw new TypeError(
						'Expected "' + token.name + '" to not repeat, but received "' + value + '"'
					);
				}

				if ( value.length === 0 ) {
					if ( token.optional ) {
						continue;
					} else {
						throw new TypeError( 'Expected "' + token.name + '" to not be empty' );
					}
				}

				for ( var j = 0; j < value.length; j++ ) {
					segment = encodeURIComponent( value[ j ] );

					if ( ! matches[ i ].test( segment ) ) {
						throw new TypeError(
							'Expected all "' +
								token.name +
								'" to match "' +
								token.pattern +
								'", but received "' +
								segment +
								'"'
						);
					}

					path += ( j === 0 ? token.prefix : token.delimiter ) + segment;
				}

				continue;
			}

			segment = encodeURIComponent( value );

			if ( ! matches[ i ].test( segment ) ) {
				throw new TypeError(
					'Expected "' +
						token.name +
						'" to match "' +
						token.pattern +
						'", but received "' +
						segment +
						'"'
				);
			}

			path += token.prefix + segment;
		}

		return path;
	};
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString( str ) {
	return str.replace( /([.+*?=^!:${}()[\]|\/])/g, '\\$1' );
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup( group ) {
	return group.replace( /([=!:$\/()])/g, '\\$1' );
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys( re, keys ) {
	re.keys = keys;
	return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags( options ) {
	return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp( path, keys ) {
	// Use a negative lookahead to match only capturing groups.
	var groups = path.source.match( /\((?!\?)/g );

	if ( groups ) {
		for ( var i = 0; i < groups.length; i++ ) {
			keys.push( {
				name: i,
				prefix: null,
				delimiter: null,
				optional: false,
				repeat: false,
				pattern: null,
			} );
		}
	}

	return attachKeys( path, keys );
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp( path, keys, options ) {
	var parts = [];

	for ( var i = 0; i < path.length; i++ ) {
		parts.push( pathToRegexp( path[ i ], keys, options ).source );
	}

	var regexp = new RegExp( '(?:' + parts.join( '|' ) + ')', flags( options ) );

	return attachKeys( regexp, keys );
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp( path, keys, options ) {
	var tokens = parse( path );
	var re = tokensToRegExp( tokens, options );

	// Attach keys back to the regexp.
	for ( var i = 0; i < tokens.length; i++ ) {
		if ( typeof tokens[ i ] !== 'string' ) {
			keys.push( tokens[ i ] );
		}
	}

	return attachKeys( re, keys );
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp( tokens, options ) {
	options = options || {};

	var strict = options.strict;
	var end = options.end !== false;
	var route = '';
	var lastToken = tokens[ tokens.length - 1 ];
	var endsWithSlash = typeof lastToken === 'string' && /\/$/.test( lastToken );

	// Iterate over the tokens and create our regexp string.
	for ( var i = 0; i < tokens.length; i++ ) {
		var token = tokens[ i ];

		if ( typeof token === 'string' ) {
			route += escapeString( token );
		} else {
			var prefix = escapeString( token.prefix );
			var capture = token.pattern;

			if ( token.repeat ) {
				capture += '(?:' + prefix + capture + ')*';
			}

			if ( token.optional ) {
				if ( prefix ) {
					capture = '(?:' + prefix + '(' + capture + '))?';
				} else {
					capture = '(' + capture + ')?';
				}
			} else {
				capture = prefix + '(' + capture + ')';
			}

			route += capture;
		}
	}

	// In non-strict mode we allow a slash at the end of match. If the path to
	// match already ends with a slash, we remove it for consistency. The slash
	// is valid at the end of a path match, not in the middle. This is important
	// in non-ending mode, where "/test/" shouldn't match "/test//route".
	if ( ! strict ) {
		route = ( endsWithSlash ? route.slice( 0, -2 ) : route ) + '(?:\\/(?=$))?';
	}

	if ( end ) {
		route += '$';
	} else {
		// In non-ending mode, we need the capturing groups to match as much as
		// possible by using a positive lookahead to the end or next path segment.
		route += strict && endsWithSlash ? '' : '(?=\\/|$)';
	}

	return new RegExp( '^' + route, flags( options ) );
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp( path, keys, options ) {
	keys = keys || [];

	if ( ! isarray( keys ) ) {
		options = keys;
		keys = [];
	} else if ( ! options ) {
		options = {};
	}

	if ( path instanceof RegExp ) {
		return regexpToRegexp( path, keys, options );
	}

	if ( isarray( path ) ) {
		return arrayToRegexp( path, keys, options );
	}

	return stringToRegexp( path, keys, options );
}

pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

/**
 * Module dependencies.
 */

/**
 * Short-cuts for global-object checks
 */

var hasDocument = 'undefined' !== typeof document;
var hasWindow = 'undefined' !== typeof window;
var hasHistory = 'undefined' !== typeof history;
var hasProcess = typeof process !== 'undefined';

/**
 * Detect click event
 */
var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

/**
 * To work properly with the URL
 * history.location generated polyfill in https://github.com/devote/HTML5-History-API
 */

var isLocation = hasWindow && !! ( window.history.location || window.location );

/**
 * The page instance
 * @api private
 */
function Page() {
	// public things
	this.callbacks = [];
	this.exits = [];
	this.current = '';
	this.len = 0;

	// private things
	this._decodeURLComponents = true;
	this._base = '';
	this._strict = false;
	this._running = false;
	this._hashbang = false;

	// bound functions
	this.clickHandler = this.clickHandler.bind( this );
	this._onpopstate = this._onpopstate.bind( this );
}

/**
 * Configure the instance of page. This can be called multiple times.
 *
 * @param {Object} options
 * @api public
 */

Page.prototype.configure = function ( options ) {
	var opts = options || {};

	this._window = opts.window || ( hasWindow && window );
	this._decodeURLComponents = opts.decodeURLComponents !== false;
	this._popstate = opts.popstate !== false && hasWindow;
	this._click = opts.click !== false && hasDocument;
	this._hashbang = !! opts.hashbang;

	var _window = this._window;
	if ( this._popstate ) {
		_window.addEventListener( 'popstate', this._onpopstate, false );
	} else if ( hasWindow ) {
		_window.removeEventListener( 'popstate', this._onpopstate, false );
	}

	if ( this._click ) {
		_window.document.addEventListener( clickEvent, this.clickHandler, false );
	} else if ( hasDocument ) {
		_window.document.removeEventListener( clickEvent, this.clickHandler, false );
	}

	if ( this._hashbang && hasWindow && ! hasHistory ) {
		_window.addEventListener( 'hashchange', this._onpopstate, false );
	} else if ( hasWindow ) {
		_window.removeEventListener( 'hashchange', this._onpopstate, false );
	}
};

/**
 * Get or set basepath to `path`.
 *
 * @param {string} path
 * @api public
 */

Page.prototype.base = function ( path ) {
	if ( 0 === arguments.length ) return this._base;
	this._base = path;
};

/**
   * Gets the `base`, which depends on whether we are using History or
   * hashbang routing.

   * @api private
   */
Page.prototype._getBase = function () {
	var base = this._base;
	if ( !! base ) return base;
	var loc = hasWindow && this._window && this._window.location;

	if ( hasWindow && this._hashbang && loc && loc.protocol === 'file:' ) {
		base = loc.pathname;
	}

	return base;
};

/**
 * Get or set strict path matching to `enable`
 *
 * @param {boolean} enable
 * @api public
 */

Page.prototype.strict = function ( enable ) {
	if ( 0 === arguments.length ) return this._strict;
	this._strict = enable;
};

/**
 * Bind with the given `options`.
 *
 * Options:
 *
 *    - `click` bind to click events [true]
 *    - `popstate` bind to popstate [true]
 *    - `dispatch` perform initial dispatch [true]
 *
 * @param {Object} options
 * @api public
 */

Page.prototype.start = function ( options ) {
	var opts = options || {};
	this.configure( opts );

	if ( false === opts.dispatch ) return;
	this._running = true;

	var url;
	if ( isLocation ) {
		var window = this._window;
		var loc = window.location;

		if ( this._hashbang && ~loc.hash.indexOf( '#!' ) ) {
			url = loc.hash.substr( 2 ) + loc.search;
		} else if ( this._hashbang ) {
			url = loc.search + loc.hash;
		} else {
			url = loc.pathname + loc.search + loc.hash;
		}
	}

	this.replace( url, null, true, opts.dispatch );
};

/**
 * Unbind click and popstate event handlers.
 *
 * @api public
 */

Page.prototype.stop = function () {
	if ( ! this._running ) return;
	this.current = '';
	this.len = 0;
	this._running = false;

	var window = this._window;
	this._click && window.document.removeEventListener( clickEvent, this.clickHandler, false );
	hasWindow && window.removeEventListener( 'popstate', this._onpopstate, false );
	hasWindow && window.removeEventListener( 'hashchange', this._onpopstate, false );
};

/**
 * Show `path` with optional `state` object.
 *
 * @param {string} path
 * @param {Object=} state
 * @param {boolean=} dispatch
 * @param {boolean=} push
 * @return {!Context}
 * @api public
 */

Page.prototype.show = function ( path, state, dispatch, push ) {
	var ctx = new Context( path, state, this ),
		prev = this.prevContext;
	this.prevContext = ctx;
	this.current = ctx.path;
	if ( false !== dispatch ) this.dispatch( ctx, prev );
	if ( false !== ctx.handled && false !== push ) ctx.pushState();
	return ctx;
};

/**
 * Goes back in the history
 * Back should always let the current route push state and then go back.
 *
 * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
 * @param {Object=} state
 * @api public
 */

Page.prototype.back = function ( path, state ) {
	var page = this;
	if ( this.len > 0 ) {
		var window = this._window;
		// this may need more testing to see if all browsers
		// wait for the next tick to go back in history
		hasHistory && window.history.back();
		this.len--;
	} else if ( path ) {
		setTimeout( function () {
			page.show( path, state );
		} );
	} else {
		setTimeout( function () {
			page.show( page._getBase(), state );
		} );
	}
};

/**
 * Register route to redirect from one path to other
 * or just redirect to another route
 *
 * @param {string} from - if param 'to' is undefined redirects to 'from'
 * @param {string=} to
 * @api public
 */
Page.prototype.redirect = function ( from, to ) {
	var inst = this;

	// Define route from a path to another
	if ( 'string' === typeof from && 'string' === typeof to ) {
		page.call( this, from, function ( e ) {
			setTimeout( function () {
				inst.replace( /** @type {!string} */ ( to ) );
			}, 0 );
		} );
	}

	// Wait for the push state and replace it with another
	if ( 'string' === typeof from && 'undefined' === typeof to ) {
		setTimeout( function () {
			inst.replace( from );
		}, 0 );
	}
};

/**
 * Replace `path` with optional `state` object.
 *
 * @param {string} path
 * @param {Object=} state
 * @param {boolean=} init
 * @param {boolean=} dispatch
 * @return {!Context}
 * @api public
 */

Page.prototype.replace = function ( path, state, init, dispatch ) {
	var ctx = new Context( path, state, this ),
		prev = this.prevContext;
	this.prevContext = ctx;
	this.current = ctx.path;
	ctx.init = init;
	ctx.save(); // save before dispatching, which may redirect
	if ( false !== dispatch ) this.dispatch( ctx, prev );
	return ctx;
};

/**
 * Dispatch the given `ctx`.
 *
 * @param {Context} ctx
 * @api private
 */

Page.prototype.dispatch = function ( ctx, prev ) {
	var i = 0,
		j = 0,
		page = this;

	function nextExit() {
		var fn = page.exits[ j++ ];
		if ( ! fn ) return nextEnter();
		fn( prev, nextExit );
	}

	function nextEnter() {
		var fn = page.callbacks[ i++ ];

		if ( ctx.path !== page.current ) {
			ctx.handled = false;
			return;
		}
		if ( ! fn ) return unhandled.call( page, ctx );
		fn( ctx, nextEnter );
	}

	if ( prev ) {
		nextExit();
	} else {
		nextEnter();
	}
};

/**
 * Register an exit route on `path` with
 * callback `fn()`, which will be called
 * on the previous context when a new
 * page is visited.
 */
Page.prototype.exit = function ( path, fn ) {
	if ( typeof path === 'function' ) {
		return this.exit( '*', path );
	}

	var route = new Route( path, null, this );
	for ( var i = 1; i < arguments.length; ++i ) {
		this.exits.push( route.middleware( arguments[ i ] ) );
	}
};

/**
 * Handle "click" events.
 */

/* jshint +W054 */
Page.prototype.clickHandler = function ( e ) {
	if ( 1 !== this._which( e ) ) return;

	if ( e.metaKey || e.ctrlKey || e.shiftKey ) return;
	if ( e.defaultPrevented ) return;

	// ensure link
	// use shadow dom when available if not, fall back to composedPath()
	// for browsers that only have shady
	var el = e.target;
	var eventPath = e.path || ( e.composedPath ? e.composedPath() : null );

	if ( eventPath ) {
		for ( var i = 0; i < eventPath.length; i++ ) {
			if ( ! eventPath[ i ].nodeName ) continue;
			if ( eventPath[ i ].nodeName.toUpperCase() !== 'A' ) continue;
			if ( ! eventPath[ i ].href ) continue;

			el = eventPath[ i ];
			break;
		}
	}

	// continue ensure link
	// el.nodeName for svg links are 'a' instead of 'A'
	while ( el && 'A' !== el.nodeName.toUpperCase() ) el = el.parentNode;
	if ( ! el || 'A' !== el.nodeName.toUpperCase() ) return;

	// check if link is inside an svg
	// in this case, both href and target are always inside an object
	var svg = typeof el.href === 'object' && el.href.constructor.name === 'SVGAnimatedString';

	// Ignore if tag has
	// 1. "download" attribute
	// 2. rel="external" attribute
	if ( el.hasAttribute( 'download' ) || el.getAttribute( 'rel' ) === 'external' ) return;

	// ensure non-hash for the same path
	var link = el.getAttribute( 'href' );
	if ( ! this._hashbang && this._samePath( el ) && ( el.hash || '#' === link ) ) return;

	// Check for mailto: in the href
	if ( link && link.indexOf( 'mailto:' ) > -1 ) return;

	// check target
	// svg target is an object and its desired value is in .baseVal property
	if ( svg ? el.target.baseVal : el.target ) return;

	// x-origin
	// note: svg links that are not relative don't call click events (and skip page.js)
	// consequently, all svg links tested inside page.js are relative and in the same origin
	if ( ! svg && ! this.sameOrigin( el.href ) ) return;

	// rebuild path
	// There aren't .pathname and .search properties in svg links, so we use href
	// Also, svg href is an object and its desired value is in .baseVal property
	var path = svg ? el.href.baseVal : el.pathname + el.search + ( el.hash || '' );

	path = path[ 0 ] !== '/' ? '/' + path : path;

	// strip leading "/[drive letter]:" on NW.js on Windows
	if ( hasProcess && path.match( /^\/[a-zA-Z]:\// ) ) {
		path = path.replace( /^\/[a-zA-Z]:\//, '/' );
	}

	// same page
	var orig = path;
	var pageBase = this._getBase();

	if ( path.indexOf( pageBase ) === 0 ) {
		path = path.substr( pageBase.length );
	}

	if ( this._hashbang ) path = path.replace( '#!', '' );

	if (
		pageBase &&
		orig === path &&
		( ! isLocation || this._window.location.protocol !== 'file:' )
	) {
		return;
	}

	e.preventDefault();
	this.show( orig );
};

/**
 * Handle "populate" events.
 * @api private
 */

Page.prototype._onpopstate = ( function () {
	var loaded = false;
	if ( ! hasWindow ) {
		return function () {};
	}
	if ( hasDocument && document.readyState === 'complete' ) {
		loaded = true;
	} else {
		window.addEventListener( 'load', function () {
			setTimeout( function () {
				loaded = true;
			}, 0 );
		} );
	}
	return function onpopstate( e ) {
		if ( ! loaded ) return;
		var page = this;
		if ( e.state ) {
			var path = e.state.path;
			page.replace( path, e.state );
		} else if ( isLocation ) {
			var loc = page._window.location;
			page.show( loc.pathname + loc.search + loc.hash, undefined, undefined, false );
		}
	};
} )();

/**
 * Event button.
 */
Page.prototype._which = function ( e ) {
	e = e || ( hasWindow && this._window.event );
	return null == e.which ? e.button : e.which;
};

/**
 * Convert to a URL object
 * @api private
 */
Page.prototype._toURL = function ( href ) {
	var window = this._window;
	if ( typeof URL === 'function' && isLocation ) {
		return new URL( href, window.location.toString() );
	} else if ( hasDocument ) {
		var anc = window.document.createElement( 'a' );
		anc.href = href;
		return anc;
	}
};

/**
 * Check if `href` is the same origin.
 * @param {string} href
 * @api public
 */

Page.prototype.sameOrigin = function ( href ) {
	if ( ! href || ! isLocation ) return false;

	var url = this._toURL( href );
	var window = this._window;

	var loc = window.location;
	return loc.protocol === url.protocol && loc.hostname === url.hostname && loc.port === url.port;
};

/**
 * @api private
 */
Page.prototype._samePath = function ( url ) {
	if ( ! isLocation ) return false;
	var window = this._window;
	var loc = window.location;
	return url.pathname === loc.pathname && url.search === loc.search;
};

/**
 * Remove URL encoding from the given `str`.
 * Accommodates whitespace in both x-www-form-urlencoded
 * and regular percent-encoded form.
 *
 * @param {string} val - URL component to decode
 * @api private
 */
Page.prototype._decodeURLEncodedURIComponent = function ( val ) {
	if ( typeof val !== 'string' ) {
		return val;
	}
	return this._decodeURLComponents ? decodeURIComponent( val.replace( /\+/g, ' ' ) ) : val;
};

/**
 * Create a new `page` instance and function
 */
function createPage() {
	var pageInstance = new Page();

	function pageFn( /* args */ ) {
		return page.apply( pageInstance, arguments );
	}

	// Copy all of the things over. In 2.0 maybe we use setPrototypeOf
	pageFn.callbacks = pageInstance.callbacks;
	pageFn.exits = pageInstance.exits;
	pageFn.base = pageInstance.base.bind( pageInstance );
	pageFn.strict = pageInstance.strict.bind( pageInstance );
	pageFn.start = pageInstance.start.bind( pageInstance );
	pageFn.stop = pageInstance.stop.bind( pageInstance );
	pageFn.show = pageInstance.show.bind( pageInstance );
	pageFn.back = pageInstance.back.bind( pageInstance );
	pageFn.redirect = pageInstance.redirect.bind( pageInstance );
	pageFn.replace = pageInstance.replace.bind( pageInstance );
	pageFn.dispatch = pageInstance.dispatch.bind( pageInstance );
	pageFn.exit = pageInstance.exit.bind( pageInstance );
	pageFn.configure = pageInstance.configure.bind( pageInstance );
	pageFn.sameOrigin = pageInstance.sameOrigin.bind( pageInstance );
	pageFn.clickHandler = pageInstance.clickHandler.bind( pageInstance );

	pageFn.create = createPage;

	Object.defineProperty( pageFn, 'len', {
		get: function () {
			return pageInstance.len;
		},
		set: function ( val ) {
			pageInstance.len = val;
		},
	} );

	Object.defineProperty( pageFn, 'current', {
		get: function () {
			return pageInstance.current;
		},
		set: function ( val ) {
			pageInstance.current = val;
		},
	} );

	// In 2.0 these can be named exports
	pageFn.Context = Context;
	pageFn.Route = Route;

	return pageFn;
}

/**
 * Register `path` with callback `fn()`,
 * or route `path`, or redirection,
 * or `page.start()`.
 *
 *   page(fn);
 *   page('*', fn);
 *   page('/user/:id', load, user);
 *   page('/user/' + user.id, { some: 'thing' });
 *   page('/user/' + user.id);
 *   page('/from', '/to')
 *   page();
 *
 * @param {string|!Function|!Object} path
 * @param {Function=} fn
 * @api public
 */

function page( path, fn ) {
	// <callback>
	if ( 'function' === typeof path ) {
		return page.call( this, '*', path );
	}

	// route <path> to <callback ...>
	if ( 'function' === typeof fn ) {
		var route = new Route( /** @type {string} */ ( path ), null, this );
		for ( var i = 1; i < arguments.length; ++i ) {
			this.callbacks.push( route.middleware( arguments[ i ] ) );
		}
		// show <path> with [state]
	} else if ( 'string' === typeof path ) {
		this[ 'string' === typeof fn ? 'redirect' : 'show' ]( path, fn );
		// start [options]
	} else {
		this.start( path );
	}
}

/**
 * Unhandled `ctx`. When it's not the initial
 * popstate then redirect. If you wish to handle
 * 404s on your own use `page('*', callback)`.
 *
 * @param {Context} ctx
 * @api private
 */
function unhandled( ctx ) {
	if ( ctx.handled ) return;
	var current;
	var page = this;
	var window = page._window;

	if ( page._hashbang ) {
		current = isLocation && this._getBase() + window.location.hash.replace( '#!', '' );
	} else {
		current = isLocation && window.location.pathname + window.location.search;
	}

	if ( current === ctx.canonicalPath ) return;
	page.stop();
	ctx.handled = false;
	isLocation && ( window.location.href = ctx.canonicalPath );
}

/**
 * Escapes RegExp characters in the given string.
 *
 * @param {string} s
 * @api private
 */
function escapeRegExp( s ) {
	return s.replace( /([.+*?=^!:${}()[\]|/\\])/g, '\\$1' );
}

/**
 * Initialize a new "request" `Context`
 * with the given `path` and optional initial `state`.
 *
 * @constructor
 * @param {string} path
 * @param {Object=} state
 * @api public
 */

function Context( path, state, pageInstance ) {
	var _page = ( this.page = pageInstance || page );
	var window = _page._window;
	var hashbang = _page._hashbang;

	var pageBase = _page._getBase();
	if ( '/' === path[ 0 ] && 0 !== path.indexOf( pageBase ) )
		path = pageBase + ( hashbang ? '#!' : '' ) + path;
	var i = path.indexOf( '?' );

	this.canonicalPath = path;
	var re = new RegExp( '^' + escapeRegExp( pageBase ) );
	this.path = path.replace( re, '' ) || '/';
	if ( hashbang ) this.path = this.path.replace( '#!', '' ) || '/';

	this.title = hasDocument && window.document.title;
	this.state = state || {};
	this.state.path = path;
	this.querystring = ~i ? _page._decodeURLEncodedURIComponent( path.slice( i + 1 ) ) : '';
	this.pathname = _page._decodeURLEncodedURIComponent( ~i ? path.slice( 0, i ) : path );
	this.params = {};

	// fragment
	this.hash = '';
	if ( ! hashbang ) {
		if ( ! ~this.path.indexOf( '#' ) ) return;
		var parts = this.path.split( '#' );
		this.path = this.pathname = parts[ 0 ];
		this.hash = _page._decodeURLEncodedURIComponent( parts[ 1 ] ) || '';
		this.querystring = this.querystring.split( '#' )[ 0 ];
	}
}

/**
 * Push state.
 *
 * @api private
 */

Context.prototype.pushState = function () {
	var page = this.page;
	var window = page._window;
	var hashbang = page._hashbang;

	page.len++;
	if ( hasHistory ) {
		window.history.pushState(
			this.state,
			this.title,
			hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath
		);
	}
};

/**
 * Save the context state.
 *
 * @api public
 */

Context.prototype.save = function () {
	var page = this.page;
	if ( hasHistory ) {
		page._window.history.replaceState(
			this.state,
			this.title,
			page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath
		);
	}
};

/**
 * Initialize `Route` with the given HTTP `path`,
 * and an array of `callbacks` and `options`.
 *
 * Options:
 *
 *   - `sensitive`    enable case-sensitive routes
 *   - `strict`       enable strict matching for trailing slashes
 *
 * @constructor
 * @param {string} path
 * @param {Object=} options
 * @api private
 */

function Route( path, options, page ) {
	var _page = ( this.page = page || globalPage );
	var opts = options || {};
	opts.strict = opts.strict || page._strict;
	this.path = path === '*' ? '(.*)' : path;
	this.method = 'GET';
	this.regexp = pathToRegexp_1( this.path, ( this.keys = [] ), opts );
}

/**
 * Return route middleware with
 * the given callback `fn()`.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

Route.prototype.middleware = function ( fn ) {
	var self = this;
	return function ( ctx, next ) {
		if ( self.match( ctx.path, ctx.params ) ) return fn( ctx, next );
		next();
	};
};

/**
 * Check if this route matches `path`, if so
 * populate `params`.
 *
 * @param {string} path
 * @param {Object} params
 * @return {boolean}
 * @api private
 */

Route.prototype.match = function ( path, params ) {
	var keys = this.keys,
		qsIndex = path.indexOf( '?' ),
		pathname = ~qsIndex ? path.slice( 0, qsIndex ) : path,
		m = this.regexp.exec( decodeURIComponent( pathname ) );

	if ( ! m ) return false;

	for ( var i = 1, len = m.length; i < len; ++i ) {
		var key = keys[ i - 1 ];
		var val = this.page._decodeURLEncodedURIComponent( m[ i ] );
		if ( val !== undefined || ! hasOwnProperty.call( params, key.name ) ) {
			params[ key.name ] = val;
		}
	}

	return true;
};

/**
 * Module exports.
 */

var globalPage = createPage();
var page_js = globalPage;
var default_1 = globalPage;

page_js.default = default_1;

export default page_js;
