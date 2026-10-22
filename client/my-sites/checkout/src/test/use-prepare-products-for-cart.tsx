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
	source,
	aiSessionId,
}: {
	productAliasFromUrl?: string;
	purchaseId?: string;
	sitelessCheckoutType: SitelessCheckoutType;
	source?: string;
	aiSessionId?: string;
} ) {
	return renderHook( () =>
		usePrepareProductsForCart( {
			productAliasFromUrl,
			purchaseId,
			siteSlug: undefined,
			sitelessCheckoutType,
			// The siteless route controller always sets this, so the 'wpcom' branch
			// has to beat the localStorage path.
			isNoSiteCart: true,
			source,
			aiSessionId,
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

describe( 'usePrepareProductsForCart for Professional Email', () => {
	it( 'sets new_quantity from the :-q- suffix', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'wp_titan_mail_yearly:example.com:-q-3',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.productsForCart[ 0 ].extra.new_quantity ).toBe( 3 );
	} );

	it( 'sets new_quantity to 1 when the URL has no quantity', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'wp_titan_mail_monthly:example.com',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.productsForCart[ 0 ].extra.new_quantity ).toBe( 1 );
	} );

	it( 'sets new_quantity for every Professional Email tier', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'wp_titan_mail_ultra_yearly:example.com',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.productsForCart[ 0 ].extra.new_quantity ).toBe( 1 );
	} );

	it( 'does not set new_quantity on other products', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle:-q-5',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.productsForCart[ 0 ].extra.new_quantity ).toBeUndefined();
	} );
} );

describe( 'usePrepareProductsForCart purchase attribution', () => {
	it( 'records the checkout link source and AI session on the cart item', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle',
			sitelessCheckoutType: 'wpcom',
			source: 'wpcom-mcp-checkout-url',
			aiSessionId: 'a755f9e8-8e0a-45be-81bc-524aaf8e2703',
		} );

		expect( result.current.productsForCart[ 0 ].extra ).toMatchObject( {
			source: 'wpcom-mcp-checkout-url',
			ai_session_id: 'a755f9e8-8e0a-45be-81bc-524aaf8e2703',
		} );
	} );

	it( 'omits the AI session when the link has none', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'personal-bundle',
			sitelessCheckoutType: 'wpcom',
			source: 'wpcom-mcp-checkout-url',
		} );

		expect( result.current.productsForCart[ 0 ].extra.ai_session_id ).toBeUndefined();
	} );
} );

describe( 'usePrepareProductsForCart for invalid product aliases', () => {
	it.each( [
		':product',
		':',
		'personal-bundle,:product',
		'personal-bundle,',
		',personal-bundle',
	] )(
		'reports a preparation error for %s without creating any cart products',
		( productAliasFromUrl ) => {
			const { result } = renderPrepareProducts( {
				productAliasFromUrl,
				sitelessCheckoutType: 'jetpack',
			} );

			expect( result.current.isLoading ).toBe( false );
			expect( result.current.error ).toBe(
				`I tried and failed to create products matching the identifier '${ productAliasFromUrl }'`
			);
			expect( result.current.productsForCart ).toEqual( [] );
		}
	);

	it( 'leaves unknown nonempty product slugs for the cart API to validate', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'foobar',
			sitelessCheckoutType: 'jetpack',
		} );

		expect( result.current.error ).toBeNull();
		expect( result.current.productsForCart[ 0 ].product_slug ).toBe( 'foobar' );
	} );

	it( 'preserves aliases, metadata, quantities, and multiple products', () => {
		const { result } = renderPrepareProducts( {
			productAliasFromUrl: 'domain-mapping:example.com,theme:ovation:-q-2',
			sitelessCheckoutType: 'wpcom',
		} );

		expect( result.current.error ).toBeNull();
		expect( result.current.productsForCart ).toEqual( [
			expect.objectContaining( {
				product_slug: 'domain_map',
				meta: 'example.com',
				quantity: null,
			} ),
			expect.objectContaining( { product_slug: 'premium_theme', meta: 'ovation', quantity: 2 } ),
		] );
	} );
} );
