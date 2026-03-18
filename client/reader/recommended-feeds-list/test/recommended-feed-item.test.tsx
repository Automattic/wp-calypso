/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import readerReducer from 'calypso/state/reader/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { RecommendedFeedItem } from '../recommended-feed-item';

jest.mock( 'calypso/components/data/query-reader-site', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/data/query-sites', () => ( {
	__esModule: true,
	default: () => null,
} ) );

// Mock ReaderFollowButton - requires complex Redux state (reader, route, currentUser) and has side effects (analytics, API calls for follow/unfollow).
jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: ( { isButtonOnly, className }: { isButtonOnly: boolean; className: string } ) => (
		<button
			data-testid="follow-button"
			data-is-button-only={ isButtonOnly }
			className={ className }
		>
			{ isButtonOnly ? null : 'Subscribe' }
		</button>
	),
} ) );

describe( 'RecommendedFeedItem', () => {
	const defaultFeed: FeedRecommendation = {
		ID: '123',
		name: 'Test Blog',
		feedUrl: 'https://example.com/feed',
		siteId: '456',
		feedId: '789',
		image: 'https://example.com/image.jpg',
	};

	const defaultProps: ComponentProps< typeof RecommendedFeedItem > = {
		feed: defaultFeed,
		variant: 'default' as const,
		followSource: 'test-source',
	};

	const renderComponent = (
		props = defaultProps,
		siteData?: object
	): ReturnType< typeof renderWithProvider > =>
		renderWithProvider( <RecommendedFeedItem { ...props } />, {
			initialState: {
				reader: {
					sites: { items: siteData ? { 456: siteData } : {} },
				},
			},
			reducers: { reader: readerReducer },
		} );

	beforeAll( () => {
		// Mock IntersectionObserver for SiteIcon's lazy loading
		const mockIntersectionObserver = jest.fn();
		mockIntersectionObserver.mockReturnValue( {
			observe: () => null,
			unobserve: () => null,
			disconnect: () => null,
		} );
		window.IntersectionObserver = mockIntersectionObserver;
	} );

	test( 'renders recommended feed item correctly', () => {
		renderComponent();

		expect( document.querySelector( '.reader-avatar' ) ).toBeVisible();
		expect( document.querySelector( '.site-icon' ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { level: 3 } ) ).toHaveTextContent( 'Test Blog' );
		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', '/reader/feeds/789' );
		expect( screen.getByText( 'No description.' ) ).toBeVisible();
		expect( screen.getByTestId( 'follow-button' ) ).toBeVisible();
	} );

	test( 'fallback to feedUrl when feedId is empty', () => {
		renderComponent( { ...defaultProps, feed: { ...defaultFeed, feedId: '' } } );

		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', 'https://example.com/feed' );
	} );

	describe( 'feed name variations', () => {
		test( 'fallback to feedUrl when name is not provided', () => {
			renderComponent( { ...defaultProps, feed: { ...defaultFeed, name: undefined } } );

			expect( screen.getByRole( 'heading', { level: 3 } ) ).toHaveTextContent(
				'https://example.com/feed'
			);
		} );
	} );

	describe( 'description variations', () => {
		test( 'shows site description when available', () => {
			renderComponent( defaultProps, { description: 'A great blog about testing' } );

			expect( screen.getByText( 'A great blog about testing' ) ).toBeVisible();
		} );

		test( 'hides description in compact variant', () => {
			renderComponent( { ...defaultProps, variant: 'compact' } );

			expect( screen.queryByText( 'No description.' ) ).not.toBeInTheDocument();
		} );

		test( 'shows description in card variant', () => {
			renderComponent( { ...defaultProps, variant: 'card' } );

			expect( screen.getByText( 'No description.' ) ).toBeVisible();
		} );
	} );

	describe( 'follow button variations', () => {
		test( 'does not render when feedUrl is not provided', () => {
			renderComponent( { ...defaultProps, feed: { ...defaultFeed, feedUrl: undefined } } );

			expect( screen.queryByTestId( 'follow-button' ) ).not.toBeInTheDocument();
		} );

		test( 'shows label in default variant', () => {
			renderComponent();

			const button = screen.getByTestId( 'follow-button' );
			expect( button ).toHaveAttribute( 'data-is-button-only', 'false' );
			expect( button ).toHaveTextContent( 'Subscribe' );
		} );

		test( 'hides label in compact (isButtonOnly) variant', () => {
			renderComponent( { ...defaultProps, variant: 'compact' } );

			const button = screen.getByTestId( 'follow-button' );
			expect( button ).toHaveAttribute( 'data-is-button-only', 'true' );
			expect( button ).not.toHaveTextContent( 'Subscribe' );
		} );
	} );
} );
