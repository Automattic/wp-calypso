/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { getLastSearchPage, getPluginsPage } from '../pagination';
import { getESPluginsQueryParams, useESPlugins, useESPluginsInfinite } from '../use-es-query';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );
jest.mock( 'calypso/state', () => ( { useSelector: () => 'en' } ) );

const response = ( slug, total = 50, pageHandle = false ) => ( {
	data: {
		results: [
			{
				fields: { slug, plugin: { title: `${ slug } &amp; tools`, rating: 4 } },
				railcar: { id: slug },
			},
		],
		total,
		page_handle: pageHandle,
	},
} );

function setup() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return {
		queryClient,
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	};
}

beforeEach( () => wpcom.req.get.mockReset() );

test.each( [
	undefined,
	'',
	'0',
	'-1',
	'2.5',
	'2abc',
	'1e2',
	' 2 ',
	'02',
	[ '2' ],
	0,
	NaN,
	Infinity,
	Number.MAX_SAFE_INTEGER + 1,
] )( 'defaults malformed page %p to 1', ( page ) => expect( getPluginsPage( page ) ).toBe( 1 ) );

test( 'accepts the last reachable page and defaults later pages to 1', () => {
	expect( getLastSearchPage() ).toBe( 11 );
	expect( getPluginsPage( '11', getLastSearchPage() ) ).toBe( 11 );
	expect( getPluginsPage( '12', getLastSearchPage() ) ).toBe( 1 );
} );

test.each( [
	[ 1, 0 ],
	[ 2, 20 ],
	[ 11, 200 ],
	[ 12, 0 ],
] )( 'page %i requests offset %i without a cursor', async ( page, offset ) => {
	wpcom.req.get.mockResolvedValue( response( 'plugin' ) );
	await getESPluginsQueryParams( { locale: 'en', category: 'popular', page }, 'en' ).queryFn();
	expect( wpcom.req.get ).toHaveBeenCalledWith(
		{ path: '/marketplace/search' },
		expect.objectContaining( {
			from: offset,
			size: 20,
			page_handle: undefined,
			group_id: 'wporg',
			sort: 'active_installs',
			track_total_hits: true,
		} )
	);
} );

test( 'preserves search encoding, author extraction and localized requests', async () => {
	wpcom.req.get.mockResolvedValue( response( 'plugin' ) );
	await getESPluginsQueryParams(
		{ locale: 'es', searchTerm: 'contact form developer:"Automattic"', page: 3 },
		'en'
	).queryFn();
	expect( wpcom.req.get ).toHaveBeenCalledWith(
		{ path: '/marketplace/search' },
		expect.objectContaining( {
			from: 40,
			lang: 'es_ES',
			query: 'contact%20form',
			group_id: 'marketplace',
			sort: 'score_default',
			filter: { bool: { must: [ { term: { 'plugin.author.raw': 'Automattic' } } ] } },
		} )
	);
} );

test( 'preserves category and curated slug filters', async () => {
	wpcom.req.get.mockResolvedValue( response( 'plugin' ) );
	await getESPluginsQueryParams( { locale: 'en', category: 'seo', page: 2 }, 'en' ).queryFn();
	expect( wpcom.req.get.mock.calls[ 0 ][ 1 ].filter.bool.should ).toContainEqual( {
		term: { 'taxonomy.plugin_category.slug': 'seo' },
	} );
	await getESPluginsQueryParams(
		{ locale: 'en', category: 'wpbeginner', slugs: [ 'a', 'b' ], page: 2 },
		'en'
	).queryFn();
	expect( wpcom.req.get.mock.calls[ 1 ][ 1 ].filter ).toEqual( {
		bool: { should: [ { terms: { slug: [ 'a', 'b' ] } } ] },
	} );
} );

test( 'keeps each page, locale and filter in its own cache entry', async () => {
	const { wrapper, queryClient } = setup();
	wpcom.req.get.mockImplementation( ( _, params ) =>
		Promise.resolve( response( `plugin-${ params.from }` ) )
	);
	const { result, rerender } = renderHook( ( options ) => useESPlugins( options ), {
		wrapper,
		initialProps: { locale: 'en', page: 1 },
	} );
	await waitFor( () => expect( result.current.data?.plugins[ 0 ].slug ).toBe( 'plugin-0' ) );
	expect( result.current.data.plugins[ 0 ].name ).toBe( 'plugin-0 & tools' );
	rerender( { locale: 'en', page: 2 } );
	expect( result.current.data ).toBeUndefined();
	await waitFor( () => expect( result.current.data?.plugins[ 0 ].slug ).toBe( 'plugin-20' ) );
	rerender( { locale: 'en', page: 1 } );
	expect( result.current.data.plugins[ 0 ].slug ).toBe( 'plugin-0' );
	expect( wpcom.req.get ).toHaveBeenCalledTimes( 2 );
	const base = { locale: 'en', page: 2 };
	for ( const filter of [
		{ locale: 'es' },
		{ category: 'seo' },
		{ searchTerm: 'form' },
		{ slugs: [ 'a' ] },
		{ tag: 'forms' },
		{ pageSize: 10 },
	] ) {
		expect( getESPluginsQueryParams( { ...base, ...filter }, 'en' ).queryKey ).not.toEqual(
			getESPluginsQueryParams( base, 'en' ).queryKey
		);
	}
	queryClient.clear();
} );

test( 'caps navigation at page 11 while retaining the full result count', async () => {
	const { wrapper, queryClient } = setup();
	wpcom.req.get.mockResolvedValue( response( 'last-page', 75000 ) );
	const { result } = renderHook( () => useESPlugins( { locale: 'en', page: 11 } ), { wrapper } );
	await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	expect( result.current.data.pagination ).toEqual( { page: 11, pages: 11, results: 75000 } );
	queryClient.clear();
} );

test( 'retries a failed page request', async () => {
	const { wrapper, queryClient } = setup();
	wpcom.req.get
		.mockRejectedValueOnce( new Error( 'unavailable' ) )
		.mockResolvedValueOnce( response( 'recovered' ) );
	const { result } = renderHook( () => useESPlugins( { locale: 'en', page: 2 } ), { wrapper } );
	await waitFor( () => expect( result.current.isError ).toBe( true ) );
	await act( () => result.current.refetch() );
	await waitFor( () => expect( result.current.data?.plugins[ 0 ].slug ).toBe( 'recovered' ) );
	queryClient.clear();
} );

test( 'keeps infinite requests cursor-based and appends their results', async () => {
	const { wrapper, queryClient } = setup();
	wpcom.req.get
		.mockResolvedValueOnce( response( 'first', 50, 'next-cursor' ) )
		.mockResolvedValueOnce( response( 'second' ) );
	const { result } = renderHook(
		() => useESPluginsInfinite( { locale: 'en', category: 'popular' } ),
		{ wrapper }
	);
	await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	expect( result.current.hasNextPage ).toBe( true );
	await act( () => result.current.fetchNextPage() );
	expect( wpcom.req.get.mock.calls.map( ( call ) => call[ 1 ].page_handle ) ).toEqual( [
		'1',
		'next-cursor',
	] );
	await waitFor( () =>
		expect( result.current.data.plugins.map( ( plugin ) => plugin.slug ) ).toEqual( [
			'first',
			'second',
		] )
	);
	expect( wpcom.req.get.mock.calls.map( ( call ) => call[ 1 ].page_handle ) ).toEqual( [
		'1',
		'next-cursor',
	] );
	expect( wpcom.req.get.mock.calls[ 0 ][ 1 ] ).not.toHaveProperty( 'from' );
	queryClient.clear();
} );
