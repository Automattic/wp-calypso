/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import { isPastBillingTransactionError } from 'state/selectors';

describe( 'isPastBillingTransactionError()', () => {
	const state = {
		billingTransactions: {
			individualTransactions: {
				errors: {
					123: false,
					435: true,
				},
			},
		},
	};

	test( 'returns false for data the fetched successfully', () => {
		const output = isPastBillingTransactionError( state, '123' );
		expect( output ).to.eql( false );
	} );

	test( 'returns true for data that failed to fetch', () => {
		const output = isPastBillingTransactionError( state, '435' );
		expect( output ).to.eql( true );
	} );

	test( 'returns false for unknown id', () => {
		const output = isPastBillingTransactionError( state, '679' );
		expect( output ).to.eql( false );
	} );
} );
