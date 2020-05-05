/**
 * External dependencies
 */

import { assign, values } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:viewers:store' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

let _fetchingViewers = {},
	_viewersBySite = {},
	_totalViewers = {},
	_numViewersFetched = {},
	_viewersCurrentPage = {},
	_removingFromSite = {};

const ViewersStore = {
	// This data may help with infinite scrolling
	getPaginationData: function ( siteId ) {
		return {
			totalViewers: _totalViewers[ siteId ] || 0,
			fetchingViewers: _fetchingViewers[ siteId ],
			currentViewersPage: _viewersCurrentPage[ siteId ],
			numViewersFetched: _numViewersFetched[ siteId ],
		};
	},

	getViewers: function ( siteId ) {
		if ( ! _viewersBySite[ siteId ] ) {
			return false;
		}

		return values( _viewersBySite[ siteId ] );
	},

	isRemoving: function ( siteId ) {
		return _removingFromSite[ siteId ];
	},

	emitChange: function () {
		this.emit( 'change' );
	},
};

function updateViewer( siteId, id, viewer ) {
	if ( ! _viewersBySite[ siteId ] ) {
		_viewersBySite[ siteId ] = {};
	}
	if ( ! _viewersBySite[ siteId ][ id ] ) {
		_viewersBySite[ siteId ][ id ] = {};
	}

	_viewersBySite[ siteId ][ id ] = assign( {}, _viewersBySite[ siteId ][ id ], viewer );

	debug( 'Updating viewer:', _viewersBySite[ siteId ][ id ] );
}

function updateViewers( siteId, viewers, page, total ) {
	_fetchingViewers[ siteId ] = false;
	_totalViewers[ siteId ] = total;
	_viewersCurrentPage[ siteId ] = page;

	if ( page === 1 ) {
		_viewersBySite[ siteId ] = {};
		_numViewersFetched[ siteId ] = 0;
	}

	viewers.forEach( function ( viewer ) {
		_numViewersFetched[ siteId ]++;
		updateViewer( siteId, viewer.ID, viewer );
	} );
}

function incrementPaginationData( siteId ) {
	_totalViewers[ siteId ]++;
	_numViewersFetched[ siteId ]++;
	_viewersCurrentPage[ siteId ]++;
}

function decrementPaginationData( siteId ) {
	_totalViewers[ siteId ]--;
	_numViewersFetched[ siteId ]--;
	_viewersCurrentPage[ siteId ]--;
}

function removeViewerFromSite( siteId, viewerId ) {
	if ( ! _viewersBySite[ siteId ] || ! _viewersBySite[ siteId ][ viewerId ] ) {
		return;
	}
	delete _viewersBySite[ siteId ][ viewerId ];
	decrementPaginationData( siteId );
}

ViewersStore.dispatchToken = Dispatcher.register( function ( payload ) {
	const action = payload.action;
	debug( 'register event Type', action.type, payload );

	switch ( action.type ) {
		case 'FETCHING_VIEWERS':
			_fetchingViewers[ action.siteId ] = true;
			ViewersStore.emitChange();
			break;
		case 'RECEIVE_VIEWERS':
			_fetchingViewers[ action.siteId ] = false;
			// Only update users if there was not an error
			if ( ! action.error ) {
				updateViewers( action.siteId, action.data.viewers, action.page, action.data.found );
			}
			ViewersStore.emitChange();
			break;
		case 'REMOVE_VIEWER':
			_removingFromSite[ action.siteId ] = true;
			removeViewerFromSite( action.siteId, action.viewer.ID );
			ViewersStore.emitChange();
			break;
		case 'RECEIVE_REMOVE_VIEWER_SUCCESS':
			_removingFromSite[ action.siteId ] = false;
			ViewersStore.emitChange();
			break;
		case 'RECEIVE_REMOVE_VIEWER_ERROR':
			_removingFromSite[ action.siteId ] = false;
			updateViewer( action.siteId, action.viewer.ID, action.viewer );
			incrementPaginationData( action.siteId );
			ViewersStore.emitChange();
			break;
	}
} );

emitter( ViewersStore );

export default ViewersStore;
