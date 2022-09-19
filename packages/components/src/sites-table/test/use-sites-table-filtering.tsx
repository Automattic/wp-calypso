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
	visible = true,
	options = {
		is_redirect: false,
		unmapped_url: '',
	},
}: {
	ID?: number;
	name?: string;
	URL?: string;
	is_private?: boolean;
	is_coming_soon?: boolean;
	visible?: boolean;
	options?: {
		is_redirect?: boolean;
		unmapped_url?: string;
	};
} = {} ) {
	const slug = `site${ ID }.io`;

	return {
		name: name ?? `site ${ ID }`,
		URL: URL ?? `https://site${ ID }.io`,
		slug,
		title: name ?? slug,
		is_private,
		is_coming_soon,
		visible,
		options,
	};
}

const status = 'all';

describe( 'useSitesTableFiltering', () => {
	test( 'no sites to filter', () => {
		const { result } = renderHook( () => useSitesTableFiltering( [], { search: '', status } ) );
		expect( result.current.filteredSites ).toEqual( [] );
	} );

	test( 'empty search query returns the same list', () => {
		const sites = [ createMockSite(), createMockSite(), createMockSite() ];

		const { result } = renderHook( () => useSitesTableFiltering( sites, { search: '', status } ) );

		expect( result.current.filteredSites ).toEqual( sites );
	} );

	test( 'search by query matches site name', () => {
		const catSite = createMockSite( { name: 'cat' } );
		const dogSite = createMockSite( { name: 'dog' } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ catSite, dogSite ], { search: 'c', status } )
		);

		expect( result.current.filteredSites ).toEqual( [ catSite ] );
	} );

	test( 'search by query matches site URL', () => {
		const catSite = createMockSite( { URL: 'https://cat.io' } );
		const dogSite = createMockSite( { URL: 'https://dog.io' } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ catSite, dogSite ], { search: 'c', status } )
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

	test( 'does not return hidden sites by default', () => {
		const visible = createMockSite( { visible: true } );
		const hidden = createMockSite( { visible: false } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ visible, hidden ], { status } )
		);

		expect( result.current.filteredSites ).toEqual( [ visible ] );
	} );

	test( 'returns hidden sites when asked', () => {
		const visible = createMockSite( { visible: true } );
		const hidden = createMockSite( { visible: false } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ visible, hidden ], { status, showHidden: true } )
		);

		expect( result.current.filteredSites ).toEqual( [ visible, hidden ] );
	} );

	test( 'returns counts for each status type', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true, visible: false } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );
		const redirect1 = createMockSite( {
			options: { is_redirect: true, unmapped_url: 'http://redirect1.com' },
		} );
		const redirect2 = createMockSite( {
			options: { is_redirect: true, unmapped_url: 'http://redirect2.com' },
		} );

		const { result } = renderHook( () =>
			useSitesTableFiltering(
				[ public1, public2, private1, private2, comingSoon, redirect1, redirect2 ],
				{
					search: '',
					status,
				}
			)
		);

		expect( result.current.statuses ).toEqual( [
			{
				name: 'all',
				count: 6, // hidden site not included in count
				title: expect.any( String ),
				hiddenCount: 1,
			},
			{
				name: 'public',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'private',
				count: 1, // hidden site not included in count
				title: expect.any( String ),
				hiddenCount: 1,
			},
			{
				name: 'coming-soon',
				count: 1,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'redirect',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
		] );
	} );

	test( 'showHidden option includes hidden sites in `count`, but not `hiddenCount`', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false, visible: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true, visible: false } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );

		const { result } = renderHook( () =>
			useSitesTableFiltering( [ public1, public2, private1, private2, comingSoon ], {
				search: '',
				showHidden: true,
				status,
			} )
		);

		expect( result.current.statuses ).toEqual( [
			{
				name: 'all',
				count: 5,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'public',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'private',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'coming-soon',
				count: 1,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'redirect',
				count: 0,
				title: expect.any( String ),
				hiddenCount: 0,
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
