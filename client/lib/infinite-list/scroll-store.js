/** @format */
/**
 * External Dependencies
 */
var Dispatcher = require( 'dispatcher' );

/**
 * Module Variables
 */
var _scrollStore = {},
	InfiniteListScrollStore = {
		get: function( url ) {
			return _scrollStore[ url ];
		},
	};

function storeInfiniteListScrollPosition( url, scrollPosition ) {
	var oldScrollPosition = InfiniteListScrollStore.get( url );
	if ( oldScrollPosition === scrollPosition ) {
		return;
	}
	_scrollStore[ url ] = scrollPosition;
}

InfiniteListScrollStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'SCROLL_CHANGED':
			storeInfiniteListScrollPosition( action.url, action.scrollPosition );
			break;
	}
} );

module.exports = InfiniteListScrollStore;
