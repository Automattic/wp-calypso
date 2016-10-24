/**
 * External dependencies
 */
var map = require( 'lodash/map' );

/**
 * Internal dependencies
 */
var MediaStore = require( './store' ),
	Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' );

/**
 * Module variables
 */
const MediaLibrarySelectedStore = {
	_media: {}
};

function ensureSelectedItemsForSiteId( siteId ) {
	if ( siteId in MediaLibrarySelectedStore._media ) {
		return;
	}

	MediaLibrarySelectedStore._media[ siteId ] = [];
}

function setSelectedItems( siteId, items ) {
	MediaLibrarySelectedStore._media[ siteId ] = map( items, 'ID' );
}

function addSingle( siteId, item ) {
	ensureSelectedItemsForSiteId( siteId );
	MediaLibrarySelectedStore._media[ siteId ].push( item.ID );
}

function receiveSingle( siteId, item, itemId ) {
	var index;

	if ( ! itemId ) {
		itemId = item.ID;
	}

	if ( ! itemId || ! ( siteId in MediaLibrarySelectedStore._media ) ) {
		return;
	}

	index = MediaLibrarySelectedStore._media[ siteId ].indexOf( itemId );
	if ( -1 === index ) {
		return;
	}

	// Replace existing index if one exists
	MediaLibrarySelectedStore._media[ siteId ].splice( index, 1, item.ID );
}

function receiveMany( siteId, items ) {
	items.forEach( function( item ) {
		receiveSingle( siteId, item );
	} );
}

function removeSingle( siteId, item ) {
	var index;

	if ( ! ( siteId in MediaLibrarySelectedStore._media ) ) {
		return;
	}

	index = MediaLibrarySelectedStore._media[ siteId ].indexOf( item.ID );
	if ( -1 !== index ) {
		MediaLibrarySelectedStore._media[ siteId ].splice( index, 1 );
	}
}

emitter( MediaLibrarySelectedStore );

MediaLibrarySelectedStore.get = function( siteId, itemId ) {
	return MediaStore.get( siteId, itemId );
};

MediaLibrarySelectedStore.getAll = function( siteId ) {
	if ( ! ( siteId in MediaLibrarySelectedStore._media ) ) {
		return [];
	}

	return MediaLibrarySelectedStore._media[ siteId ].map( function( itemId ) {
		return MediaStore.get( siteId, itemId );
	} );
};

MediaLibrarySelectedStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	Dispatcher.waitFor( [ MediaStore.dispatchToken ] );

	switch ( action.type ) {
		case 'SET_MEDIA_LIBRARY_SELECTED_ITEMS':
			if ( action.error || ! action.siteId || ! action.data || ! Array.isArray( action.data ) ) {
				break;
			}

			setSelectedItems( action.siteId, action.data );
			MediaLibrarySelectedStore.emit( 'change' );
			break;

		case 'CREATE_MEDIA_ITEM':
			if ( ! action.error && action.siteId && action.data ) {
				addSingle( action.siteId, action.data );
				MediaLibrarySelectedStore.emit( 'change' );
			}
			break;

		case 'RECEIVE_MEDIA_ITEM':
			if ( action.error && action.siteId && action.id ) {
				// If error occured while uploading, remove item from store
				removeSingle( action.siteId, { ID: action.id } );
				MediaLibrarySelectedStore.emit( 'change' );
			}

			if ( ! action.siteId || ! action.data || action.error ) {
				break;
			}

			receiveSingle( action.siteId, action.data, action.id );
			MediaLibrarySelectedStore.emit( 'change' );
			break;

		case 'RECEIVE_MEDIA_ITEMS':
			if ( ! action.error && action.siteId && action.data && action.data.media ) {
				receiveMany( action.siteId, action.data.media );
				MediaLibrarySelectedStore.emit( 'change' );
			}
			break;

		case 'REMOVE_MEDIA_ITEM':
			if ( ! action.siteId || ! action.data || action.error ) {
				break;
			}

			removeSingle( action.siteId, action.data );
			MediaLibrarySelectedStore.emit( 'change' );
			break;
	}
} );

module.exports = MediaLibrarySelectedStore;
