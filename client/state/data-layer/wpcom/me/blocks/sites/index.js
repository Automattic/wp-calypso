import { readSiteQuery } from '@automattic/api-queries';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_BLOCKS_REQUEST,
} from 'calypso/state/reader/action-types';

export const handleSiteBlocksRequest = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/me/blocks/sites',
			query: {
				page: ( action.payload && action.payload.page ) || 1,
				per_page: ( action.payload && action.perPage ) || 20,
			},
		},
		action
	);

const seedReadSiteCacheFromBlocks = ( payload ) => {
	const queryClient = getCalypsoQueryClient();
	if ( ! queryClient || ! payload || ! payload.sites ) {
		return;
	}
	for ( const site of payload.sites ) {
		const queryKey = readSiteQuery( site.ID ).queryKey;
		// Only seed when there's no fresher entry. Mark the seed as immediately
		// stale (`updatedAt: 0`) so a subsequent `useSite( site.ID )` still
		// triggers a full fetch — the seed only lets icon/name render quickly.
		if ( ! queryClient.getQueryData( queryKey ) ) {
			queryClient.setQueryData( queryKey, site, { updatedAt: 0 } );
		}
	}
};

export const siteBlocksRequestReceived = ( action, payload ) => {
	seedReadSiteCacheFromBlocks( payload );
	return {
		type: READER_SITE_BLOCKS_RECEIVE,
		payload,
	};
};

export const siteBlocksRequestFailure = ( error ) => ( {
	type: READER_SITE_BLOCKS_RECEIVE,
	payload: error,
	error: true,
} );

registerHandlers( 'state/data-layer/wpcom/me/blocks/sites/index.js', {
	[ READER_SITE_BLOCKS_REQUEST ]: [
		dispatchRequest( {
			fetch: handleSiteBlocksRequest,
			onSuccess: siteBlocksRequestReceived,
			onError: siteBlocksRequestFailure,
		} ),
	],
} );

export default {};
