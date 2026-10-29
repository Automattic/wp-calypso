/**
 * @jest-environment jsdom
 */
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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comments from 'calypso/blocks/comments';
import { usePost } from 'calypso/reader/data/post';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationDetail } from '..';
import { groupNotesByPost } from '../../group-notes';
import { makeNote } from '../../test/helpers';

const mockedUsePost = jest.mocked( usePost );

const [ conversation ] = groupNotesByPost( [
	makeNote( { id: 1, siteId: 10, postId: 100, title: 'A post title', commenter: 'Ana' } ),
] );

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

const renderDetail = ( props: Partial< React.ComponentProps< typeof ConversationDetail > > = {} ) =>
	renderWithProvider(
		<ConversationDetail siteId={ 10 } postId={ 100 } conversation={ conversation } { ...props } />
	);

beforeEach( () => {
	mockedUsePost.mockReset();
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

	it( 'marks the highlighted comments as new and lets threads collapse', () => {
		mockedUsePost.mockReturnValue( { data: post, isLoading: false } as never );

		renderDetail( { highlightedCommentIds: [ 1000 ] } );

		expect( jest.mocked( Comments ) ).toHaveBeenLastCalledWith(
			expect.objectContaining( { highlightedCommentIds: [ 1000 ], collapsibleThreads: true } ),
			undefined
		);
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
} );
