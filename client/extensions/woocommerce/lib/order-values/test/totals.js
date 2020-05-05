/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getOrderDiscountTotal,
	getOrderFeeCost,
	getOrderFeeTotal,
	getOrderItemCost,
	getOrderRefundTotal,
	getOrderShippingTotal,
	getOrderSubtotal,
	getOrderTotal,
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

describe( 'getOrderFeeCost', () => {
	test( 'should be a function', () => {
		expect( getOrderFeeCost ).to.be.a( 'function' );
	} );

	test( 'should get the correct fee value', () => {
		expect( getOrderFeeCost( orderWithTax, 48 ) ).to.eql( 1.53 );
	} );

	test( 'should get the correct tax amount with multiple fees', () => {
		expect( getOrderFeeCost( orderWithCoupons, 41 ) ).to.eql( 10 );
	} );

	test( "should return 0 if this fee doesn't exist", () => {
		// orderWithRefunds has no fees
		expect( getOrderFeeCost( orderWithoutTax, 3 ) ).to.eql( 0 );
	} );

	test( 'should return 0 if there are no fees', () => {
		// orderWithRefunds has no fees
		expect( getOrderFeeCost( orderWithRefunds, 2 ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderFeeTotal', () => {
	test( 'should be a function', () => {
		expect( getOrderFeeTotal ).to.be.a( 'function' );
	} );

	test( 'should get the correct fee total', () => {
		expect( getOrderFeeTotal( orderWithTax ) ).to.eql( 1.53 );
	} );

	test( 'should get the correct fee total with multiple fees', () => {
		expect( getOrderFeeTotal( orderWithCoupons ) ).to.eql( 15 );
	} );

	test( 'should return 0 if there are no fees', () => {
		// orderWithRefunds has no fees
		expect( getOrderFeeTotal( orderWithRefunds ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderItemCost', () => {
	it( 'should be a function', () => {
		expect( getOrderItemCost ).to.be.a( 'function' );
	} );

	it( 'should get the singular cost of an item', () => {
		expect( getOrderItemCost( orderWithTax, 19 ) ).to.eql( 17.99 );
	} );

	it( 'should get the singular cost of an item, before discounts', () => {
		expect( getOrderItemCost( orderWithTax, 15 ) ).to.eql( 49.99 );
	} );

	it( 'should get the singular cost of an item, even if quantity > 1', () => {
		expect( getOrderItemCost( orderWithCoupons, 26 ) ).to.eql( 15.99 );
	} );

	it( 'should return 0 if this ID does not exist in line_items', () => {
		expect( getOrderItemCost( orderWithoutTax, 2 ) ).to.eql( 0 );
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

describe( 'getOrderTotal', () => {
	it( 'should be a function', () => {
		expect( getOrderTotal ).to.be.a( 'function' );
	} );

	it( 'should get the sum of line_item totals', () => {
		expect( getOrderTotal( orderWithTax ).toFixed( 2 ) ).to.eql( '64.51' );
	} );

	it( 'should get the sum of line_item totals regardless of coupons', () => {
		expect( getOrderTotal( orderWithCoupons ).toFixed( 2 ) ).to.eql( '74.67' );
	} );

	it( 'should return 0 if there is nothing in the order', () => {
		expect( getOrderTotal( { line_items: [] } ) ).to.eql( 0 );
	} );
} );
