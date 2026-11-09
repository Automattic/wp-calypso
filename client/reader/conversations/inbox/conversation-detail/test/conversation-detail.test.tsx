/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/state/notices/actions', () => {
	const actual = jest.requireActual( 'calypso/state/notices/actions' );
	return {
		...actual,
		errorNotice: jest.fn( actual.errorNotice ),
		successNotice: jest.fn( actual.successNotice ),
	};
} );
jest.mock( 'calypso/reader/data/post', () => ( {
	usePost: jest.fn(),
} ) );

jest.mock( 'calypso/blocks/comments', () => ( {
	__esModule: true,
	default: jest.fn( ( props ) => (
		<div
			role="feed"
			aria-label={ `${ props.commentCount } comments, starting at ${ props.startingCommentId }` }
		/>
	) ),
} ) );

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { adaptReadConversation } from 'calypso/reader/data/conversations';
import { usePost } from 'calypso/reader/data/post';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import preferences from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationDetail } from '..';
import { makeConversation } from '../../test/helpers';

const mockedUsePost = jest.mocked( usePost );

const conversation = adaptReadConversation(
	makeConversation( { blogId: 10, postId: 100, title: 'A post title' } )
);

const post = {
	ID: 100,
	site_ID: 10,
	site_name: 'Ana’s blog',
	site_icon: { img: 'https://example.com/icon.png' },
	author: { name: 'Ana' },
	date: '2024-01-01T00:00:00Z',
	title: 'A post title',
	excerpt_no_html: 'A post excerpt',
	better_excerpt_no_html: 'A better post excerpt',
	discussion: { comment_count: 3 },
};

const CURRENT_USER_ID = 42;

const renderDetail = ( props: Partial< React.ComponentProps< typeof ConversationDetail > > = {} ) =>
	renderWithProvider(
		<ConversationDetail siteId={ 10 } postId={ 100 } conversation={ conversation } { ...props } />,
		{ reducers: { preferences }, initialState: { currentUser: { id: CURRENT_USER_ID } } }
	);

beforeEach( () => {
	mockedUsePost.mockReset();
	jest.mocked( errorNotice ).mockClear();
	jest.mocked( successNotice ).mockClear();
} );

