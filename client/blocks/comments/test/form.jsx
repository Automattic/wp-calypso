/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PostCommentForm from '../form';

jest.mock( 'calypso/blocks/user-mentions', () => ( {
	__esModule: true,
	default: ( Component ) => Component,
	withUserMentions: ( Component ) => Component,
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

const renderForm = ( props = {} ) => {
	return renderWithProvider( <PostCommentForm { ...defaultProps } { ...props } />, {
		initialState: {
			currentUser: {
				id: 1,
				user: { ID: 1, display_name: 'Test User' },
			},
		},
	} );
};

describe( 'PostCommentForm', () => {
	describe( 'when comments are open', () => {
		it( 'renders the comment form', () => {
			renderForm();
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
