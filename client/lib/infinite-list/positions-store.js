/**
 * External dependencies
 */
import { isEqual } from 'lodash';
var debug = require( 'debug' )( 'calypso:infinite-list:positions-store' ),
	Dispatcher = require( 'dispatcher' );

/**
 * Internal Dependencies
 */
var emitter = require( 'lib/mixins/emitter' );

/**
 * Module Variables
 */
var _infiniteListPositions = {},
	InfiniteListPositionsStore = {
		get: function( url ) {
			debug( 'positions-store:get(): ', url, _infiniteListPositions );
			return _infiniteListPositions[ url ];
		}
	};

emitter( InfiniteListPositionsStore );

function storeInfiniteListPositions( url, positions ) {
	var oldPositions = InfiniteListPositionsStore.get( url );
	debug( 'comparing positions:', url, oldPositions, positions );
	if ( isEqual( oldPositions, positions ) ) {
		return;
	}

	debug( 'storing values:', url, positions );
	_infiniteListPositions[ url ] = positions;
	InfiniteListPositionsStore.emit( 'change' );
}

InfiniteListPositionsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'INFINITE_LIST_POSITION_CHANGED':
			storeInfiniteListPositions( action.url, action.positions );
			break;
	}
} );

module.exports = InfiniteListPositionsStore;
