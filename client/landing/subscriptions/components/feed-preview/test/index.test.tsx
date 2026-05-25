/**
 * @jest-environment jsdom
 */

import { Reader } from '@automattic/data-stores';
import { render, screen, waitFor } from '@testing-library/react';
import FeedPreview from '../index';

// Mock wpcom API
const mockWpcomGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: ( ...args: unknown[] ) => mockWpcomGet( ...args ),
		},
	},
} ) );

// Mock useDebounce to return value immediately for testing
jest.mock( 'use-debounce', () => ( {
	useDebounce: ( value: string ) => [ value ],
} ) );

jest.mock( 'calypso/reader/stream', () => {
	return jest.fn( () => <div data-testid="mock-stream" data-restore-scroll="false" /> );
} );

jest.mock( 'calypso/blocks/reader-feed-item', () => {
	return jest.fn( ( { feed }: { feed: Reader.FeedItem } ) => (
		<div
			data-testid="mock-reader-feed-item"
			data-feed-id={ feed.feed_ID }
			data-source="test-source"
		/>
	) );
} );

const mockFeed: Partial< Reader.FeedItem > = {
	feed_ID: '123',
	subscribe_URL: 'https://example.com/feed',
	meta: {},
};

describe( 'FeedPreview', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders null when URL is empty', () => {
		const { container } = render( <FeedPreview url="" source="test-source" /> );

		expect( mockWpcomGet ).not.toHaveBeenCalled();
		expect( container.firstChild ).toBeNull();
	} );

	it( 'shows loading spinner while fetching', async () => {
		// Create a promise that doesn't resolve immediately
		mockWpcomGet.mockReturnValue( new Promise( () => {} ) );

		render( <FeedPreview url="https://example.com" source="test-source" /> );

		expect( screen.getByText( 'Loading feed preview…' ) ).toBeVisible();
	} );

	it( 'calls the correct API endpoint with the URL', async () => {
		mockWpcomGet.mockResolvedValue( { feeds: [ mockFeed ] } );

		render( <FeedPreview url="https://example.com/feed" source="test-source" /> );

		await waitFor( () => {
			expect( mockWpcomGet ).toHaveBeenCalledWith( '/read/feed', {
				url: 'https://example.com/feed',
			} );
		} );
	} );

	it( 'shows error message when no feed is found', async () => {
		mockWpcomGet.mockResolvedValue( { feeds: [] } );

		render( <FeedPreview url="https://example.com" source="test-source" /> );

		await waitFor( () => {
			expect( screen.getByText( 'No feed is available at this url.' ) ).toBeVisible();
		} );
	} );

	it( 'shows "Preview not available" message when feed has no feed_ID', async () => {
		mockWpcomGet.mockResolvedValue( {
			feeds: [ { subscribe_URL: 'https://example.com', meta: {} } ],
		} );

		render( <FeedPreview url="https://example.com" source="test-source" /> );

		await waitFor( () => {
			expect( screen.getByText( 'Preview of the feed is not yet available.' ) ).toBeVisible();
		} );
	} );

	it( 'renders ReaderFeedItem with feed data', async () => {
		mockWpcomGet.mockResolvedValue( { feeds: [ mockFeed ] } );

		render( <FeedPreview url="https://example.com" source="test-source" /> );

		await waitFor( () => {
			const feedItem = screen.getByTestId( 'mock-reader-feed-item' );
			expect( feedItem ).toBeVisible();
			expect( feedItem ).toHaveAttribute( 'data-feed-id', '123' );
			expect( feedItem ).toHaveAttribute( 'data-source', 'test-source' );

			const stream = screen.getByTestId( 'mock-stream' );
			expect( stream ).toBeVisible();
			expect( stream ).toHaveAttribute( 'data-restore-scroll', 'false' );
		} );
	} );

	describe( 'callbacks', () => {
		it( 'calls onChangeFeedPreview with true when feed loads successfully', async () => {
			const onChangeFeedPreview = jest.fn();
			mockWpcomGet.mockResolvedValue( { feeds: [ mockFeed ] } );

			render(
				<FeedPreview
					url="https://example.com"
					source="test-source"
					onChangeFeedPreview={ onChangeFeedPreview }
				/>
			);

			await waitFor( () => {
				expect( onChangeFeedPreview ).toHaveBeenCalledWith( true );
			} );
		} );

		it( 'calls onChangeFeedPreview with false when no feed is found', async () => {
			const onChangeFeedPreview = jest.fn();
			mockWpcomGet.mockResolvedValue( { feeds: [] } );

			render(
				<FeedPreview
					url="https://example.com"
					source="test-source"
					onChangeFeedPreview={ onChangeFeedPreview }
				/>
			);

			await waitFor( () => {
				expect( onChangeFeedPreview ).toHaveBeenCalledWith( false );
			} );
		} );

		it( 'passes onChangeSubscribe to ReaderFeedItem', async () => {
			const onChangeSubscribe = jest.fn();
			mockWpcomGet.mockResolvedValue( { feeds: [ mockFeed ] } );

			const ReaderFeedItem = jest.requireMock( 'calypso/blocks/reader-feed-item' );

			render(
				<FeedPreview
					url="https://example.com"
					source="test-source"
					onChangeSubscribe={ onChangeSubscribe }
				/>
			);

			await waitFor( () => {
				expect( ReaderFeedItem ).toHaveBeenCalledWith(
					expect.objectContaining( { onChangeSubscribe } ),
					expect.anything()
				);
			} );
		} );
	} );
} );
