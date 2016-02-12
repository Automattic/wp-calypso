/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	scrollStore = require( 'lib/infinite-list/scroll-store' ),
	positionsStore = require( 'lib/infinite-list/positions-store' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Module variables
 */
let _lastCalledPositions = null,
	_lastCalledScroll = null;

module.exports = {
	storePositions: function( url, positions ) {
		if ( ! _lastCalledPositions ) {
			setTimeout( () => {
				let storedPositions = positionsStore.get( _lastCalledPositions.url );
				if ( ! isEqual( _lastCalledPositions.positions, storedPositions ) ) {
					Dispatcher.handleViewAction( {
						type: 'INFINITE_LIST_POSITION_CHANGED',
						url: _lastCalledPositions.url,
						positions: _lastCalledPositions.positions
					} );
				}
				_lastCalledPositions = null;
			}, 0 );
		}
		_lastCalledPositions = { url, positions }
	},
	storeScroll: function( url, scrollPosition ) {
		if ( ! _lastCalledScroll ) {
			setTimeout( () => {
				let storedScroll = scrollStore.get( _lastCalledScroll.url );
				if ( _lastCalledScroll.scrollPosition !== storedScroll ) {
					Dispatcher.handleViewAction( {
						type: 'SCROLL_CHANGED',
						url: _lastCalledScroll.url,
						scrollPosition: _lastCalledScroll.scrollPosition
					} );
				}
				_lastCalledScroll = null;
			}, 0 );
		}
		_lastCalledScroll = { url, scrollPosition }
	}
};
