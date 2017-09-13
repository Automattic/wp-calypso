/**
 * Internal dependencies
 */
import debug from 'debug';
import wpcom from 'lib/wp';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isRequestingMediaItem } from 'state/selectors';
import { MEDIA_REQUEST, MEDIA_ITEM_REQUEST } from 'state/action-types';
import {
	failMediaRequest,
	failMediaItemRequest,
	receiveMedia,
	requestingMedia,
	requestingMediaItem,
	successMediaRequest,
	successMediaItemRequest
} from 'state/media/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-media' );

/**
 * Issues an API request to fetch media for a site and query.
 *
 * @param  {Object}  store  Redux store
 * @param  {Object}  action Action object
 * @return {Promise}        Promise
 */
export function requestMedia( { dispatch, getState }, action ) {
	dispatch( requestingMedia( action.siteId, action.query ) );

	log( 'Request media for site %d using query %o', action.siteId, action.query );

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/media`,
				apiVersion: '1.1',
			},
			action
		)
	);
}

export function requestMediaSuccess( { dispatch }, { siteId, query }, { media, found } ) {
	dispatch( receiveMedia( siteId, media, found, query ) );
	dispatch( successMediaRequest( siteId, query ) );
}

export function requestMediaError( { dispatch }, { siteId, query } ) {
	dispatch( failMediaRequest( siteId, query ) );
}

export function requestMediaItem( { dispatch, getState }, { siteId, mediaId } ) {
	if ( isRequestingMediaItem( getState(), siteId, mediaId ) ) {
		return;
	}

	dispatch( requestingMediaItem( siteId, mediaId ) );

	log( 'Request media item %d for site %d', mediaId, siteId );

	return wpcom
		.site( siteId )
		.media( mediaId )
		.get()
		.then( ( media ) => {
			dispatch( receiveMedia( siteId, media ) );
			dispatch( successMediaItemRequest( siteId, mediaId ) );
		} )
		.catch( () => dispatch( failMediaItemRequest( siteId, mediaId ) ) );
}

function handleMediaItemRequest( { dispatch, getState }, action ) {
	const { mediaId, query, siteId } = action;
	if ( isRequestingMediaItem( getState(), siteId, mediaId ) ) {
		return;
	}

	dispatch( requestingMediaItem( siteId, query ) );

	log( 'Request media item %d for site %d', mediaId, siteId );

	dispatch(
		http(
			{
				apiVersion: '1.2',
				method: 'GET',
				path: `/sites/${ siteId }/media/${ mediaId }`,
				query,
			},
			action
		)
	);
}

export default {
	[ MEDIA_REQUEST ]: [ dispatchRequest( requestMedia, requestMediaSuccess, requestMediaError ) ],
	[ MEDIA_ITEM_REQUEST ]: [
		requestMediaItem,
		dispatchRequest( handleMediaItemRequest, ()=>{}, () => {} ),
	],
};
