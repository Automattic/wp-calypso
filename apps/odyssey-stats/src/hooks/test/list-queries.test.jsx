/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import useReferrersQuery from '../use-referrers-query';
import useTopPostsQuery from '../use-top-posts-query';

jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: jest.fn( () => Promise.resolve( { summary: { postviews: [], groups: [] } } ) ) },
} ) );

const SITE_ID = 123;

const wrapper = ( { children } ) => {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
};

/**
 * @param {Function} hook The query hook to render.
 */
async function requestFrom( hook ) {
	renderHook( () => hook( SITE_ID, '2025-11-01', '2026-10-05' ), { wrapper } );
	await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalled() );
	return wpcom.req.get.mock.calls[ 0 ];
}

describe( 'the widget list queries', () => {
	beforeEach( () => {
		wpcom.req.get.mockClear();
	} );

	it.each( [
		[ 'top posts', useTopPostsQuery, '/sites/123/stats/top-posts' ],
		[ 'referrers', useReferrersQuery, '/sites/123/stats/referrers' ],
	] )( 'asks %s for whole days between the range ends', async ( _, hook, path ) => {
		const [ requestedPath, params ] = await requestFrom( hook );

		expect( requestedPath ).toBe( path );
		expect( params ).toEqual(
			expect.objectContaining( {
				period: 'day',
				start_date: '2025-11-01',
				date: '2026-10-05',
				summarize: 1,
			} )
		);
		expect( params ).not.toHaveProperty( 'num' );
	} );
} );

describe( 'the referrers list', () => {
	/**
	 * @param {Array} groups The groups the API returns.
	 */
	async function rowsFor( groups ) {
		wpcom.req.get.mockResolvedValueOnce( { summary: { groups } } );
		const { result } = renderHook( () => useReferrersQuery( SITE_ID, '2026-09-06', '2026-10-05' ), {
			wrapper,
		} );
		await waitFor( () => expect( result.current.data ).toBeDefined() );
		return result.current.data;
	}

	beforeEach( () => {
		wpcom.req.get.mockClear();
	} );

	it( 'counts a group by its own total, not by its first child', async () => {
		const [ row ] = await rowsFor( [
			{
				name: 'X',
				total: 25,
				results: [
					{ name: 'x.com', views: 20, url: 'https://x.com/' },
					{ name: 'x.com/status', views: 5 },
				],
			},
		] );

		expect( row.title ).toBe( 'X' );
		expect( row.views ).toBe( 25 );
		expect( row.url ).toBe( 'https://x.com/' );
	} );

	it( 'adds the children up when a group states no total', async () => {
		const [ row ] = await rowsFor( [
			{
				name: 'Reddit',
				results: [
					{ name: 'reddit.com', views: 7 },
					{ name: 'old.reddit.com', views: 3 },
				],
			},
		] );

		expect( row.views ).toBe( 10 );
	} );

	it( 'reads a plain referrer from its own results', async () => {
		const [ row ] = await rowsFor( [
			{ name: 'Search Engines', url: 'https://wordpress.com/', results: { views: 12 } },
		] );

		expect( row.title ).toBe( 'Search Engines' );
		expect( row.views ).toBe( 12 );
	} );
} );
