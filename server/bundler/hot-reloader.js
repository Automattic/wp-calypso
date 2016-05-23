/***** WARNING: ES5 code only here. Not transpiled! *****/

/**
 * External dependencies
 */
var socketio = require( 'socket.io' );
var debug = require( 'debug')( 'hot-reloader' );
var cssHotReloader = require( './css-hot-reload' );

var io = null,
	_stats = null,
	hotReloader;

function invalidPlugin() {
	if ( io ) {
		io.emit( 'invalid' );
	}
}

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

hotReloader = {

	listen: function( server, webpackCompiler ) {
		io = socketio.listen( server, { 'log level': 1 } );
		io.sockets.on( 'connection', function( socket ) {
			socket.emit( 'hot' );
			if ( ! _stats ) {
				return;
			}
			sendStats( socket, _stats.toJson(), true );
		} );

		webpackCompiler.plugin( 'compile', invalidPlugin );
		webpackCompiler.plugin( 'invalid', invalidPlugin );
		webpackCompiler.plugin( 'done', function( stats ) {
			if ( ! io ) {
				return;
			}
			sendStats( io.sockets, stats.toJson() );
			_stats = stats;
		} );
		
		// CSS hot reloading logic

		io.of( '/css-hot-reload' ).on( 'connection', function(socket) {
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
