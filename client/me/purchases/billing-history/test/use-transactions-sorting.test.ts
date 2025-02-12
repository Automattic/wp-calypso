/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useTransactionsSorting } from '../hooks/use-transactions-sorting';
import { mockTransactions } from '../test-fixtures/billing-transactions';

describe( 'useTransactionsSorting', () => {
	test( 'sorts transactions by date ascending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'date', direction: 'asc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current[ 0 ].date ).toBe( '2023-01-15' );
		expect( result.current[ 1 ].date ).toBe( '2023-02-01' );
		expect( result.current[ 2 ].date ).toBe( '2023-03-01' );
	} );

	test( 'sorts transactions by date descending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'date', direction: 'desc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current[ 0 ].date ).toBe( '2023-03-01' );
		expect( result.current[ 1 ].date ).toBe( '2023-02-01' );
		expect( result.current[ 2 ].date ).toBe( '2023-01-15' );
	} );

	test( 'sorts transactions by service ascending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'service', direction: 'asc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		// Should sort by variation first
		expect( result.current[ 0 ].items[ 0 ].variation ).toBe( 'Basic' );
		expect( result.current[ 1 ].items[ 0 ].variation ).toBe( 'Daily' );
		expect( result.current[ 2 ].items[ 0 ].variation ).toBe( 'Premium' );
	} );

	test( 'sorts transactions by service descending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'service', direction: 'desc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		// Should sort by variation first
		expect( result.current[ 0 ].items[ 0 ].variation ).toBe( 'Premium' );
		expect( result.current[ 1 ].items[ 0 ].variation ).toBe( 'Daily' );
		expect( result.current[ 2 ].items[ 0 ].variation ).toBe( 'Basic' );
	} );

	test( 'sorts transactions by type ascending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'type', direction: 'asc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current[ 0 ].items[ 0 ].type ).toBe( 'cancellation' );
		expect( result.current[ 1 ].items[ 0 ].type ).toBe( 'new purchase' );
		expect( result.current[ 2 ].items[ 0 ].type ).toBe( 'renewal' );
	} );

	test( 'sorts transactions by type descending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'type', direction: 'desc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current[ 0 ].items[ 0 ].type ).toBe( 'renewal' );
		expect( result.current[ 1 ].items[ 0 ].type ).toBe( 'new purchase' );
		expect( result.current[ 2 ].items[ 0 ].type ).toBe( 'cancellation' );
	} );

	test( 'sorts transactions by amount ascending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'amount', direction: 'asc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current[ 0 ].amount_integer ).toBe( 1500 ); // $15.00
		expect( result.current[ 1 ].amount_integer ).toBe( 2000 ); // $20.00
		expect( result.current[ 2 ].amount_integer ).toBe( 2500 ); // $25.00
	} );

	test( 'sorts transactions by amount descending', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'amount', direction: 'desc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current[ 0 ].amount_integer ).toBe( 2500 ); // $25.00
		expect( result.current[ 1 ].amount_integer ).toBe( 2000 ); // $20.00
		expect( result.current[ 2 ].amount_integer ).toBe( 1500 ); // $15.00
	} );

	test( 'handles unknown sort field by returning original order', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( mockTransactions, {
				sort: { field: 'unknown' as any, direction: 'asc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current ).toEqual( mockTransactions );
	} );

	test( 'handles empty transactions array', () => {
		const { result } = renderHook( () =>
			useTransactionsSorting( [], {
				sort: { field: 'date', direction: 'asc' },
				type: 'table',
				search: '',
				filters: [],
				page: 0,
				perPage: 0,
				fields: [],
				hiddenFields: [],
			} )
		);

		expect( result.current ).toEqual( [] );
	} );
} );
