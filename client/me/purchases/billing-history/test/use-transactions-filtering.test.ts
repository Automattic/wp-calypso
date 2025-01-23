/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useTransactionsFiltering } from '../hooks/use-transactions-filtering';
import { mockTransactions } from '../test-fixtures/billing-transactions';

describe( 'useTransactionsFiltering', () => {
	test( 'returns all transactions when no filters are applied', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: '',
					filters: [],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current ).toEqual( mockTransactions );
	} );

	test( 'filters transactions by search term matching service', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: 'Jetpack',
					filters: [],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].service ).toBe( 'Jetpack' );
	} );

	test( 'filters transactions by service type', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: '',
					filters: [
						{
							field: 'service',
							value: 'Store Services',
							operator: 'is',
						},
					],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].service ).toBe( 'Store Services' );
	} );

	test( 'filters transactions by purchase type', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: '',
					filters: [
						{
							field: 'type',
							value: 'renewal',
							operator: 'is',
						},
					],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].items[ 0 ].type ).toBe( 'renewal' );
	} );

	test( 'filters transactions by date', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: '',
					filters: [
						{
							field: 'date',
							value: '2023-02',
							operator: 'is',
						},
					],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].date ).toBe( '2023-02-01' );
	} );

	test( 'combines multiple filters', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: '',
					filters: [
						{
							field: 'service',
							value: 'WordPress.com',
							operator: 'is',
						},
						{
							field: 'type',
							value: 'new purchase',
							operator: 'is',
						},
						{
							field: 'date',
							value: '2023-01',
							operator: 'is',
						},
					],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].service ).toBe( 'WordPress.com' );
		expect( result.current[ 0 ].items[ 0 ].type ).toBe( 'new purchase' );
		expect( result.current[ 0 ].date ).toBe( '2023-01-15' );
	} );

	test( 'handles null transactions array', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				null,
				{
					search: 'test',
					filters: [],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current ).toEqual( [] );
	} );

	test( 'search is case insensitive', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: 'jetpack',
					filters: [],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].service ).toBe( 'Jetpack' );
	} );

	test( 'search matches partial strings', () => {
		const { result } = renderHook( () =>
			useTransactionsFiltering(
				mockTransactions,
				{
					search: 'jet',
					filters: [],
					type: 'table',
					page: 0,
					perPage: 0,
					sort: {
						field: 'service',
						direction: 'asc',
					},
					fields: [],
					hiddenFields: [],
				},
				null
			)
		);

		expect( result.current.length ).toBe( 1 );
		expect( result.current[ 0 ].service ).toBe( 'Jetpack' );
	} );

	describe( 'site filtering', () => {
		test( 'filters transactions by siteId', () => {
			const { result } = renderHook( () =>
				useTransactionsFiltering(
					mockTransactions,
					{
						search: '',
						filters: [],
						type: 'table',
						page: 0,
						perPage: 0,
						sort: { field: 'service', direction: 'asc' },
						fields: [],
						hiddenFields: [],
					},
					123 // assuming this siteId exists in mockTransactions
				)
			);

			result.current.forEach( ( transaction ) => {
				expect( transaction.items.some( ( item ) => String( item.site_id ) === '123' ) ).toBe(
					true
				);
			} );
		} );

		test( 'returns all transactions when siteId is null', () => {
			const { result } = renderHook( () =>
				useTransactionsFiltering(
					mockTransactions,
					{
						search: '',
						filters: [],
						type: 'table',
						page: 0,
						perPage: 0,
						sort: { field: 'service', direction: 'asc' },
						fields: [],
						hiddenFields: [],
					},
					null
				)
			);

			expect( result.current ).toEqual( mockTransactions );
		} );
	} );
} );
