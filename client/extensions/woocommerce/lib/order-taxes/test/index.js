/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getOrderDiscountTax,
	getOrderLineItemTax,
	getOrderShippingTax,
	getOrderSubtotalTax,
	getOrderTotalTax,
} from '../index';
import orderWithTax from './fixtures/order';
import orderWithoutTax from './fixtures/order-no-tax';

describe( 'getOrderDiscountTax', () => {
	it( 'should be a function', () => {
		expect( getOrderDiscountTax ).to.be.a( 'function' );
	} );

	it( 'should get the correct tax amount', () => {
		expect( getOrderDiscountTax( orderWithTax ) ).to.eql( 0.95 );
	} );

	it( 'should return 0 if there is no tax', () => {
		expect( getOrderDiscountTax( orderWithoutTax ) ).to.eql( 0 );
	} );

	it( 'should return 0 if the order is malformed', () => {
		expect( getOrderDiscountTax( {} ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderLineItemTax', () => {
	it( 'should be a function', () => {
		expect( getOrderLineItemTax ).to.be.a( 'function' );
	} );

	it( 'should get the correct tax amount', () => {
		expect( getOrderLineItemTax( orderWithTax, 0 ) ).to.eql( 5.3964 );
	} );

	it( 'should get the correct tax amount for the second item', () => {
		expect( getOrderLineItemTax( orderWithTax, 1 ) ).to.eql( 1.1424 );
	} );

	it( 'should return 0 if there is no tax', () => {
		expect( getOrderLineItemTax( orderWithoutTax, 0 ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderShippingTax', () => {
	it( 'should be a function', () => {
		expect( getOrderShippingTax ).to.be.a( 'function' );
	} );

	it( 'should get the correct tax amount', () => {
		expect( getOrderShippingTax( orderWithTax ) ).to.eql( 0.635 );
	} );

	it( 'should return 0 if there is no tax', () => {
		expect( getOrderShippingTax( orderWithoutTax ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderSubtotalTax', () => {
	it( 'should be a function', () => {
		expect( getOrderSubtotalTax ).to.be.a( 'function' );
	} );

	it( 'should get the correct tax amount', () => {
		expect( getOrderSubtotalTax( orderWithTax ) ).to.eql( 6.5388 );
	} );

	it( 'should return 0 if there is no tax', () => {
		expect( getOrderSubtotalTax( orderWithoutTax ) ).to.eql( 0 );
	} );
} );

describe( 'getOrderTotalTax', () => {
	it( 'should be a function', () => {
		expect( getOrderTotalTax ).to.be.a( 'function' );
	} );

	it( 'should get the correct tax amount', () => {
		expect( getOrderTotalTax( orderWithTax ) ).to.eql( 7.1738 );
	} );

	it( 'should return 0 if there is no tax', () => {
		expect( getOrderTotalTax( orderWithoutTax ) ).to.eql( 0 );
	} );
} );
