/** @format */
/**
 * Internal dependencies
 */
import { isPastBillingTransactionError } from 'state/selectors';

describe( 'getPastBillingTransactionError()', () => {
	const state = {
		billingTransactions: {
			individualTransactions: {
				123: { error: false },
				435: { error: true },
			},
		},
	};

	test( 'returns false for data the fetched successfully', () => {
		const output = isPastBillingTransactionError( state, 123 );
		expect( output ).toEqual( false );
	} );

	test( 'returns true for data that failed to fetch', () => {
		const output = isPastBillingTransactionError( state, 435 );
		expect( output ).toEqual( true );
	} );

	test( 'returns false for unknown id', () => {
		const output = isPastBillingTransactionError( state, 679 );
		expect( output ).toEqual( false );
	} );
} );
