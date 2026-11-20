import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { readSiteLatestPostQuery, readSiteLatestPostQueryKey, readSiteQuery } from '../read-site';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'readSiteQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches /read/sites/{siteId} on apiVersion 1.1 with the legacy field set', async () => {
		const interceptor = nock( BASE )
			.get( '/rest/v1.1/read/sites/123' )
			.query( ( query ) => {
				const fields = String( query.fields ?? '' ).split( ',' );
				const options = String( query.options ?? '' ).split( ',' );
				expect( fields ).toEqual(
					expect.arrayContaining( [
						'ID',
						'name',
						'title',
						'URL',
						'icon',
						'is_following',
						'is_jetpack',
						'description',
						'is_private',
						'feed_ID',
						'feed_URL',
						'capabilities',
						'prefer_feed',
						'subscribers_count',
						'options',
						'subscription',
						'is_blocked',
						'unseen_count',
					] )
				);
				expect( options ).toEqual(
					expect.arrayContaining( [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ] )
				);
				return true;
			} )
			.reply( 200, {
				ID: 123,
				URL: 'https://example.wordpress.com',
				name: '  Example Blog  ',
				description: 'Tasty &amp; delicious',
				is_following: true,
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readSiteQuery( 123 ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( interceptor.isDone() ).toBe( true );
	} );

	it( 'applies adaptReadSite via select: derives domain/slug/title and decodes description', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/sites/200' )
			.query( true )
			.reply( 200, {
				ID: 200,
				URL: 'https://example.wordpress.com/path',
				name: '  My Blog  ',
				description: 'Tasty &amp; delicious',
				is_following: true,
				subscription: { delivery_methods: { email: { send_posts: true } } },
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readSiteQuery( 200 ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toMatchObject( {
			ID: 200,
			URL: 'https://example.wordpress.com/path',
			domain: 'example.wordpress.com/path',
			slug: 'example.wordpress.com::path',
			title: 'My Blog',
			description: 'Tasty & delicious',
			is_following: true,
		} );
		// `subscription` is stripped by the select (consumed separately via the raw cache).
		expect( result.current.data?.subscription ).toBeUndefined();
	} );

	it( 'preserves the API title when the site has no name', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/201' ).query( true ).reply( 200, {
			ID: 201,
			URL: 'https://example.wordpress.com',
			title: 'API Site Title',
		} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readSiteQuery( 201 ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.title ).toBe( 'API Site Title' );
	} );

	it( 'derives wpcom_url for non-Jetpack sites with mapped domains', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/sites/300' )
			.query( true )
			.reply( 200, {
				ID: 300,
				URL: 'https://example.com',
				name: 'Example',
				is_jetpack: false,
				options: {
					is_mapped_domain: true,
					unmapped_url: 'https://example.wordpress.com',
				},
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readSiteQuery( 300 ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.wpcom_url ).toBe( 'example.wordpress.com' );
	} );

	it( 'rewrites slug/domain to the unmapped url when is_redirect is set', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/sites/400' )
			.query( true )
			.reply( 200, {
				ID: 400,
				URL: 'https://redirect.example.com',
				options: {
					is_redirect: true,
					unmapped_url: 'https://canonical.wordpress.com',
				},
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readSiteQuery( 400 ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.slug ).toBe( 'canonical.wordpress.com' );
		expect( result.current.data?.domain ).toBe( 'canonical.wordpress.com' );
	} );

	it( 'is disabled when siteId is undefined or invalid', () => {
		expect( readSiteQuery( undefined ).enabled ).toBe( false );
		expect( readSiteQuery( 0 ).enabled ).toBe( false );
		expect( readSiteQuery( -1 ).enabled ).toBe( false );
		expect( readSiteQuery( 'not-a-site' ).enabled ).toBe( false );
		expect( readSiteQuery( 'not-a-site' ).queryKey ).toEqual( [ 'read', 'sites', 'invalid' ] );
	} );

	it( 'accepts string siteIds and coerces them in the query key', () => {
		expect( readSiteQuery( '123' ).queryKey ).toEqual( [ 'read', 'sites', 123 ] );
		expect( readSiteQuery( 123 ).queryKey ).toEqual( [ 'read', 'sites', 123 ] );
	} );

	it( 'sets a 24h staleTime and disables retries after handled site errors', () => {
		const options = readSiteQuery( 1 );
		expect( options.staleTime ).toBe( 24 * 60 * 60 * 1000 );
		expect( options.retry ).toBe( false );
		expect( options.retryOnMount ).toBe( false );
	} );
} );

describe( 'readSiteLatestPostQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'uses its own key and memory-only options', () => {
		const options = readSiteLatestPostQuery( 123 );

		expect( readSiteLatestPostQueryKey( 123 ) ).toEqual( [ 'read', 'site-latest-post', 123 ] );
		expect( options.queryKey ).toEqual( readSiteLatestPostQueryKey( 123 ) );
		expect( options.enabled ).toBe( true );
		expect( options.meta ).toEqual( { persist: false } );
	} );

	it( 'is disabled for missing or invalid site ids', () => {
		expect( readSiteLatestPostQuery( null ).enabled ).toBe( false );
		expect( readSiteLatestPostQuery( undefined ).enabled ).toBe( false );
		expect( readSiteLatestPostQuery( 0 ).enabled ).toBe( false );
		expect( readSiteLatestPostQuery( 'abc' ).enabled ).toBe( false );
	} );

	it( 'fetches one post from the site stream', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/sites/123/posts' )
			.query( { number: '1' } )
			.reply( 200, { posts: [ { ID: 9, site_ID: 123, date: '2026-11-18T10:00:00+00:00' } ] } );
		const { result } = renderHook( () => useQuery( readSiteLatestPostQuery( 123 ) ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( {
			ID: 9,
			site_ID: 123,
			date: '2026-11-18T10:00:00+00:00',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'resolves to null for a site with no posts', async () => {
		nock( BASE ).get( '/rest/v1.2/read/sites/123/posts' ).query( { number: '1' } ).reply( 200, {
			posts: null,
		} );
		const { result } = renderHook( () => useQuery( readSiteLatestPostQuery( 123 ) ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toBeNull();
	} );
} );
