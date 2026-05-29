/**
 * @jest-environment jsdom
 */
import { patchFollow, getFollowsQueryKey, type FollowsInfiniteData } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as selectors from '../use-follow-selectors';
import { useFollowForBlog, useFollowForFeed, useIsFollowing } from '../use-follow-selectors';
import { useFollows } from '../use-follows';
import type { FollowItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const makeData = (
	follows: FollowItem[] = [],
	totalCount = follows.length
): FollowsInfiniteData => ( {
	pages: [
		{
			follows,
			totalCount,
			page: 1,
			number: 200,
		},
	],
	pageParams: [ 1 ],
} );

const makeFollow = ( overrides: Partial< FollowItem > = {} ): FollowItem => ( {
	URL: 'https://example.com/feed/',
	feed_URL: 'https://example.com/feed/',
	blog_ID: 123,
	feed_ID: 456,
	is_following: true,
	...overrides,
} );

describe( 'follows hooks', () => {
	it( 'useFollows derives follows and count from the query cache', async () => {
		const queryClient = makeQueryClient();
		const follow = makeFollow();
		queryClient.setQueryData( getFollowsQueryKey(), makeData( [ follow ], 7 ) );

		const { result } = renderHook( () => useFollows(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.follows ).toEqual( [ follow ] );
		expect( result.current.count ).toBe( 7 );
	} );

	it( 'selector hooks react when a follow is patched into the query cache', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( getFollowsQueryKey(), makeData() );

		const { result } = renderHook(
			() => ( {
				isFollowing: useIsFollowing( {
					feedUrl: 'https://example.com/rss',
					feedId: '456',
					blogId: '123',
				} ),
				blogFollow: useFollowForBlog( '123' ),
				feedFollow: useFollowForFeed( '456' ),
			} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		await waitFor( () => expect( result.current.isFollowing ).toBe( false ) );
		expect( result.current.blogFollow ).toBeUndefined();
		expect( result.current.feedFollow ).toBeUndefined();

		act( () => {
			patchFollow( queryClient, {
				requestedFeedUrl: 'https://example.com/rss',
				follow: makeFollow(),
			} );
		} );

		await waitFor( () => expect( result.current.isFollowing ).toBe( true ) );
		expect( result.current.blogFollow ).toMatchObject( { blog_ID: 123 } );
		expect( result.current.feedFollow ).toMatchObject( { feed_ID: 456 } );
	} );

	it( 'does not export hook or function names containing Reader', () => {
		expect( Object.keys( selectors ).filter( ( name ) => /Reader/.test( name ) ) ).toEqual( [] );
	} );
} );
