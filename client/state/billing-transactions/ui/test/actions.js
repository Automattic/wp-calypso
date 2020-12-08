/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'calypso/state/action-types';
import { setApp, setDate, setPage, setQuery } from '../actions';

describe( 'transaction filter actions', () => {
	describe( '#setApp()', () => {
		test( 'should return an action object with the app name', () => {
			const action = setApp( 'past', 'Test app' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: 'Test app',
			} );
		} );
	} );

	describe( '#setDate()', () => {
		test( 'should return an action object with month and operator', () => {
			const action = setDate( 'past', '2018-03', 'equal' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_MONTH,
				transactionType: 'past',
				month: '2018-03',
				operator: 'equal',
			} );
		} );
	} );

	describe( '#setPage()', () => {
		test( 'should return an action object with the page number', () => {
			const action = setPage( 'past', 14 );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_PAGE,
				transactionType: 'past',
				page: 14,
			} );
		} );
	} );

	describe( '#setQuery()', () => {
		test( 'should return an action object with the query set', () => {
			const action = setQuery( 'past', 'some query' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
				transactionType: 'past',
				query: 'some query',
			} );
		} );
	} );
} );
