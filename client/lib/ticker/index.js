/**
 * External dependencies
 */
import { wrap } from 'lodash';

var Emitter = require( 'lib/mixins/emitter' ),
	debug = require( 'debug' )( 'calypso:ticker' );

var ticker = {};

Emitter( ticker );

ticker.on = wrap( ticker.on, function( func, type, callback ) {
	func.call( this, type, callback );
	ticker._start();
	if ( ! ticker._listening ) {
		if ( document ) {
			debug( 'listening for vis change' );
			document.addEventListener( 'visibilitychange', ticker.handleVisibilityChange, false );
		}
		ticker._listening = true;
	}
} );

ticker._start = function() {
	if ( ticker.listeners( 'tick' ).length === 0 ) {
		debug( 'no listeners, abort start' );
		return;
	}

	debug( '%d listeners active', ticker.listeners( 'tick' ).length );

	if ( ! ticker.interval ) {
		debug( 'starting interval' );
		ticker.interval = setInterval( ticker.tick, 10000 );
	}
};

ticker._stop = function() {
	if ( ticker.interval ) {
		debug( 'killing interval' );
		clearInterval( ticker.interval );
		ticker.interval = null;
	}
};

ticker.tick = function() {
	debug( 'tick' );
	ticker.emit( 'tick' );
};

ticker.off = wrap( ticker.off, function( func, type, callback ) {
	func.call( this, type, callback );
	if ( this.listeners( 'tick' ).length === 0 && this.interval ) {
		ticker._stop();

		if ( ticker._listening ) {
			if ( document ) {
				debug( 'killing vis listener' );
				document.removeEventListener( 'visibilitychange', ticker.handleVisibilityChange, false );
			}
			ticker._listening = false;
		}
	}
} );

ticker.handleVisibilityChange = function() {
	debug( 'viz change');
	if ( document.hidden ) {
		debug( 'stopping' );
		ticker._stop();
	} else {
		debug( 'restarting' );
		ticker._start();
	}
};

ticker.setMaxListeners( 100 );

module.exports = ticker;
