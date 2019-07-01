/** @format */
/*
 *  WARNING: ES5 code only here. Not transpiled! ****
 */

/**
 * External dependencies
 */
const socketio = require( 'socket.io' );
const debug = require( 'debug' )( 'calypso:bundler:hot-reloader' );
const { memoize } = require( 'lodash' );

/**
 * Internal dependencies
 */
const cssHotReloader = require( './css-hot-reload' );

let io = null,
	_stats = null;

function invalidPlugin() {
	if ( io ) {
		io.emit( 'invalid' );
	}
}

const getStats = memoize( stats => stats.toJson() );
getStats.cache = new WeakMap(); // play a bit nicer with the GC than the default lodash cache

function sendStats( socket, stats, force ) {
	function emitted( asset ) {
		return ! asset.emitted;
	}

	if ( ! force && stats && stats.assets && stats.assets.every( emitted ) ) {
		return socket.emit( 'still-ok' );
	}

	socket.emit( 'hash', stats.hash );

	if ( stats.errors.length > 0 ) {
		socket.emit( 'errors', stats.errors );
	} else if ( stats.warnings.length > 0 ) {
		socket.emit( 'warnings', stats.warnings );
	} else {
		socket.emit( 'ok' );
	}
}

const hotReloader = {
	listen: function( server, webpackCompiler ) {
		io = socketio.listen( server, { 'log level': 1 } );
		io.sockets.on( 'connection', function( socket ) {
			socket.emit( 'hot' );
			if ( ! _stats ) {
				return;
			}
			sendStats( socket, getStats( _stats ), true );
		} );

		webpackCompiler.plugin( 'compile', invalidPlugin );
		webpackCompiler.plugin( 'invalid', invalidPlugin );
		webpackCompiler.plugin( 'done', function( stats ) {
			if ( ! io ) {
				return;
			}
			sendStats( io.sockets, getStats( stats ) );
			_stats = stats;
		} );

		// CSS hot reloading logic

		io.of( '/css-hot-reload' ).on( 'connection', function() {
			debug( '/css-hot-reload new connection' );
		} );

		cssHotReloader( io );
	},

	close: function() {
		if ( io ) {
			io.close();
			io = null;
		}
	},
};

module.exports = hotReloader;