describe( 'ConversationDetail', () => {
	it( 'shows a spinner while the post is loading', () => {
		mockedUsePost.mockReturnValue( { data: undefined, isLoading: true } as never );

		const { container } = renderDetail();

		expect( container.querySelector( '.components-spinner' ) ).toBeVisible();
	} );

	it( 'shows the post card once the post has loaded', () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );

		const { container } = renderDetail();

		expect( container.querySelector( '.components-spinner' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'A post title' } ) ).toBeVisible();
		expect( screen.getByText( 'Ana’s blog' ) ).toBeVisible();
		expect( screen.getByText( 'Ana' ) ).toBeVisible();
		expect( screen.getByText( 'A better post excerpt' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /A post title/ } ) ).toHaveAttribute(
			'href',
			'/reader/blogs/10/posts/100'
		);
	} );

	it( 'links the post author to their Reader profile', () => {
		mockedUsePost.mockReturnValue( {
			data: { ...post, author: { name: 'Ana', wpcom_login: 'ana' } },
			isLoading: false,
		} as never );

		renderDetail();

		expect( screen.getByRole( 'link', { name: 'Ana' } ) ).toHaveAttribute(
			'href',
			'/reader/users/ana'
		);
	} );

	it( 'renders the comment thread with the starting comment and count from the post', () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );

		renderDetail();

		expect(
			screen.getByRole( 'feed', {
				name: `3 comments, starting at ${ conversation.latestCommentId }`,
			} )
		).toBeVisible();
	} );

	it( 'shows nothing in place of the post when it fails to load', () => {
		mockedUsePost.mockReturnValue( {
			data: { ...post, is_error: true },
			isLoading: false,
		} as never );

		const { container } = renderDetail();

		expect( container.querySelector( '.components-spinner' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'A post title' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'feed' ) ).not.toBeInTheDocument();
	} );

	it( 'disables the previous and next buttons when there is nowhere to go', () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );

		renderDetail();

		expect( screen.getByRole( 'button', { name: 'Previous conversation' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Next conversation' } ) ).toBeDisabled();
	} );

	it( 'calls onPrevious and onNext when their buttons are enabled and clicked', async () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );
		const onPrevious = jest.fn();
		const onNext = jest.fn();
		const user = userEvent.setup();

		renderDetail( { onPrevious, onNext } );

		const previousButton = screen.getByRole( 'button', { name: 'Previous conversation' } );
		const nextButton = screen.getByRole( 'button', { name: 'Next conversation' } );
		expect( previousButton ).toBeEnabled();
		expect( nextButton ).toBeEnabled();

		await user.click( previousButton );
		await user.click( nextButton );

		expect( onPrevious ).toHaveBeenCalledTimes( 1 );
		expect( onNext ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'starts the thread at the given comment instead of the latest one', () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );

		renderDetail( { startingCommentId: 77 } );

		expect( screen.getByRole( 'feed', { name: '3 comments, starting at 77' } ) ).toBeVisible();
	} );

	it.each( [
		[ 'reply', 'Replied to you' ],
		[ 'mention', 'You were mentioned' ],
		[ 'own_post', 'Your post' ],
		[ 'commented', 'You commented' ],
		[ 'following', 'You follow this' ],
	] as const )( 'titles the header for the “%s” reason “%s”', ( reason, title ) => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );

		renderDetail( { conversation: { ...conversation, reason } } );

		expect( screen.getByRole( 'heading', { level: 2, name: title } ) ).toBeVisible();
	} );

	it( 'titles the header from the post author when the conversation isn’t loaded', () => {
		mockedUsePost.mockReturnValue( {
			data: { ...post, author: { ID: CURRENT_USER_ID } },
			isLoading: false,
		} as never );

		renderDetail( { conversation: undefined } );

		expect( screen.getByRole( 'heading', { level: 2, name: 'Your post' } ) ).toBeVisible();
	} );

	it( 'offers to follow a conversation the user doesn’t follow', async () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );
		const user = userEvent.setup();

		renderDetail();
		await user.click( screen.getByRole( 'button', { name: 'Post actions' } ) );

		expect( screen.getByRole( 'menuitem', { name: 'Follow conversation' } ) ).toBeInTheDocument();
	} );

	it( 'unfollows a conversation the user follows', async () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/read/sites/10/posts/100/unfollow' )
			.reply( 200, { success: true } );

		renderDetail( { conversation: { ...conversation, isFollowing: true } } );
		await user.click( screen.getByRole( 'button', { name: 'Post actions' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Unfollow conversation' } ) );

		await waitFor( () =>
			expect( successNotice ).toHaveBeenCalledWith(
				'The conversation has been successfully unfollowed.',
				expect.anything()
			)
		);
	} );

	it( 'shows an error when the unfollow does not go through', async () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/read/sites/10/posts/100/unfollow' )
			.reply( 200, { success: false } );

		renderDetail( { conversation: { ...conversation, isFollowing: true } } );
		await user.click( screen.getByRole( 'button', { name: 'Post actions' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Unfollow conversation' } ) );

		await waitFor( () =>
			expect( errorNotice ).toHaveBeenCalledWith(
				'Sorry, we had a problem unfollowing that conversation. Please try again.'
			)
		);
		expect( successNotice ).not.toHaveBeenCalled();
	} );

	it( 'doesn’t offer to follow a conversation the user follows', async () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );
		const user = userEvent.setup();

		renderDetail( { conversation: { ...conversation, isFollowing: true } } );
		await user.click( screen.getByRole( 'button', { name: 'Post actions' } ) );

		expect(
			screen.queryByRole( 'menuitem', { name: 'Follow conversation' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Mute conversation' } ) ).toBeInTheDocument();
	} );
} );
