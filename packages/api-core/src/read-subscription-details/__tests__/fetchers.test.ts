import nock from 'nock';
// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';
import { fetchSubscriptionDetails } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

type SubkeyWindow = typeof window & {
	currentUser?: { subscriptionManagementSubkey?: string };
};

describe( 'fetchSubscriptionDetails', () => {
	afterEach( () => {
		nock.cleanAll();
		delete ( window as SubkeyWindow ).currentUser;
	} );

	describe( 'logged-in path (no subkey)', () => {
		it( 'GETs /read/sites/:blogId/subscription-details when blogId is provided', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/sites/123/subscription-details' )
				.reply( 200, { ID: 1, blog_ID: 123, name: 'Example' } );

			const result = await fetchSubscriptionDetails( { blogId: '123' } );
			expect( result ).toMatchObject( { ID: 1, blog_ID: 123, name: 'Example' } );
		} );

		it( 'GETs /read/subscriptions/:subscriptionId when subscriptionId is provided', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/subscriptions/42' )
				.reply( 200, { ID: 42, blog_ID: 999, name: 'Other' } );

			const result = await fetchSubscriptionDetails( { subscriptionId: '42' } );
			expect( result ).toMatchObject( { ID: 42 } );
		} );

		it( 'prefers blogId over subscriptionId when both are provided', async () => {
			nock( BASE )
				.get( '/wpcom/v2/read/sites/123/subscription-details' )
				.reply( 200, { ID: 1, blog_ID: 123, name: 'Example' } );

			const result = await fetchSubscriptionDetails( { blogId: '123', subscriptionId: '42' } );
			expect( result ).toMatchObject( { blog_ID: 123 } );
		} );

		it( 'throws when neither blogId nor subscriptionId is provided', async () => {
			await expect( fetchSubscriptionDetails( {} ) ).rejects.toThrow(
				/blogId or subscriptionId is required/
			);
		} );
	} );

	describe( 'logged-out subkey path', () => {
		const SUBKEY = 'abc123';

		beforeEach( () => {
			( window as SubkeyWindow ).currentUser = { subscriptionManagementSubkey: SUBKEY };
		} );

		it( 'sends X-WPSUBKEY header on the public-api endpoint when a subkey is present', async () => {
			nock( BASE, {
				reqheaders: {
					authorization: `X-WPSUBKEY ${ encodeURIComponent( SUBKEY ) }`,
				},
			} )
				.get( '/wpcom/v2/read/sites/123/subscription-details' )
				.reply( 200, { ID: 1, blog_ID: 123, name: 'Subkey' } );

			const result = await fetchSubscriptionDetails( { blogId: '123' } );
			expect( result ).toMatchObject( { name: 'Subkey' } );
		} );

		it( 'uses subkey path for /read/subscriptions/:id as well', async () => {
			nock( BASE, {
				reqheaders: {
					authorization: `X-WPSUBKEY ${ encodeURIComponent( SUBKEY ) }`,
				},
			} )
				.get( '/wpcom/v2/read/subscriptions/42' )
				.reply( 200, { ID: 42, blog_ID: 999, name: 'Subkey-sub' } );

			const result = await fetchSubscriptionDetails( { subscriptionId: '42' } );
			expect( result ).toMatchObject( { ID: 42 } );
		} );
	} );
} );
