/** @format */
/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_NEWEST,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'state/action-types';
import { setApp, setDate, setNewest, setPage, setQuery } from '../actions';

describe( 'transaction filter actions', () => {
	describe( '#setApp()', () => {
		test( 'should return an action object', () => {
			const action = setApp( 'past', 'Test app' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: 'Test app',
			} );
		} );
	} );

	describe( '#setNewest()', () => {
		test( 'should return an action object', () => {
			const action = setNewest( 'past' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_NEWEST,
				transactionType: 'past',
			} );
		} );
	} );

	describe( '#setDate()', () => {
		test( 'should return an action object', () => {
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
		test( 'should return an action object', () => {
			const action = setPage( 'past', 14 );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_PAGE,
				transactionType: 'past',
				page: 14,
			} );
		} );
	} );

	describe( '#setQuery()', () => {
		test( 'should return an action object', () => {
			const action = setQuery( 'past', 'some query' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
				transactionType: 'past',
				query: 'some query',
			} );
		} );
	} );
} );
