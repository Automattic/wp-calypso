/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { transactionPaymentSetActions, paymentActionLocations } from './fixtures/actions';
import { recordUnrecognizedPaymentMethod } from 'lib/analytics/cart';
import { setTaxLocation } from 'lib/cart-values';

jest.mock( 'lib/analytics/cart', () => ( {
	recordEvents: () => ( {} ),
	recordUnrecognizedPaymentMethod: jest.fn(),
} ) );
jest.mock( '../cart-synchronizer', () => () => {
	return {
		hasLoadedFromServer: () => true,
		hasPendingServerUpdates: () => false,
		update: () => ( {} ),
		on: () => ( {} ),
		off: () => ( {} ),
		getLatestValue: () => ( {} ),
		_poll: { bind: () => ( {} ) },
	};
} );
jest.mock( 'lib/cart-values', () => {
	return {
		setTaxLocation: jest.fn( () => () => ( {} ) ),
		fillInAllCartItemAttributes: jest.fn( () => ( {} ) ),
		removeCoupon: jest.fn( () => ( i ) => i ),
	};
} );
jest.mock( 'lib/data-poller', () => ( {
	add: () => ( {} ),
	remove: () => ( {} ),
} ) );
jest.mock( 'lib/products-list', () => () => ( { get: () => [] } ) );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {} ),
	me: () => ( {
		get: async () => ( {} ),
	} ),
} ) );

describe( 'Cart Store', () => {
	let CartStore, Dispatcher;

	beforeEach( () => {
		jest.isolateModules( () => {
			CartStore = require( 'lib/cart/store' );
			Dispatcher = require( 'dispatcher' );
		} );

		CartStore.setSelectedSiteId();
		jest.clearAllMocks();
	} );

	test( 'Store should be an object', () => {
		expect( typeof CartStore ).toBe( 'object' );
	} );

	test( 'Store should have method emitChange', () => {
		expect( typeof CartStore.emitChange ).toBe( 'function' );
	} );

	test( 'Store should have method get', () => {
		expect( typeof CartStore.get ).toBe( 'function' );
	} );

	test( 'Store should ignore update actions that arrive after disable', () => {
		let disableCart, removeCoupon;
		jest.isolateModules( () => {
			const cartActions = jest.requireActual( 'lib/cart/actions' );
			disableCart = cartActions.disableCart;
			removeCoupon = cartActions.removeCoupon;
		} );

		disableCart();
		expect( () => removeCoupon() ).not.toThrow();
	} );

	describe( 'Transaction Payment Set', () => {
		test.each( paymentActionLocations )(
			'should extract location from payment method for %s',
			( paymentMethod, location ) => {
				Dispatcher.handleServerAction( transactionPaymentSetActions[ paymentMethod ] );
				expect( setTaxLocation ).toHaveBeenCalledWith( location );
			}
		);

		test( 'Should report an unknown payment method', () => {
			Dispatcher.handleServerAction( transactionPaymentSetActions.unrecognized );
			expect( recordUnrecognizedPaymentMethod ).toHaveBeenCalled();
		} );

		test( 'Should report an unknown payment method parameters', () => {
			Dispatcher.handleServerAction( transactionPaymentSetActions.unrecognized );
			expect( recordUnrecognizedPaymentMethod ).toHaveBeenCalled();

			const args = JSON.stringify( recordUnrecognizedPaymentMethod.mock.calls );
			expect( args ).toContain( 'postal-code' );
			expect( args ).toContain( '98765' );
		} );

		test( 'Should not report a known payment method', () => {
			Dispatcher.handleServerAction( transactionPaymentSetActions.credits );
			expect( recordUnrecognizedPaymentMethod ).not.toHaveBeenCalled();
		} );

		test( 'Should not ignore missing country code values', () => {
			Dispatcher.handleServerAction( transactionPaymentSetActions.creditCard );
			expect( setTaxLocation ).toHaveBeenCalledWith(
				expect.objectContaining( {
					postalCode: '90014',
				} )
			);

			Dispatcher.handleServerAction( transactionPaymentSetActions.newCardNoPostalCode );
			expect( setTaxLocation ).toHaveBeenNthCalledWith(
				2,
				expect.objectContaining( {
					countryCode: 'AI',
				} )
			);
			expect( setTaxLocation ).toHaveBeenNthCalledWith(
				2,
				expect.not.objectContaining( {
					postalCode: expect.anything(),
				} )
			);
		} );
	} );
} );
