/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CommentEditorContext } from '../comment-editor-context';
import PostCommentForm from '../form';

jest.mock( 'calypso/blocks/user-mentions', () => ( {
	__esModule: true,
	default: ( Component ) => Component,
	withUserMentions: ( Component ) => Component,
} ) );

// The editor's script stays loading, so the form keeps the markup it was given.
jest.mock( '../load-comment-editor', () => ( {
	loadCommentEditor: () => new Promise( () => {} ),
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	getLocation: () => 'reader',
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
	recordTrackForPost: jest.fn(),
} ) );

const defaultPost = {
	ID: 123,
	site_ID: 456,
	URL: 'https://example.com/post',
	discussion: {
		comments_open: true,
		comment_count: 5,
	},
};

const defaultProps = {
	post: defaultPost,
	onUpdateCommentText: jest.fn(),
	onCommentSubmit: jest.fn(),
};

const renderForm = ( props = {}, { composer = false } = {} ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<CommentEditorContext.Provider value={ composer }>
				<PostCommentForm { ...defaultProps } { ...props } />
			</CommentEditorContext.Provider>
		</QueryClientProvider>,
		{
			initialState: {
				currentUser: {
					id: 1,
					user: { ID: 1, display_name: 'Test User' },
				},
			},
		}
	);
};

describe( 'PostCommentForm', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	describe( 'when comments are open', () => {
		it( 'renders the comment form', () => {
			renderForm();
			expect( screen.getByPlaceholderText( 'Add a comment…' ) ).toBeVisible();
		} );

		it( 'submits a root comment through the comments API', async () => {
			const request = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/456/posts/123/replies/new', { content: 'Hello API' } )
				.reply( 200, {
					ID: 2,
					content: 'Hello API',
					date: '2026-05-02T00:00:00.000Z',
					parent: false,
					post: { ID: 123 },
					status: 'approved',
				} );
			const onUpdateCommentText = jest.fn();

			renderForm( { commentText: 'Hello API', onUpdateCommentText } );

			await userEvent.click( screen.getByRole( 'button', { name: 'Send' } ) );

			expect( request.isDone() ).toBe( true );
			expect( onUpdateCommentText ).toHaveBeenCalledWith( '' );
		} );

		it( 'submits a reply through the comment replies API', async () => {
			const request = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/456/comments/99/replies/new', { content: 'Reply API' } )
				.reply( 200, {
					ID: 3,
					content: 'Reply API',
					date: '2026-05-02T00:00:00.000Z',
					parent: { ID: 99 },
					post: { ID: 123 },
					status: 'approved',
				} );

			renderForm( { commentText: 'Reply API', parentCommentId: 99 } );

			await userEvent.click( screen.getByRole( 'button', { name: 'Send' } ) );

			expect( request.isDone() ).toBe( true );
		} );
	} );

	describe( 'in the inbox composer', () => {
		const markup =
			'<!-- wp:paragraph --><p>Hello <strong>there</strong></p><!-- /wp:paragraph -->\n\n' +
			'<!-- wp:list --><ul><!-- wp:list-item --><li>One</li><!-- /wp:list-item --></ul><!-- /wp:list -->';
		const editorSettings = {
			assetsUrl: 'https://s0.wp.com/build/',
			loaderUrl: 'https://s0.wp.com/build/editor-loader.js',
			maxLength: 65525,
			blocks: true,
			editorLocale: {},
			editor: { blockTools: 'Block tools', addBlock: 'Add block', embedUrl: '', images: false },
		};
		const mockEditorSettings = ( status, body ) =>
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/sites/456/comments/editor' )
				.query( true )
				.reply( status, body );
		const postReply = async ( content ) => {
			const request = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/456/posts/123/replies/new', { content } )
				.reply( 200, {
					ID: 4,
					content,
					date: '2026-11-03T00:00:00.000Z',
					parent: false,
					post: { ID: 123 },
					status: 'approved',
				} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Reply' } ) );

			return request.isDone();
		};

		it.each( [
			[ 'block markup for a site with block comments', true, markup ],
			[
				'plain HTML for a site without block comments',
				false,
				'Hello <strong>there</strong>\n\n- One',
			],
		] )( 'saves %s', async ( _, blocks, content ) => {
			mockEditorSettings( 200, { ...editorSettings, blocks } );
			renderForm( { commentText: markup }, { composer: true } );

			await screen.findByRole( 'textbox', { name: 'Comment' } );
			expect( await postReply( content ) ).toBe( true );
		} );

		it( 'keeps the textarea where the site has no editor settings', async () => {
			const settings = mockEditorSettings( 404, { code: 'editor_not_available' } );
			renderForm( { commentText: 'Plain words' }, { composer: true } );

			await waitFor( () => expect( settings.isDone() ).toBe( true ) );
			expect( screen.queryByRole( 'textbox', { name: 'Comment' } ) ).not.toBeInTheDocument();
			expect( await postReply( 'Plain words' ) ).toBe( true );
		} );

		it( 'leaves Cancel off the top-level composer', () => {
			mockEditorSettings( 404, {} );
			renderForm( {}, { composer: true } );

			expect( screen.queryByRole( 'button', { name: 'Cancel' } ) ).not.toBeInTheDocument();
		} );

		it( 'offers Cancel on a reply', () => {
			mockEditorSettings( 404, {} );
			renderForm( { parentCommentId: 99, onReplyCancel: jest.fn() }, { composer: true } );

			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		} );
	} );

	describe( 'when comments are closed', () => {
		it( 'shows "Comments closed." when there are existing comments', () => {
			renderForm( {
				post: {
					...defaultPost,
					discussion: { comments_open: false, comment_count: 3 },
				},
			} );
			expect( screen.getByText( 'Comments closed.' ) ).toBeVisible();
		} );

		it( 'renders nothing when there are no comments', () => {
			const { container } = renderForm( {
				post: {
					...defaultPost,
					discussion: { comments_open: false, comment_count: 0 },
				},
			} );
			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'when login is required to comment', () => {
		it( 'shows the registration required message when comments are open', () => {
			renderForm( {
				post: {
					...defaultPost,
					discussion: {
						comments_open: true,
						comments_require_registration: true,
					},
				},
			} );
			expect( screen.getByText( /This site requires registration to comment/ ) ).toBeVisible();
		} );

		it( 'links to the original post', () => {
			renderForm( {
				post: {
					...defaultPost,
					discussion: {
						comments_open: true,
						comments_require_registration: true,
					},
				},
			} );
			const link = screen.getByRole( 'link', { name: /Visit the original post/ } );
			expect( link ).toHaveAttribute( 'href', 'https://example.com/post' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );

		it( 'does not render the comment textarea', () => {
			renderForm( {
				post: {
					...defaultPost,
					discussion: {
						comments_open: true,
						comments_require_registration: true,
					},
				},
			} );
			expect( screen.queryByPlaceholderText( 'Add a comment…' ) ).not.toBeInTheDocument();
		} );

		it( 'shows comments closed when comments_open is false even with registration required', () => {
			renderForm( {
				post: {
					...defaultPost,
					discussion: {
						comments_open: false,
						comment_count: 5,
						comments_require_registration: true,
					},
				},
			} );
			expect( screen.getByText( 'Comments closed.' ) ).toBeVisible();
		} );
	} );
} );
