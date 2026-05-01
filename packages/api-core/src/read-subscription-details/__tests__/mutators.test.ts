import nock from 'nock';
// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';
import { postReadSubscription } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

type SubkeyWindow = typeof window & {
	currentUser?: { subscriptionManagementSubkey?: string };
};

describe( 'postReadSubscription', () => {
	afterEach( () => {
		nock.cleanAll();
		delete ( window as SubkeyWindow ).currentUser;
	} );

	describe( 'logged-in path', () => {
		it( 'POSTs to v1.2 endpoint with body via wpcom', async () => {
			nock( BASE )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/new', {} )
				.reply( 200, { success: true } );

			const result = await postReadSubscription( {
				path: '/read/site/123/post_email_subscriptions/new',
				apiVersion: '1.2',
				body: {},
			} );

			expect( result ).toMatchObject( { success: true } );
		} );

		it( 'POSTs to wpcom/v2 endpoint when apiVersion is "2"', async () => {
			nock( BASE )
				.post( '/wpcom/v2/read/sites/123/notification-subscriptions/new', {} )
				.reply( 200, { success: true } );

			const result = await postReadSubscription( {
				path: '/read/sites/123/notification-subscriptions/new',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
				body: {},
			} );

			expect( result ).toMatchObject( { success: true } );
		} );

		it( 'sends a body with custom payload', async () => {
			nock( BASE )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/update', {
					delivery_frequency: 'weekly',
				} )
				.reply( 200, { success: true } );

			const result = await postReadSubscription< { success: boolean } >( {
				path: '/read/site/123/post_email_subscriptions/update',
				apiVersion: '1.2',
				body: { delivery_frequency: 'weekly' },
			} );

			expect( result.success ).toBe( true );
		} );
	} );

	describe( 'logged-out subkey path', () => {
		const SUBKEY = 'sub-abc';

		beforeEach( () => {
			( window as SubkeyWindow ).currentUser = { subscriptionManagementSubkey: SUBKEY };
		} );

		it( 'sends X-WPSUBKEY header on the v1.2 path when a subkey is present', async () => {
			nock( BASE, {
				reqheaders: {
					authorization: `X-WPSUBKEY ${ encodeURIComponent( SUBKEY ) }`,
				},
			} )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/delete', '{}' )
				.reply( 200, { success: true } );

			const result = await postReadSubscription( {
				path: '/read/site/123/post_email_subscriptions/delete',
				apiVersion: '1.2',
				body: {},
			} );

			expect( result ).toMatchObject( { success: true } );
		} );

		it( 'sends X-WPSUBKEY header on the wpcom/v2 path when a subkey is present', async () => {
			nock( BASE, {
				reqheaders: {
					authorization: `X-WPSUBKEY ${ encodeURIComponent( SUBKEY ) }`,
				},
			} )
				.post( '/wpcom/v2/read/sites/123/notification-subscriptions/new', '{}' )
				.reply( 200, { success: true } );

			const result = await postReadSubscription( {
				path: '/read/sites/123/notification-subscriptions/new',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
				body: {},
			} );

			expect( result ).toMatchObject( { success: true } );
		} );
	} );
} );
