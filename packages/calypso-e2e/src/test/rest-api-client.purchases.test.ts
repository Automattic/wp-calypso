/**
 * Tests for RestAPIClient purchase methods, the bearer-scoped lever used to
 * deprovision an Atomic site during teardown: the getAllPurchases/cancelPurchase
 * primitives and the cancelAtomicPlan orchestration (Business-plan selection).
 */
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import nock from 'nock';
import { RestAPIClient, BEARER_TOKEN_URL } from '../rest-api-client';
import { SecretsManager } from '../secrets';
import type { Secrets } from '../secrets';

const fakeSecrets = {
	calypsoOauthApplication: {
		client_id: 'some_value',
		client_secret: 'some_value',
	},
} as unknown as Secrets;

jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation( () => fakeSecrets );

describe( 'RestAPIClient: purchases', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );

	const purchasesURL = restAPIClient.getRequestURL( '1.2', '/me/purchases' );

	beforeEach( function () {
		nock.cleanAll();
		nock( BEARER_TOKEN_URL )
			.persist()
			.post( /.*/ )
			.reply( 200, {
				success: true,
				data: { bearer_token: 'abcdefghijklmn', token_links: [] },
			} );
	} );

	test( 'getAllPurchases returns the purchases array', async function () {
		const purchases = [
			{ ID: '111', product_id: '1008', product_slug: 'business-bundle', blog_id: '5' },
			{
				ID: '222',
				product_id: '1200',
				product_slug: 'wordpress_com_1gb_space_upgrade',
				blog_id: '5',
			},
		];
		nock( purchasesURL.origin ).get( purchasesURL.pathname ).reply( 200, purchases );

		const response = await restAPIClient.getAllPurchases();

		expect( response ).toHaveLength( 2 );
		expect( response[ 0 ].product_slug ).toBe( 'business-bundle' );
	} );

	test( 'getAllPurchases throws when the API returns an error', async function () {
		nock( purchasesURL.origin )
			.get( purchasesURL.pathname )
			.reply( 200, { error: 'unauthorized', message: 'nope' } );

		await expect( restAPIClient.getAllPurchases() ).rejects.toThrow( 'unauthorized: nope' );
	} );

	test( 'cancelPurchase posts to the wpcom/v2 cancel endpoint with the given body', async function () {
		const cancelURL = restAPIClient.getRequestURL( '2', '/purchases/111/cancel', 'wpcom' );
		const body = {
			product_id: '1008',
			cancel_bundled_domain: 0,
			email_variant: 'control',
		} as const;

		const cancelScope = nock( cancelURL.origin )
			.post( cancelURL.pathname, body )
			.reply( 200, { status: 'completed' } );

		const response = await restAPIClient.cancelPurchase( '111', body );

		expect( cancelScope.isDone() ).toBe( true );
		expect( response.status ).toBe( 'completed' );
	} );

	describe( 'cancelAtomicPlan', function () {
		const businessPlan = {
			ID: '111',
			product_id: '1008',
			product_slug: 'business-bundle',
			blog_id: '5',
		};
		const otherSitePlan = {
			ID: '333',
			product_id: '1008',
			product_slug: 'business-bundle',
			blog_id: '9',
		};
		const addOn = {
			ID: '222',
			product_id: '1200',
			product_slug: 'wordpress_com_1gb_space_upgrade',
			blog_id: '5',
		};

		/**
		 * Stubs GET /me/purchases with the given list.
		 *
		 * @param {unknown[]} purchases Raw purchase objects to return.
		 */
		function mockPurchases( purchases: unknown[] ) {
			nock( purchasesURL.origin ).get( purchasesURL.pathname ).reply( 200, purchases );
		}

		test( 'cancels the first Business plan when no siteId is given', async function () {
			mockPurchases( [ addOn, businessPlan ] );
			const cancelURL = restAPIClient.getRequestURL( '2', '/purchases/111/cancel', 'wpcom' );
			const cancelScope = nock( cancelURL.origin )
				.post( cancelURL.pathname, {
					product_id: '1008',
					cancel_bundled_domain: 0,
					email_variant: 'control',
				} )
				.reply( 200, { status: 'completed' } );

			const response = await restAPIClient.cancelAtomicPlan();

			expect( cancelScope.isDone() ).toBe( true );
			expect( response.status ).toBe( 'completed' );
		} );

		test( 'returns null and cancels nothing when there is no Business plan', async function () {
			mockPurchases( [ addOn ] );

			const response = await restAPIClient.cancelAtomicPlan();

			expect( response ).toBeNull();
		} );

		test( 'cancels only the Business plan matching the given siteId', async function () {
			mockPurchases( [ otherSitePlan, businessPlan ] );
			const cancelURL = restAPIClient.getRequestURL( '2', '/purchases/111/cancel', 'wpcom' );
			const cancelScope = nock( cancelURL.origin )
				.post( cancelURL.pathname )
				.reply( 200, { status: 'completed' } );

			await restAPIClient.cancelAtomicPlan( 5 );

			expect( cancelScope.isDone() ).toBe( true );
		} );

		test( 'returns null when no Business plan matches the given siteId', async function () {
			mockPurchases( [ businessPlan ] );

			const response = await restAPIClient.cancelAtomicPlan( 999 );

			expect( response ).toBeNull();
		} );
	} );
} );
