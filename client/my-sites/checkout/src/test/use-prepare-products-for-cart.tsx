/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePrepareProductsForCart from '../hooks/use-prepare-products-for-cart';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';

jest.mock( 'calypso/my-sites/checkout/use-cart-key' );

function renderPrepareProducts( {
	productAliasFromUrl,
	purchaseId,
	sitelessCheckoutType,
}: {
	productAliasFromUrl?: string;
	purchaseId?: string;
	sitelessCheckoutType: SitelessCheckoutType;
} ) {
	return renderHook( () =>
		usePrepareProductsForCart( {
			productAliasFromUrl,
			purchaseId,
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

describe( 'usePrepareProductsForCart for siteless renewals', () => {
	it.each( [ 'akismet', 'marketplace' ] as const )(
		'renews a %s subscription from the subscription ID alone',
		( sitelessCheckoutType ) => {
			const { result } = renderPrepareProducts( {
				purchaseId: '12345',
				sitelessCheckoutType,
			} );

			expect( result.current.isLoading ).toBe( false );
			expect( result.current.error ).toBeNull();
			expect( result.current.productsForCart ).toHaveLength( 1 );
			// The backend derives the product from the subscription record.
			expect( result.current.productsForCart[ 0 ].product_slug ).toBe( '' );
			expect( result.current.productsForCart[ 0 ].extra.purchaseId ).toBe( '12345' );
			expect( result.current.productsForCart[ 0 ].extra.purchaseType ).toBe( 'renewal' );
		}
	);

	it( 'still uses the product slug when the legacy URL supplies one', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'ak_pro5h_yearly',
			purchaseId: '12345',
			sitelessCheckoutType: 'akismet',
		} );

		expect( result.current.productsForCart ).toHaveLength( 1 );
		expect( result.current.productsForCart[ 0 ].product_slug ).toBe( 'ak_pro5h_yearly' );
		expect( result.current.productsForCart[ 0 ].extra.purchaseId ).toBe( '12345' );
	} );

	it.each( [
		[ 'akismet', 'isAkismetSitelessCheckout' ],
		[ 'marketplace', 'isMarketplaceSitelessCheckout' ],
	] as const )(
		'flags a %s renewal as siteless so the backend keeps it in the cart',
		( sitelessCheckoutType, extraKey ) => {
			const { result } = renderPrepareProducts( {
				purchaseId: '12345',
				sitelessCheckoutType,
			} );

			expect( result.current.productsForCart[ 0 ].extra[ extraKey ] ).toBe( true );
		}
	);

	it( 'renews several subscriptions from a comma-separated list of IDs', () => {
		const { result } = renderPrepareProducts( {
			purchaseId: '12345,67890',
			sitelessCheckoutType: 'akismet',
		} );

		expect( result.current.productsForCart ).toHaveLength( 2 );
		expect( result.current.productsForCart.map( ( product ) => product.extra.purchaseId ) ).toEqual(
			[ '12345', '67890' ]
		);
	} );
} );
