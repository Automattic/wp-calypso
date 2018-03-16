/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import { getPastBillingTransactionError } from 'state/selectors';

describe( 'getPastBillingTransactionError()', () => {
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
		const output = getPastBillingTransactionError( state, '123' );
		expect( output ).to.eql( false );
	} );

	test( 'returns true for data that failed to fetch', () => {
		const output = getPastBillingTransactionError( state, '435' );
		expect( output ).to.eql( true );
	} );

	test( 'returns false for unknown id', () => {
		const output = getPastBillingTransactionError( state, '679' );
		expect( output ).to.eql( false );
	} );
} );
