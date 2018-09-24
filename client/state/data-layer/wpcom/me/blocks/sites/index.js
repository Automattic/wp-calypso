/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_BLOCKS_REQUEST, SITE_BLOCKS_RECEIVE } from 'state/action-types';
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
				page: action.page ? action.page : 1,
				per_page: action.perPage ? action.perPage : 100,
			},
		},
		action
	);

export const siteBlocksRequestReceived = ( action, apiResponse ) => ( {
	type: SITE_BLOCKS_RECEIVE,
	payload: apiResponse,
} );

export const siteBlocksRequestFailure = error => ( {
	type: SITE_BLOCKS_RECEIVE,
	payload: error,
	error: true,
} );

registerHandlers( 'state/data-layer/wpcom/me/blocks/sites/index.js', {
	[ SITE_BLOCKS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: handleSiteBlocksRequest,
			onSuccess: siteBlocksRequestReceived,
			onError: siteBlocksRequestFailure,
		} ),
	],
} );

export default {};
