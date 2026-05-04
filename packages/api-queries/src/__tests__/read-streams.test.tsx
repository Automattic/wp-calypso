import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { readStreamQuery } from '../read-streams';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'readStreamQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'builds a stable queryKey from streamKey and pageHandle', () => {
		const opts = readStreamQuery( 'following', { number: 4 }, null );
		expect( opts.queryKey ).toEqual( [ 'read', 'stream', 'following', null ] );
	} );

	it( 'includes the pageHandle in the queryKey', () => {
		const opts = readStreamQuery( 'following', { number: 7 }, { before: '2026-01-01' } );
		expect( opts.queryKey ).toEqual( [ 'read', 'stream', 'following', { before: '2026-01-01' } ] );
	} );

	it( 'fetches following posts from /read/following', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/following' )
			.query( true )
			.reply( 200, {
				posts: [ { ID: 1, site_ID: 100, date: '2026-01-01', URL: 'https://example.com/a' } ],
				date_range: { after: '2026-01-01' },
			} );

		const client = newClient();
		const { result } = renderHook(
			() =>
				useQuery(
					readStreamQuery(
						'following',
						{ orderBy: 'date', meta: 'post,discover_original_post', number: 4, content_width: 675 },
						null
					)
				),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.posts ).toHaveLength( 1 );
		expect( result.current.data?.date_range?.after ).toBe( '2026-01-01' );
	} );

	it( 'fetches conversations posts from /read/conversations', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/conversations' )
			.query( ( query ) => query.comments_per_post === '20' )
			.reply( 200, {
				posts: [
					{
						ID: 1,
						site_ID: 100,
						last_comment_date_gmt: '2026-04-30',
						URL: 'https://example.com/a',
					},
				],
				date_range: { after: '2026-04-30' },
			} );

		const client = newClient();
		const { result } = renderHook(
			() =>
				useQuery( readStreamQuery( 'conversations', { number: 4, comments_per_post: 20 }, null ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.posts ).toHaveLength( 1 );
	} );

	it( 'fetches conversations-a8c posts with the a8c index filter', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/conversations' )
			.query( ( query ) => query.index === 'a8c' && query.comments_per_post === '20' )
			.reply( 200, { posts: [], date_range: { after: null } } );

		const client = newClient();
		const { result } = renderHook(
			() =>
				useQuery(
					readStreamQuery(
						'conversations-a8c',
						{ number: 4, comments_per_post: 20, index: 'a8c' },
						null
					)
				),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'fetches liked posts from /read/liked', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/liked' )
			.query( true )
			.reply( 200, {
				posts: [
					{
						ID: 30,
						site_ID: 300,
						date: '2026-01-01',
						date_liked: '2026-04-10',
						URL: 'https://example.com/liked',
					},
				],
				date_range: { after: '2026-04-10' },
			} );

		const client = newClient();
		const { result } = renderHook(
			() =>
				useQuery(
					readStreamQuery(
						'likes',
						{ orderBy: 'date', meta: 'post,discover_original_post', number: 4, content_width: 675 },
						null
					)
				),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.posts ).toHaveLength( 1 );
		expect( result.current.data?.posts?.[ 0 ].date_liked ).toBe( '2026-04-10' );
	} );

	it( 'throws when called for an unmigrated streamType', () => {
		// `recommendations_posts` is still served by the legacy data-layer
		// (custom `seed` + `algorithm` query shape); update this case when it
		// lands in `readStreamQuery`.
		const opts = readStreamQuery( 'recommendations_posts', { number: 4 }, null );
		expect( () => opts.queryFn!( {} as never ) ).toThrow(
			/unsupported streamType "recommendations_posts"/
		);
	} );
} );
