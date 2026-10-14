/**
 * @jest-environment jsdom
 */
import { siteByIdQuery } from '@automattic/api-queries';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, useShoppingCart } from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import WPCheckoutOrderReview from '../wp-checkout-order-review';
import type { Site } from '@automattic/api-core';
import type { ResponseCart } from '@automattic/shopping-cart';

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => () => 'no-site' );
jest.mock( '../wp-order-review-line-items', () => ( {
	WPOrderReviewLineItems: () => null,
	WPOrderReviewSection: ( { children }: { children: React.ReactNode } ) => children,
} ) );
let mockIsCheckoutUiRedesignV1 = false;
jest.mock( '../../hooks/use-checkout-ui-redesign-experiment', () => ( {
	useCheckoutUiRedesignExperiment: () => [ false, mockIsCheckoutUiRedesignV1 ],
} ) );
jest.mock( '../../hooks/use-mobile-checkout-sticky-summary-experiment', () => ( {
	useMobileCheckoutStickySummaryExperiment: () => ( { isMobileCheckoutStickySummary: false } ),
} ) );

function renderOrderReview( cart: ResponseCart, queryClient: QueryClient ) {
	( useShoppingCart as jest.Mock ).mockReturnValue( { responseCart: cart } );
	return renderWithProvider(
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<WPCheckoutOrderReview
				removeProductFromCart={ jest.fn() }
				replaceProductInCart={ jest.fn() }
				addProductsToCart={ jest.fn() }
				couponFieldStateProps={ {} as never }
				removeCouponAndClearField={ jest.fn() }
				isCouponFieldVisible={ false }
				setCouponFieldVisible={ jest.fn() }
				// What `CheckoutMainWrapper` passes when no site is selected.
				siteUrl="no-site"
			/>
		</CheckoutProvider>,
		{
			queryClient,
			initialState: {
				currentUser: { id: 1, user: { ID: 1, email: 'buyer@example.com' } },
			},
		}
	);
}

describe( 'WPCheckoutOrderReview', () => {
	beforeEach( () => {
		mockIsCheckoutUiRedesignV1 = false;
	} );

	it( 'does not show the site and account lines in the default checkout', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteByIdQuery( 456 ).queryKey, {
			ID: 456,
			slug: 'renewing.example',
		} as Site );

		renderOrderReview( { ...getEmptyResponseCart(), blog_id: 456 }, queryClient );

		expect( screen.queryByText( /renewing\.example/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /buyer@example\.com/ ) ).not.toBeInTheDocument();
	} );

	// The checkout UI redesign experiment still shows the site and account lines.
	it( 'shows the site the server assigned to a cart that has no site in its key', async () => {
		mockIsCheckoutUiRedesignV1 = true;
		const queryClient = new QueryClient();
		queryClient.setQueryData( siteByIdQuery( 456 ).queryKey, {
			ID: 456,
			slug: 'renewing.example',
		} as Site );

		renderOrderReview( { ...getEmptyResponseCart(), blog_id: 456 }, queryClient );

		expect( await screen.findByText( 'renewing.example' ) ).toBeInTheDocument();
	} );

	it( 'shows no site when the cart has no blog ID', () => {
		mockIsCheckoutUiRedesignV1 = true;
		renderOrderReview( { ...getEmptyResponseCart(), blog_id: 0 }, new QueryClient() );

		expect( screen.getByText( 'buyer@example.com' ) ).toBeInTheDocument();
		expect( document.querySelector( '.checkout-review-order__site' ) ).not.toBeInTheDocument();
	} );
} );
