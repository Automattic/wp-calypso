/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { clearSessionStorageQuery, useQueryHandler } from '../use-query-handler';

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

	it( 'should initialize with provided initialQuery in lowercase', () => {
		const { result } = renderHook( () => useQueryHandler( { initialQuery: 'TEST-DOMAIN' } ) );
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

	it( 'should initialize with domain without TLD when currentSiteUrl is a custom domain', () => {
		const { result } = renderHook( () =>
			useQueryHandler( { currentSiteUrl: 'https://test-site.com' } )
		);
		expect( result.current.query ).toBe( 'test-site' );
	} );

	it( 'should initialize with query from sessionStorage when available', () => {
		sessionStorage.setItem( 'domain-search-query', 'stored-domain' );
		const { result } = renderHook( () => useQueryHandler( {} ) );
		expect( result.current.query ).toBe( 'stored-domain' );
	} );

	it( 'should initialize with query from sessionStorage when available even if currentSiteUrl is present', () => {
		sessionStorage.setItem( 'domain-search-query', 'stored-domain' );
		const { result } = renderHook( () =>
			useQueryHandler( { currentSiteUrl: 'https://test-site.wordpress.com' } )
		);
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

	it( 'should clear sessionStorage but keep the query in state when clearQuery is called', () => {
		const { result } = renderHook( () => useQueryHandler( {} ) );

		act( () => {
			result.current.setQuery( 'test-domain' );
		} );

		act( () => {
			result.current.clearQuery();
		} );

		expect( sessionStorage.getItem( 'domain-search-query' ) ).toBeNull();
		expect( result.current.query ).toBe( 'test-domain' );
	} );

	it( 'should clear sessionStorage and the query in state when resetQuery is called', () => {
		const { result } = renderHook( () => useQueryHandler( {} ) );

		act( () => {
			result.current.setQuery( 'test-domain' );
		} );

		act( () => {
			result.current.resetQuery();
		} );

		expect( sessionStorage.getItem( 'domain-search-query' ) ).toBeNull();
		expect( result.current.query ).toBeUndefined();
	} );

	it( 'should clear a stored query when clearSessionStorageQuery is called directly', () => {
		sessionStorage.setItem( 'domain-search-query', 'stored-domain' );

		clearSessionStorageQuery();

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

	describe( 'with persistQuery disabled', () => {
		it( 'should not seed the query from sessionStorage', () => {
			sessionStorage.setItem( 'domain-search-query', 'stored-domain' );
			const { result } = renderHook( () => useQueryHandler( { persistQuery: false } ) );
			expect( result.current.query ).toBeUndefined();
		} );

		it( 'should still seed the query from initialQuery', () => {
			sessionStorage.setItem( 'domain-search-query', 'stored-domain' );
			const { result } = renderHook( () =>
				useQueryHandler( { initialQuery: 'test-domain', persistQuery: false } )
			);
			expect( result.current.query ).toBe( 'test-domain' );
		} );

		it( 'should update the query without writing to sessionStorage when setQuery is called', () => {
			const { result } = renderHook( () => useQueryHandler( { persistQuery: false } ) );

			act( () => {
				result.current.setQuery( 'new-domain' );
			} );

			expect( result.current.query ).toBe( 'new-domain' );
			expect( sessionStorage.getItem( 'domain-search-query' ) ).toBeNull();
		} );
	} );
} );
