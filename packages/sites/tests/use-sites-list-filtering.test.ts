/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSitesListFiltering } from '../src';
import { createMockSite } from './create-mock-site';

describe( 'useSitesListFiltering', () => {
	test( 'no sites to filter', () => {
		const { result } = renderHook( () => useSitesListFiltering( [], { search: '' } ) );
		expect( result.current ).toEqual( [] );
	} );

	test( 'empty search query returns the same list', () => {
		const sites = [ createMockSite(), createMockSite(), createMockSite() ];

		const { result } = renderHook( () => useSitesListFiltering( sites, { search: '' } ) );

		expect( result.current ).toEqual( sites );
	} );

	test( 'search by query matches site name', () => {
		const catSite = createMockSite( { name: 'cat' } );
		const dogSite = createMockSite( { name: 'dog' } );

		const { result } = renderHook( () =>
			useSitesListFiltering( [ catSite, dogSite ], { search: 'c' } )
		);

		expect( result.current ).toEqual( [ catSite ] );
	} );

	test( 'search by query matches site URL', () => {
		const catSite = createMockSite( { URL: 'https://cat.io' } );
		const dogSite = createMockSite( { URL: 'https://dog.io' } );

		const { result } = renderHook( () =>
			useSitesListFiltering( [ catSite, dogSite ], { search: 'c' } )
		);

		expect( result.current ).toEqual( [ catSite ] );
	} );
} );
