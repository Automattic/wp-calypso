import debug from 'debug';
import { translate } from 'i18n-calypso';
import { isEqual, omit } from 'lodash';
import { MEDIA_REQUEST, MEDIA_ITEM_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	setNextPageHandle,
	successMediaItemRequest,
	successMediaRequest,
} from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice } from 'calypso/state/notices/actions';
import getNextPageQuery from 'calypso/state/selectors/get-next-page-query';

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

export const requestMediaSuccess =
	( { siteId, query }, data ) =>
	( dispatch, getState ) => {
		if (
			! isEqual(
				omit( query, 'page_handle' ),
				omit( getNextPageQuery( getState(), siteId ), 'page_handle' )
			)
		) {
			dispatch( successMediaRequest( siteId, query ) );
			return;
		}

		if ( data?.pickerUri ) {
			window.open( data.pickerUri, '_blank' ).focus();
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
} );
