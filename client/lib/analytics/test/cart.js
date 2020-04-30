/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { recordAddToCart } from 'lib/analytics/record-add-to-cart';
import { getAllCartItems } from 'lib/cart-values/cart-items';
import { recordEvents } from 'lib/analytics/cart';

jest.mock( 'lib/analytics/tracks', () => ( {
	__esModule: true,
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'lib/analytics/record-add-to-cart', () => ( {
	__esModule: true,
	recordAddToCart: jest.fn(),
} ) );
jest.mock( 'lib/cart-values/cart-items', () => ( { getAllCartItems: jest.fn() } ) );

const previousCart = {};
const nextCart = {};

const domainReg = {
	product_id: 6,
	product_name: 'Domain Registration',
	extra: {
		privacy_available: true,
		context: 'calypstore',
		registrar: 'OpenHRS',
	},
};

const domainRegNoExtra = {
	product_id: 6,
	product_name: 'Domain Registration',
};

const privateReg = {
	product_id: 16,
	product_name: 'Private Registration',
	extra: {
		context: 'calypstore',
	},
};

const privateRegNoExtra = {
	product_id: 16,
	product_name: 'Private Registration',
};

describe( 'recordEvents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'does not record events when no items are added or removed', () => {
		getAllCartItems.mockImplementation( getMockCartItems( [ domainReg ], [ domainReg ] ) );

		recordEvents( previousCart, nextCart );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( recordAddToCart ).not.toHaveBeenCalled();
	} );

	it( 'records an add event when an item is added', () => {
		getAllCartItems.mockImplementation( getMockCartItems( [], [ domainReg ] ) );

		recordEvents( previousCart, nextCart );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_cart_product_add',
			domainRegNoExtra
		);
		expect( recordAddToCart ).toHaveBeenCalledTimes( 1 );
		expect( recordAddToCart ).toHaveBeenCalledWith( { cartItem: domainReg } );
	} );

	it( 'records a remove event when an item is removed', () => {
		getAllCartItems.mockImplementation( getMockCartItems( [ domainReg ], [] ) );

		recordEvents( previousCart, nextCart );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_cart_product_remove',
			domainRegNoExtra
		);
		expect( recordAddToCart ).not.toHaveBeenCalled();
	} );

	it( 'records an add and a remove event when items are added and removed', () => {
		getAllCartItems.mockImplementation( getMockCartItems( [ domainReg ], [ privateReg ] ) );

		recordEvents( previousCart, nextCart );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_cart_product_remove',
			domainRegNoExtra
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_cart_product_add',
			privateRegNoExtra
		);
		expect( recordAddToCart ).toHaveBeenCalledTimes( 1 );
		expect( recordAddToCart ).toHaveBeenCalledWith( { cartItem: privateReg } );
	} );
} );

function getMockCartItems( previousCartItems, nextCartItems ) {
	return ( cart ) => {
		if ( cart === previousCart ) {
			return previousCartItems;
		}
		if ( cart === nextCart ) {
			return nextCartItems;
		}
	};
}
