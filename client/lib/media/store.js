/**
 * External dependencies
 */
var values = require( 'lodash/values' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	MediaValidationStore = require( './validation-store' );

import { isItemBeingUploaded } from 'lib/media/utils';

/**
 * Module variables
 */
const MediaStore = {
	_media: {},
	_pointers: {}
};

emitter( MediaStore );

function receiveSingle( siteId, item, itemId ) {
	if ( ! ( siteId in MediaStore._media ) ) {
		MediaStore._media[ siteId ] = {};
	}

	if ( itemId ) {
		if ( ! ( siteId in MediaStore._pointers ) ) {
			MediaStore._pointers[ siteId ] = {};
		}

		MediaStore._pointers[ siteId ][ itemId ] = item.ID;

		const maybeTransientMediaItem = MediaStore._media[ siteId ][ itemId ];

		if ( isItemBeingUploaded( maybeTransientMediaItem ) ) {
			item.description = maybeTransientMediaItem.description;
			item.alt = maybeTransientMediaItem.alt;
			item.caption = maybeTransientMediaItem.caption;
		}

		delete MediaStore._media[ siteId ][ itemId ];
	}

	MediaStore._media[ siteId ][ item.ID ] = item;
}

function removeSingle( siteId, item ) {
	if ( ! ( siteId in MediaStore._media ) ) {
		return;
	}

	// This mimics the behavior we get from the server.
	// Deleted items return with only an ID.
	// Status is also added to let any listeners distinguish deleted items.
	MediaStore._media[ siteId ][ item.ID ] = { ID: item.ID, status: item.status };
}

function receivePage( siteId, items ) {
	items.forEach( function( item ) {
		receiveSingle( siteId, item );
	} );
}

function clearPointers( siteId ) {
	MediaStore._pointers[ siteId ] = {};
}

MediaStore.get = function( siteId, postId ) {
	if ( ! ( siteId in MediaStore._media ) ) {
		return;
	}

	if ( siteId in MediaStore._pointers && postId in MediaStore._pointers[ siteId ] ) {
		return MediaStore.get( siteId, MediaStore._pointers[ siteId ][ postId ] );
	}

	return MediaStore._media[ siteId ][ postId ];
};

MediaStore.getAll = function( siteId ) {
	if ( ! ( siteId in MediaStore._media ) ) {
		return;
	}

	return values( MediaStore._media[ siteId ] );
};

MediaStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	Dispatcher.waitFor( [ MediaValidationStore.dispatchToken ] );

	switch ( action.type ) {
		case 'SET_MEDIA_SOURCE':
			clearPointers( action.siteId );
			MediaStore.emit( 'change' );
			break;

		case 'CREATE_MEDIA_ITEM':
		case 'RECEIVE_MEDIA_ITEM':
		case 'RECEIVE_MEDIA_ITEMS':
			if ( action.error && action.siteId && action.id ) {
				// If error occured while uploading, remove item from store
				removeSingle( action.siteId, { ID: action.id } );
				MediaStore.emit( 'change' );
			}

			if ( action.error || ! action.siteId || ! action.data ) {
				break;
			}

			if ( Array.isArray( action.data.media ) ) {
				receivePage( action.siteId, action.data.media );
			} else {
				receiveSingle( action.siteId, action.data, action.id );
			}

			MediaStore.emit( 'change' );
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

			MediaStore.emit( 'change' );
			break;

		case 'FETCH_MEDIA_ITEM':
			if ( ! action.siteId || ! action.id ) {
				break;
			}

			receiveSingle( action.siteId, {
				ID: action.id
			} );

			MediaStore.emit( 'change' );
			break;
		case 'FETCH_MEDIA_LIMITS':
			if ( ! action.siteId ) {
				break;
			}
			MediaStore.emit( 'fetch-media-limits' );
			break;
	}
} );

module.exports = MediaStore;
