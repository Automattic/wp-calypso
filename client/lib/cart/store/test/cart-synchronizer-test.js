var CartSynchronizer = require( '../cart-synchronizer' ),
	FakeWPCOM = require( './fake-wpcom' ),
	cartValues = require( 'lib/cart-values' ),
	emptyCart = cartValues.emptyCart,
	applyCoupon = cartValues.applyCoupon,
	assert = require( 'assert' );

var TEST_SITE_ID = 91234567890;

var poller = {
	add: function() {}
};

describe( 'CartSynchronizer', function() {
	describe( '*before* the first fetch from the server', function() {
		it( 'should *not* allow the value to be read', function() {
			var wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_SITE_ID, wpcom, poller );

			assert.throws(function() { synchronizer.getLatestValue(); }, Error);
		} );

		it( 'should enqueue local changes and POST them after fetching', function() {
			var wpcom = FakeWPCOM(),
				synchronizer = CartSynchronizer( TEST_SITE_ID, wpcom, poller ),
				serverCart = emptyCart( TEST_SITE_ID );

			synchronizer.fetch();
			synchronizer.update( applyCoupon( 'foo' ) );

			assert.throws( function() { synchronizer.getLatestValue(); }, Error );
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
				synchronizer = CartSynchronizer( TEST_SITE_ID, wpcom, poller ),
				serverCart = emptyCart( TEST_SITE_ID );

			synchronizer.fetch();
			wpcom.resolveRequest( 0, serverCart );

			assert.equal( synchronizer.getLatestValue().blog_id, serverCart.blog_id );
		} );
	} );

	it( 'should make local changes visible immediately', function() {
		var wpcom = FakeWPCOM(),
			synchronizer = CartSynchronizer( TEST_SITE_ID, wpcom, poller ),
			serverCart = emptyCart( TEST_SITE_ID );

		synchronizer.fetch();
		wpcom.resolveRequest( 0, serverCart );

		synchronizer.update( applyCoupon( 'foo' ) );
		assert.equal( synchronizer.getLatestValue().coupon, 'foo' );
	} );
} );
