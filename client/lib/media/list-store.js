/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	omit = require( 'lodash/omit' ),
	map = require( 'lodash/map' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	MediaStore = require( './store' ),
	MediaUtils = require( './utils' ),
	emitter = require( 'lib/mixins/emitter' );

/**
 * Module variables
 */
const MediaListStore = {
		_activeQueries: {},
		DEFAULT_QUERY: Object.freeze( { number: 20 } ),
		_media: {}
	},
	DEFAULT_ACTIVE_QUERY = Object.freeze( { isFetchingNextPage: false } ),
	SAME_QUERY_IGNORE_PARAMS = Object.freeze( [ 'number', 'page_handle' ] );

function sortItemsByDate( siteId ) {
	var sortedItems;

	if ( ! ( siteId in MediaListStore._media ) ) {
		return;
	}

	sortedItems = MediaUtils.sortItemsByDate( MediaListStore.getAll( siteId ) );
	MediaListStore._media[ siteId ] = map( sortedItems, 'ID' );
}

function ensureMediaForSiteId( siteId ) {
	if ( ! ( siteId in MediaListStore._media ) ) {
		MediaListStore._media[ siteId ] = [];
	}
}

function receiveSingle( siteId, item, itemId ) {
	var existingIndex;

	ensureMediaForSiteId( siteId );

	if ( itemId ) {
		// When updating an existing item, account for the case where the ID
		// has changed by replacing its existing ID in the array
		existingIndex = MediaListStore._media[ siteId ].indexOf( itemId );
		if ( -1 !== existingIndex ) {
			MediaListStore._media[ siteId ].splice( existingIndex, 1, item.ID );
		}
	} else if ( -1 === MediaListStore._media[ siteId ].indexOf( item.ID ) && MediaListStore.isItemMatchingQuery( siteId, item ) ) {
		MediaListStore._media[ siteId ].push( item.ID );
	}
}

function removeSingle( siteId, item ) {
	var index;

	if ( ! ( siteId in MediaListStore._media ) ) {
		return;
	}

	index = MediaListStore._media[ siteId ].indexOf( item.ID );
	if ( -1 !== index ) {
		MediaListStore._media[ siteId ].splice( index, 1 );
	}
}

function receivePage( siteId, items ) {
	ensureMediaForSiteId( siteId );

	items.forEach( function( item ) {
		receiveSingle( siteId, item );
	} );
}

MediaListStore.ensureActiveQueryForSiteId = function( siteId ) {
	if ( ! ( siteId in MediaListStore._activeQueries ) ) {
		MediaListStore._activeQueries[ siteId ] = assign( {}, DEFAULT_ACTIVE_QUERY );
	}
};

function updateActiveQuery( siteId, query ) {
	query = omit( query, 'page_handle' );
	MediaListStore.ensureActiveQueryForSiteId( siteId );

	if ( ! isQuerySame( siteId, query ) ) {
		delete MediaListStore._media[ siteId ];
		delete MediaListStore._activeQueries[ siteId ].nextPageHandle;
		MediaListStore._activeQueries[ siteId ].isFetchingNextPage = false;
	}

	MediaListStore._activeQueries[ siteId ].query = query;
}

function updateActiveQueryStatus( siteId, status ) {
	MediaListStore.ensureActiveQueryForSiteId( siteId );
	assign( MediaListStore._activeQueries[ siteId ], status );
}

function getNextPageMetaFromResponse( response ) {
	return response && response.meta && response.meta.next_page ? response.meta.next_page : null;
}

function isQuerySame( siteId, query ) {
	if ( ! ( siteId in MediaListStore._activeQueries ) ) {
		return false;
	}

	return isEqual(
		omit( query, SAME_QUERY_IGNORE_PARAMS ),
		omit( MediaListStore._activeQueries[ siteId ].query, SAME_QUERY_IGNORE_PARAMS )
	);
}

MediaListStore.isItemMatchingQuery = function( siteId, item ) {
	var query, matches;

	if ( ! ( siteId in MediaListStore._activeQueries ) ) {
		return true;
	}

	query = omit( MediaListStore._activeQueries[ siteId ].query, SAME_QUERY_IGNORE_PARAMS );

	if ( ! Object.keys( query ).length ) {
		return true;
	}

	matches = true;

	if ( query.search ) {
		// WP_Query tests a post's title and content when performing a search.
		// Since we're testing binary data, we match the title only.
		//
		// See: https://core.trac.wordpress.org/browser/tags/4.2.2/src/wp-includes/query.php#L2091
		matches = item.title && -1 !== item.title.toLowerCase().indexOf( query.search.toLowerCase() );
	}

	if ( query.mime_type && matches ) {
		// Mime type query can contain a fragment, e.g. "image/", so match
		// item mime type at beginning
		matches = item.mime_type && 0 === item.mime_type.indexOf( query.mime_type );
	}

	return matches;
};

emitter( MediaListStore );

MediaListStore.get = function( siteId, postId ) {
	return MediaStore.get( siteId, postId );
};

MediaListStore.getAllIds = function( siteId ) {
	return MediaListStore._media[ siteId ];
};

MediaListStore.getAll = function( siteId ) {
	var allIds = MediaListStore.getAllIds( siteId );

	if ( allIds ) {
		return allIds.map( MediaStore.get.bind( null, siteId ) );
	}
};

MediaListStore.getNextPageQuery = function( siteId ) {
	if ( ! ( siteId in MediaListStore._activeQueries ) ) {
		return MediaListStore.DEFAULT_QUERY;
	}

	return assign( {}, MediaListStore.DEFAULT_QUERY, {
		page_handle: MediaListStore._activeQueries[ siteId ].nextPageHandle
	}, MediaListStore._activeQueries[ siteId ].query );
};

MediaListStore.hasNextPage = function( siteId ) {
	return ! ( siteId in MediaListStore._activeQueries ) || null !== MediaListStore._activeQueries[ siteId ].nextPageHandle;
};

MediaListStore.isFetchingNextPage = function( siteId ) {
	return siteId in MediaListStore._activeQueries && MediaListStore._activeQueries[ siteId ].isFetchingNextPage;
};

MediaListStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	Dispatcher.waitFor( [ MediaStore.dispatchToken ] );

	switch ( action.type ) {
		case 'SET_MEDIA_QUERY':
			if ( action.siteId && action.query ) {
				updateActiveQuery( action.siteId, action.query );
			}

			break;

		case 'FETCH_MEDIA_ITEMS':
			if ( ! action.siteId ) {
				break;
			}

			updateActiveQueryStatus( action.siteId, {
				isFetchingNextPage: true
			} );

			MediaListStore.emit( 'change' );
			break;

		case 'CREATE_MEDIA_ITEM':
		case 'RECEIVE_MEDIA_ITEM':
			if ( action.error && action.siteId && action.id ) {
				// If error occured while uploading, remove item from store
				removeSingle( action.siteId, { ID: action.id } );
				MediaListStore.emit( 'change' );
			}

			if ( ! action.siteId ) {
				break;
			}

			if ( action.error || ! action.data ) {
				break;
			}

			receiveSingle( action.siteId, action.data, action.id );
			sortItemsByDate( action.siteId );
			MediaListStore.emit( 'change' );
			break;

		case 'RECEIVE_MEDIA_ITEMS':
			if ( ! action.siteId ) {
				break;
			}

			updateActiveQueryStatus( action.siteId, {
				isFetchingNextPage: false,
				nextPageHandle: getNextPageMetaFromResponse( action.data )
			} );

			if ( action.error || ! action.data || ( action.query && ! isQuerySame( action.siteId, action.query ) ) ) {
				break;
			}

			receivePage( action.siteId, action.data.media );
			sortItemsByDate( action.siteId );
			MediaListStore.emit( 'change' );
			break;

		case 'REMOVE_MEDIA_ITEM':
			if ( ! action.siteId || ! action.data ) {
				break;
			}

			if ( action.error ) {
				receiveSingle( action.siteId, action.data );
			} else {
				removeSingle( action.siteId, action.data );
			}

			MediaListStore.emit( 'change' );
			break;
	}
} );

module.exports = MediaListStore;
