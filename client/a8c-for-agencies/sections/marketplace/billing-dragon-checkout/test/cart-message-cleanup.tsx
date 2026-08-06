/**
 * @jest-environment jsdom
 */
import { useShoppingCart } from '@automattic/shopping-cart';
import { render } from '@testing-library/react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { removeNotice } from 'calypso/state/notices/actions';
import CartMessageCleanup from '../cart-message-cleanup';

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => jest.fn() );
jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.fn(),
} ) );

describe( 'CartMessageCleanup', () => {
	const dispatch = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		( useCartKey as jest.Mock ).mockReturnValue( 'no-site' );
		( useDispatch as jest.Mock ).mockReturnValue( dispatch );
	} );

	test( 'removes A4A checkout error notices and clears cached cart messages on unmount', () => {
		const clearMessages = jest.fn().mockResolvedValue( undefined );
		( useShoppingCart as jest.Mock ).mockReturnValue( {
			clearMessages,
			responseCart: {
				messages: {
					errors: [
						{ code: 'regular-error', message: 'Regular error' },
						{ code: 'coupon-not-found', message: 'Coupon error' },
					],
					persistent_errors: [ { code: 'persistent-error', message: 'Persistent error' } ],
				},
			},
		} );

		const { unmount } = render( <CartMessageCleanup /> );
		unmount();

		expect( dispatch ).toHaveBeenCalledWith( removeNotice( 'regular-error' ) );
		expect( dispatch ).toHaveBeenCalledWith( removeNotice( 'coupon-message' ) );
		expect( dispatch ).toHaveBeenCalledWith( removeNotice( 'persistent-error' ) );
		expect( clearMessages ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'cleans messages from every cart manager used during the checkout session', () => {
		const firstClearMessages = jest.fn().mockResolvedValue( undefined );
		const secondClearMessages = jest.fn().mockResolvedValue( undefined );
		( useShoppingCart as jest.Mock )
			.mockReturnValueOnce( {
				clearMessages: firstClearMessages,
				responseCart: {
					messages: { errors: [ { code: 'first-error', message: 'First error' } ] },
				},
			} )
			.mockReturnValueOnce( {
				clearMessages: secondClearMessages,
				responseCart: {
					messages: { errors: [ { code: 'second-error', message: 'Second error' } ] },
				},
			} );

		const { rerender, unmount } = render( <CartMessageCleanup /> );
		rerender( <CartMessageCleanup /> );
		unmount();

		expect( dispatch ).toHaveBeenCalledWith( removeNotice( 'first-error' ) );
		expect( dispatch ).toHaveBeenCalledWith( removeNotice( 'second-error' ) );
		expect( firstClearMessages ).toHaveBeenCalledTimes( 1 );
		expect( secondClearMessages ).toHaveBeenCalledTimes( 1 );
	} );
} );
