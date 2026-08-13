/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePrepareProductsForCart from '../hooks/use-prepare-products-for-cart';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';

jest.mock( 'calypso/my-sites/checkout/use-cart-key' );

function renderPrepareProducts( {
	productAliasFromUrl,
	sitelessCheckoutType,
}: {
	productAliasFromUrl: string;
	sitelessCheckoutType: SitelessCheckoutType;
} ) {
	return renderHook( () =>
		usePrepareProductsForCart( {
			productAliasFromUrl,
			purchaseId: undefined,
			usesJetpackProducts: false,
			isPrivate: false,
			siteSlug: undefined,
			sitelessCheckoutType,
			// The siteless route controller always sets this, so the 'wpcom' branch
			// has to beat the localStorage path.
			isNoSiteCart: true,
		} )
	);
}

describe( 'usePrepareProductsForCart for WordPress.com siteless checkout', () => {
	it( 'builds the cart from the URL slug rather than from localStorage', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.isLoading ).toBe( false );
		expect( result.current.error ).toBeNull();
		expect( result.current.productsForCart ).toHaveLength( 1 );
		expect( result.current.productsForCart[ 0 ].product_slug ).toBe( 'personal-bundle' );
	} );

	it( 'marks the product as a WordPress.com siteless checkout', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.productsForCart[ 0 ].extra.isWpcomSitelessCheckout ).toBe( true );
	} );

	it( 'only the wpcom type sets isWpcomSitelessCheckout', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'ak_pro5h_yearly',
			sitelessCheckoutType: 'akismet',
		} );

		expect( result.current.productsForCart[ 0 ].extra.isWpcomSitelessCheckout ).toBeFalsy();
		expect( result.current.productsForCart[ 0 ].extra.isAkismetSitelessCheckout ).toBe( true );
	} );

	it( 'reads the quantity from a :-q- suffix on the URL slug', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle:-q-500',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.productsForCart[ 0 ].product_slug ).toBe( 'personal-bundle' );
		expect( result.current.productsForCart[ 0 ].quantity ).toBe( 500 );
	} );

	// Without 'wpcom' in `doNotStripProducts`, `useStripProductsFromUrl` rewrites the
	// URL and the product is lost on reload.
	it( 'leaves the product in the URL', () => {
		const replaceState = jest.spyOn( window.history, 'replaceState' );
		window.history.replaceState( null, '', '/checkout/wpcom/personal-bundle' );
		replaceState.mockClear();

		renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( replaceState ).not.toHaveBeenCalled();
		replaceState.mockRestore();
	} );
} );
