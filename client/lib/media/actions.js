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
import { reduxDispatch } from 'lib/redux-bridge';
import { createTransientMedia } from './utils';
import MediaStore from './store';
import MediaListStore from './list-store';
import {
	changeMediaSource,
	deleteMedia,
	failMediaRequest,
	receiveMedia,
	successMediaRequest,
} from 'state/media/actions';

/**
 * @typedef IMediaActions
 *
 * TODO: Better method types
 *
 * @property {Function} fetch
 */

/**
 * @type {IMediaActions}
 */
const MediaActions = {
	_fetching: {},
};

MediaActions.setQuery = function ( siteId, query ) {
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_QUERY',
		siteId: siteId,
		query: query,
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

	reduxDispatch( receiveMedia( siteId, updateAction.data ) );

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

	reduxDispatch( deleteMedia( siteId, item.ID ) );

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

MediaActions.sourceChanged = function ( siteId ) {
	debug( 'Media data source changed' );
	Dispatcher.handleViewAction( {
		type: 'CHANGE_MEDIA_SOURCE',
		siteId,
	} );
	reduxDispatch( changeMediaSource( siteId ) );
};

export default MediaActions;
