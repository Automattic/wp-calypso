/**
 * @jest-environment jsdom
 */
import { useShoppingCart } from '@automattic/shopping-cart';
import { renderHook } from '@testing-library/react';
import usePreparedCart from '../use-prepared-cart';

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );

const replaceProductsInCart = jest.fn();

function mockCart( {
	isLoading = false,
	loadingError = null,
	products = [],
}: {
	isLoading?: boolean;
	loadingError?: string | null;
	products?: { extra?: Record< string, unknown > }[];
} ) {
	( useShoppingCart as jest.Mock ).mockReturnValue( {
		isLoading,
		loadingError,
		responseCart: { products },
		replaceProductsInCart,
	} );
}

const preparedItem = {
	extra: { isA4ASitelessCheckout: true, agency_id: 42 },
};

describe( 'usePreparedCart', () => {
	beforeEach( () => {
		replaceProductsInCart.mockReset();
	} );

	it( 'is neither ready nor failed while the cart is loading', () => {
		mockCart( { isLoading: true } );
		const { result } = renderHook( () => usePreparedCart( 'no-site', true ) );

		expect( result.current ).toEqual( { isReady: false, error: null } );
	} );

	it( 'is ready when the loaded cart holds only prepared agency items, without touching the cart', () => {
		mockCart( { products: [ preparedItem ] } );
		const { result } = renderHook( () => usePreparedCart( 'no-site', true ) );

		expect( result.current ).toEqual( { isReady: true, error: null } );
		expect( replaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'reports a cart that failed to load', () => {
		mockCart( { loadingError: 'boom' } );
		const { result } = renderHook( () => usePreparedCart( 'no-site', true ) );

		expect( result.current.isReady ).toBe( false );
		expect( result.current.error ).toBe( 'Unable to load your prepared order.' );
	} );

	it( 'reports an empty cart instead of falling back to the frontend cart', () => {
		mockCart( { products: [] } );
		const { result } = renderHook( () => usePreparedCart( 'no-site', true ) );

		expect( result.current.isReady ).toBe( false );
		expect( result.current.error ).toBe( 'We could not find your prepared order.' );
		expect( replaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'reports a cart holding an item that was not prepared for the agency', () => {
		mockCart( { products: [ preparedItem, { extra: {} } ] } );
		const { result } = renderHook( () => usePreparedCart( 'no-site', true ) );

		expect( result.current.isReady ).toBe( false );
		expect( result.current.error ).toBe( 'We could not find your prepared order.' );
	} );

	it( 'does nothing when disabled', () => {
		mockCart( { products: [] } );
		const { result } = renderHook( () => usePreparedCart( 'no-site', false ) );

		expect( result.current ).toEqual( { isReady: false, error: null } );
	} );
} );
