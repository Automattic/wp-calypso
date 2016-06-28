
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:pinghub');


/**
 * Create a `Pinghub` instance
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @return {null} null
 * @api public
 */
export default function Pinghub( wpcom ) {
	if ( ! ( this instanceof Pinghub ) ) {
		return new Pinghub( wpcom );
	}

	this.wpcom = wpcom;
	this.conns = {};
}

/**
 * Open a websocket to Pinghub
 *
 * @param {String} path
 * @param {Function} fn
 * @api public
 */
Pinghub.prototype.connect = function( path, fn ) {
	debug("connect", path, fn);
	var pinghub = this,
		params = {
			action: 'connect',
			path: '/pinghub' + path
		},
		errorCallback = function() {}, // we want an xhr, not a promise
		xhr = this.conns[path] = this.wpcom.req.get( params, errorCallback );
	xhr.onload = function(e) {
		debug( "onload", path, e );
		fn( null, e );
	};
	xhr.onerror = xhr.onabort = xhr.onclose = function(e) {
		debug( "onerror", path, e );
		pinghub.remove( path );
		fn( e, null );
	};
};

/**
 * Close a websocket connection (unsubscribe)
 *
 * @param {String} path
 * @api public
 */
Pinghub.prototype.disconnect = function( path ) {
	debug("disconnect", path);
	var params = {
			action: 'disconnect',
			path: '/pinghub' + path
		},
		errorCallback = function() {}; // no promises
	this.wpcom.req.get( params, errorCallback );
}

/**
 * Remove a dead connection
 *
 * @param {String} path - pinghub channel
 * @api private
 */
Pinghub.prototype.remove = function( path ) {
	debug("remove", path);
	delete this.conns[path];
};
