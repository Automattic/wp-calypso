/**
 * @jest-environment jsdom
 */

jest.mock( '../../../use-cart-key', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	ShoppingCartProvider,
} from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import useCartKey from '../../../use-cart-key';
import { CheckoutOrderBanner } from '../index';
import type { CartKey, GetCart, SetCart, ResponseCart } from '@automattic/shopping-cart';

const CART_KEY: CartKey = 123;

function buildFakeCartBackend( cart: Partial< ResponseCart > ) {
	const fullCart: ResponseCart = { ...getEmptyResponseCart(), cart_key: CART_KEY, ...cart };

	const getCart: GetCart = async () => fullCart;
	const setCart: SetCart = async ( _key, _newCart ) => fullCart;

	return createShoppingCartManagerClient( { getCart, setCart } );
}

function renderWithCart( cart: Partial< ResponseCart > ) {
	const client = buildFakeCartBackend( cart );

	( useCartKey as jest.Mock ).mockReturnValue( CART_KEY );

	return render(
		<ShoppingCartProvider managerClient={ client }>
			<CheckoutOrderBanner />
		</ShoppingCartProvider>
	);
}

describe( '<CheckoutOrderBanner>', () => {
	const originalPathname = window.location.pathname;

	beforeEach( () => {
		( useCartKey as jest.Mock ).mockReset();
		// jsdom does not allow direct assignment to window.location.pathname,
		// so we use Object.defineProperty.
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { ...window.location, pathname: '/checkout/test.wordpress.com/gift/personal' },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { ...window.location, pathname: originalPathname },
		} );
	} );

	test( 'renders the gifting banner for an unrestricted gift checkout', async () => {
		renderWithCart( {
			gift_details: {
				receiver_blog_id: 1,
				receiver_blog_slug: 'test.wordpress.com',
				is_gifting_restricted: false,
			},
		} );

		expect( await screen.findByText( 'Spread the love!' ) ).toBeVisible();
	} );

	test( 'suppresses the gifting banner when the receiver site is restricted', async () => {
		renderWithCart( {
			gift_details: {
				receiver_blog_id: 1,
				receiver_blog_slug: 'test.wordpress.com',
				is_gifting_restricted: true,
			},
		} );

		// Wait briefly for cart to settle, then assert banner is absent.
		await new Promise( ( r ) => setTimeout( r, 50 ) );
		expect( screen.queryByText( 'Spread the love!' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render the banner outside a gift checkout path', async () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { ...window.location, pathname: '/checkout/test.wordpress.com/personal' },
		} );

		renderWithCart( {
			gift_details: {
				receiver_blog_id: 1,
				receiver_blog_slug: 'test.wordpress.com',
				is_gifting_restricted: false,
			},
		} );

		await new Promise( ( r ) => setTimeout( r, 50 ) );
		expect( screen.queryByText( 'Spread the love!' ) ).not.toBeInTheDocument();
	} );
} );
