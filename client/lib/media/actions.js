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
import MediaStore from './store';
import MediaListStore from './list-store';
import {
	changeMediaSource,
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

MediaActions.sourceChanged = function ( siteId ) {
	debug( 'Media data source changed' );
	Dispatcher.handleViewAction( {
		type: 'CHANGE_MEDIA_SOURCE',
		siteId,
	} );
	reduxDispatch( changeMediaSource( siteId ) );
};

export default MediaActions;
