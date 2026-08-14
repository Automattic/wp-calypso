import wpcom from 'calypso/lib/wp';
import { OAUTH2_CLIENT_DATA_RECEIVE } from 'calypso/state/action-types';
import { fetchOAuth2_1ClientData } from '../actions';

jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: jest.fn() },
} ) );

describe( 'fetchOAuth2_1ClientData', () => {
	beforeEach( () => {
		wpcom.req.get.mockReset();
	} );

	test( 'fetches from the OAuth 2.1 endpoint and dispatches the data under a namespaced key', async () => {
		wpcom.req.get.mockResolvedValue( {
			id: 7,
			name: 'chatgpt',
			title: 'ChatGPT',
			icon: 'https://example.com/icon.svg',
		} );
		const dispatch = jest.fn();

		const data = await fetchOAuth2_1ClientData( 7 )( dispatch );

		expect( wpcom.req.get ).toHaveBeenCalledWith( '/oauth2-1/client-data/7', {
			apiNamespace: 'wpcom/v2',
		} );
		expect( data.id ).toBe( 'oauth2-1:7' );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: OAUTH2_CLIENT_DATA_RECEIVE,
			data: expect.objectContaining( { id: 'oauth2-1:7', title: 'ChatGPT' } ),
		} );
	} );

	test( 'serves repeat fetches of the same client from the cache', async () => {
		wpcom.req.get.mockResolvedValue( { id: 8, title: 'ChatGPT' } );
		const dispatch = jest.fn();

		await fetchOAuth2_1ClientData( 8 )( dispatch );
		await fetchOAuth2_1ClientData( 8 )( dispatch );

		expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'converts wpcom errors', async () => {
		wpcom.req.get.mockRejectedValue( { message: 'not found', error: 'rest_no_route' } );
		const dispatch = jest.fn();

		await expect( fetchOAuth2_1ClientData( 404 )( dispatch ) ).rejects.toEqual( {
			message: 'not found',
			code: 'rest_no_route',
		} );
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
