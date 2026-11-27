/**
 * @vitest-environment jsdom
 */
import { siteByIdQuery } from '@automattic/api-queries';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, useShoppingCart } from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import WPCheckoutOrderReview from '../wp-checkout-order-review';
import type { Site } from '@automattic/api-core';
import type { ResponseCart } from '@automattic/shopping-cart';

vi.mock( '@automattic/shopping-cart', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/shopping-cart' ) >(
		'@automattic/shopping-cart'
	) ),
	useShoppingCart: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/checkout/src/hooks/use-checkout-cart-key', () => ( {
	default: () => 'no-site',
} ) );
vi.mock( '../wp-order-review-line-items', () => ( {
	WPOrderReviewLineItems: () => null,
	WPOrderReviewSection: ( { children }: { children: React.ReactNode } ) => children,
} ) );

function renderOrderReview(
	cart: ResponseCart,
	queryClient: QueryClient,
	selectedSiteId: number | null = null
) {
	( useShoppingCart as Mock ).mockReturnValue( { responseCart: cart } );
	return renderWithProvider(
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<WPCheckoutOrderReview
				removeProductFromCart={ vi.fn() }
				replaceProductInCart={ vi.fn() }
				addProductsToCart={ vi.fn() }
				couponFieldStateProps={ {} as never }
				removeCouponAndClearField={ vi.fn() }
				isCouponFieldVisible={ false }
				setCouponFieldVisible={ vi.fn() }
				// What `CheckoutMainWrapper` passes when no site is selected.
				siteUrl="no-site"
			/>
		</CheckoutProvider>,
		{
			queryClient,
			initialState: {
				currentUser: { id: 1, user: { ID: 1, email: 'buyer@example.com' } },
				ui: { selectedSiteId },
			},
		}
	);
}

describe( 'WPCheckoutOrderReview', () => {
	it( 'shows the site the server assigned to a cart that has no site in its key', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteByIdQuery( 456 ).queryKey, {
			ID: 456,
			slug: 'renewing.example',
		} as Site );

		renderOrderReview( { ...getEmptyResponseCart(), blog_id: 456 }, queryClient );

		expect( await screen.findByText( 'Site: renewing.example' ) ).toBeInTheDocument();
	} );

	it( 'shows no site when the cart has no blog ID', () => {
		renderOrderReview( { ...getEmptyResponseCart(), blog_id: 0 }, new QueryClient() );

		expect( screen.getByText( /^Account:/ ) ).toBeInTheDocument();
		expect( screen.queryByText( /^Site:/ ) ).not.toBeInTheDocument();
	} );

	it( "shows the selected site's mapped domain", async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteByIdQuery( 123 ).queryKey, {
			ID: 123,
			slug: 'mapped.example',
			URL: 'https://mapped.example',
			options: { is_mapped_domain: true },
		} as Site );

		renderOrderReview( { ...getEmptyResponseCart(), blog_id: 123 }, queryClient, 123 );

		expect( await screen.findByText( 'Site: mapped.example' ) ).toBeInTheDocument();
	} );
} );
