import deepFreeze from 'deep-freeze';
import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer, { requesting, items, sendingReceiptEmail } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'requesting',
				'items',
				'sendingReceiptEmail',
				'individualTransactions',
				'ui',
			] )
		);
	} );

	describe( '#requesting()', () => {
		test( 'should default to an false', () => {
			const state = requesting( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should set requesting to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: BILLING_TRANSACTIONS_REQUEST,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should set requesting to false if request finishes successfully', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
			} );

			expect( state ).toEqual( false );
		} );

		test( 'should set requesting to false if request finishes unsuccessfully', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
			} );

			expect( state ).toEqual( false );
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

			expect( state ).toEqual( {} );
		} );

		test( 'should store the billing transactions properly', () => {
			const state = items( null, {
				type: BILLING_TRANSACTIONS_RECEIVE,
				...billingTransactions,
			} );

			expect( state ).toEqual( billingTransactions );
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

			expect( state ).toEqual( billingTransactions );
		} );

		test( 'should persist state', () => {
			const state = serialize( items, deepFreeze( billingTransactions ) );

			expect( state ).toEqual( billingTransactions );
		} );

		test( 'should load valid persisted state', () => {
			const state = deserialize( items, deepFreeze( billingTransactions ) );

			expect( state ).toEqual( billingTransactions );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = deserialize( items, deepFreeze( { example: 'test' } ) );

			expect( state ).toEqual( {} );
		} );
	} );

	describe( '#sendingReceiptEmail()', () => {
		const currentState = {
			87654321: false,
		};

		test( 'should default to an empty object', () => {
			const state = sendingReceiptEmail( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should set sendingReceiptEmail of that receipt to true value if a request is initiated', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND,
				receiptId: 12345678,
			} );

			expect( state ).toEqual( {
				12345678: true,
				...state,
			} );
		} );

		test( 'should set sendingReceiptEmail of that receipt to false if request finishes successfully', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
				receiptId: 12345678,
			} );

			expect( state ).toEqual( {
				12345678: false,
				...state,
			} );
		} );

		test( 'should set sendingReceiptEmail of that receipt to false if request finishes unsuccessfully', () => {
			const state = sendingReceiptEmail( currentState, {
				type: BILLING_RECEIPT_EMAIL_SEND_FAILURE,
				receiptId: 12345678,
			} );

			expect( state ).toEqual( {
				12345678: false,
				...state,
			} );
		} );
	} );
} );
