/**
 * Internal dependencies
 */
import { requesting, error, data } from '../reducer';
import {
	BILLING_TRANSACTION_ERROR_CLEAR,
	BILLING_TRANSACTION_RECEIVE,
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

describe( 'individualTransactions reducer', () => {
	const transactionId = 345;

	describe( 'requesting', () => {
		test( 'true if not already requesting', () => {
			const state = requesting( false, {
				type: BILLING_TRANSACTION_REQUEST,
				transactionId,
			} );

			expect( state ).toBe( true );
		} );

		test( 'true when already requesting', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTION_REQUEST,
				transactionId,
			} );

			expect( state ).toBe( true );
		} );

		test( 'false on success', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTION_REQUEST_SUCCESS,
				transactionId,
			} );

			expect( state ).toBe( false );
		} );

		test( 'false on error', () => {
			const state = requesting( true, {
				type: BILLING_TRANSACTION_REQUEST_FAILURE,
				transactionId,
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( 'error', () => {
		test( 'true on BILLING_TRANSACTION_REQUEST_FAILURE', () => {
			const state = error( false, {
				type: BILLING_TRANSACTION_REQUEST_FAILURE,
				transactionId,
				error: { message: 'error' },
			} );

			expect( state ).toBe( true );
		} );

		test( 'false on BILLING_TRANSACTION_ERROR_CLEAR', () => {
			const state = error( true, {
				type: BILLING_TRANSACTION_ERROR_CLEAR,
				transactionId,
			} );

			expect( state ).toBe( false );
		} );

		test( 'false on BILLING_TRANSACTION_REQUEST_SUCCESS', () => {
			const state = error( true, {
				type: BILLING_TRANSACTION_REQUEST_SUCCESS,
				transactionId,
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( 'data', () => {
		test( 'returns receipt data', () => {
			const state = data( null, {
				type: BILLING_TRANSACTION_RECEIVE,
				transactionId,
				receipt: { amount: 123 },
			} );

			expect( state ).toEqual( { amount: 123 } );
		} );

		test( 'overwrites existing data', () => {
			const state = data( Object.freeze( { amount: 123 } ), {
				type: BILLING_TRANSACTION_RECEIVE,
				transactionId,
				receipt: { amount: 456, refunded: true },
			} );

			expect( state ).toEqual( { amount: 456, refunded: true } );
		} );
	} );
} );
