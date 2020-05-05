/**
 * External dependencies
 */
import { assign } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:media' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { createTransientMedia } from './utils';
import getMediaItemErrors from 'state/selectors/get-media-item-errors';
import MediaStore from './store';
import MediaListStore from './list-store';
import {
	changeMediaSource,
	clearMediaErrors,
	clearMediaItemErrors,
	createMediaItem,
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	successMediaItemRequest,
	successMediaRequest,
} from 'state/media/actions';

/**
 * @typedef IMediaActions
 *
 * TODO: Better method types
 *
 * @property {Function} fetch
 * @property {Function} setLibrarySelectedItems
 */

/**
 * @type {IMediaActions}
 */
const MediaActions = {
	_fetching: {},
};

/**
 * Constants
 */
const ONE_YEAR_IN_MILLISECONDS = 31540000000;

MediaActions.setQuery = function ( siteId, query ) {
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_QUERY',
		siteId: siteId,
		query: query,
	} );
};

MediaActions.fetch = function ( siteId, itemId ) {
	const fetchKey = [ siteId, itemId ].join();
	if ( MediaActions._fetching[ fetchKey ] ) {
		return;
	}

	MediaActions._fetching[ fetchKey ] = true;
	Dispatcher.handleViewAction( {
		type: 'FETCH_MEDIA_ITEM',
		siteId: siteId,
		id: itemId,
	} );

	debug( 'Fetching media for %d using ID %d', siteId, itemId );
	wpcom
		.site( siteId )
		.media( itemId )
		.get( function ( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_MEDIA_ITEM',
				error: error,
				siteId: siteId,
				data: data,
			} );

			delete MediaActions._fetching[ fetchKey ];
		} );
};

MediaActions.fetchNextPage = function ( siteId ) {
	if ( MediaListStore.isFetchingNextPage( siteId ) ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'FETCH_MEDIA_ITEMS',
		siteId: siteId,
	} );

	const query = MediaListStore.getNextPageQuery( siteId );

	const mediaReceived = ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEMS',
			error: error,
			siteId: siteId,
			data: data,
			query: query,
		} );
		if ( error ) {
			reduxDispatch( failMediaRequest( siteId, query, error ) );
		} else {
			reduxDispatch( successMediaRequest( siteId, query ) );
			reduxDispatch( receiveMedia( siteId, data.media, data.found, query ) );
		}
	};

	debug( 'Fetching media for %d using query %o', siteId, query );

	if ( ! query.source ) {
		wpcom.site( siteId ).mediaList( query, mediaReceived );
	} else {
		wpcom.undocumented().externalMediaList( query, mediaReceived );
	}
};

const getExternalUploader = ( service ) => ( file, siteId ) => {
	return wpcom.undocumented().site( siteId ).uploadExternalMedia( service, [ file.guid ] );
};

const getFileUploader = () => ( file, siteId ) => {
	// Determine upload mechanism by object type
	const isUrl = 'string' === typeof file;

	// Assign parent ID if currently editing post
	const postId = getEditorPostId( reduxGetState() );
	const title = file.title;
	if ( postId ) {
		file = {
			parent_id: postId,
			[ isUrl ? 'url' : 'file' ]: file,
		};
	} else if ( file.fileContents ) {
		//if there's no parent_id, but the file object is wrapping a Blob
		//(contains fileContents, fileName etc) still wrap it in a new object
		file = {
			file: file,
		};
	}

	if ( title ) {
		file.title = title;
	}

	debug( 'Uploading media to %d from %o', siteId, file );

	if ( isUrl ) {
		return wpcom.site( siteId ).addMediaUrls( {}, file );
	}

	return wpcom.site( siteId ).addMediaFiles( {}, file );
};

