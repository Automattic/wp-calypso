/** @format */

/**
 * Internal dependencies
 */
import { READER_SITE_BLOCKS_RECEIVE, READER_SITE_BLOCKS_REQUEST } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

export const handleSiteBlocksRequest = action =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/me/blocks/sites',
			query: {
				page: action.page || null,
				per_page: action.perPage || null,
			},
		},
		action
	);

export const siteBlocksRequestReceived = ( action, payload ) => ( {
	type: READER_SITE_BLOCKS_RECEIVE,
	payload,
} );

export const siteBlocksRequestFailure = error => ( {
	type: READER_SITE_BLOCKS_RECEIVE,
	payload: error,
	error: true,
} );

registerHandlers( 'state/data-layer/wpcom/me/blocks/sites/index.js', {
	[ READER_SITE_BLOCKS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: handleSiteBlocksRequest,
			onSuccess: siteBlocksRequestReceived,
			onError: siteBlocksRequestFailure,
		} ),
	],
} );

export default {};
