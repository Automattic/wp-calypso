/** @format */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
import CartSynchronizer from '../cart-synchronizer';
import FakeWPCOM from './fake-wpcom';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

const TEST_CART_KEY = 91234567890;

const poller = {
	add: function() {},
};

describe( 'cart-synchronizer', () => {
	let applyCoupon, emptyCart;

	beforeAll( () => {
		const cartValues = require( 'lib/cart-values' );

		applyCoupon = cartValues.applyCoupon;
		emptyCart = cartValues.emptyCart;
	} );

	describe( '*before* the first fetch from the server', () => {
		test( 'should *not* allow the value to be read', () => {
			let wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller );

			assert.throws( () => {
				synchronizer.getLatestValue();
			}, Error );
		} );

		test( 'should enqueue local changes and POST them after fetching', () => {
			let wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
				serverCart = emptyCart( TEST_CART_KEY );

			synchronizer.fetch();
			synchronizer.update( applyCoupon( 'foo' ) );

			assert.throws( () => {
				synchronizer.getLatestValue();
			}, Error );
			wpcom.resolveRequest( 0, serverCart );

			assert.equal( synchronizer.getLatestValue().coupon, 'foo' );
			assert.equal( wpcom.getRequest( 1 ).method, 'POST' );
			assert.equal( wpcom.getRequest( 1 ).cart.coupon, 'foo' );

			wpcom.resolveRequest( 1, applyCoupon( 'bar' )( serverCart ) );
			assert.equal( synchronizer.getLatestValue().coupon, 'bar' );
		} );
	} );

	describe( '*after* the first fetch from the server', () => {
		test( 'should allow the value to be read', () => {
			let wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
				serverCart = emptyCart( TEST_CART_KEY );

			synchronizer.fetch();
			wpcom.resolveRequest( 0, serverCart );

			assert.equal( synchronizer.getLatestValue().blog_id, serverCart.blog_id );
		} );
	} );

	test( 'should make local changes visible immediately', () => {
		let wpcom = FakeWPCOM(),
			synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
			serverCart = emptyCart( TEST_CART_KEY );

		synchronizer.fetch();
		wpcom.resolveRequest( 0, serverCart );

		synchronizer.update( applyCoupon( 'foo' ) );
		assert.equal( synchronizer.getLatestValue().coupon, 'foo' );
	} );
} );
