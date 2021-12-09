import { SITE_MEDIA_STORAGE_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveMediaStorage } from 'calypso/state/sites/media-storage/actions';

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

const requestMediaStorageSuccess = ( { siteId }, mediaStorage ) =>
	receiveMediaStorage( mediaStorage, siteId );

const requestMediaStorageError = () => {};

registerHandlers( 'state/data-layer/wpcom/sites/media-storage/index.js', {
	[ SITE_MEDIA_STORAGE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestMediaStorage,
			onSuccess: requestMediaStorageSuccess,
			onError: requestMediaStorageError,
		} ),
	],
} );
