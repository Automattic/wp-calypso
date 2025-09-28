/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getBasicCart,
	mockGetPaymentMethodsEndpoint,
	mockGetSupportedCountriesEndpoint,
	mockGetVatInfoEndpoint,
	mockLogStashEndpoint,
	mockMatchMediaOnWindow,
	mockSetCartEndpointWith,
	getActivePersonalPlanDataForType,
	countryList,
} from './util';
import { MockCheckout } from './util/mock-checkout';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'Checkout CSP Integration', () => {
	const initialCart = getBasicCart();
	const mainCartKey = 123456;

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );

	beforeEach( () => {
		jest.clearAllMocks();

		// Clear any existing CSP meta tags
		document.querySelectorAll( 'meta[data-checkout-csp="true"]' ).forEach( ( tag ) => {
			tag.remove();
		} );

		// Mock dependencies
		( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		( hasLoadedSiteDomains as jest.Mock ).mockImplementation( () => true );
		( getDomainsBySiteId as jest.Mock ).mockImplementation( () => [] );
		( isMarketplaceProduct as jest.Mock ).mockImplementation( () => false );
		( isJetpackSite as jest.Mock ).mockImplementation( () => false );
		( isAtomicSite as jest.Mock ).mockImplementation( () => false );
		( useCartKey as jest.Mock ).mockImplementation( () => mainCartKey );

		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetVatInfoEndpoint( {} );
		mockGetSupportedCountriesEndpoint( countryList );
		mockMatchMediaOnWindow();
	} );

	afterEach( () => {
		// Clean up CSP meta tags
		document.querySelectorAll( 'meta[data-checkout-csp="true"]' ).forEach( ( tag ) => {
			tag.remove();
		} );
	} );

	describe( 'CSP meta tag injection on checkout pages', () => {
		it( 'should add CSP meta tag when CheckoutMain is rendered', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor(
				() => {
					const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
					expect( metaTags ).toHaveLength( 1 );
				},
				{ timeout: 5000 }
			);

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			expect( metaTag ).toBeTruthy();
			expect( metaTag.httpEquiv ).toBe( 'Content-Security-Policy' );

			unmount();
		} );

		it( 'should include required CSP directives for payment processing', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// PCI DSS 6.4.3 required directives
			expect( content ).toContain( 'script-src' );
			expect( content ).toContain( 'frame-src' );
			expect( content ).toContain( 'form-action' );
			expect( content ).toContain( 'connect-src' );

			// Payment processor domains
			expect( content ).toContain( 'https://js.stripe.com' );
			expect( content ).toContain( 'https://checkout.stripe.com' );
			expect( content ).toContain( 'https://api.stripe.com' );
			expect( content ).toContain( 'https://www.paypal.com' );

			unmount();
		} );

		it( 'should remove CSP meta tag when CheckoutMain unmounts', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			// Wait for meta tag to be added
			await waitFor( () => {
				const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
				expect( metaTags ).toHaveLength( 1 );
			} );

			// Unmount the checkout component
			unmount();

			// Verify meta tag was removed
			const metaTags = document.querySelectorAll( 'meta[data-checkout-csp="true"]' );
			expect( metaTags ).toHaveLength( 0 );
		} );

		it( 'should include fraud prevention domains in CSP', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// Fraud prevention services
			expect( content ).toContain( 'https://www.google.com/recaptcha/' );
			expect( content ).toContain( 'https://www.gstatic.com/recaptcha/' );
			expect( content ).toContain( 'https://cdn.siftscience.com' );

			unmount();
		} );

		it( 'should include support and analytics domains in CSP', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// Analytics
			expect( content ).toContain( 'https://stats.wp.com' );

			// Support (Zendesk/Smooch)
			expect( content ).toContain( 'https://cdn.smooch.io' );
			expect( content ).toContain( 'https://static.zdassets.com' );

			// Surveys
			expect( content ).toContain( 'https://surveys-static-prd.survicate-cdn.com' );

			unmount();
		} );

		it( 'should restrict form-action directive for PCI compliance', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// Form action should be restricted to self and Stripe checkout
			expect( content ).toMatch( /form-action\s+'self'\s+https:\/\/checkout\.stripe\.com/ );

			unmount();
		} );

		it( 'should use nonce for inline scripts if available', async () => {
			// Add a script tag with nonce to simulate server-side nonce injection
			const scriptTag = document.createElement( 'script' );
			const testNonce = 'test-integration-nonce-456';
			scriptTag.setAttribute( 'nonce', testNonce );
			document.head.appendChild( scriptTag );

			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// Should include the nonce in script-src
			expect( content ).toContain( `'nonce-${ testNonce }'` );

			// Clean up
			document.head.removeChild( scriptTag );
			unmount();
		} );

		it( 'should handle multiple checkout renders without duplicating meta tags', async () => {
			// First render
			const { unmount: unmount1 } = render(
				<MockCheckout key="checkout1" initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 1 );
			} );

			unmount1();

			// Verify cleanup
			expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 0 );

			// Second render
			const { unmount: unmount2 } = render(
				<MockCheckout key="checkout2" initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 1 );
			} );

			unmount2();

			// Final cleanup verification
			expect( document.querySelectorAll( 'meta[data-checkout-csp="true"]' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'CSP directive completeness for PCI DSS 6.4.3', () => {
		it( 'should include all required payment processor endpoints', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// Stripe endpoints
			const stripeEndpoints = [
				'https://js.stripe.com',
				'https://checkout.stripe.com',
				'https://api.stripe.com',
			];
			stripeEndpoints.forEach( ( endpoint ) => {
				expect( content ).toContain( endpoint );
			} );

			// PayPal endpoints
			const paypalEndpoints = [ 'https://www.paypal.com', 'https://www.paypalobjects.com' ];
			paypalEndpoints.forEach( ( endpoint ) => {
				expect( content ).toContain( endpoint );
			} );

			unmount();
		} );

		it( 'should include WordPress.com API endpoints', async () => {
			const { unmount } = render(
				<MockCheckout initialCart={ initialCart } setCart={ mockSetCartEndpoint } />
			);

			await waitFor( () => {
				const metaTag = document.querySelector(
					'meta[data-checkout-csp="true"]'
				) as HTMLMetaElement;
				expect( metaTag ).toBeTruthy();
			} );

			const metaTag = document.querySelector( 'meta[data-checkout-csp="true"]' ) as HTMLMetaElement;
			const content = metaTag.content;

			// WordPress.com API endpoints
			const wpEndpoints = [
				'https://public-api.wordpress.com',
				'https://widgets.wp.com',
				'https://wpcom.com',
			];
			wpEndpoints.forEach( ( endpoint ) => {
				expect( content ).toContain( endpoint );
			} );

			unmount();
		} );
	} );
} );
