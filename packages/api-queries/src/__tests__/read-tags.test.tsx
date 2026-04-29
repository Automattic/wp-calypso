import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	followReadTagMutation,
	readTagQuery,
	readTagsQuery,
	unfollowReadTagMutation,
} from '../read-tags';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'readTagsQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'normalizes the followed-tags response and annotates each tag with isFollowing', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags' )
			.query( true )
			.reply( 200, {
				tags: [
					{
						ID: '99',
						slug: 'photography',
						title: 'Photography',
						display_name: 'Photography',
						URL: '/tag/photography',
					},
					{
						ID: '12',
						slug: 'food',
						title: 'Food &amp; Drink',
						display_name: 'food',
						URL: '/tag/food',
						description: 'Tasty &amp; delicious',
					},
				],
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readTagsQuery() ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( [
			{
				id: '12',
				slug: 'food',
				title: 'Food & Drink',
				displayName: 'Food & Drink',
				url: '/tag/food',
				description: 'Tasty & delicious',
				isFollowing: true,
			},
			{
				id: '99',
				slug: 'photography',
				title: 'Photography',
				displayName: 'Photography',
				url: '/tag/photography',
				description: undefined,
				isFollowing: true,
			},
		] );
	} );

	it( 'lowercases the slug', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags' )
			.query( true )
			.reply( 200, {
				tags: [
					{
						ID: '1',
						slug: 'MixedCase',
						title: 'MixedCase',
						display_name: 'MixedCase',
						URL: '/tag/mixedcase',
					},
				],
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readTagsQuery() ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.[ 0 ].slug ).toBe( 'mixedcase' );
	} );
} );

describe( 'readTagQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'normalizes a single-tag response without setting isFollowing', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags/health' )
			.query( true )
			.reply( 200, {
				tag: {
					ID: '7',
					slug: 'health',
					title: 'Health',
					display_name: 'Health',
					URL: '/tag/health',
				},
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readTagQuery( 'health' ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( {
			id: '7',
			slug: 'health',
			title: 'Health',
			displayName: 'Health',
			url: '/tag/health',
			description: undefined,
		} );
		expect( result.current.data?.isFollowing ).toBeUndefined();
	} );

	it( 'is disabled when the slug is empty', () => {
		const client = newClient();
		const { result } = renderHook( () => useQuery( readTagQuery( '' ) ), {
			wrapper: makeWrapper( client ),
		} );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( result.current.data ).toBeUndefined();
	} );

	it( 'URL-encodes the slug exactly once when fetching', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/tags/%E6%97%A5%E6%9C%AC' )
			.query( true )
			.reply( 200, {
				tag: {
					ID: '1',
					slug: '日本',
					title: 'Japan',
					display_name: 'Japan',
					URL: '/tag/japan',
				},
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readTagQuery( '日本' ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'followReadTagMutation', () => {
	afterEach( () => nock.cleanAll() );

	function followStub( slug: string ) {
		return nock( BASE )
			.post( `/rest/v1.1/read/tags/${ encodeURIComponent( slug ) }/mine/new` )
			.reply( 200, { subscribed: true, added_tag: slug, tags: [] } );
	}

	const cases: Array< [ string, string, string ] > = [
		[ 'passes a clean slug through unchanged', 'health', 'health' ],
		[ 'lowercases and dashes a label', 'Food & Drink', 'food-&-drink' ],
		[ 'collapses repeated whitespace and dashes', 'foo   bar -- baz', 'foo-bar-baz' ],
		[ 'preserves non-ASCII characters', '日本', '日本' ],
	];

	it.each( cases )( 'follow %s', async ( _name, input, expectedSlug ) => {
		const scope = followStub( expectedSlug );

		const client = newClient();
		const { result } = renderHook( () => useMutation( followReadTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( input );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'treats already_subscribed as success', async () => {
		nock( BASE )
			.post( '/rest/v1.1/read/tags/health/mine/new' )
			.reply( 403, { error: 'already_subscribed', message: 'You are already subscribed' } );

		const client = newClient();
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useMutation( followReadTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await expect( result.current.mutateAsync( 'health' ) ).resolves.toEqual( {
			subscribed: true,
			added_tag: 'health',
			tags: [],
		} );
		expect( spy ).toHaveBeenCalledWith( {
			queryKey: [ 'read', 'tags', 'followed' ],
		} );
	} );
} );

describe( 'unfollowReadTagMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'slugifies the input before posting', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/tags/photography/mine/delete' )
			.reply( 200, { subscribed: false, removed_tag: '99' } );

		const client = newClient();
		const { result } = renderHook( () => useMutation( unfollowReadTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( 'Photography' );
		expect( scope.isDone() ).toBe( true );
	} );
} );
