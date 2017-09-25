/**
 * External dependencies
 */
import { isEqual } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:infinite-list:positions-store' );
import Dispatcher from 'dispatcher';

/**
 * Internal Dependencies
 */
import emitter from 'lib/mixins/emitter';

/**
 * Module Variables
 */
let _infiniteListPositions = {},
	InfiniteListPositionsStore = {
		get: function( url ) {
			debug( 'positions-store:get(): ', url, _infiniteListPositions );
			return _infiniteListPositions[ url ];
		}
	};

emitter( InfiniteListPositionsStore );

function storeInfiniteListPositions( url, positions ) {
	const oldPositions = InfiniteListPositionsStore.get( url );
	debug( 'comparing positions:', url, oldPositions, positions );
	if ( isEqual( oldPositions, positions ) ) {
		return;
	}

	debug( 'storing values:', url, positions );
	_infiniteListPositions[ url ] = positions;
	InfiniteListPositionsStore.emit( 'change' );
}

InfiniteListPositionsStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	switch ( action.type ) {
		case 'INFINITE_LIST_POSITION_CHANGED':
			storeInfiniteListPositions( action.url, action.positions );
			break;
	}
} );

module.exports = InfiniteListPositionsStore;
