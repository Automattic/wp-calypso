/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, items, sendingReceiptEmail } from '../reducer';
import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items',
			'sendingReceiptEmail',
			'individualTransactions',
		] );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an false', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should set requesting to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: BILLING_TRANSACTIONS_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should set requesting to false if request finishes successfully', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
			} );

			expect( state ).to.eql( false );
		} );

		test( 'should set requesting to false if request finishes unsuccessfully', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
			} );

			expect( state ).to.eql( false );
		} );

		test( 'should not persist state', () => {
			const state = requesting( true, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = requesting( true, {
				type: DESERIALIZE,
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
				},
			],
			upcoming: [
				{
					id: '87654321',
					amount: '$4.56',
				},
			],
		};

		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store the billing transactions properly', () => {
			const state = items( null, {
				type: BILLING_TRANSACTIONS_RECEIVE,
				...billingTransactions,
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		test( 'should override previous billing transactions', () => {
			const state = items(
				deepFreeze( {
					past: [
						{
							id: '11223344',
							amount: '$3.43',
							desc: 'test',
						},
					],
					upcoming: [
						{
							id: '88776655',
							amount: '$1.11',
							product: 'example',
						},
					],
				} ),
				{
					type: BILLING_TRANSACTIONS_RECEIVE,
					...billingTransactions,
				}
			);

			expect( state ).to.eql( billingTransactions );
		} );

		test( 'should persist state', () => {
			const state = items( deepFreeze( billingTransactions ), {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		test( 'should load valid persisted state', () => {
			const state = items( deepFreeze( billingTransactions ), {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( billingTransactions );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = items(
				deepFreeze( {
					example: 'test',
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#sendingReceiptEmail()', () => {
		const currentState = {
			87654321: false,
		};

		test( 'should default to an empty object', () => {
			const state = sendingReceiptEmail( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set sendingReceiptEmail of that receipt to true value if a request is initiated', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND,
				receiptId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: true,
				...state,
			} );
		} );

		test( 'should set sendingReceiptEmail of that receipt to false if request finishes successfully', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
				receiptId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: false,
				...state,
			} );
		} );

		test( 'should set sendingReceiptEmail of that receipt to false if request finishes unsuccessfully', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND_FAILURE,
				receiptId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: false,
				...state,
			} );
		} );

		test( 'should not persist state', () => {
			const state = sendingReceiptEmail( currentState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = sendingReceiptEmail( currentState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
