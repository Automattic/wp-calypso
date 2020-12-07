/**
 * @jest-environment jsdom
 */

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
	let CartStore;

	beforeEach( () => {
		jest.isolateModules( () => {
			CartStore = require( 'calypso/lib/cart/store' ).default;
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
		let disableCart;
		let removeCoupon;
		jest.isolateModules( () => {
			const cartActions = jest.requireActual( 'lib/cart/actions' );
			disableCart = cartActions.disableCart;
			removeCoupon = cartActions.removeCoupon;
		} );

		disableCart();
		expect( () => removeCoupon() ).not.toThrow();
	} );
} );
