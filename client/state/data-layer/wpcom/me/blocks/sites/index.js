/**
 * Internal dependencies
 */
import { READER_SITE_BLOCKS_RECEIVE, READER_SITE_BLOCKS_REQUEST } from 'state/reader/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

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

export const siteBlocksRequestReceived = ( action, payload ) => ( {
	type: READER_SITE_BLOCKS_RECEIVE,
	payload,
} );

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
