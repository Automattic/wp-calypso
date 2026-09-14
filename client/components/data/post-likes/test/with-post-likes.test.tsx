/**
 * @jest-environment jsdom
 */
import { postLikesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Component } from 'react';
import { withPostLikeActions, withPostLikes } from '../with-post-likes';
import type { PostLiker, PostLikesResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( queryClient: QueryClient, children: ReactNode ) => (
	<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
);

class PostLikesView extends Component< {
	siteId?: number | string | null;
	postId?: number | string | null;
	postLikes: PostLikesResponse | null;
	likeCount: number;
	countLikes: number | null;
	iLike: boolean;
	liked: boolean;
	likes: PostLiker[] | null;
} > {
	render() {
		const { likeCount, iLike, likes } = this.props;

		return (
			<div>
				<span>count:{ likeCount }</span>
				<span>liked:{ String( iLike ) }</span>
				<span>likers:{ likes?.length ?? 0 }</span>
			</div>
		);
	}
}

class PostLikeActionsView extends Component< {
	siteId?: number;
	postId?: number;
	like: ( siteId: number, postId: number ) => void;
	unlike: ( siteId: number, postId: number ) => void;
	likePost: ( siteId: number, postId: number ) => void;
	unlikePost: ( siteId: number, postId: number ) => void;
	isLikePending: boolean;
	isUnlikePending: boolean;
} > {
	render() {
		return <button onClick={ () => this.props.unlike( 123, 456 ) }>Unlike</button>;
	}
}

describe( 'withPostLikes', () => {
	afterEach( () => nock.cleanAll() );

	it( 'injects post like data from React Query', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/likes' )
			.reply( 200, {
				found: 72,
				i_like: true,
				likes: [ { ID: 1, login: 'alice' } ],
			} );

		const queryClient = makeQueryClient();
		const View = withPostLikes( PostLikesView );

		render( makeWrapper( queryClient, <View siteId={ 123 } postId={ 456 } /> ) );

		await screen.findByText( 'count:72' );
		expect( screen.getByText( 'liked:true' ) ).toBeVisible();
		expect( screen.getByText( 'likers:1' ) ).toBeVisible();
	} );

	it( 'does not create NaN query keys for invalid string IDs', () => {
		const queryClient = makeQueryClient();
		const View = withPostLikes( PostLikesView );

		render( makeWrapper( queryClient, <View siteId="not-a-number" postId={ 456 } /> ) );

		const queryKeys = queryClient
			.getQueryCache()
			.getAll()
			.map( ( query ) => query.queryKey );

		expect( queryKeys ).toContainEqual( [ 'sites', null, 'posts', 456, 'likes' ] );
		expect(
			queryKeys.some( ( queryKey ) => Array.isArray( queryKey ) && queryKey.some( Number.isNaN ) )
		).toBe( false );
	} );
} );

describe( 'withPostLikeActions', () => {
	afterEach( () => nock.cleanAll() );

	it( 'injects optimistic unlike actions backed by React Query mutations', async () => {
		const unlikeScope = nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/mine/delete', {} )
			.reply( 200, {
				success: true,
				like_count: 72,
				liker: { ID: 1, login: 'alice' },
			} );

		const queryClient = makeQueryClient();
		queryClient.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const View = withPostLikeActions( PostLikeActionsView );

		render( makeWrapper( queryClient, <View siteId={ 123 } postId={ 456 } /> ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Unlike' } ) );

		await waitFor( () =>
			expect( queryClient.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toMatchObject( {
				found: 71,
				iLike: false,
				likes: [],
			} )
		);
		await waitFor( () => expect( unlikeScope.isDone() ).toBe( true ) );
	} );
} );
