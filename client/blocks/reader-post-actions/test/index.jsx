/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReaderPostActions from '../index';

let mockSavedPostsEnabled = false;
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: ( flag ) => flag === 'reader/saved-posts' && mockSavedPostsEnabled,
} ) );

// Mock the components that are complex to test
jest.mock( 'calypso/blocks/comment-button', () => () => <div data-testid="comment-button" /> );
jest.mock( 'calypso/blocks/reader-share', () => () => <div data-testid="share-button" /> );
jest.mock( 'calypso/blocks/reader-save-button', () => () => <div data-testid="save-button" /> );
jest.mock( 'calypso/reader/like-button', () => () => <div data-testid="like-button" /> );

// Simple mock store
const createMockStore = ( initialState = {} ) => {
	const reducer = ( state = initialState ) => state;
	return createStore( reducer );
};

const createQueryClient = () => {
	const client = new QueryClient();
	client.setDefaultOptions( { queries: { retry: false } } );
	return client;
};

const defaultProps = {
	post: {
		ID: 123,
		site_ID: 456,
		discussion: { comment_count: 5 },
		URL: 'https://example.com/post',
	},
	site: { ID: 456 },
	onCommentClick: jest.fn(),
};

describe( 'ReaderPostActions', () => {
	beforeEach( () => {
		mockSavedPostsEnabled = false;
	} );

	describe( 'when comments API is disabled', () => {
		it( 'should not render CommentButton', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: true };

			const { queryByTestId } = render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( queryByTestId( 'comment-button' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when comments API is enabled', () => {
		it( 'should render CommentButton when comments are enabled', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: false };

			const { queryByTestId } = render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );

		it( 'should render CommentButton when commentsApiDisabled is not provided (defaults to false)', () => {
			const store = createMockStore();
			const props = { ...defaultProps };

			const { queryByTestId } = render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'the Save button', () => {
		const renderActions = ( {
			post = defaultProps.post,
			state = { currentUser: { id: 1 } },
		} = {} ) =>
			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ createMockStore( state ) }>
						<ReaderPostActions { ...defaultProps } post={ post } />
					</Provider>
				</QueryClientProvider>
			);

		beforeEach( () => {
			mockSavedPostsEnabled = true;
		} );

		it( 'shows for a logged-in user', () => {
			renderActions();

			expect( screen.getByTestId( 'save-button' ) ).toBeVisible();
		} );

		it( 'is hidden when the saved posts feature is off', () => {
			mockSavedPostsEnabled = false;

			renderActions();

			expect( screen.queryByTestId( 'save-button' ) ).not.toBeInTheDocument();
		} );

		it( 'is hidden from a logged-out user', () => {
			renderActions( { state: { currentUser: { id: null } } } );

			expect( screen.queryByTestId( 'save-button' ) ).not.toBeInTheDocument();
		} );

		it( 'shows on an RSS post', () => {
			renderActions( {
				post: {
					ID: 9000,
					feed_ID: 60,
					feed_item_ID: 9000,
					is_external: true,
					URL: 'https://example.com/post',
				},
			} );

			expect( screen.getByTestId( 'save-button' ) ).toBeVisible();
		} );

		it( 'is hidden on a post without the IDs the saved posts API needs', () => {
			renderActions( { post: { ...defaultProps.post, site_ID: undefined } } );

			expect( screen.queryByTestId( 'save-button' ) ).not.toBeInTheDocument();
		} );
	} );
} );
