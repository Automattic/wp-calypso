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
import { app, date, page, query } from '../reducer';

describe( 'transaction filter reducer', () => {
	describe( '#app', () => {
		test( 'should update from empty filter', () => {
			const state = app( '', {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: 'Test app',
			} );
			expect( state ).toEqual( 'Test app' );
		} );

		test( 'should update existing filter', () => {
			const state = app( 'Test app', {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: 'Another test app',
			} );
			expect( state ).toEqual( 'Another test app' );
		} );

		test( 'should clear the filter', () => {
			const state = app( 'Test app', {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: '',
			} );
			expect( state ).toEqual( '' );
		} );
	} );

	describe( '#date', () => {
		test( 'should set the date filter to month', () => {
			const state = date( Object.freeze( { newest: true } ), {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: false,
				month: '2018-03-29',
				before: '',
			} );
			expect( state ).toEqual( { newest: false, month: '2018-03-29', before: '' } );
		} );

		test( 'should set the date filter to before', () => {
			const state = date( Object.freeze( { newest: true } ), {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: false,
				month: '',
				before: '2018-03-29',
			} );
			expect( state ).toEqual( { newest: false, month: '', before: '2018-03-29' } );
		} );

		test( 'should update existing filter', () => {
			const state = date(
				Object.freeze( {
					newest: false,
					month: '2018-03-29',
					before: '',
				} ),
				{
					type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
					transactionType: 'past',
					newest: true,
					month: '',
					before: '',
				}
			);
			expect( state ).toEqual( { newest: true, month: '', before: '' } );
		} );
	} );

	describe( '#page', () => {
		test( 'should update set the page number', () => {
			const state = page( 1, {
				type: BILLING_TRANSACTIONS_FILTER_SET_PAGE,
				transactionType: 'past',
				page: 3,
			} );
			expect( state ).toEqual( 3 );
		} );

		test( 'should reset to 1 on app filter change', () => {
			const state = page( 4, {
				type: BILLING_TRANSACTIONS_FILTER_SET_APP,
				transactionType: 'past',
				app: 'Test app',
			} );
			expect( state ).toEqual( 1 );
		} );

		test( 'should reset to 1 on date filter change', () => {
			const state = page( 4, {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: false,
				month: '2018-03-29',
				before: '',
			} );
			expect( state ).toEqual( 1 );
		} );

		test( 'should reset to 1 on search query change', () => {
			const state = page( 4, {
				type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
				transactionType: 'past',
				query: 'search query',
			} );
			expect( state ).toEqual( 1 );
		} );
	} );

	describe( '#query', () => {
		test( 'should update from empty query', () => {
			const state = query( '', {
				type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
				transactionType: 'past',
				query: 'Test query',
			} );
			expect( state ).toEqual( 'Test query' );
		} );

		test( 'should update existing query', () => {
			const state = query( 'Test query', {
				type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
				transactionType: 'past',
				query: 'Another test query',
			} );
			expect( state ).toEqual( 'Another test query' );
		} );

		test( 'should clear the query', () => {
			const state = query( 'Test query', {
				type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
				transactionType: 'past',
				query: '',
			} );
			expect( state ).toEqual( '' );
		} );
	} );
} );
