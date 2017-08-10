/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isOrderWaitingPayment, isOrderWaitingFulfillment, isOrderFinished } from '../index';

describe( 'isOrderWaitingPayment', () => {
	it( 'should be true for a pending order', () => {
		expect( isOrderWaitingPayment( 'pending' ) ).to.be.true;
	} );

	it( 'should be true for an on-hold order', () => {
		expect( isOrderWaitingPayment( 'on-hold' ) ).to.be.true;
	} );

	it( 'should be false for a processing order', () => {
		expect( isOrderWaitingPayment( 'processing' ) ).to.be.false;
	} );

	it( 'should be false for a completed order', () => {
		expect( isOrderWaitingPayment( 'completed' ) ).to.be.false;
	} );

	it( 'should be false for a failed order', () => {
		expect( isOrderWaitingPayment( 'failed' ) ).to.be.false;
	} );

	it( 'should be false for a fake order status', () => {
		expect( isOrderWaitingPayment( 'fake' ) ).to.be.false;
	} );
} );

describe( 'isOrderWaitingFulfillment', () => {
	it( 'should be false for a pending order', () => {
		expect( isOrderWaitingFulfillment( 'pending' ) ).to.be.false;
	} );

	it( 'should be false for an on-hold order', () => {
		expect( isOrderWaitingFulfillment( 'on-hold' ) ).to.be.false;
	} );

	it( 'should be true for a processing order', () => {
		expect( isOrderWaitingFulfillment( 'processing' ) ).to.be.true;
	} );

	it( 'should be false for a completed order', () => {
		expect( isOrderWaitingFulfillment( 'completed' ) ).to.be.false;
	} );

	it( 'should be false for a failed order', () => {
		expect( isOrderWaitingFulfillment( 'failed' ) ).to.be.false;
	} );

	it( 'should be false for a fake order status', () => {
		expect( isOrderWaitingFulfillment( 'fake' ) ).to.be.false;
	} );
} );

describe( 'isOrderFinished', () => {
	it( 'should be false for a pending order', () => {
		expect( isOrderFinished( 'pending' ) ).to.be.false;
	} );

	it( 'should be false for an on-hold order', () => {
		expect( isOrderFinished( 'on-hold' ) ).to.be.false;
	} );

	it( 'should be false for a processing order', () => {
		expect( isOrderFinished( 'processing' ) ).to.be.false;
	} );

	it( 'should be true for a completed order', () => {
		expect( isOrderFinished( 'completed' ) ).to.be.true;
	} );

	it( 'should be true for a failed order', () => {
		expect( isOrderFinished( 'failed' ) ).to.be.true;
	} );

	it( 'should be false for a fake order status', () => {
		expect( isOrderFinished( 'fake' ) ).to.be.false;
	} );
} );
