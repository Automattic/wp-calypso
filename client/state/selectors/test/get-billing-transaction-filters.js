/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import getBillingTransactionFilters from 'calypso/state/selectors/get-billing-transaction-filters';

describe( 'getBillingTransactionFilters()', () => {
	const state = {
		billingTransactions: {
			ui: {
				past: {
					app: 'test app',
					date: { month: '2018-03', operator: 'equal' },
					page: 3,
					query: 'test query',
				},
			},
		},
	};

	test( 'returns transaction filters', () => {
		const output = getBillingTransactionFilters( state, 'past' );
		expect( output ).toEqual( {
			app: 'test app',
			date: { month: '2018-03', operator: 'equal' },
			page: 3,
			query: 'test query',
		} );
	} );

	test( 'returns default values for non-existent filters', () => {
		const output = getBillingTransactionFilters( state, 'upcoming' );
		expect( output ).toEqual( {
			app: '',
			date: { month: null, operator: null },
			page: 1,
			query: '',
		} );
	} );

	test( 'fills missing values', () => {
		const testState = cloneDeep( state );
		testState.billingTransactions.ui.past = {
			app: 'test app',
		};
		const output = getBillingTransactionFilters( testState, 'past' );
		expect( output ).toEqual( {
			app: 'test app',
			date: { month: null, operator: null },
			page: 1,
			query: '',
		} );
	} );
} );
