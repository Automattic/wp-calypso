/** @format */
/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_DATE,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'state/action-types';
import {
	setApp,
	setNewest,
	setMonth,
	setBefore,
	setPage,
	setQuery,
} from '../actions';

describe( 'transaction filter actions', () => {
	describe( '#setApp', () => {
		test( 'should return an action object', () => {
			const action = setApp( 'past', 'Test app' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: 'Test app',
			} );
		} );
	} );

	describe( '#setNewest', () => {
		test( 'should return an action object', () => {
			const action = setNewest( 'past' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: true,
				month: '',
				before: '',
			} );
		} );
	} );

	describe( '#setMonth', () => {
		test( 'should return an action object', () => {
			const action = setMonth( 'past', '2018-03-29' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: false,
				month: '2018-03-29',
				before: '',
			} );
		} );
	} );

	describe( '#setBefore', () => {
		test( 'should return an action object', () => {
			const action = setBefore( 'past', '2017-03-29' );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: false,
				month: '',
				before: '2017-03-29',
			} );
		} );
	} );

	describe( '#setPage', () => {
		test( 'should return an action object', () => {
			const action = setPage( 'past', 14 );
			expect( action ).toEqual( {
				type: BILLING_TRANSACTIONS_FILTER_SET_PAGE,
				transactionType: 'past',
				page: 14,
			} );
		} );
	} );

	describe( '#setQuery', () => {
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