function uploadFiles( uploader, files, site ) {
	// We offset the current time when generating a fake date for the transient
	// media so that the first uploaded media doesn't suddenly become newest in
	// the set once it finishes uploading. This duration is pretty arbitrary,
	// but one would hope that it would never take this long to upload an item.
	const baseTime = Date.now() + ONE_YEAR_IN_MILLISECONDS;
	const siteId = site.ID;

	return files.reduce( ( lastUpload, file, i ) => {
		// Assign a date such that the first item will be the oldest at the
		// time of upload, as this is expected order when uploads finish
		const date = new Date( baseTime - ( files.length - i ) ).toISOString();

		// Generate a fake transient item that can be used immediately, even
		// before the media has persisted to the server
		const transientMedia = { date, ...createTransientMedia( file ) };
		if ( file.ID ) {
			transientMedia.ID = file.ID;
		}

		Dispatcher.handleViewAction( {
			type: 'CREATE_MEDIA_ITEM',
			siteId: siteId,
			data: transientMedia,
			site,
		} );

		// Abort upload if file fails to pass validation.
		if ( getMediaItemErrors( reduxGetState(), siteId, transientMedia.ID ).length ) {
			return Promise.resolve();
		}

		// If there are no errors, dispatch the create media item action
		reduxDispatch( createMediaItem( site, transientMedia ) );

		return lastUpload.then( () => {
			// Achieve series upload by waiting for the previous promise to
			// resolve before starting this item's upload
			const action = { type: 'RECEIVE_MEDIA_ITEM', id: transientMedia.ID, siteId };

			return uploader( file, siteId )
				.then( ( data ) => {
					Dispatcher.handleServerAction(
						Object.assign( action, {
							data: data.media[ 0 ],
						} )
					);

					reduxDispatch( successMediaItemRequest( siteId, transientMedia.ID ) );
					reduxDispatch( receiveMedia( siteId, data.media, data.found ) );

					// also refetch media limits
					Dispatcher.handleServerAction( {
						type: 'FETCH_MEDIA_LIMITS',
						siteId: siteId,
					} );
				} )
				.catch( ( error ) => {
					Dispatcher.handleServerAction( Object.assign( action, { error } ) );
					reduxDispatch( failMediaItemRequest( siteId, transientMedia.ID, error ) );
				} );
		} );
	}, Promise.resolve() );
}

MediaActions.addExternal = function ( site, files, service ) {
	return uploadFiles( getExternalUploader( service ), files, site );
};

MediaActions.add = function ( site, files ) {
	if ( files instanceof window.FileList ) {
		files = [ ...files ];
	}

	if ( ! Array.isArray( files ) ) {
		files = [ files ];
	}

	return uploadFiles( getFileUploader(), files, site );
};

MediaActions.edit = function ( siteId, item ) {
	const newItem = assign( {}, MediaStore.get( siteId, item.ID ), item );

	Dispatcher.handleViewAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId: siteId,
		data: newItem,
	} );
};

MediaActions.update = function ( siteId, item, editMediaFile = false ) {
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
		data: newItem,
	};

	if ( item.media ) {
		// Show a fake transient media item that can be rendered into the list immediately,
		// even before the media has persisted to the server
		updateAction.data = {
			...newItem,
			...createTransientMedia( item.media ),
			ID: mediaId,
		};
	} else if ( editMediaFile && item.media_url ) {
		updateAction.data = {
			...newItem,
			...createTransientMedia( item.media_url ),
			ID: mediaId,
		};
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
		[ method ]( item, function ( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_MEDIA_ITEM',
				error: error,
				siteId: siteId,
				data: editMediaFile ? { ...data, isDirty: true } : data,
			} );
		} );
};

MediaActions.delete = function ( siteId, item ) {
	if ( Array.isArray( item ) ) {
		item.forEach( MediaActions.delete.bind( null, siteId ) );
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId: siteId,
		data: item,
	} );

	debug( 'Deleting media from %d by ID %d', siteId, item.ID );
	wpcom
		.site( siteId )
		.media( item.ID )
		.delete( function ( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'REMOVE_MEDIA_ITEM',
				error: error,
				siteId: siteId,
				data: data,
			} );
			// also refetch storage limits
			Dispatcher.handleServerAction( {
				type: 'FETCH_MEDIA_LIMITS',
				siteId: siteId,
			} );
		} );
};

MediaActions.setLibrarySelectedItems = function ( siteId, items ) {
	debug( 'Setting selected items for %d as %o', siteId, items );
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_LIBRARY_SELECTED_ITEMS',
		siteId: siteId,
		data: items,
	} );
};

MediaActions.clearValidationErrors = function ( siteId, itemId ) {
	debug( 'Clearing validation errors for %d, with item ID %d', siteId, itemId );
	Dispatcher.handleViewAction( {
		type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
		siteId: siteId,
		itemId: itemId,
	} );
	reduxDispatch( clearMediaItemErrors( siteId, itemId ) );
};

MediaActions.clearValidationErrorsByType = function ( siteId, type ) {
	debug( 'Clearing validation errors for %d, by type %s', siteId, type );
	Dispatcher.handleViewAction( {
		type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
		siteId: siteId,
		errorType: type,
	} );
	reduxDispatch( clearMediaErrors( siteId, type ) );
};

MediaActions.sourceChanged = function ( siteId ) {
	debug( 'Media data source changed' );
	Dispatcher.handleViewAction( {
		type: 'CHANGE_MEDIA_SOURCE',
		siteId,
	} );
	reduxDispatch( changeMediaSource( siteId ) );
};

export default MediaActions;
