/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isOrderEditable,
	isOrderWaitingPayment,
	isOrderWaitingFulfillment,
	isOrderFinished,
	isOrderFailed,
} from '../index';

describe( 'isOrderEditable', () => {
	test( 'should be true for a pending order', () => {
		expect( isOrderEditable( { id: 1, status: 'pending' } ) ).to.be.true;
	} );

	test( 'should be true for an on-hold order', () => {
		expect( isOrderEditable( { id: 1, status: 'on-hold' } ) ).to.be.true;
	} );

	test( 'should be false for a processing order', () => {
		expect( isOrderEditable( { id: 1, status: 'processing' } ) ).to.be.false;
	} );

	test( 'should be false for a completed order', () => {
		expect( isOrderEditable( { id: 1, status: 'completed' } ) ).to.be.false;
	} );

	test( 'should be false for a failed order', () => {
		expect( isOrderEditable( { id: 1, status: 'failed' } ) ).to.be.false;
	} );

	test( 'should be true for an unsaved pending order', () => {
		expect( isOrderEditable( { id: { placeholder: 'order_1' }, status: 'pending' } ) ).to.be.true;
	} );

	test( 'should be true for an unsaved completed order', () => {
		expect( isOrderEditable( { id: { placeholder: 'order_1' }, status: 'completed' } ) ).to.be.true;
	} );

	test( 'should be false for a fake order status', () => {
		expect( isOrderEditable( { id: 1, status: 'fake' } ) ).to.be.false;
	} );
} );

describe( 'isOrderWaitingPayment', () => {
	test( 'should be true for a pending order', () => {
		expect( isOrderWaitingPayment( 'pending' ) ).to.be.true;
	} );

	test( 'should be true for an on-hold order', () => {
		expect( isOrderWaitingPayment( 'on-hold' ) ).to.be.true;
	} );

	test( 'should be false for a processing order', () => {
		expect( isOrderWaitingPayment( 'processing' ) ).to.be.false;
	} );

	test( 'should be false for a completed order', () => {
		expect( isOrderWaitingPayment( 'completed' ) ).to.be.false;
	} );

	test( 'should be false for a failed order', () => {
		expect( isOrderWaitingPayment( 'failed' ) ).to.be.false;
	} );

	test( 'should be false for a fake order status', () => {
		expect( isOrderWaitingPayment( 'fake' ) ).to.be.false;
	} );
} );

describe( 'isOrderWaitingFulfillment', () => {
	test( 'should be false for a pending order', () => {
		expect( isOrderWaitingFulfillment( 'pending' ) ).to.be.false;
	} );

	test( 'should be false for an on-hold order', () => {
		expect( isOrderWaitingFulfillment( 'on-hold' ) ).to.be.false;
	} );

	test( 'should be true for a processing order', () => {
		expect( isOrderWaitingFulfillment( 'processing' ) ).to.be.true;
	} );

	test( 'should be false for a completed order', () => {
		expect( isOrderWaitingFulfillment( 'completed' ) ).to.be.false;
	} );

	test( 'should be false for a failed order', () => {
		expect( isOrderWaitingFulfillment( 'failed' ) ).to.be.false;
	} );

	test( 'should be false for a fake order status', () => {
		expect( isOrderWaitingFulfillment( 'fake' ) ).to.be.false;
	} );
} );

describe( 'isOrderFinished', () => {
	test( 'should be false for a pending order', () => {
		expect( isOrderFinished( 'pending' ) ).to.be.false;
	} );

	test( 'should be false for an on-hold order', () => {
		expect( isOrderFinished( 'on-hold' ) ).to.be.false;
	} );

	test( 'should be false for a processing order', () => {
		expect( isOrderFinished( 'processing' ) ).to.be.false;
	} );

	test( 'should be true for a completed order', () => {
		expect( isOrderFinished( 'completed' ) ).to.be.true;
	} );

	test( 'should be true for a failed order', () => {
		expect( isOrderFinished( 'failed' ) ).to.be.true;
	} );

	test( 'should be false for a fake order status', () => {
		expect( isOrderFinished( 'fake' ) ).to.be.false;
	} );
} );

describe( 'isOrderFailed', () => {
	it( 'should be false for a pending order', () => {
		expect( isOrderFailed( 'pending' ) ).to.be.false;
	} );

	it( 'should be false for an on-hold order', () => {
		expect( isOrderFailed( 'on-hold' ) ).to.be.false;
	} );

	it( 'should be false for a processing order', () => {
		expect( isOrderFailed( 'processing' ) ).to.be.false;
	} );

	it( 'should be false for a completed order', () => {
		expect( isOrderFailed( 'completed' ) ).to.be.false;
	} );

	it( 'should be true for a failed order', () => {
		expect( isOrderFailed( 'failed' ) ).to.be.true;
	} );

	it( 'should be false for a fake order status', () => {
		expect( isOrderFailed( 'fake' ) ).to.be.false;
	} );
} );
