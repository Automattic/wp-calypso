/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'calypso/controller';
import { noSite } from 'calypso/my-sites/controller';
import {
	checkoutAkismetSiteless,
	checkoutMarketplaceSiteless,
	checkoutWpcomSiteless,
} from '../controller';
import registerCheckoutRoutes from '../index';

const mockLocaleMiddleware = jest.fn();

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	redirectLoggedOut: jest.fn(),
	redirectMyJetpack: jest.fn(),
	render: jest.fn(),
	setLocaleMiddleware: () => mockLocaleMiddleware,
} ) );

jest.mock( 'calypso/lib/siftscience' );
jest.mock( 'calypso/my-sites/controller' );
jest.mock( 'calypso/my-sites/email/paths' );
jest.mock( '../controller' );

describe( 'checkout routes', () => {
	beforeEach( () => {
		jest.mocked( page ).mockClear();
	} );

	const registrationIndexOf = ( path: string ) =>
		( page as unknown as jest.Mock ).mock.calls.findIndex( ( [ route ] ) => route === path );

	it( 'guards the WordPress.com siteless route with redirectLoggedOut', () => {
		registerCheckoutRoutes();

		expect( page ).toHaveBeenCalledWith(
			'/checkout/wpcom/:productSlug',
			mockLocaleMiddleware,
			redirectLoggedOut,
			noSite,
			checkoutWpcomSiteless,
			makeLayout,
			clientRender
		);
	} );

	// page.js matches in registration order, so /checkout/:product/:domainOrProduct
	// would swallow this route.
	it( 'registers the WordPress.com siteless route ahead of the generic product route', () => {
		registerCheckoutRoutes();

		const wpcomIndex = registrationIndexOf( '/checkout/wpcom/:productSlug' );
		const genericIndex = registrationIndexOf( '/checkout/:product/:domainOrProduct' );

		expect( wpcomIndex ).toBeGreaterThanOrEqual( 0 );
		expect( genericIndex ).toBeGreaterThanOrEqual( 0 );
		expect( wpcomIndex ).toBeLessThan( genericIndex );
	} );

	// Single-segment, so it competes with /checkout/:domainOrProduct rather than the two-segment
	// route above.
	it( 'registers the Studio return route ahead of the generic product route', () => {
		registerCheckoutRoutes();

		const studioReturnIndex = registrationIndexOf( '/checkout/studio-return' );
		const genericIndex = registrationIndexOf( '/checkout/:domainOrProduct' );

		expect( studioReturnIndex ).toBeGreaterThanOrEqual( 0 );
		expect( genericIndex ).toBeGreaterThanOrEqual( 0 );
		expect( studioReturnIndex ).toBeLessThan( genericIndex );
	} );

	describe( 'siteless renewals by subscription ID', () => {
		it.each( [
			[ '/checkout/akismet/renew/:subscriptionId', checkoutAkismetSiteless ],
			[ '/checkout/marketplace/renew/:subscriptionId', checkoutMarketplaceSiteless ],
			[ '/checkout/passport/renew/:subscriptionId', checkoutMarketplaceSiteless ],
		] )( 'registers %s with its siteless handler', ( path, handler ) => {
			registerCheckoutRoutes();

			expect( page ).toHaveBeenCalledWith(
				path,
				mockLocaleMiddleware,
				redirectLoggedOut,
				noSite,
				handler,
				makeLayout,
				clientRender
			);
		} );

		// These are four-segment paths, so /checkout/:product/renew/:purchaseId would
		// swallow them and read the service name as the product slug.
		it.each( [
			'/checkout/akismet/renew/:subscriptionId',
			'/checkout/marketplace/renew/:subscriptionId',
			'/checkout/passport/renew/:subscriptionId',
		] )( 'registers %s ahead of the generic renewal route', ( path ) => {
			registerCheckoutRoutes();

			const sitelessIndex = registrationIndexOf( path );
			const genericIndex = registrationIndexOf( '/checkout/:product/renew/:purchaseId' );

			expect( sitelessIndex ).toBeGreaterThanOrEqual( 0 );
			expect( genericIndex ).toBeGreaterThanOrEqual( 0 );
			expect( sitelessIndex ).toBeLessThan( genericIndex );
		} );
	} );
} );
