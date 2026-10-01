/**
 * Tests for RestAPIClient shopping cart methods, used by specs to clean up the
 * products they add to a shared site cart: getShoppingCart reads the cart, and
 * removeCartProducts posts it back without the products matching a keyword.
 */
import { describe, expect, test, jest, beforeEach, afterAll } from '@jest/globals';
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

const SITE_ID = 5;
// Differs from SITE_ID to prove the posted blog_id comes from the read cart.
const CART_BLOG_ID = 6;
const KEYWORD = 'e2eflowtesting123';
const COUPON = 'SAVE10';

// Response products carry response-only fields (cost, uuid...) that a request
// cart does not.
const leakedDomain = {
	product_slug: 'dotblog_domain',
	product_id: 78,
	meta: `${ KEYWORD }.blog`,
	extra: { privacy: true },
	volume: 1,
	quantity: null,
	cost: 25,
	uuid: 'leaked',
};
const prefixedLeakedDomain = { ...leakedDomain, meta: `get${ KEYWORD }.com`, uuid: 'prefixed' };
const otherDomain = { ...leakedDomain, meta: 'example.blog', uuid: 'other' };
const plan = {
	product_slug: 'business-bundle',
	product_id: 1008,
	extra: {},
	volume: 1,
	quantity: null,
	cost: 300,
	uuid: 'plan',
};

const emptyTaxLocation = { location: { ip_address: '127.0.0.1' } };

describe( 'RestAPIClient: shopping cart', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );

	const cartURL = restAPIClient.getRequestURL( '1.1', `/me/shopping-cart/${ SITE_ID }` );

	/**
	 * Stubs the cart read with the given products and tax.
	 *
	 * @param {unknown[]} products Raw response products.
	 * @param {unknown} tax Raw response tax.
	 */
	function mockCartRead( products: unknown[], tax: unknown = emptyTaxLocation ) {
		nock( cartURL.origin )
			.get( cartURL.pathname )
			.reply( 200, { blog_id: CART_BLOG_ID, coupon: COUPON, products, tax } );
	}

	/**
	 * Stubs the cart write and records the body it receives.
	 *
	 * @returns {{ body: Record<string, unknown> | undefined }} The recorded body, set once posted.
	 */
	function mockCartWrite() {
		const posted: { body: Record< string, unknown > | undefined } = { body: undefined };

		nock( cartURL.origin )
			.post( cartURL.pathname, ( body ) => {
				posted.body = body;
				return true;
			} )
			.reply( 200, {
				blog_id: CART_BLOG_ID,
				coupon: COUPON,
				products: [ { ...otherDomain, uuid: 'saved' } ],
			} );

		return posted;
	}

	beforeEach( function () {
		nock.cleanAll();
		// A request no interceptor matches must fail, not reach the real API.
		nock.disableNetConnect();
		nock( BEARER_TOKEN_URL )
			.persist()
			.post( /.*/ )
			.reply( 200, {
				success: true,
				data: { bearer_token: 'abcdefghijklmn', token_links: [] },
			} );
	} );

	afterAll( function () {
		nock.enableNetConnect();
	} );

	test( 'getShoppingCart returns the site cart', async function () {
		mockCartRead( [ otherDomain, plan ] );

		const cart = await restAPIClient.getShoppingCart( SITE_ID );

		expect( cart.products.map( ( product ) => product.product_slug ) ).toEqual( [
			'dotblog_domain',
			'business-bundle',
		] );
	} );

	test( 'getShoppingCart throws when the API returns an error', async function () {
		nock( cartURL.origin )
			.get( cartURL.pathname )
			.reply( 200, { error: 'unauthorized', message: 'nope' } );

		await expect( restAPIClient.getShoppingCart( SITE_ID ) ).rejects.toThrow(
			'unauthorized: nope'
		);
	} );

	test( 'removeCartProducts drops every product whose meta contains the keyword', async function () {
		mockCartRead( [ leakedDomain, otherDomain, prefixedLeakedDomain, plan ] );
		const posted = mockCartWrite();

		await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( ( posted.body?.products as { meta?: string }[] ).map( ( p ) => p.meta ) ).toEqual( [
			'example.blog',
			undefined,
		] );
	} );

	test( 'removeCartProducts posts kept products in the request shape only', async function () {
		mockCartRead( [ otherDomain ] );
		const posted = mockCartWrite();

		await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( posted.body?.products ).toEqual( [
			{
				product_slug: 'dotblog_domain',
				product_id: 78,
				meta: 'example.blog',
				extra: { privacy: true },
				volume: 1,
				quantity: null,
			},
		] );
	} );

	test( 'removeCartProducts keeps the blog, the coupon and a persisted cart', async function () {
		mockCartRead( [ otherDomain ] );
		const posted = mockCartWrite();

		await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( posted.body ).toMatchObject( {
			blog_id: CART_BLOG_ID,
			coupon: COUPON,
			temporary: false,
		} );
	} );

	test( 'removeCartProducts returns the cart the write saved', async function () {
		mockCartRead( [ leakedDomain, otherDomain ] );
		mockCartWrite();

		const cart = await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( ( cart.products as { uuid?: string }[] ).map( ( product ) => product.uuid ) ).toEqual( [
			'saved',
		] );
	} );

	test( 'removeCartProducts posts a null tax when no location field is set', async function () {
		mockCartRead( [ otherDomain ] );
		const posted = mockCartWrite();

		await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( posted.body?.tax ).toBeNull();
	} );

	test( 'removeCartProducts posts the tax location fields Calypso sends', async function () {
		const location = {
			country_code: 'FR',
			postal_code: '75001',
			subdivision_code: 'IDF',
			vat_id: 'FR12345678901',
			organization: 'Example SARL',
			address: '1 rue Example',
			city: 'Paris',
			is_for_business: true,
		};
		mockCartRead( [ otherDomain ], { location: { ...location, ip_address: '127.0.0.1' } } );
		const posted = mockCartWrite();

		await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( posted.body?.tax ).toEqual( { location } );
	} );

	test( 'removeCartProducts posts the tax when only one location field is set', async function () {
		mockCartRead( [ otherDomain ], {
			location: { ip_address: '127.0.0.1', is_for_business: true },
		} );
		const posted = mockCartWrite();

		await restAPIClient.removeCartProducts( SITE_ID, KEYWORD );

		expect( posted.body?.tax ).toEqual( { location: { is_for_business: true } } );
	} );

	test( 'removeCartProducts throws when the write returns an error', async function () {
		mockCartRead( [ leakedDomain ] );
		nock( cartURL.origin )
			.post( cartURL.pathname )
			.reply( 200, { error: 'invalid_cart', message: 'nope' } );

		await expect( restAPIClient.removeCartProducts( SITE_ID, KEYWORD ) ).rejects.toThrow(
			'invalid_cart: nope'
		);
	} );
} );
