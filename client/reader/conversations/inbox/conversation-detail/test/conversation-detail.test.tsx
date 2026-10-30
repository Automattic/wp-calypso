/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/reader/data/post', () => ( {
	usePost: jest.fn(),
} ) );

jest.mock( 'calypso/reader/data/comments', () => ( {
	useComments: jest.fn(),
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
import { useComments } from 'calypso/reader/data/comments';
import { usePost } from 'calypso/reader/data/post';
import preferences from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationDetail } from '..';
import { groupNotesByPost } from '../../group-notes';
import { makeNote } from '../../test/helpers';

const mockedUsePost = jest.mocked( usePost );
const mockedUseComments = jest.mocked( useComments );

const [ conversation ] = groupNotesByPost( [
	makeNote( { id: 1, siteId: 10, postId: 100, title: 'A post title', commenter: 'Ana' } ),
] );

const post = {
	ID: 100,
	site_ID: 10,
	site_name: 'Ana’s blog',
	site_icon: { img: 'https://example.com/icon.png' },
	author: { ID: 7, name: 'Ana' },
	date: '2024-01-01T00:00:00Z',
	title: 'A post title',
	excerpt_no_html: 'A post excerpt',
	better_excerpt_no_html: 'A better post excerpt',
	discussion: { comment_count: 3 },
};

const CURRENT_USER_ID = 42;
const WELCOME_DISMISSED_PREFERENCE_KEY = 'reader_conversations_inbox_welcome_dismissed';

const renderDetail = (
	props: Partial< React.ComponentProps< typeof ConversationDetail > > = {},
	{
		comments = [],
		remotePreferences = { [ WELCOME_DISMISSED_PREFERENCE_KEY ]: true },
	}: {
		comments?: { ID: number; author: { ID: number } }[];
		remotePreferences?: Record< string, unknown > | null;
	} = {}
) => {
	mockedUseComments.mockReturnValue( { comments } as never );
	return renderWithProvider(
		<ConversationDetail siteId={ 10 } postId={ 100 } conversation={ conversation } { ...props } />,
		{
			reducers: { preferences },
			initialState: {
				currentUser: { id: CURRENT_USER_ID },
				preferences: { localValues: {}, remoteValues: remotePreferences },
			},
		}
	);
};

beforeEach( () => {
	mockedUsePost.mockReset();
} );

afterEach( () => {
	nock.cleanAll();
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

	it.each( [
		[ 'You follow this', post, [] ],
		[ 'Your post', { ...post, author: { ID: CURRENT_USER_ID } }, [] ],
		[ 'You commented', post, [ { ID: 1, author: { ID: CURRENT_USER_ID } } ] ],
	] )( 'titles the header “%s”', ( title, data, comments ) => {
		mockedUsePost.mockReturnValue( { data, isLoading: false } as never );

		renderDetail( {}, { comments } );

		expect( screen.getByRole( 'heading', { level: 2, name: title } ) ).toBeVisible();
	} );

	it( 'saves the welcome notice dismissal as a preference', async () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );
		const user = userEvent.setup();
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { [ WELCOME_DISMISSED_PREFERENCE_KEY ]: true } } );

		renderDetail( {}, { remotePreferences: {} } );

		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( screen.queryByText( 'Welcome to Conversations' ) ).not.toBeInTheDocument();
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	it( 'shows the featured image and Today for a post published today', () => {
		mockedUsePost.mockReturnValue( {
			data: {
				...post,
				date: new Date().toISOString(),
				canonical_image: { uri: 'https://example.com/featured.jpg' },
			},
			isLoading: false,
		} as never );

		const { container } = renderDetail();

		expect( container.querySelector( '.conversations-inbox__post-image' ) ).toHaveAttribute(
			'src',
			'https://example.com/featured.jpg'
		);
		expect( screen.getByText( '· Today' ) ).toBeVisible();
	} );
} );
