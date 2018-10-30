/** @format */
/**
 * External dependencies
 */
import { cartSyncOn, cartSyncOff } from '../actions';
import CartStore from 'lib/cart/store';

// jest.mock( 'lib/cart/store', () => {
// 	return function() {
// 		return {
// 			on: jest.fn(),
// 			off: jest.fn(),
// 			get: jest.fn(),
// 		};
// 	};
// } );

jest.mock( 'lib/cart/store', () => ( {
	on: jest.fn(),
	off: jest.fn(),
	get: jest.fn(),
} ) );

beforeEach( () => {
	CartStore.on.mockClear();
	CartStore.off.mockClear();
	CartStore.get.mockClear();
} );

describe( 'cartSyncOn', () => {
	test( 'only registers the listener once', () => {
		const on1 = cartSyncOn( 'key1' );

		on1( () => {} );

		expect( CartStore.on ).toHaveBeenCalledTimes( 1 );

		on1( () => {} );

		expect( CartStore.on ).toHaveBeenCalledTimes( 1 );

		const on2 = cartSyncOn( 'key2' );

		on2( () => {} );

		expect( CartStore.on ).toHaveBeenCalledTimes( 1 );

		cartSyncOff( 'key1' )( () => {} );
		cartSyncOff( 'key1' )( () => {} );
		cartSyncOff( 'key2' )( () => {} );
	} );
} );
describe( 'cartSyncOff', () => {
	test( 'only deregisters the listener once', () => {
		const on1 = cartSyncOn( 'key1' );
		on1( () => {} ); // on 1
		on1( () => {} ); // on 2

		const on2 = cartSyncOn( 'key2' );
		on2( () => {} ); // on 3
		on2( () => {} ); // on 4
		on2( () => {} ); // on 5

		expect( CartStore.on ).toHaveBeenCalledTimes( 1 );

		const off1 = cartSyncOff( 'key1' );

		off1( () => {} ); // off 1
		off1( () => {} ); // off 2
		off1( () => {} ); // off 3 - ignored

		expect( CartStore.off ).toHaveBeenCalledTimes( 0 );

		const off2 = cartSyncOff( 'key2' );

		off2( () => {} ); // off 3 still
		off2( () => {} ); // off 4

		expect( CartStore.off ).toHaveBeenCalledTimes( 0 );

		off2( () => {} ); // off 5 - now off

		expect( CartStore.off ).toHaveBeenCalledTimes( 1 );

		off2( () => {} ); // extra
		off2( () => {} ); // extra

		expect( CartStore.off ).toHaveBeenCalledTimes( 1 );
	} );
} );
