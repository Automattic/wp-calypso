/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'redux';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { showFullPost } from 'calypso/reader/utils';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FullFeedPost } from '../full-feed-post';

jest.mock( 'calypso/blocks/reader-post-actions', () => ( {
	__esModule: true,
	default: jest.fn( () => <div aria-label="Reader post actions">Reader post actions</div> ),
} ) );

jest.mock( 'calypso/blocks/reader-full-post/wp-iframe-resize', () => ( {
	__esModule: true,
	default: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/reader/utils', () => ( {
	...jest.requireActual( 'calypso/reader/utils' ),
	showFullPost: jest.fn(),
} ) );

const post = {
	ID: 456,
	URL: 'https://example.com/post',
	author: { name: 'Example Author' },
	content: '<p>Full post body</p>',
	date: '2026-04-17T12:00:00Z',
	feed_ID: 123,
	feed_item_ID: 789,
	global_ID: 'global-post-id',
	is_external: true,
	site_ID: 456,
	site_name: 'Example Site',
	title: 'Example post',
};

let contentScrollHeight = 1200;
let scrollIntoViewMock: jest.Mock;
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

const renderPost = ( postProps = post, commentsState = { apiDisabled: {} } ) => {
	const store = createStore( ( state = { comments: commentsState } ) => state );

	renderWithProvider( <FullFeedPost post={ postProps } />, {
		store,
	} );

	return { store };
};

