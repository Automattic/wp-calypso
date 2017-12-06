/** @format */

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

export function add( dataStore, fetcher, options ) {
	var poller = new Poller( dataStore, fetcher, options );
	if ( poller.id === 0 ) {
		initActivityDetection();
	}
	_pollers[ poller.id ] = poller;

	debug( 'Adding poller %o', poller );
	return poller;
}

export function remove( poller ) {
	if ( typeof poller !== 'object' && _pollers[ poller ] ) {
		poller = _pollers[ poller ];
	}

	poller.clear();
	debug( 'Removing poller %o', poller );

	delete _pollers[ poller.id ];
}

export function pauseAll() {
	var poller, id;
	debug( 'Pausing active pollers' );
	for ( id in _pollers ) {
		poller = _pollers[ id ];
		if ( poller.timer && poller.pauseWhenHidden ) {
			poller.stop();
			poller.paused = true;
		}
	}
}

export function resumePaused() {
	var poller, id;
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
