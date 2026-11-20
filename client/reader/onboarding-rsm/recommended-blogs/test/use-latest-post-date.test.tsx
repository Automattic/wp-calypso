/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { getLatestPostDate, useLatestPostDate } from '../use-latest-post-date';
import type { ReactNode } from 'react';

const API = 'https://public-api.wordpress.com';
const FEED_POSTS_PATH = '/rest/v1.2/read/feed/123/posts';
const SITE_POSTS_PATH = '/rest/v1.2/read/sites/456/posts';

const renderLatestPostDate = ( ...args: Parameters< typeof useLatestPostDate > ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	return renderHook( () => useLatestPostDate( ...args ), { wrapper } );
};

describe( 'getLatestPostDate', () => {
	it( 'returns the post date', () => {
		expect( getLatestPostDate( { ID: 1, date: '2026-11-18T10:00:00+00:00' } ) ).toEqual(
			new Date( '2026-11-18T10:00:00+00:00' )
		);
	} );

	it( 'returns null for a missing post or date', () => {
		expect( getLatestPostDate( null ) ).toBeNull();
		expect( getLatestPostDate( undefined ) ).toBeNull();
		expect( getLatestPostDate( { ID: 1 } ) ).toBeNull();
	} );

	it( 'returns null for a malformed date', () => {
		expect( getLatestPostDate( { ID: 1, date: 'not a date' } ) ).toBeNull();
	} );

	it( 'returns null for a date well in the future', () => {
		const nextWeek = new Date( Date.now() + 1000 * 60 * 60 * 24 * 7 ).toISOString();
		expect( getLatestPostDate( { ID: 1, date: nextWeek } ) ).toBeNull();
	} );
} );

describe( 'useLatestPostDate', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'returns the date of the feed’s newest post', async () => {
		nock( API )
			.get( FEED_POSTS_PATH )
			.query( { number: '1' } )
			.reply( 200, { posts: [ { ID: 9, feed_ID: 123, date: '2026-11-18T10:00:00+00:00' } ] } );

		const { result } = renderLatestPostDate( { feed_ID: 123, site_ID: 0 } );

		await waitFor( () =>
			expect( result.current ).toEqual( new Date( '2026-11-18T10:00:00+00:00' ) )
		);
	} );

	it( 'reads the site’s newest post when the blog has a site ID', async () => {
		const scope = nock( API )
			.get( SITE_POSTS_PATH )
			.query( { number: '1' } )
			.reply( 200, { posts: [ { ID: 7, site_ID: 456, date: '2026-11-17T08:00:00+00:00' } ] } );

		const { result } = renderLatestPostDate( { feed_ID: 123, site_ID: 456 } );

		await waitFor( () =>
			expect( result.current ).toEqual( new Date( '2026-11-17T08:00:00+00:00' ) )
		);
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'returns null when the feed has no posts', async () => {
		const scope = nock( API ).get( FEED_POSTS_PATH ).query( { number: '1' } ).reply( 200, {
			posts: [],
		} );

		const { result } = renderLatestPostDate( { feed_ID: 123, site_ID: 0 } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( result.current ).toBeNull();
	} );

	it( 'returns null when the lookup fails', async () => {
		const scope = nock( API ).get( FEED_POSTS_PATH ).query( { number: '1' } ).reply( 500, {
			error: 'server_error',
		} );

		const { result } = renderLatestPostDate( { feed_ID: 123, site_ID: 0 } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( result.current ).toBeNull();
	} );

	it( 'makes no request until enabled', () => {
		const scope = nock( API ).get( FEED_POSTS_PATH ).query( true ).reply( 200, { posts: [] } );

		const { result } = renderLatestPostDate( { feed_ID: 123, site_ID: 0 }, { enabled: false } );

		expect( result.current ).toBeNull();
		expect( scope.isDone() ).toBe( false );
	} );

	it( 'makes no request without a feed ID', () => {
		const { result } = renderLatestPostDate( { feed_ID: null, site_ID: null } );

		expect( result.current ).toBeNull();
	} );
} );
