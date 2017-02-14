/**
 * External dependencies
 */
import assert from 'assert';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import CartSynchronizer from '../cart-synchronizer';
import FakeWPCOM from './fake-wpcom';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

var TEST_CART_KEY = 91234567890;

var poller = {
	add: function() {}
};

describe( 'cart-synchronizer', function() {
	let applyCoupon, emptyCart;

	useFilesystemMocks( __dirname );

	before( () => {
		const cartValues = require( 'lib/cart-values' );

		applyCoupon = cartValues.applyCoupon;
		emptyCart = cartValues.emptyCart;
	} );

	describe( '*before* the first fetch from the server', function() {
		it( 'should *not* allow the value to be read', function() {
			var wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller );

			assert.throws( () => {
				synchronizer.getLatestValue();
			}, Error );
		} );

		it( 'should enqueue local changes and POST them after fetching', function() {
			var wpcom = FakeWPCOM(),
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

	describe( '*after* the first fetch from the server', function() {
		it( 'should allow the value to be read', function() {
			var wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
				serverCart = emptyCart( TEST_CART_KEY );

			synchronizer.fetch();
			wpcom.resolveRequest( 0, serverCart );

			assert.equal( synchronizer.getLatestValue().blog_id, serverCart.blog_id );
		} );
	} );

	it( 'should make local changes visible immediately', function() {
		var wpcom = FakeWPCOM(),
			synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
			serverCart = emptyCart( TEST_CART_KEY );

		synchronizer.fetch();
		wpcom.resolveRequest( 0, serverCart );

		synchronizer.update( applyCoupon( 'foo' ) );
		assert.equal( synchronizer.getLatestValue().coupon, 'foo' );
	} );

	it( 'should fetch on first update', () => {
		const wpcom = FakeWPCOM(),
			synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
			changeFunction = () => {},
			serverFlushCallback = () => {};

		sinon.spy( synchronizer, 'fetch' );

		synchronizer.update( changeFunction, serverFlushCallback );

		expect( synchronizer.fetch ).to.have.been.called;
	} );

	it( 'should call server flush callback after update', () => {
		const wpcom = FakeWPCOM(),
			synchronizer = CartSynchronizer( TEST_CART_KEY, wpcom, poller ),
			changeFunction = applyCoupon( 'foo' ),
			serverFlushCallback = sinon.spy();

		synchronizer.update( changeFunction, serverFlushCallback );
		// get request
		wpcom.resolveRequest( 0, emptyCart( TEST_CART_KEY ) );
		// post request
		wpcom.resolveRequest( 1, emptyCart( TEST_CART_KEY ) );

		expect( serverFlushCallback ).to.have.been.called;
	} );
} );
