/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
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
	describe( '#app()', () => {
		test( 'should return default state', () => {
			const state = app( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should update from empty filter', () => {
			const state = app( null, {
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
				app: null,
			} );
			expect( state ).toBeNull();
		} );
	} );

	describe( '#date()', () => {
		test( 'should return default state', () => {
			const state = date( undefined, {} );
			expect( state ).toEqual( { newest: true } );
		} );

		test( 'should set the date filter to month', () => {
			const state = date( deepFreeze( { newest: true } ), {
				type: BILLING_TRANSACTIONS_FILTER_SET_DATE,
				transactionType: 'past',
				newest: false,
				month: '2018-03-29',
				before: '',
			} );
			expect( state ).toEqual( { newest: false, month: '2018-03-29', before: '' } );
		} );

		test( 'should set the date filter to before', () => {
			const state = date( deepFreeze( { newest: true } ), {
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
				deepFreeze( {
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

	describe( '#page()', () => {
		test( 'should return default state', () => {
			const state = page( undefined, {} );
			expect( state ).toEqual( 1 );
		} );

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

	describe( '#query()', () => {
		test( 'should return default state', () => {
			const state = query( undefined, {} );
			expect( state ).toEqual( '' );
		} );

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
	} );
} );
