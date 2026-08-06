/**
 * @jest-environment jsdom
 */
import { useShoppingCart } from '@automattic/shopping-cart';
import { render, waitFor } from '@testing-library/react';
import CartMessages from '../cart-messages';
import type { ResponseCart } from '@automattic/shopping-cart';

const mockDispatch = jest.fn();
const mockClearMessages = jest.fn().mockResolvedValue( undefined );

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => ( {
	__esModule: true,
	default: jest.fn( () => 'no-site' ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.fn( () => mockDispatch ),
	useSelector: jest.fn(),
} ) );

const cart = {
	cart_generated_at_timestamp: 1,
	messages: {
		errors: [ { code: 'cart-error', message: 'Cart error' } ],
		persistent_errors: [ { code: 'persistent-cart-error', message: 'Persistent cart error' } ],
	},
} as ResponseCart;

function mockShoppingCart( responseCart: ResponseCart = cart ) {
	( useShoppingCart as jest.Mock ).mockReturnValue( {
		clearMessages: mockClearMessages,
		isLoading: false,
		responseCart,
	} );
}

describe( 'CartMessages', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockClearMessages.mockResolvedValue( undefined );
		mockShoppingCart();
	} );

	it( 'keeps default error notices persistent and does not clean them up', async () => {
		const { unmount } = render( <CartMessages shouldShowPersistentErrors /> );

		await waitFor( () => expect( mockDispatch ).toHaveBeenCalledTimes( 4 ) );
		const createdNotices = mockDispatch.mock.calls
			.map( ( [ action ] ) => action )
			.filter( ( action ) => action.type === 'NOTICE_CREATE' );

		expect( createdNotices ).toHaveLength( 2 );
		expect( createdNotices ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					notice: expect.objectContaining( {
						isPersistent: true,
						noticeId: 'cart-error',
					} ),
				} ),
				expect.objectContaining( {
					notice: expect.objectContaining( {
						isPersistent: true,
						noticeId: 'persistent-cart-error',
					} ),
				} ),
			] )
		);

		mockDispatch.mockClear();
		unmount();

		expect( mockDispatch ).not.toHaveBeenCalled();
		expect( mockClearMessages ).not.toHaveBeenCalled();
	} );

	it( 'makes opted-in errors nonpersistent and removes only their notices on unmount', async () => {
		const { unmount } = render(
			<CartMessages dismissErrorNoticesOnUnmount shouldShowPersistentErrors />
		);

		await waitFor( () => expect( mockDispatch ).toHaveBeenCalledTimes( 4 ) );
		const createdNotices = mockDispatch.mock.calls
			.map( ( [ action ] ) => action )
			.filter( ( action ) => action.type === 'NOTICE_CREATE' );

		expect( createdNotices ).toHaveLength( 2 );
		expect( createdNotices.every( ( action ) => action.notice.isPersistent === false ) ).toBe(
			true
		);

		mockDispatch.mockClear();
		unmount();

		expect( mockDispatch.mock.calls.map( ( [ action ] ) => action ) ).toEqual( [
			{ type: 'NOTICE_REMOVE', noticeId: 'cart-error' },
			{ type: 'NOTICE_REMOVE', noticeId: 'persistent-cart-error' },
		] );
		expect( mockClearMessages ).toHaveBeenCalledTimes( 1 );
	} );
} );
