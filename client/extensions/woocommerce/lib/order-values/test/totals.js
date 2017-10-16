/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getOrderDiscountTotal,
	getOrderRefundTotal,
	getOrderShippingTotal,
	getOrderSubtotal,
	// getOrderTotal,
} from '../totals';
import orderWithTax from './fixtures/order';
import orderWithoutTax from './fixtures/order-no-tax';
import orderWithCoupons from './fixtures/order-with-coupons';
import orderWithRefunds from './fixtures/order-with-refunds';

describe( 'getOrderDiscountTotal', () => {
	it( 'should be a function', () => {
		expect( getOrderDiscountTotal ).to.be.a( 'function' );
	} );

	it( 'should get the correct discount amount', () => {
		expect( getOrderDiscountTotal( orderWithRefunds ) ).to.eql( 15 );
	} );

	it( 'should return 0 if there are no discounts', () => {
		expect( getOrderDiscountTotal( orderWithoutTax ) ).to.eql( 0 );
	} );

	it( 'should get the correct discount amount with multiple coupons', () => {
		expect( getOrderDiscountTotal( orderWithCoupons ) ).to.eql( 22.3 );
	} );
} );

describe( 'getOrderRefundTotal', () => {
	it( 'should be a function', () => {
		expect( getOrderRefundTotal ).to.be.a( 'function' );
	} );

	it( 'should get the correct refund amount', () => {
		expect( getOrderRefundTotal( orderWithCoupons ) ).to.eql( -10.0 );
	} );

	it( 'should return 0 if there are no refunds', () => {
		expect( getOrderRefundTotal( orderWithoutTax ) ).to.eql( 0 );
	} );

	it( 'should get the correct refund amount with multiple refunds', () => {
		expect( getOrderRefundTotal( orderWithRefunds ) ).to.eql( -25.0 );
	} );
} );

describe( 'getOrderShippingTotal', () => {
	it( 'should be a function', () => {
		expect( getOrderShippingTotal ).to.be.a( 'function' );
	} );

	it( 'should get the correct shipping amount', () => {
		expect( getOrderShippingTotal( orderWithTax ) ).to.eql( 10 );
	} );

	it( 'should return 0 if there is no shipping', () => {
		expect( getOrderShippingTotal( orderWithoutTax ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderSubtotal', () => {
	it( 'should be a function', () => {
		expect( getOrderSubtotal ).to.be.a( 'function' );
	} );

	it( 'should get the sum of line_item totals', () => {
		expect( getOrderSubtotal( orderWithTax ) ).to.eql( 67.98 );
	} );

	it( 'should get the sum of line_item totals regardless of coupons', () => {
		expect( getOrderSubtotal( orderWithCoupons ) ).to.eql( 81.97 );
	} );

	it( 'should return 0 if there are no line_items', () => {
		expect( getOrderSubtotal( { line_items: [] } ) ).to.eql( 0 );
	} );
} );
