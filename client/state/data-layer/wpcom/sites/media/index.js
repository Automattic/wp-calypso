/**
 * External dependencies
 */
import { toPairs } from 'lodash';

/**
 * Internal dependencies
 */

import debug from 'debug';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	MEDIA_REQUEST,
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_UPDATE,
	MEDIA_ITEM_EDIT,
	MEDIA_ITEM_DELETE,
} from 'state/action-types';
import {
	deleteMedia,
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	setNextPageHandle,
	successMediaItemRequest,
	successMediaRequest,
} from 'state/media/actions';
import { requestMediaStorage } from 'state/sites/media-storage/actions';
import {
	dispatchFluxUpdateMediaItemSuccess,
	dispatchFluxUpdateMediaItemError,
	dispatchFluxRemoveMediaItemSuccess,
	dispatchFluxRemoveMediaItemError,
	dispatchFluxRequestMediaItemSuccess,
	dispatchFluxRequestMediaItemError,
	dispatchFluxRequestMediaItemsSuccess,
} from 'state/media/utils/flux-adapter';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-media' );

export function updateMedia( action ) {
	const { siteId, item } = action;

	return [
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/media/${ item.ID }`,
				apiVersion: '1.1',
				body: item,
			},
			action
		),
	];
}

export const updateMediaSuccess = ( { siteId }, mediaItem ) => ( dispatch ) => {
	dispatch( receiveMedia( siteId, mediaItem ) );
	dispatchFluxUpdateMediaItemSuccess( siteId, mediaItem );
};

export const updateMediaError = ( { siteId }, error ) => (/* dispatch, getState */) => {
	dispatchFluxUpdateMediaItemError( siteId, error );
};

export const editMedia = ( action ) => {
	const { siteId, item } = action;
	const { ID: mediaId, ...rest } = item;

	return [
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/media/${ mediaId }/edit`,
				apiVersion: '1.1',
				formData: toPairs( rest ),
			},
			action
		),
	];
};

export function requestMedia( action ) {
	log( 'Request media for site %d using query %o', action.siteId, action.query );

	const { siteId, query } = action;

	const path =
		query && query.source ? `/meta/external-media/${ query.source }` : `/sites/${ siteId }/media`;

	return [
		http(
			{
				method: 'GET',
				path,
				apiVersion: '1.1',
				query,
			},
			action
		),
	];
}

export const requestMediaSuccess = ( { siteId, query }, data ) => ( dispatch ) => {
	dispatch( receiveMedia( siteId, data.media, data.found, query ) );
	dispatch( successMediaRequest( siteId, query ) );
	dispatch( setNextPageHandle( siteId, data.meta ) );

	dispatchFluxRequestMediaItemsSuccess( siteId, data, query );
};

export const requestMediaError = ( { siteId, query } ) => ( dispatch ) => {
	dispatch( failMediaRequest( siteId, query ) );
};

export function requestMediaItem( action ) {
	const { mediaId, query, siteId } = action;

	log( 'Request media item %d for site %d', mediaId, siteId );

	return [
		http(
			{
				apiVersion: '1.2',
				method: 'GET',
				path: `/sites/${ siteId }/media/${ mediaId }`,
				query,
			},
			action
		),
	];
}

export const receiveMediaItem = ( { mediaId, siteId }, media ) => ( dispatch ) => {
	dispatch( receiveMedia( siteId, media ) );
	dispatch( successMediaItemRequest( siteId, mediaId ) );

	dispatchFluxRequestMediaItemSuccess( siteId, media );
};

export const receiveMediaItemError = ( { mediaId, siteId }, error ) => ( dispatch ) => {
	dispatch( failMediaItemRequest( siteId, mediaId ) );
	dispatchFluxRequestMediaItemError( siteId, error );
};

export const requestDeleteMedia = ( action ) => {
	return [
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/sites/${ action.siteId }/media/${ action.mediaId }/delete`,
			},
			action
		),
	];
};

export const deleteMediaSuccess = ( { siteId }, mediaItem ) => ( dispatch ) => {
	dispatch( deleteMedia( siteId, mediaItem.ID ) );
	dispatch( requestMediaStorage( siteId ) );

	dispatchFluxRemoveMediaItemSuccess( siteId, mediaItem );
};

export const deleteMediaError = ( { siteId }, error ) => () => {
	dispatchFluxRemoveMediaItemError( siteId, error );
};

registerHandlers( 'state/data-layer/wpcom/sites/media/index.js', {
	[ MEDIA_REQUEST ]: [
		dispatchRequest( {
			fetch: requestMedia,
			onSuccess: requestMediaSuccess,
			onError: requestMediaError,
		} ),
	],

	[ MEDIA_ITEM_REQUEST ]: [
		dispatchRequest( {
			fetch: requestMediaItem,
			onSuccess: receiveMediaItem,
			onError: receiveMediaItemError,
		} ),
	],

	[ MEDIA_ITEM_UPDATE ]: [
		dispatchRequest( {
			fetch: updateMedia,
			onSuccess: updateMediaSuccess,
			onError: updateMediaError,
		} ),
	],

	[ MEDIA_ITEM_EDIT ]: [
		dispatchRequest( {
			fetch: editMedia,
			onSuccess: updateMediaSuccess,
			onError: updateMediaError,
		} ),
	],

	[ MEDIA_ITEM_DELETE ]: [
		dispatchRequest( {
			fetch: requestDeleteMedia,
			onSuccess: deleteMediaSuccess,
			onError: deleteMediaError,
		} ),
	],
} );
