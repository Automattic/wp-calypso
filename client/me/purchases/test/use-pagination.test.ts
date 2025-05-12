/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { renderHook } from '@testing-library/react';
import { generateTransactions } from '../billing-history/test-fixtures/billing-transactions.ts';
import { usePagination } from '../use-pagination.ts';

describe( 'usePagination', () => {
	test( 'returns all transactions when there are fewer than perPage', () => {
		const transactions = generateTransactions( 3 );
		const { result } = renderHook( () => usePagination( transactions, 1, 5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions );
		expect( result.current.totalPages ).toBe( 1 );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );

	test( 'returns first page correctly when there are multiple pages', () => {
		const transactions = generateTransactions( 12 );
		const { result } = renderHook( () => usePagination( transactions, 1, 5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions.slice( 0, 5 ) );
		expect( result.current.totalPages ).toBe( 3 );
		expect( result.current.hasNextPage ).toBe( true );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );

	test( 'returns correct page of transactions when there are more than perPage', () => {
		const transactions = generateTransactions( 12 );
		const { result } = renderHook( () => usePagination( transactions, 2, 5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions.slice( 5, 10 ) );
		expect( result.current.totalPages ).toBe( 3 );
		expect( result.current.hasNextPage ).toBe( true );
		expect( result.current.hasPreviousPage ).toBe( true );
	} );

	test( 'returns last page correctly when not completely filled', () => {
		const transactions = generateTransactions( 12 );
		const { result } = renderHook( () => usePagination( transactions, 3, 5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions.slice( 10, 12 ) );
		expect( result.current.totalPages ).toBe( 3 );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.hasPreviousPage ).toBe( true );
	} );

	test( 'handles exact page size correctly', () => {
		const transactions = generateTransactions( 10 );
		const { result } = renderHook( () => usePagination( transactions, 2, 5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions.slice( 5, 10 ) );
		expect( result.current.totalPages ).toBe( 2 );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.hasPreviousPage ).toBe( true );
	} );

	test( 'handles empty transactions array', () => {
		const { result } = renderHook( () => usePagination( [], 1, 5 ) );

		expect( result.current.paginatedItems ).toEqual( [] );
		expect( result.current.totalPages ).toBe( 0 );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );

	test( 'handles invalid high page numbers gracefully', () => {
		const transactions = generateTransactions( 10 );
		const { result } = renderHook( () => usePagination( transactions, 99, 5 ) );

		expect( result.current.paginatedItems ).toEqual( [] );
		expect( result.current.totalPages ).toBe( 2 );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.hasPreviousPage ).toBe( true );
	} );

	test( 'handles zero page number by returning empty array', () => {
		const transactions = generateTransactions( 10 );
		const { result } = renderHook( () => usePagination( transactions, 0, 5 ) );

		expect( result.current.paginatedItems ).toEqual( [] );
		expect( result.current.totalPages ).toBe( 2 );
		expect( result.current.hasNextPage ).toBe( true );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );

	test( 'handles negative page numbers by returning first page', () => {
		const transactions = generateTransactions( 10 );
		const { result } = renderHook( () => usePagination( transactions, -1, 5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions.slice( 0, 5 ) );
		expect( result.current.totalPages ).toBe( 2 );
		expect( result.current.hasNextPage ).toBe( true );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );

	test( 'handles zero page size', () => {
		const transactions = generateTransactions( 10 );
		const { result } = renderHook( () => usePagination( transactions, 1, 0 ) );

		expect( result.current.paginatedItems ).toEqual( [] );
		expect( result.current.totalPages ).toBe( Infinity );
		expect( result.current.hasNextPage ).toBe( true );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );

	test( 'handles negative page size', () => {
		const transactions = generateTransactions( 10 );
		const { result } = renderHook( () => usePagination( transactions, 1, -5 ) );

		expect( result.current.paginatedItems ).toEqual( transactions.slice( 0, 5 ) );
		expect( result.current.totalPages ).toBe( -2 );
		expect( result.current.hasNextPage ).toBe( false );
		expect( result.current.hasPreviousPage ).toBe( false );
	} );
} );
