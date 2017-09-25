/**
 * External Dependencies
 */
import Dispatcher from 'dispatcher';

/**
 * Module Variables
 */
let _scrollStore = {},
	InfiniteListScrollStore = {
		get: function( url ) {
			return _scrollStore[ url ];
		}
	};

function storeInfiniteListScrollPosition( url, scrollPosition ) {
	const oldScrollPosition = InfiniteListScrollStore.get( url );
	if ( oldScrollPosition === scrollPosition ) {
		return;
	}
	_scrollStore[ url ] = scrollPosition;
}

InfiniteListScrollStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	switch ( action.type ) {
		case 'SCROLL_CHANGED':
			storeInfiniteListScrollPosition( action.url, action.scrollPosition );
			break;

	}
} );

module.exports = InfiniteListScrollStore;
