import debug from 'debug';
import { translate } from 'i18n-calypso';
import { isEqual, omit } from 'lodash';
import {
	MEDIA_REQUEST,
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_EDIT,
	MEDIA_ITEM_DELETE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	deleteMedia,
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	setNextPageHandle,
	successMediaItemRequest,
	successMediaRequest,
} from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import getNextPageQuery from 'calypso/state/selectors/get-next-page-query';
import { requestMediaStorage } from 'calypso/state/sites/media-storage/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-media' );

export const updateMediaSuccess = ( { siteId }, mediaItem ) => [
	receiveMedia( siteId, mediaItem ),
	gutenframeUpdateImageBlocks( mediaItem, 'updated' ),
];

export const updateMediaError = ( { siteId, originalMediaItem } ) => [
	receiveMedia( siteId, originalMediaItem ),
	errorNotice( translate( 'We were unable to process this media item.' ), {
		id: `update-media-notice-${ originalMediaItem.ID }`,
	} ),
];

export const editMedia = ( action ) => {
	const { siteId, data } = action;
	const { ID: mediaId, ...rest } = data;

	return [
		removeNotice( `update-media-notice-${ mediaId }` ),
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/media/${ mediaId }/edit`,
				apiVersion: '1.1',
				formData: Object.entries( rest ),
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

export const requestMediaSuccess = ( { siteId, query }, data ) => ( dispatch, getState ) => {
	if (
		! isEqual(
			omit( query, 'page_handle' ),
			omit( getNextPageQuery( getState(), siteId ), 'page_handle' )
		)
	) {
		dispatch( successMediaRequest( siteId, query ) );
		return;
	}

	dispatch( receiveMedia( siteId, data.media, data.found, query ) );
	dispatch( successMediaRequest( siteId, query ) );
	dispatch( setNextPageHandle( siteId, data.meta ) );
};

export const requestMediaError = ( { siteId, query } ) => failMediaRequest( siteId, query );

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

export const receiveMediaItem = ( { mediaId, siteId }, media ) => [
	receiveMedia( siteId, media ),
	successMediaItemRequest( siteId, mediaId ),
];

export const receiveMediaItemError = ( { mediaId, siteId } ) =>
	failMediaItemRequest( siteId, mediaId );

export const requestDeleteMedia = ( action ) => {
	const { siteId, mediaId } = action;

	return [
		removeNotice( `delete-media-notice-${ mediaId }` ),
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/sites/${ siteId }/media/${ mediaId }/delete`,
			},
			action
		),
	];
};

export const deleteMediaSuccess = ( { siteId }, mediaItem ) => [
	deleteMedia( siteId, mediaItem.ID ),
	requestMediaStorage( siteId ),
	gutenframeUpdateImageBlocks( mediaItem, 'deleted' ),
];

export const deleteMediaError = ( { mediaId } ) => [
	errorNotice( translate( 'We were unable to delete this media item.' ), {
		id: `delete-media-notice-${ mediaId }`,
	} ),
];

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
