import CartSynchronizer from '../cart-synchronizer';
import WpcomMock from 'lib/wpcom-mock';
import cartValues from 'lib/cart-values';
import sinon from 'sinon';

const emptyCart = cartValues.emptyCart,
	applyCoupon = cartValues.applyCoupon;

const TEST_SITE_ID = 91234567890;

describe( 'CartStore', function() {
	beforeEach( function() {
		this.sinon = sinon.sandbox.create();
		this.wpcom = WpcomMock.create( { sinonSandbox: this.sinon } );
	} );

	describe( '*before* the first fetch from the server', function() {
		it( 'should', function() {
			const fetchOptions = {

				},
				cartData = {

				};

			this.wpcom.mock().undocumented().cart( fetchOptions, function( mockResponse ) {
				mockResponse( null, cartData );
			} );
		} );
	} );
} );
