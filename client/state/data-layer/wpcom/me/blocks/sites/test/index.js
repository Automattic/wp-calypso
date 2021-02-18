/**
 * Internal dependencies
 */
import { handleSiteBlocksRequest, siteBlocksRequestReceived, siteBlocksRequestFailure } from '../';
import { READER_SITE_BLOCKS_RECEIVE } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const action = { type: 'DUMMY_ACTION' };

test( 'should return an action for an HTTP request to the site blocks endpoint', () => {
	const result = handleSiteBlocksRequest( action );

	expect( result ).toMatchObject(
		http(
			{
				method: 'GET',
				path: '/me/blocks/sites',
				apiNamespace: 'wpcom/v2',
			},
			action
		)
	);
} );

test( 'should return a SITE_BLOCKS_RECEIVE action with error when request errors', () => {
	const result = siteBlocksRequestFailure( action );

	expect( result ).toEqual( {
		type: READER_SITE_BLOCKS_RECEIVE,
		payload: action,
		error: true,
	} );
} );

test( 'should return a SITE_BLOCKS_RECEIVE action without error when request succeeds', () => {
	const apiResponse = {
		sites: [
			{
				ID: 123,
				name: 'Blocked Site',
				URL: 'http://example.com',
			},
		],
	};
	const result = siteBlocksRequestReceived( action, apiResponse );

	expect( result ).toEqual( {
		type: READER_SITE_BLOCKS_RECEIVE,
		payload: apiResponse,
	} );
} );
