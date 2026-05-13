/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { recordAction, recordPermalinkClick } from 'calypso/reader/stats';
import ReaderPostActions from '../index';

const mockLikeButton = jest.fn( () => <div data-testid="like-button" /> );

// Mock the components that are complex to test
jest.mock( 'calypso/blocks/comment-button', () => () => <div data-testid="comment-button" /> );
jest.mock( 'calypso/blocks/reader-share', () => () => <div data-testid="share-button" /> );
jest.mock( 'calypso/reader/like-button', () => ( props ) => mockLikeButton( props ) );
jest.mock( 'calypso/blocks/reader-freshly-pressed-button', () => ( {
	ReaderFreshlyPressedButton: () => <button>Suggest: Freshly Pressed</button>,
} ) );
jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordPermalinkClick: jest.fn(),
} ) );

// Simple mock store
const createMockStore = () => {
	const reducer = ( state = {} ) => state;
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
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		mockLikeButton.mockClear();
		recordAction.mockClear();
		recordPermalinkClick.mockClear();
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 200, { number: 0, teams: [] } );
	} );

	afterAll( () => {
		nock.enableNetConnect();
	} );

	describe( 'when comments API is disabled', () => {
		it( 'should not render CommentButton', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: true };

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( screen.queryByTestId( 'comment-button' ) ).not.toBeInTheDocument();
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

	describe( 'full-feed action options', () => {
		it( 'passes explicit like context and mark-seen behavior through to LikeButton', () => {
			const store = createMockStore();

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions
							{ ...defaultProps }
							likeContext="full-feed"
							markLikedPostSeen={ false }
						/>
					</Provider>
				</QueryClientProvider>
			);

			expect( mockLikeButton ).toHaveBeenCalledWith(
				expect.objectContaining( {
					likeContext: 'full-feed',
					markLikedPostSeen: false,
				} )
			);
		} );

		it( 'can suppress Freshly Pressed for full-post-style actions', async () => {
			nock.cleanAll();
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, { teams: [ { slug: 'a8c' } ] } );
			const store = createMockStore();

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...defaultProps } fullPost showFreshlyPressed={ false } />
					</Provider>
				</QueryClientProvider>
			);

			await waitFor( () => {
				expect(
					screen.queryByRole( 'button', { name: 'Suggest: Freshly Pressed' } )
				).not.toBeInTheDocument();
			} );
		} );

		it( 'shows Freshly Pressed by default for eligible full posts', async () => {
			nock.cleanAll();
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, { teams: [ { slug: 'a8c' } ] } );
			const store = createMockStore();

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...defaultProps } fullPost />
					</Provider>
				</QueryClientProvider>
			);

			expect(
				await screen.findByRole( 'button', { name: 'Suggest: Freshly Pressed' } )
			).toBeVisible();
		} );

		it( 'does not render View original by default', () => {
			const store = createMockStore();

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...defaultProps } />
					</Provider>
				</QueryClientProvider>
			);

			expect( screen.queryByRole( 'link', { name: 'View original' } ) ).not.toBeInTheDocument();
		} );

		it( 'renders View original when enabled with a URL', () => {
			const store = createMockStore();

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...defaultProps } showViewOriginal />
					</Provider>
				</QueryClientProvider>
			);

			const viewOriginal = screen.getByRole( 'link', { name: 'View original' } );

			expect( viewOriginal ).toHaveAttribute( 'href', defaultProps.post.URL );
			expect( viewOriginal ).toHaveAttribute( 'target', '_blank' );
			expect( viewOriginal ).toHaveAttribute( 'rel', 'external noopener noreferrer' );
		} );

		it( 'uses visitUrl for View original and tracks clicks', () => {
			const store = createMockStore();
			const visitUrl = 'https://example.com/original';

			render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...defaultProps } showViewOriginal visitUrl={ visitUrl } />
					</Provider>
				</QueryClientProvider>
			);

			const viewOriginal = screen.getByRole( 'link', { name: 'View original' } );
			expect( viewOriginal ).toHaveAttribute( 'href', visitUrl );

			fireEvent.click( viewOriginal );

			expect( recordAction ).toHaveBeenCalledWith( 'clicked_view_original' );
			expect( recordPermalinkClick ).toHaveBeenCalledWith(
				'full_post_visit_link',
				defaultProps.post
			);
		} );
	} );
} );
