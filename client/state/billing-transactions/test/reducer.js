/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { requesting, items, sendingReceiptEmail } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items',
			'sendingReceiptEmail',
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an false', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should set requesting to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: BILLING_TRANSACTIONS_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set requesting to false if request finishes successfully', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should set requesting to false if request finishes unsuccessfully', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not persist state', () => {
			const state = requesting( true, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );

	describe( '#items()', () => {
		const billingTransactions = {
			past: [
				{
					id: '12345678',
					amount: '$1.23',
				}
			],
			upcoming: [
				{
					id: '87654321',
					amount: '$4.56',
				}
			]
		};

		it( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store the billing transactions properly', () => {
			const state = items( null, {
				type: BILLING_TRANSACTIONS_RECEIVE,
				...billingTransactions
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		it( 'should override previous billing transactions', () => {
			const state = items( deepFreeze( {
				past: [
					{
						id: '11223344',
						amount: '$3.43',
						desc: 'test'
					}
				],
				upcoming: [
					{
						id: '88776655',
						amount: '$1.11',
						product: 'example'
					}
				]
			} ), {
				type: BILLING_TRANSACTIONS_RECEIVE,
				...billingTransactions
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		it( 'should persist state', () => {
			const state = items( deepFreeze( billingTransactions ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( deepFreeze( billingTransactions ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = items( deepFreeze( {
				example: 'test'
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#sendingReceiptEmail()', () => {
		const currentState = {
			87654321: false,
		};

		it( 'should default to an empty object', () => {
			const state = sendingReceiptEmail( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set sendingReceiptEmail of that receipt to true value if a request is initiated', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND,
				receiptId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: true,
				...state
			} );
		} );

		it( 'should set sendingReceiptEmail of that receipt to false if request finishes successfully', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
				receiptId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: false,
				...state
			} );
		} );

		it( 'should set sendingReceiptEmail of that receipt to false if request finishes unsuccessfully', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND_FAILURE,
				receiptId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: false,
				...state
			} );
		} );

		it( 'should not persist state', () => {
			const state = sendingReceiptEmail( currentState, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = sendingReceiptEmail( currentState, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
