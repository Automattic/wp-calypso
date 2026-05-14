/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CheckoutOrderBanner } from 'calypso/my-sites/checkout/src/components/checkout-order-banner';

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => ( {
	__esModule: true,
	default: jest.fn().mockReturnValue( 'test-cart-key' ),
} ) );

// Mock the gifting banner to simplify assertions
jest.mock(
	'calypso/my-sites/checkout/src/components/checkout-order-banner/gifting-checkout-banner',
	() => ( {
		GiftingCheckoutBanner: ( { siteSlug }: { siteSlug: string } ) => (
			<div data-testid="gifting-banner">gifting banner for { siteSlug }</div>
		),
	} )
);

const { useShoppingCart } = jest.requireMock( '@automattic/shopping-cart' );

function setPathname( pathname: string ) {
	Object.defineProperty( window, 'location', {
		value: { pathname },
		writable: true,
	} );
}

describe( 'CheckoutOrderBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the gifting banner on a gift checkout path', () => {
		setPathname( '/checkout/example.com/gift/personal' );
		useShoppingCart.mockReturnValue( {
			responseCart: {
				gift_details: {
					receiver_blog_id: 1,
					receiver_blog_slug: 'example.com',
				},
			},
		} );

		render( <CheckoutOrderBanner /> );

		expect( screen.getByTestId( 'gifting-banner' ) ).toBeVisible();
	} );

	test( 'suppresses the gifting banner when is_content_flagged is true', () => {
		setPathname( '/checkout/example.com/gift/personal' );
		useShoppingCart.mockReturnValue( {
			responseCart: {
				gift_details: {
					receiver_blog_id: 1,
					receiver_blog_slug: 'example.com',
					is_content_flagged: true,
				},
			},
		} );

		render( <CheckoutOrderBanner /> );

		expect( screen.queryByTestId( 'gifting-banner' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the gifting banner when is_content_flagged is false', () => {
		setPathname( '/checkout/example.com/gift/personal' );
		useShoppingCart.mockReturnValue( {
			responseCart: {
				gift_details: {
					receiver_blog_id: 1,
					receiver_blog_slug: 'example.com',
					is_content_flagged: false,
				},
			},
		} );

		render( <CheckoutOrderBanner /> );

		expect( screen.getByTestId( 'gifting-banner' ) ).toBeVisible();
	} );

	test( 'does not render anything on a non-gift checkout path', () => {
		setPathname( '/checkout/example.com/personal' );
		useShoppingCart.mockReturnValue( {
			responseCart: {
				gift_details: undefined,
			},
		} );

		const { container } = render( <CheckoutOrderBanner /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
