/**
 * @jest-environment jsdom
 */
import { siteCommentsInfiniteQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { useComments } from 'calypso/reader/data/comments';
import { READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN } from 'calypso/state/reader-ui/action-types';
import CommentLikeButtonContainer from '../comment-likes';

jest.mock( 'calypso/reader/components/icons/like-icon', () => () => <span /> );

const BASE = 'https://public-api.wordpress.com';

const makeQueryClient = () =>
	new QueryClient( { defaultOptions: { queries: { retry: false, staleTime: Infinity } } } );

const renderWithRedux = ( element, { state, onAction = () => {}, queryClient } = {} ) => {
	const client = queryClient ?? makeQueryClient();
	const reducer = (
		currentState = state ?? {
			currentUser: { id: 1 },
			comments: { items: { '100-1': [] } },
			reader: { follows: { items: {}, itemsCount: 0 } },
		},
		action
	) => {
		onAction( action );
		return currentState;
	};
	const store = createStore( reducer, applyMiddleware( thunkMiddleware ) );

	return render(
		<QueryClientProvider client={ client }>
			<Provider store={ store }>{ element }</Provider>
		</QueryClientProvider>
	);
};

const CommentsBackedLikeButton = () => {
	const { comments } = useComments( { siteId: 100, postId: 1 } );
	const comment = comments.find( ( item ) => item.ID === 5 );

	if ( ! comment ) {
		return null;
	}

	return (
		<CommentLikeButtonContainer
			siteId={ 100 }
			postId={ 1 }
			commentId={ 5 }
			comment={ comment }
			tagName="button"
			onLikeToggle={ jest.fn() }
		/>
	);
};

describe( 'CommentLikeButtonContainer', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'renders like data from the comment prop', () => {
		renderWithRedux(
			<CommentLikeButtonContainer
				siteId={ 100 }
				postId={ 1 }
				commentId={ 5 }
				comment={ { ID: 5, i_like: true, like_count: 7 } }
				tagName="button"
				onLikeToggle={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Liked' } ) ).toHaveClass( 'is-liked' );
		expect( screen.getByText( '7' ) ).toBeVisible();
	} );

	it( 'accepts string comment ids', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		renderWithRedux(
			<CommentLikeButtonContainer
				siteId={ 100 }
				postId={ 1 }
				commentId="placeholder-5"
				comment={ { ID: 'placeholder-5', i_like: false, like_count: 0 } }
				tagName="button"
				onLikeToggle={ jest.fn() }
			/>
		);

		expect( consoleError ).not.toHaveBeenCalled();
		consoleError.mockRestore();
	} );

	it( 'does not persist unsupported comment unlike actions for logged-out users', async () => {
		const actions = [];

		renderWithRedux(
			<CommentLikeButtonContainer
				siteId={ 100 }
				postId={ 1 }
				commentId={ 5 }
				comment={ { ID: 5, i_like: true, like_count: 7 } }
				tagName="button"
				onLikeToggle={ jest.fn() }
			/>,
			{
				state: {
					currentUser: { id: null },
					comments: { items: { '100-1': [] } },
				},
				onAction: ( action ) => actions.push( action ),
			}
		);

		screen.getByRole( 'button', { name: 'Liked' } ).click();

		expect( actions ).not.toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					type: READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
					lastAction: expect.objectContaining( { type: 'comment-unlike' } ),
				} ),
			] )
		);
	} );

	it( 'optimistically updates the button state and like count while liking a cached comment', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( siteCommentsInfiniteQuery( { siteId: 100, postId: 1 } ).queryKey, {
			pages: [
				{
					comments: [
						{
							ID: 5,
							content: 'Hello',
							date: '2026-05-01T00:00:00.000Z',
							i_like: false,
							like_count: 7,
							parent: false,
							status: 'approved',
						},
					],
					found: 1,
				},
			],
			pageParams: [ undefined ],
		} );
		const likeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/comments/5/likes/new', {} )
			.delay( 1000 )
			.reply( 200, {
				success: true,
				like_count: '8',
			} );

		renderWithRedux( <CommentsBackedLikeButton />, { queryClient } );

		screen.getByRole( 'button', { name: 'Like' } ).click();

		await waitFor(
			() => {
				expect( screen.getByRole( 'button', { name: 'Liked' } ) ).toHaveClass( 'is-liked' );
				expect( screen.getByText( '8' ) ).toBeVisible();
			},
			{ timeout: 50 }
		);

		await waitFor( () => expect( likeScope.isDone() ).toBe( true ) );
	} );

	it( 'renders like data from the fetched comments list after a page load', async () => {
		const commentsScope = nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 5,
						content: 'Hello',
						date: '2026-05-01T00:00:00.000Z',
						i_like: true,
						like_count: 7,
						parent: false,
						status: 'approved',
					},
				],
				found: 1,
			} );

		renderWithRedux( <CommentsBackedLikeButton /> );

		expect( await screen.findByRole( 'button', { name: 'Liked' } ) ).toHaveClass( 'is-liked' );
		expect( screen.getByText( '7' ) ).toBeVisible();
		expect( commentsScope.isDone() ).toBe( true );
	} );

	it( 'rolls back an optimistic comment like when the request fails', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( siteCommentsInfiniteQuery( { siteId: 100, postId: 1 } ).queryKey, {
			pages: [
				{
					comments: [
						{
							ID: 5,
							content: 'Hello',
							date: '2026-05-01T00:00:00.000Z',
							i_like: false,
							like_count: 7,
							parent: false,
							status: 'approved',
						},
					],
					found: 1,
				},
			],
			pageParams: [ undefined ],
		} );
		const likeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/comments/5/likes/new', {} )
			.delay( 100 )
			.reply( 500, { error: 'oops' } );

		renderWithRedux( <CommentsBackedLikeButton />, { queryClient } );

		screen.getByRole( 'button', { name: 'Like' } ).click();

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Liked' } ) ).toHaveClass( 'is-liked' );
			expect( screen.getByText( '8' ) ).toBeVisible();
		} );
		await waitFor( () => expect( likeScope.isDone() ).toBe( true ) );
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Like' } ) ).not.toHaveClass( 'is-liked' );
			expect( screen.getByText( '7' ) ).toBeVisible();
		} );
	} );
} );
