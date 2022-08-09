/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import { useSitesTableFiltering } from '../use-sites-table-filtering';

function createMockSite( {
	ID = Math.round( Math.random() * 1000 ),
	name,
	URL,
	is_private = false,
	is_coming_soon = false,
}: {
	ID?: number;
	name?: string;
	URL?: string;
	is_private?: boolean;
	is_coming_soon?: boolean;
} = {} ): Parameters< typeof useSitesTableFiltering >[ 0 ][ number ] {
	return {
		ID,
		name: name ?? `site ${ ID }`,
		URL: URL ?? `https://site${ ID }.io`,
		slug: `site${ ID }.io`,
		is_private,
		is_coming_soon,
		plan: {
			product_id: 1,
			product_slug: 'product_slug',
			product_name_short: 'product_name_short',
			expired: false,
			user_is_owner: true,
			is_free: true,
		},
	};
}

describe( 'useSitesTableFiltering', () => {
	test( 'no sites to filter', () => {
		const { result } = renderHook( () => useSitesTableFiltering( [], { search: '' } ) );
		expect( result.current.filteredSites ).toEqual( [] );
	} );

	test( 'empty search query returns the same list', () => {
		const sites = [ createMockSite(), createMockSite(), createMockSite() ];

		const { result } = renderHook( () => useSitesTableFiltering( sites, { search: '' } ) );

		expect( result.current.filteredSites ).toEqual( sites );
	} );

	test( 'search by query matches site name', () => {
		const catSite = createMockSite( { name: 'cat' } );
		const dogSite = createMockSite( { name: 'dog' } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ catSite, dogSite ], { search: 'c' } )
		);

		expect( result.current.filteredSites ).toEqual( [ catSite ] );
	} );

	test( 'search by query matches site URL', () => {
		const catSite = createMockSite( { URL: 'https://cat.io' } );
		const dogSite = createMockSite( { URL: 'https://dog.io' } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ catSite, dogSite ], { search: 'c' } )
		);

		expect( result.current.filteredSites ).toEqual( [ catSite ] );
	} );

	test( 'filter by "private"', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ public1, public2, private1, private2, comingSoon ], {
				status: 'private',
			} )
		);

		expect( result.current.filteredSites ).toEqual( [ private1, private2 ] );
	} );

	test( 'returns counts for each status type', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ public1, public2, private1, private2, comingSoon ], {
				search: '',
			} )
		);

		expect( result.current.statuses ).toEqual( [
			{
				name: 'all',
				count: 5,
				title: expect.any( String ),
			},
			{
				name: 'launched',
				count: 2,
				title: expect.any( String ),
			},
			{
				name: 'private',
				count: 2,
				title: expect.any( String ),
			},
			{
				name: 'coming-soon',
				count: 1,
				title: expect.any( String ),
			},
		] );
	} );

	test( 'filtering maintains object equality', () => {
		// Object equality is important for memoizing the site table row

		const mockSite = createMockSite( { name: 'site title 1' } );

		const { result, rerender } = renderHook(
			( { search } ) => useSitesTableFiltering( [ mockSite ], { search, status: 'all' } ),
			{ initialProps: { search: 'titl' } }
		);

		expect( result.current.filteredSites ).toHaveLength( 1 );
		expect( result.current.filteredSites[ 0 ] ).toBe( mockSite );

		rerender( { search: 'does not match' } );

		expect( result.current.filteredSites ).toHaveLength( 0 );

		rerender( { search: 'title' } );

		expect( result.current.filteredSites ).toHaveLength( 1 );
		expect( result.current.filteredSites[ 0 ] ).toBe( mockSite );
	} );
} );