describe( 'FullFeedPost', () => {
	const recordReaderTracksEvent = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		contentScrollHeight = 1200;
		scrollIntoViewMock = jest.fn();
		Object.defineProperty( HTMLElement.prototype, 'scrollIntoView', {
			configurable: true,
			value: scrollIntoViewMock,
		} );
		window.requestAnimationFrame = ( ( callback: FrameRequestCallback ) => {
			callback( 0 );
			return 0;
		} ) as typeof window.requestAnimationFrame;
		window.cancelAnimationFrame = jest.fn();
		jest.spyOn( HTMLElement.prototype, 'scrollHeight', 'get' ).mockImplementation( () => {
			return contentScrollHeight;
		} );
		( useRecordReaderTracksEvent as jest.Mock ).mockReturnValue( recordReaderTracksEvent );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		if ( originalScrollIntoView ) {
			Object.defineProperty( HTMLElement.prototype, 'scrollIntoView', {
				configurable: true,
				value: originalScrollIntoView,
			} );
		} else {
			Object.defineProperty( HTMLElement.prototype, 'scrollIntoView', {
				configurable: true,
				value: undefined,
			} );
		}
		window.requestAnimationFrame = originalRequestAnimationFrame;
		window.cancelAnimationFrame = originalCancelAnimationFrame;
	} );

	it( 'renders full post content in a collapsed preview that can expand and collapse', async () => {
		const user = userEvent.setup();

		renderPost();

		expect( screen.getByRole( 'heading', { name: 'Example post' } ) ).toBeVisible();
		expect( screen.getByRole( 'region', { name: 'Post content' } ) ).toHaveTextContent(
			'Full post body'
		);
		expect( screen.getByLabelText( 'Reader post actions' ) ).toBeVisible();
		expect( ReaderPostActions ).toHaveBeenCalledWith(
			expect.objectContaining( {
				commentsApiDisabled: false,
				likeContext: 'full-feed',
				markLikedPostSeen: false,
				onCommentClick: expect.any( Function ),
				post,
				showFreshlyPressed: false,
			} ),
			expect.any( Object )
		);

		await user.click( await screen.findByRole( 'button', { name: 'Read more: Example post' } ) );

		expect(
			screen.getAllByRole( 'button', { name: 'Collapse: Example post' } )[ 0 ]
		).toBeVisible();
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_full_feed_post_expanded',
			expect.objectContaining( {
				feed_id: 123,
				feed_item_id: 789,
			} )
		);

		await user.click( screen.getAllByRole( 'button', { name: 'Collapse: Example post' } )[ 0 ] );

		expect(
			await screen.findByRole( 'button', { name: 'Read more: Example post' } )
		).toBeVisible();
	} );

	it( 'opens the full post comments when the comment action is clicked', () => {
		renderPost();

		const { onCommentClick } = ( ReaderPostActions as jest.Mock ).mock.calls[ 0 ][ 0 ];

		onCommentClick();

		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_full_feed_comments_button_clicked',
			expect.objectContaining( {
				feed_id: 123,
				feed_item_id: 789,
			} )
		);
		expect( showFullPost ).toHaveBeenCalledWith( { post, comments: true } );
	} );

	it( 'opens feed-post comments with a feed item id fallback', () => {
		const feedPostWithoutFeedItemId = {
			...post,
			ID: 999,
			feed_item_ID: undefined,
		};

		renderPost( feedPostWithoutFeedItemId );

		const { onCommentClick } = ( ReaderPostActions as jest.Mock ).mock.calls[ 0 ][ 0 ];

		onCommentClick();

		expect( showFullPost ).toHaveBeenCalledWith( {
			comments: true,
			post: expect.objectContaining( {
				...feedPostWithoutFeedItemId,
				feed_item_ID: 999,
			} ),
		} );
	} );

	it( 'keeps the comment action hidden when comments API is disabled for an internal post', () => {
		const internalPost = { ...post, is_external: false };

		const { store } = renderPost( internalPost, {
			apiDisabled: {
				[ internalPost.site_ID ]: true,
			},
		} );

		expect( store.getState().comments.apiDisabled[ internalPost.site_ID ] ).toBe( true );
		expect( ReaderPostActions ).toHaveBeenCalledWith(
			expect.objectContaining( {
				commentsApiDisabled: true,
				post: internalPost,
			} ),
			expect.any( Object )
		);
	} );

	it( 'does not show read more for content that fits within the preview height', async () => {
		contentScrollHeight = 900;

		renderPost();

		await waitFor( () => {
			expect(
				screen.queryByRole( 'button', { name: 'Read more: Example post' } )
			).not.toBeInTheDocument();
		} );
		expect( screen.getByLabelText( 'Reader post actions' ) ).toBeVisible();
	} );

	it( 'shows read more when content exceeds the preview height', async () => {
		contentScrollHeight = 901;

		renderPost();

		expect(
			await screen.findByRole( 'button', { name: 'Read more: Example post' } )
		).toBeVisible();
	} );

	it( 'does not count the featured image against the collapsed text preview height', async () => {
		contentScrollHeight = 1200;
		jest.spyOn( HTMLElement.prototype, 'getBoundingClientRect' ).mockImplementation( function (
			this: HTMLElement
		) {
			return {
				bottom: 400,
				height: this.classList.contains( 'reader-full-post__featured-image' ) ? 400 : 0,
				left: 0,
				right: 0,
				top: 0,
				width: 0,
				x: 0,
				y: 0,
				toJSON: jest.fn(),
			};
		} );

		renderPost( {
			...post,
			featured_image: 'https://example.com/image.jpg',
		} );

		await waitFor( () => {
			expect(
				screen.queryByRole( 'button', { name: 'Read more: Example post' } )
			).not.toBeInTheDocument();
		} );
	} );

	it( 'expands when the collapsed content preview is clicked', async () => {
		const user = userEvent.setup();

		renderPost();

		await user.click( screen.getByRole( 'region', { name: 'Post content' } ) );

		expect( screen.getByRole( 'button', { name: 'Collapse: Example post' } ) ).toBeVisible();
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_full_feed_post_expanded',
			expect.objectContaining( {
				feed_id: 123,
				feed_item_id: 789,
			} )
		);
	} );

	it( 'keeps collapse available while an expanded article is in view', async () => {
		const user = userEvent.setup();

		renderPost();

		const article = screen.getByRole( 'article' );
		const content = screen.getByRole( 'region', { name: 'Post content' } );
		jest.spyOn( article, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );
		jest.spyOn( content as Element, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );

		await user.click( await screen.findByRole( 'button', { name: 'Read more: Example post' } ) );

		const floatingCollapse = await waitFor( () => {
			const element = document.body.querySelector( '.full-feed-post__floating-collapse' );
			expect( element ).toBeInTheDocument();
			return element as HTMLElement;
		} );
		expect(
			within( floatingCollapse ).getByRole( 'button', { name: 'Collapse: Example post' } )
		).toBeVisible();
		expect( article ).not.toContainElement(
			within( floatingCollapse ).getByRole( 'button', { name: 'Collapse: Example post' } )
		);
	} );

	it( 'scrolls back to read more after collapsing with the floating collapse button', async () => {
		const user = userEvent.setup();

		renderPost();

		const article = screen.getByRole( 'article' );
		const content = screen.getByRole( 'region', { name: 'Post content' } );
		jest.spyOn( article, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );
		jest.spyOn( content as Element, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );

		await user.click( await screen.findByRole( 'button', { name: 'Read more: Example post' } ) );
		const floatingCollapse = await waitFor( () => {
			const element = document.body.querySelector( '.full-feed-post__floating-collapse' );
			expect( element ).toBeInTheDocument();
			return element as HTMLElement;
		} );
		await user.click(
			within( floatingCollapse ).getByRole( 'button', { name: 'Collapse: Example post' } )
		);

		const readMoreButton = await screen.findByRole( 'button', { name: 'Read more: Example post' } );

		expect( readMoreButton ).toBeVisible();
		expect( scrollIntoViewMock ).toHaveBeenCalledWith( {
			behavior: 'smooth',
			block: 'center',
		} );
		expect( readMoreButton ).toHaveFocus();
	} );

	it( 'hides the floating collapse button when the inline collapse button is visible', async () => {
		const user = userEvent.setup();

		renderPost();

		const article = screen.getByRole( 'article' );
		const content = screen.getByRole( 'region', { name: 'Post content' } );
		const expandActions = screen.getByRole( 'group', {
			name: 'Post expansion controls',
		} );
		jest.spyOn( article, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );
		jest.spyOn( content as Element, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );
		jest.spyOn( expandActions as Element, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 560,
			height: 48,
			left: 320,
			right: 440,
			top: 512,
			width: 120,
			x: 320,
			y: 512,
			toJSON: jest.fn(),
		} );

		await user.click( await screen.findByRole( 'button', { name: 'Read more: Example post' } ) );

		await waitFor( () => {
			expect( document.body.querySelector( '.full-feed-post__floating-collapse' ) ).toBeNull();
		} );
		expect( screen.getByRole( 'button', { name: 'Collapse: Example post' } ) ).toBeVisible();
	} );

	it( 'hides the floating collapse button after scrolling past the content area', async () => {
		const user = userEvent.setup();

		renderPost();

		const article = screen.getByRole( 'article' );
		const content = screen.getByRole( 'region', { name: 'Post content' } );
		jest.spyOn( article, 'getBoundingClientRect' ).mockReturnValue( {
			bottom: 900,
			height: 1200,
			left: 0,
			right: 760,
			top: -300,
			width: 760,
			x: 0,
			y: -300,
			toJSON: jest.fn(),
		} );
		const contentRectMock = jest
			.spyOn( content as Element, 'getBoundingClientRect' )
			.mockReturnValue( {
				bottom: 900,
				height: 1200,
				left: 0,
				right: 760,
				top: -300,
				width: 760,
				x: 0,
				y: -300,
				toJSON: jest.fn(),
			} );

		await user.click( await screen.findByRole( 'button', { name: 'Read more: Example post' } ) );

		await waitFor( () => {
			const floatingCollapse = document.body.querySelector(
				'.full-feed-post__floating-collapse'
			) as HTMLElement | null;

			expect( floatingCollapse ).toBeVisible();
		} );

		contentRectMock.mockReturnValue( {
			bottom: 20,
			height: 1200,
			left: 0,
			right: 760,
			top: -1180,
			width: 760,
			x: 0,
			y: -1180,
			toJSON: jest.fn(),
		} );
		act( () => {
			window.dispatchEvent( new Event( 'scroll' ) );
		} );

		await waitFor( () => {
			expect( document.body.querySelector( '.full-feed-post__floating-collapse' ) ).toBeNull();
		} );
		expect( screen.getByRole( 'button', { name: 'Collapse: Example post' } ) ).toBeVisible();
	} );
} );
