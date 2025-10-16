/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { useQueryHandler } from '../use-query-handler';

describe( 'useQueryHandler', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'should initialize with undefined query when no initial values provided', () => {
		const { result } = renderHook( () => useQueryHandler( {} ) );
		expect( result.current.query ).toBeUndefined();
	} );

	it( 'should initialize with provided initialQuery', () => {
		const { result } = renderHook( () => useQueryHandler( { initialQuery: 'test-domain' } ) );
		expect( result.current.query ).toBe( 'test-domain' );
	} );

	it( 'should initialize with domain from currentSiteUrl when provided', () => {
		const { result } = renderHook( () =>
			useQueryHandler( { currentSiteUrl: 'https://test-site.wordpress.com' } )
		);
		expect( result.current.query ).toBe( 'test-site' );
	} );

	it( 'should initialize with domain from currentSiteUrl when provided (wpcomstaging)', () => {
		const { result } = renderHook( () =>
			useQueryHandler( { currentSiteUrl: 'https://test-site.wpcomstaging.com' } )
		);
		expect( result.current.query ).toBe( 'test-site' );
	} );

	it( 'should initialize with query from sessionStorage when available', () => {
		sessionStorage.setItem( 'domain-search-query', 'stored-domain' );
		const { result } = renderHook( () => useQueryHandler( {} ) );
		expect( result.current.query ).toBe( 'stored-domain' );
	} );

	it( 'should update query and sessionStorage when setQuery is called', () => {
		const { result } = renderHook( () => useQueryHandler( {} ) );

		act( () => {
			result.current.setQuery( 'new-domain' );
		} );

		expect( result.current.query ).toBe( 'new-domain' );
		expect( sessionStorage.getItem( 'domain-search-query' ) ).toBe( 'new-domain' );
	} );

	it( 'should clear query from sessionStorage when clearQuery is called', () => {
		const { result } = renderHook( () => useQueryHandler( {} ) );

		act( () => {
			result.current.setQuery( 'test-domain' );
		} );

		act( () => {
			result.current.clearQuery();
		} );

		expect( sessionStorage.getItem( 'domain-search-query' ) ).toBeNull();
	} );

	it( 'should handle sessionStorage errors gracefully', () => {
		const mockError = new Error( 'Storage access denied' );
		const originalGetItem = Storage.prototype.getItem;
		Storage.prototype.getItem = jest.fn().mockImplementation( () => {
			throw mockError;
		} );

		const { result } = renderHook( () => useQueryHandler( {} ) );
		expect( result.current.query ).toBeUndefined();

		Storage.prototype.getItem = originalGetItem;
	} );
} );
