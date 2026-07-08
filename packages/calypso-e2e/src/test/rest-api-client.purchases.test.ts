/**
 * Tests for RestAPIClient.getAllPurchases and RestAPIClient.cancelAndRefundPurchase.
 *
 * These back the Atomic-site teardown self-heal: when a hosted-site test fails
 * before its in-flow plan cancellation, teardown lists the account's purchases
 * and cancels them via API so the Atomic site deprovisions and the account can
 * be closed. The tests pin the endpoint contract (path, version, namespace and
 * request body) each method relies on.
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

/**
 * Persists a stub bearer-token endpoint so authenticated calls resolve.
 */
function persistBearerToken() {
	nock( BEARER_TOKEN_URL )
		.persist()
		.post( /.*/ )
		.reply( 200, {
			success: true,
			data: { bearer_token: 'abcdefghijklmn', token_links: [] },
		} );
}

persistBearerToken();

describe( 'RestAPIClient: purchases', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );

	const purchasesURL = restAPIClient.getRequestURL( '1.2', '/me/purchases' );

	beforeEach( function () {
		nock.cleanAll();
		persistBearerToken();
	} );

	describe( 'getAllPurchases', function () {
		test( 'returns the array of purchases from /me/purchases', async function () {
			const purchases = [
				{ ID: '111', product_id: '1008', product_slug: 'business-bundle' },
				{ ID: '222', product_id: '1153', product_slug: 'wordpress_com_1gb_space_addon' },
			];
			nock( purchasesURL.origin ).get( purchasesURL.pathname ).reply( 200, purchases );

			const response = await restAPIClient.getAllPurchases();

			expect( response ).toEqual( purchases );
		} );

		test( 'throws when the API returns an error object', async function () {
			nock( purchasesURL.origin )
				.get( purchasesURL.pathname )
				.reply( 200, { error: 'unauthorized', message: 'Denied.' } );

			await expect( restAPIClient.getAllPurchases() ).rejects.toThrow( 'unauthorized: Denied.' );
		} );
	} );

	describe( 'cancelAndRefundPurchase', function () {
		test( 'posts to wpcom/v2/purchases/<id>/cancel with the cancel-and-refund body', async function () {
			const purchaseId = 111;
			const productId = 1008;
			const cancelURL = restAPIClient.getRequestURL(
				'2',
				`/purchases/${ purchaseId }/cancel`,
				'wpcom'
			);

			let capturedBody: Record< string, unknown > | undefined;
			const cancelScope = nock( cancelURL.origin )
				.post( cancelURL.pathname, ( body ) => {
					capturedBody = body;
					return true;
				} )
				.reply( 200, { status: 'completed' } );

			const response = await restAPIClient.cancelAndRefundPurchase( purchaseId, productId );

			expect( cancelScope.isDone() ).toBe( true );
			expect( capturedBody ).toEqual( {
				product_id: productId,
				cancel_bundled_domain: 0,
				email_variant: 'control',
			} );
			expect( response.status ).toBe( 'completed' );
		} );
	} );
} );
