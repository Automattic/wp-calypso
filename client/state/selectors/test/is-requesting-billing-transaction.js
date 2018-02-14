/** @format */

/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import { isRequestingBillingTransaction } from 'state/selectors';

describe( 'isRequestingBillingTransaction()', () => {
	const state = {
		billingTransactions: {
			requesting: false,
			individualTransactions: {
				requesting: {
					123: false,
					435: true,
				},
			},
		},
	};

	test( 'returns true if the transactions batch is being requested', () => {
		const testState = cloneDeep( state );
		testState.billingTransactions.requesting = true;

		const output = isRequestingBillingTransaction( testState, '123' );
		expect( output ).to.eql( true );
	} );

	test( 'returns false for data that is not being requested', () => {
		const output = isRequestingBillingTransaction( state, '123' );
		expect( output ).to.eql( false );
	} );

	test( 'returns true for data that is being requested', () => {
		const output = isRequestingBillingTransaction( state, '435' );
		expect( output ).to.eql( true );
	} );

	test( 'returns false for unknown id', () => {
		const output = isRequestingBillingTransaction( state, '679' );
		expect( output ).to.eql( false );
	} );
} );
