/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PostComments from '..';

jest.mock( '../form-root', () => () => <textarea aria-label="Add a comment" /> );

jest.mock( '../post-comment', () => ( props ) => (
	<li data-testid="post-comment">{ props.commentId }</li>
) );

const BASE = 'https://public-api.wordpress.com';

const loadingPlaceholder = <p>Loading comments</p>;

const post = {
	ID: 456,
	site_ID: 123,
	discussion: {
		comment_count: 2,
		comments_open: true,
	},
};

const renderComments = ( props = {} ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore(
		(
			state = {
				currentUser: {
					id: 1,
					capabilities: { 123: {} },
				},
			}
		) => state
	);

	const renderElement = ( nextProps = props ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<PostComments post={ post } commentCount={ 2 } { ...nextProps } />
			</Provider>
		</QueryClientProvider>
	);

	const result = render( renderElement() );

	return {
		...result,
		rerenderComments: ( nextProps ) => result.rerender( renderElement( nextProps ) ),
	};
};

describe( 'PostComments', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'shows the loading placeholder until the first comments page resolves', async () => {
		let releaseResponse;
		const responseReady = new Promise( ( resolve ) => {
			releaseResponse = resolve;
		} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, async () => {
				await responseReady;
				return {
					comments: [
						{
							ID: 2,
							content: 'Second',
							date: '2026-05-02T00:00:00.000Z',
							parent: false,
							author: { ID: 10, name: 'Second Author' },
							status: 'approved',
						},
						{
							ID: 1,
							content: 'First',
							date: '2026-05-01T00:00:00.000Z',
							parent: false,
							author: { ID: 10, name: 'First Author' },
							status: 'approved',
						},
					],
					found: 2,
				};
			} );

		renderComments( { loadingPlaceholder } );

		try {
			expect( screen.getByText( 'Loading comments' ) ).toBeVisible();
			expect( screen.queryByText( 'No comments' ) ).not.toBeInTheDocument();
			expect( screen.queryAllByTestId( 'post-comment' ) ).toHaveLength( 0 );
			expect( screen.queryByRole( 'textbox', { name: 'Add a comment' } ) ).not.toBeInTheDocument();

			releaseResponse();

			const comments = await screen.findAllByTestId( 'post-comment' );
			expect( comments.map( ( comment ) => comment.textContent ) ).toEqual( [ '2', '1' ] );
			comments.forEach( ( comment ) => expect( comment ).toBeVisible() );
			expect( screen.queryByText( 'Loading comments' ) ).not.toBeInTheDocument();
			expect( screen.getByText( '2 comments' ) ).toBeVisible();
			expect( screen.getByRole( 'textbox', { name: 'Add a comment' } ) ).toBeVisible();
		} finally {
			releaseResponse();
		}
	} );

	it( 'clears the placeholder after an error without repeatedly remounting the comments list', async () => {
		let notifyRetryStarted;
		const retryStarted = new Promise( ( resolve ) => {
			notifyRetryStarted = resolve;
		} );
		let releaseRetry;
		const retryResponse = new Promise( ( resolve ) => {
			releaseRetry = resolve;
		} );
		const onRequest = jest.fn();
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( true )
			.reply( 500, { error: 'server_error', message: 'Failed to load comments' } )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( true )
			.reply( 500, async () => {
				notifyRetryStarted();
				await retryResponse;
				return { error: 'server_error', message: 'Failed to load comments' };
			} )
			.on( 'request', onRequest );

		renderComments( { startingCommentId: 2, loadingPlaceholder } );

		try {
			await act( async () => {
				await retryStarted;
			} );

			expect( screen.queryByText( 'Loading comments' ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'textbox', { name: 'Add a comment' } ) ).toBeVisible();

			await act( async () => {
				releaseRetry();
			} );

			await waitFor( () => expect( screen.getByText( 'No comments' ) ).toBeVisible() );
			expect( screen.queryByText( 'Loading comments' ) ).not.toBeInTheDocument();
			expect( onRequest ).toHaveBeenCalledTimes( 2 );
		} finally {
			releaseRetry();
		}
	} );

	it( 'renders comments from React Query without requiring Redux comment state', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
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
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );

		renderComments();

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '2', '1' ]
			);
		} );
	} );

	it( 'fetches and renders a starting comment that is outside the initial comments page', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
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
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				ID: 789,
				content: 'Deep linked',
				date: '2026-05-03T00:00:00.000Z',
				parent: false,
				post: { ID: 456 },
				author: { ID: 10, name: 'Deep Author' },
				status: 'approved',
			} );

		renderComments( { startingCommentId: 789 } );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				expect.arrayContaining( [ '789' ] )
			);
		} );
	} );

	it( 'does not paginate while waiting for a starting comment outside the initial comments page', async () => {
		const initialComments = Array.from( { length: 50 }, ( _, index ) => ( {
			ID: index + 1,
			content: `Comment ${ index + 1 }`,
			date: new Date( Date.UTC( 2026, 4, index + 1 ) ).toISOString(),
			parent: false,
			author: { ID: 10, name: `Author ${ index + 1 }` },
			status: 'approved',
		} ) );
		const earlierCommentsRequest = nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				before: '2026-05-01T00:00:00.000Z',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 51,
						content: 'Earlier',
						date: '2026-04-30T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Earlier Author' },
						status: 'approved',
					},
				],
				found: 51,
			} );

		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: initialComments,
				found: 51,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.delay( 100 )
			.reply( 200, {
				ID: 789,
				content: 'Deep linked',
				date: '2026-05-03T00:00:00.000Z',
				parent: false,
				post: { ID: 456 },
				author: { ID: 10, name: 'Deep Author' },
				status: 'approved',
			} );

		renderComments( { startingCommentId: 789 } );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ) ).toHaveLength( 50 );
		} );

		expect( earlierCommentsRequest.isDone() ).toBe( false );
	} );

	it( 'renders a starting reply when its parent is not in the loaded comments page', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
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
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/789' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				ID: 789,
				content: 'Deep linked reply',
				date: '2026-05-03T00:00:00.000Z',
				parent: { ID: 999 },
				post: { ID: 456 },
				author: { ID: 10, name: 'Deep Author' },
				status: 'approved',
			} );

		renderComments( { startingCommentId: 789 } );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				expect.arrayContaining( [ '789' ] )
			);
		} );
	} );

	it( 'does not fetch the starting comment separately when it is already in the comments page', async () => {
		const startingCommentRequest = nock( BASE )
			.get( '/rest/v1.1/sites/123/comments/2' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				ID: 2,
				content: 'Second',
				date: '2026-05-02T00:00:00.000Z',
				parent: false,
				post: { ID: 456 },
				author: { ID: 10, name: 'Second Author' },
				status: 'approved',
			} );

		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
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
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );

		renderComments( { startingCommentId: 2 } );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '2', '1' ]
			);
		} );

		expect( startingCommentRequest.isDone() ).toBe( false );
	} );

	it( 'resets inline expansion when the post changes', async () => {
		const nextPost = {
			...post,
			ID: 457,
		};
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
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
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/457/replies' )
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
						ID: 11,
						content: 'Next second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Next Second Author' },
						status: 'approved',
					},
					{
						ID: 10,
						content: 'Next first',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Next First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );

		const { rerenderComments } = renderComments( {
			expandableView: true,
			showCommentCount: false,
		} );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '2' ]
			);
		} );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show more comments' } ) );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '2', '1' ]
			);
		} );

		rerenderComments( {
			post: nextPost,
			expandableView: true,
			showCommentCount: false,
		} );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '11' ]
			);
		} );
	} );

	it( 'does not render comments while the post identity is missing', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
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
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );

		const { rerenderComments } = renderComments( {
			expandableView: true,
			showCommentCount: false,
		} );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '2' ]
			);
		} );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show more comments' } ) );

		await waitFor( () => {
			expect( screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent ) ).toEqual(
				[ '2', '1' ]
			);
		} );

		rerenderComments( {
			post: {
				discussion: post.discussion,
			},
			expandableView: true,
			showCommentCount: false,
		} );

		expect( screen.queryAllByTestId( 'post-comment' ) ).toEqual( [] );
		expect( consoleErrorSpy ).not.toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	} );
} );
