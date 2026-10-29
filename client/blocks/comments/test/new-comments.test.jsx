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

let pollForNewComments;

jest.mock( 'calypso/lib/interval', () => ( {
	...jest.requireActual( 'calypso/lib/interval' ),
	Interval: ( { onTick } ) => {
		pollForNewComments = onTick;
		return null;
	},
} ) );

jest.mock( '../form-root', () => () => null );

jest.mock( '../post-comment', () => ( props ) => (
	<li id={ `comment-${ props.commentId }` } data-testid="post-comment">
		{ props.commentId }
	</li>
) );

const BASE = 'https://public-api.wordpress.com';

const post = {
	ID: 456,
	site_ID: 123,
	discussion: {
		comment_count: 2,
		comments_open: true,
	},
};

const makeComment = ( id, day, authorId = 10 ) => ( {
	ID: id,
	content: `Comment ${ id }`,
	date: `2026-05-0${ day }T00:00:00.000Z`,
	parent: false,
	author: { ID: authorId, name: `Author ${ id }` },
	status: 'approved',
} );

const mockComments = () => {
	nock( BASE )
		.get( '/rest/v1.1/sites/123/posts/456/replies' )
		.query( ( query ) => query.order === 'DESC' )
		.reply( 200, { comments: [ makeComment( 2, 2 ), makeComment( 1, 1 ) ], found: 2 } );
};

const mockNewComments = ( comments ) =>
	nock( BASE )
		.get( '/rest/v1.1/sites/123/posts/456/replies' )
		.query( ( query ) => !! query.after )
		.reply( 200, { comments, found: 2 + comments.length } );

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

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<PostComments post={ post } commentCount={ 2 } shouldPollForNewComments { ...props } />
			</Provider>
		</QueryClientProvider>
	);
};

const getRenderedCommentIds = () =>
	screen.getAllByTestId( 'post-comment' ).map( ( item ) => item.textContent );

describe( 'PostComments polling for new comments', () => {
	beforeAll( () => {
		nock.disableNetConnect();
		Element.prototype.scrollIntoView = jest.fn();
	} );

	beforeEach( () => {
		nock.cleanAll();
		pollForNewComments = undefined;
		jest.mocked( Element.prototype.scrollIntoView ).mockClear();
	} );

	it( 'inserts new comments right away by default', async () => {
		mockComments();
		const newComments = mockNewComments( [ makeComment( 3, 3 ) ] );

		renderComments();

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '2', '1' ] ) );

		await act( async () => {
			await pollForNewComments();
		} );

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '3', '2', '1' ] ) );
		expect( newComments.isDone() ).toBe( true );
		expect( screen.queryByRole( 'button', { name: /new update/ } ) ).not.toBeInTheDocument();
	} );

	it( 'holds new comments behind a pill when deferring them', async () => {
		mockComments();
		mockNewComments( [ makeComment( 4, 4 ), makeComment( 3, 3 ) ] );

		renderComments( { deferNewComments: true } );

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '2', '1' ] ) );

		await act( async () => {
			await pollForNewComments();
		} );

		expect( await screen.findByRole( 'button', { name: '2 new updates' } ) ).toBeVisible();
		expect( getRenderedCommentIds() ).toEqual( [ '2', '1' ] );
	} );

	it( 'uses the singular label for a single new comment', async () => {
		mockComments();
		mockNewComments( [ makeComment( 3, 3 ) ] );

		renderComments( { deferNewComments: true } );

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '2', '1' ] ) );

		await act( async () => {
			await pollForNewComments();
		} );

		expect( await screen.findByRole( 'button', { name: '1 new update' } ) ).toBeVisible();
	} );

	it( 'reveals the new comments and scrolls to the first one when the pill is clicked', async () => {
		const user = userEvent.setup();
		mockComments();
		mockNewComments( [ makeComment( 4, 4 ), makeComment( 3, 3 ) ] );

		renderComments( { deferNewComments: true } );

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '2', '1' ] ) );

		await act( async () => {
			await pollForNewComments();
		} );

		await user.click( await screen.findByRole( 'button', { name: '2 new updates' } ) );

		expect( getRenderedCommentIds() ).toEqual( [ '4', '3', '2', '1' ] );
		expect( screen.queryByRole( 'button', { name: /new update/ } ) ).not.toBeInTheDocument();
		expect( Element.prototype.scrollIntoView ).toHaveBeenCalledTimes( 1 );
		expect( jest.mocked( Element.prototype.scrollIntoView ).mock.contexts[ 0 ] ).toBe(
			document.getElementById( 'comment-4' )
		);
	} );

	it( 'shows comments from the current user right away when deferring', async () => {
		mockComments();
		mockNewComments( [ makeComment( 3, 3, 1 ) ] );

		renderComments( { deferNewComments: true } );

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '2', '1' ] ) );

		await act( async () => {
			await pollForNewComments();
		} );

		await waitFor( () => expect( getRenderedCommentIds() ).toEqual( [ '3', '2', '1' ] ) );
		expect( screen.queryByRole( 'button', { name: /new update/ } ) ).not.toBeInTheDocument();
	} );
} );
