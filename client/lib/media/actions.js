/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:media' ),
	assign = require( 'lodash/object/assign' ),
	uniqueId = require( 'lodash/utility/uniqueId' ),
	isPlainObject = require( 'lodash/lang/isPlainObject' ),
	path = require( 'path' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ),
	MediaUtils = require( './utils' ),
	PostEditStore = require( 'lib/posts/post-edit-store' ),
	MediaStore = require( './store' ),
	MediaListStore = require( './list-store' ),
	MediaValidationStore = require( './validation-store' );

/**
 * Module variables
 */
var MediaActions = {},
	_fetching = {};

MediaActions.setQuery = function( siteId, query ) {
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_QUERY',
		siteId: siteId,
		query: query
	} );
};

MediaActions.fetch = function( siteId, itemId ) {
	var fetchKey = [ siteId, itemId ].join();
	if ( _fetching[ fetchKey ] ) {
		return;
	}

	_fetching[ fetchKey ] = true;
	Dispatcher.handleViewAction( {
		type: 'FETCH_MEDIA_ITEM',
		siteId: siteId,
		id: itemId
	} );

	debug( 'Fetching media for %d using ID %d', siteId, itemId );
	wpcom.site( siteId ).media( itemId ).get( function( error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEM',
			error: error,
			siteId: siteId,
			data: data
		} );

		delete _fetching[ fetchKey ];
	} );
};

MediaActions.fetchNextPage = function( siteId ) {
	var query;

	if ( MediaListStore.isFetchingNextPage( siteId ) ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'FETCH_MEDIA_ITEMS',
		siteId: siteId
	} );

	query = MediaListStore.getNextPageQuery( siteId );

	debug( 'Fetching media for %d using query %o', siteId, query );
	wpcom.site( siteId ).mediaList( query, function( error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEMS',
			error: error,
			siteId: siteId,
			data: data,
			query: query
		} );
	} );
};

MediaActions.add = function( siteId, file ) {
	var query = {},
		isUrl = 'string' === typeof file,
		addHandler = isUrl ? 'addMediaUrls' : 'addMediaFiles',
		fileUrl, transientMedia;

	if ( Array.isArray( file ) || file instanceof window.FileList ) {
		Array.prototype.slice.call( file ).forEach( MediaActions.add.bind( null, siteId ) );
		return;
	}

	// Generate a fake transient media item that can be rendered into the list
	// immediately, even before the media has persisted to the server
	transientMedia = {
		ID: uniqueId( 'media-' ),
		date: new Date().toISOString(),
		transient: true
	};

	if ( 'string' === typeof file ) {
		// Generate from string
		assign( transientMedia, {
			file: file,
			extension: path.extname( file ).slice( 1 ),
			mime_type: MediaUtils.getMimeType( file ),
			title: path.basename( file )
		} );
	} else {
		// Generate from window.File object
		fileUrl = window.URL.createObjectURL( file );
		assign( transientMedia, {
			URL: fileUrl,
			guid: fileUrl,
			file: file.name,
			extension: path.extname( file.name ).slice( 1 ),
			mime_type: MediaUtils.getMimeType( file.name ),
			title: path.basename( file.name ),
			// Size is not an API media property, though can be useful for
			// validation purposes if known
			size: file.size
		} );
	}

	Dispatcher.handleViewAction( {
		type: 'CREATE_MEDIA_ITEM',
		siteId: siteId,
		data: transientMedia
	} );

	// Abort upload if file fails to pass validation.
	if ( MediaValidationStore.getErrors( siteId, transientMedia.ID ).length ) {
		return;
	}

	// Assign parent ID if currently editing post
	const post = PostEditStore.get();
	if ( post && post.ID && ! isPlainObject( file ) ) {
		file = {
			parent_id: post.ID,
			[ isUrl ? 'url' : 'file' ]: file
		};
	}

	debug( 'Uploading media to %d from %o', siteId, file );
	wpcom.site( siteId )[ addHandler ]( query, file, function( error, data ) {
		var item;
		if ( data && data.media ) {
			item = data.media[0];
		}

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEM',
			error: error,
			siteId: siteId,
			id: transientMedia.ID,
			data: item
		} );
	} );
};

MediaActions.edit = function( siteId, item ) {
	var newItem = assign( {}, MediaStore.get( siteId, item.ID ), item );

	Dispatcher.handleViewAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId: siteId,
		data: newItem
	} );
};

MediaActions.update = function( siteId, item ) {
	var newItem;

	if ( Array.isArray( item ) ) {
		item.forEach( MediaActions.update.bind( null, siteId ) );
		return;
	}

	newItem = assign( {}, MediaStore.get( siteId, item.ID ), item );

	Dispatcher.handleViewAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId: siteId,
		data: newItem
	} );

	debug( 'Updating media for %d by ID %d to %o', siteId, item.ID, item );
	wpcom.site( siteId ).media( item.ID ).update( item, function( error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEM',
			error: error,
			siteId: siteId,
			data: data
		} );
	} );
};

MediaActions.delete = function( siteId, item ) {
	if ( Array.isArray( item ) ) {
		item.forEach( MediaActions.delete.bind( null, siteId ) );
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId: siteId,
		data: item
	} );

	debug( 'Deleting media from %d by ID %d', siteId, item.ID );
	wpcom.site( siteId ).media( item.ID ).delete( function( error, data ) {
		Dispatcher.handleServerAction( {
			type: 'REMOVE_MEDIA_ITEM',
			error: error,
			siteId: siteId,
			data: data
		} );
	} );
};

MediaActions.setLibrarySelectedItems = function( siteId, items ) {
	debug( 'Setting selected items for %d as %o', siteId, items );
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_LIBRARY_SELECTED_ITEMS',
		siteId: siteId,
		data: items
	} );
};

MediaActions.clearValidationErrors = function( siteId, itemId ) {
	debug( 'Clearing validation errors for %d, with item ID %d', siteId, itemId );
	Dispatcher.handleViewAction( {
		type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
		siteId: siteId,
		itemId: itemId
	} );
};

MediaActions.clearValidationErrorsByType = function( siteId, type ) {
	debug( 'Clearing validation errors for %d, by type %s', siteId, type );
	Dispatcher.handleViewAction( {
		type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
		siteId: siteId,
		errorType: type
	} );
};

module.exports = MediaActions;
