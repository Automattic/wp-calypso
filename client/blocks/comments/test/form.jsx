/**
 * @jest-environment jsdom
 */
import { loadScript } from '@automattic/load-script';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CommentEditorContext } from '../comment-editor-context';
import PostCommentForm from '../form';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
} ) );

jest.mock( 'calypso/blocks/user-mentions', () => ( {
	__esModule: true,
	default: ( Component ) => Component,
	withUserMentions: ( Component ) => Component,
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

const renderForm = ( props = {}, { blockEditor = false } = {} ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<CommentEditorContext.Provider value={ blockEditor }>
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
		loadScript.mockReset();
		delete window.JetpackCommentsEditor;
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

	describe( 'block editor', () => {
		const settings = {
			assetsUrl: 'https://s0.wp.com/jetpack-comments/build/',
			loaderUrl:
				'https://s0.wp.com/jetpack-comments/build/editor-loader.js?minify=false&ver=abc123',
			maxLength: 65525,
			blocks: true,
			editorLocale: {},
			editor: {
				blockTools: 'Block tools',
				addBlock: 'Add block',
				embedUrl: '',
				images: true,
				imageError: 'This image could not be loaded.',
			},
		};
		const markup = '<!-- wp:paragraph --><p>Hello blocks</p><!-- /wp:paragraph -->';

		// A fresh loader URL per test, since the form caches the loaded editor by URL.
		let build = 0;
		const mockEditorSettings = ( status = 200 ) => {
			const body =
				status === 200
					? { ...settings, loaderUrl: `${ settings.loaderUrl }${ ++build }` }
					: { code: 'editor_not_available' };
			const request = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/sites/456/comments/editor' )
				.query( { _locale: 'user' } )
				.reply( status, body );

			return { request, body };
		};

		const mockLoader = () => {
			const mountEditor = jest.fn();
			loadScript.mockImplementation( async () => {
				window.JetpackCommentsEditor = { load: async () => ( { mountEditor } ) };
			} );
			return mountEditor;
		};

		const renderEditorForm = ( props ) => renderForm( props, { blockEditor: true } );

		it( 'stays a textarea outside the conversations inbox', async () => {
			const { request } = mockEditorSettings();

			renderForm();
			await userEvent.click( screen.getByPlaceholderText( 'Add a comment…' ) );

			expect( request.isDone() ).toBe( false );
			expect( loadScript ).not.toHaveBeenCalled();
			expect( screen.getByPlaceholderText( 'Add a comment…' ) ).toBeVisible();
		} );

		it( 'takes over from the textarea once the box has focus', async () => {
			const { body } = mockEditorSettings();
			const mountEditor = mockLoader();

			renderEditorForm();
			await userEvent.click( screen.getByPlaceholderText( 'Add a comment…' ) );

			await waitFor( () => expect( mountEditor ).toHaveBeenCalledTimes( 1 ) );
			expect( loadScript ).toHaveBeenCalledWith( body.loaderUrl );
			expect( mountEditor.mock.calls[ 0 ][ 1 ] ).toMatchObject( {
				initialContent: '',
				placeholder: 'Add a comment…',
				labels: settings.editor,
			} );
			expect( screen.queryByPlaceholderText( 'Add a comment…' ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'group', { name: 'Comment' } ) ).toBeVisible();
		} );

		it( 'hands the editor markup to the form as the comment text', async () => {
			mockEditorSettings();
			const mountEditor = mockLoader();
			const onUpdateCommentText = jest.fn();

			renderEditorForm( { onUpdateCommentText } );
			await userEvent.click( screen.getByPlaceholderText( 'Add a comment…' ) );
			await waitFor( () => expect( mountEditor ).toHaveBeenCalled() );

			mountEditor.mock.calls[ 0 ][ 1 ].onChange( markup );

			expect( onUpdateCommentText ).toHaveBeenCalledWith( markup );
		} );

		it( 'submits on Cmd+Enter from inside the editor', async () => {
			mockEditorSettings();
			const mountEditor = mockLoader();
			const request = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/456/posts/123/replies/new', { content: markup } )
				.reply( 200, {
					ID: 4,
					content: markup,
					date: '2026-05-02T00:00:00.000Z',
					parent: false,
					post: { ID: 123 },
					status: 'approved',
				} );

			renderEditorForm( { commentText: markup } );
			await waitFor( () => expect( mountEditor ).toHaveBeenCalled() );

			const container = mountEditor.mock.calls[ 0 ][ 0 ];
			container.dispatchEvent(
				new KeyboardEvent( 'keydown', { keyCode: 13, metaKey: true, bubbles: true } )
			);

			await waitFor( () => expect( request.isDone() ).toBe( true ) );
		} );

		it( 'keeps the textarea when the site has no block editor', async () => {
			const { request } = mockEditorSettings( 404 );

			renderEditorForm();
			await userEvent.click( screen.getByPlaceholderText( 'Add a comment…' ) );
			await waitFor( () => expect( request.isDone() ).toBe( true ) );

			expect( loadScript ).not.toHaveBeenCalled();
			expect( screen.getByPlaceholderText( 'Add a comment…' ) ).toBeVisible();
		} );

		it( 'brings the textarea back when the loader fails', async () => {
			mockEditorSettings();
			loadScript.mockRejectedValue( new Error( 'blocked' ) );

			renderEditorForm();
			await userEvent.click( screen.getByPlaceholderText( 'Add a comment…' ) );
			await waitFor( () => expect( loadScript ).toHaveBeenCalled() );

			expect( screen.getByPlaceholderText( 'Add a comment…' ) ).toBeVisible();
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
