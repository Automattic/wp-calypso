import { translate } from 'i18n-calypso';
import { EDGE_CACHE_CACHE_PURGE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const updateNoticeId = 'edge-cache-purge';

const edgeCachePurge = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/edge-cache/purge`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const edgeCachePurgeSuccess = () => {
	return [
		successNotice( translate( 'Successfully cleared edge cache.' ), {
			id: updateNoticeId,
			showDismiss: false,
			duration: 5000,
		} ),
	];
};

const edgeCachePurgeError = () => {
	return [
		errorNotice( translate( 'Failed to clear edge cache.' ), {
			id: updateNoticeId,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/clear-cache.js', {
	[ EDGE_CACHE_CACHE_PURGE ]: [
		dispatchRequest( {
			fetch: edgeCachePurge,
			onSuccess: edgeCachePurgeSuccess,
			onError: edgeCachePurgeError,
		} ),
	],
} );
