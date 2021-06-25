/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';
/**
 * Internal dependencies
 */
import isRequestingBillingTransaction from 'calypso/state/selectors/is-requesting-billing-transaction';

describe( 'isRequestingBillingTransaction()', () => {
	const state = {
		billingTransactions: {
			requesting: false,
			individualTransactions: {
				123: { requesting: false },
				435: { requesting: true },
			},
		},
	};

	test( 'returns true if the transactions batch is being requested', () => {
		const testState = cloneDeep( state );
		testState.billingTransactions.requesting = true;

		const output = isRequestingBillingTransaction( testState, '123' );
		expect( output ).toBe( true );
	} );

	test( 'returns false for data that is not being requested', () => {
		const output = isRequestingBillingTransaction( state, '123' );
		expect( output ).toBe( false );
	} );

	test( 'returns true for data that is being requested', () => {
		const output = isRequestingBillingTransaction( state, '435' );
		expect( output ).toBe( true );
	} );

	test( 'returns false for unknown id', () => {
		const output = isRequestingBillingTransaction( state, '679' );
		expect( output ).toBe( false );
	} );
} );
