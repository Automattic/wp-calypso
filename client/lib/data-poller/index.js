/**
 * External dependencies
 */

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:poller' );

/**
 * Internal dependencies
 */
import Poller from './poller';

const _pollers = {};

function add( dataStore, fetcher, options ) {
	const poller = new Poller( dataStore, fetcher, options );
	if ( poller.id === 0 ) {
		initActivityDetection();
	}
	_pollers[ poller.id ] = poller;

	debug( 'Adding poller %o', poller );
	return poller;
}

function remove( poller ) {
	if ( typeof poller !== 'object' && _pollers[ poller ] ) {
		poller = _pollers[ poller ];
	}

	poller.clear();
	debug( 'Removing poller %o', poller );

	delete _pollers[ poller.id ];
}

function pauseAll() {
	let poller;
	let id;
	debug( 'Pausing active pollers' );
	for ( id in _pollers ) {
		poller = _pollers[ id ];
		if ( poller.timer && poller.pauseWhenHidden ) {
			poller.stop();
			poller.paused = true;
		}
	}
}

function resumePaused() {
	let poller;
	let id;
	debug( 'Resuming paused pollers' );
	for ( id in _pollers ) {
		poller = _pollers[ id ];
		if ( poller.paused ) {
			poller.start();
		}
	}
}

function initActivityDetection() {
	if ( document ) {
		document.addEventListener( 'visibilitychange', handleVisibilityChange, false );
	}
}

function handleVisibilityChange() {
	if ( document.hidden ) {
		pauseAll();
	} else {
		resumePaused();
	}
}

export default {
	add: add,
	remove: remove,
	pauseAll: pauseAll,
	resumePaused: resumePaused,
};
