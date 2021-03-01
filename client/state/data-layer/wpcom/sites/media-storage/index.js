/**
 * Internal dependencies
 */

import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { receiveMediaStorage } from 'calypso/state/sites/media-storage/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestMediaStorage( action ) {
	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/media-storage`,
				apiVersion: '1.1',
			},
			action
		),
	];
}

export const requestMediaStorageSuccess = ( { siteId }, mediaStorage ) => [
	receiveMediaStorage( mediaStorage, siteId ),
	{ type: SITE_MEDIA_STORAGE_REQUEST_SUCCESS, siteId },
];

export const requestMediaStorageError = ( { siteId }, error ) => [
	{ type: SITE_MEDIA_STORAGE_REQUEST_FAILURE, siteId, error },
];

registerHandlers( 'state/data-layer/wpcom/sites/media-storage/index.js', {
	[ SITE_MEDIA_STORAGE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestMediaStorage,
			onSuccess: requestMediaStorageSuccess,
			onError: requestMediaStorageError,
		} ),
	],
} );
