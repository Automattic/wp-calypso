/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:media' ),
	assign = require( 'lodash/assign' );

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
const MediaActions = {
	_fetching: {}
};

/**
 * Constants
 */
const ONE_YEAR_IN_MILLISECONDS = 31540000000;

MediaActions.setQuery = function( siteId, query ) {
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_QUERY',
		siteId: siteId,
		query: query
	} );
};

MediaActions.fetch = function( siteId, itemId ) {
	var fetchKey = [ siteId, itemId ].join();
	if ( MediaActions._fetching[ fetchKey ] ) {
		return;
	}

	MediaActions._fetching[ fetchKey ] = true;
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

		delete MediaActions._fetching[ fetchKey ];
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

MediaActions.add = function( siteId, files ) {
	if ( files instanceof window.FileList ) {
		files = [ ...files ];
	}

	if ( ! Array.isArray( files ) ) {
		files = [ files ];
	}

	// We offset the current time when generating a fake date for the transient
	// media so that the first uploaded media doesn't suddenly become newest in
	// the set once it finishes uploading. This duration is pretty arbitrary,
	// but one would hope that it would never take this long to upload an item.
	const baseTime = Date.now() + ONE_YEAR_IN_MILLISECONDS;

	return files.reduce( ( lastUpload, file, i ) => {
		// Assign a date such that the first item will be the oldest at the
		// time of upload, as this is expected order when uploads finish
		const date = new Date( baseTime - ( files.length - i ) ).toISOString();

		// Generate a fake transient item that can be used immediately, even
		// before the media has persisted to the server
		const transientMedia = { date, ...MediaUtils.createTransientMedia( file ) };
		if ( file.ID ) {
			transientMedia.ID = file.ID;
		}

		Dispatcher.handleViewAction( {
			type: 'CREATE_MEDIA_ITEM',
			siteId: siteId,
			data: transientMedia
		} );

		// Abort upload if file fails to pass validation.
		if ( MediaValidationStore.getErrors( siteId, transientMedia.ID ).length ) {
			return Promise.resolve();
		}

		// Determine upload mechanism by object type
		const isUrl = 'string' === typeof file;
		const addHandler = isUrl ? 'addMediaUrls' : 'addMediaFiles';

		// Assign parent ID if currently editing post
		const post = PostEditStore.get();
		const title = file.title;
		if ( post && post.ID ) {
			file = {
				parent_id: post.ID,
				[ isUrl ? 'url' : 'file' ]: file
			};
		} else if ( file.fileContents ) {
			//if there's no parent_id, but the file object is wrapping a Blob
			//(contains fileContents, fileName etc) still wrap it in a new object
			file = {
				file: file
			};
		}

		if ( title ) {
			file.title = title;
		}

		debug( 'Uploading media to %d from %o', siteId, file );

		return lastUpload.then( () => {
			// Achieve series upload by waiting for the previous promise to
			// resolve before starting this item's upload
			const action = { type: 'RECEIVE_MEDIA_ITEM', id: transientMedia.ID, siteId };
			return wpcom.site( siteId )[ addHandler ]( {}, file ).then( ( data ) => {
				Dispatcher.handleServerAction( Object.assign( action, {
					data: data.media[ 0 ]
				} ) );
				// also refetch media limits
				Dispatcher.handleServerAction( {
					type: 'FETCH_MEDIA_LIMITS',
					siteId: siteId
				} );
			} ).catch( ( error ) => {
				Dispatcher.handleServerAction( Object.assign( action, { error } ) );
			} );
		} );
	}, Promise.resolve() );
};

MediaActions.edit = function( siteId, item ) {
	var newItem = assign( {}, MediaStore.get( siteId, item.ID ), item );

	Dispatcher.handleViewAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId: siteId,
		data: newItem
	} );
};

MediaActions.update = function( siteId, item, editMediaFile = false ) {
	if ( Array.isArray( item ) ) {
		item.forEach( MediaActions.update.bind( null, siteId ) );
		return;
	}

	const mediaId = item.ID;
	const newItem = assign( {}, MediaStore.get( siteId, mediaId ), item );

	// Let's update the media modal immediately
	// with a fake transient media item
	const updateAction = {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId,
		data: newItem
	};

	if ( item.media ) {
		// Show a fake transient media item that can be rendered into the list immediately,
		// even before the media has persisted to the server
		updateAction.data = { ...newItem, ...MediaUtils.createTransientMedia( item.media ), ID: mediaId };
	} else if ( editMediaFile && item.media_url ) {
		updateAction.data = { ...newItem, ...MediaUtils.createTransientMedia( item.media_url ), ID: mediaId };
	}

	if ( editMediaFile && updateAction.data ) {
		// We need this to show a transient (edited) image in post/page editor after it has been edited there.
		updateAction.data.isDirty = true;
	}

	debug( 'Updating media for %o by ID %o to %o', siteId, mediaId, updateAction );
	Dispatcher.handleViewAction( updateAction );

	const method = editMediaFile ? 'edit' : 'update';

	wpcom
		.site( siteId )
		.media( item.ID )
		[ method ]( item, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_MEDIA_ITEM',
				error: error,
				siteId: siteId,
				data: editMediaFile
					? { ...data, isDirty: true }
					: data
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
		// also refetch storage limits
		Dispatcher.handleServerAction( {
			type: 'FETCH_MEDIA_LIMITS',
			siteId: siteId
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

MediaActions.changeSource = function( siteId, source ) {
	debug( 'Changing media source to ' + source );
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_SOURCE',
		siteId,
		source,
	} );
};

module.exports = MediaActions;
