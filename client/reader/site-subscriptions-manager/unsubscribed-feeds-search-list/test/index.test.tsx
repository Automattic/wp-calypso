/**
 * @jest-environment jsdom
 */

import { Reader } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import FeedPreview from 'calypso/landing/subscriptions/components/feed-preview';
import UnsubscribedFeedsSearchList from '../index';

// Mock recordTrainTracksRender
const mockRecordTrainTracksRender = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTrainTracksRender: ( ...args: unknown[] ) => mockRecordTrainTracksRender( ...args ),
	getDoNotTrack: jest.fn(),
} ) );

// Mock FeedPreview component
jest.mock( 'calypso/landing/subscriptions/components/feed-preview', () => {
	return jest.fn( ( { url, source }: ComponentProps< typeof FeedPreview > ) => (
		<div data-testid="mock-feed-preview" data-url={ url } data-source={ source } />
	) );
} );

// Mock ReaderFeedItem component
jest.mock( 'calypso/blocks/reader-feed-item', () => {
	return jest.fn( ( { feed, source }: ComponentProps< typeof ReaderFeedItem > ) => (
		<div
			data-testid="mock-reader-feed-item"
			data-feed-id={ feed.feed_ID }
			data-blog-id={ feed.blog_ID }
			data-source={ source }
		/>
	) );
} );

const createMockFeedItem = ( overrides = {} ): Reader.FeedItem => ( {
	feed_ID: '123',
	blog_ID: '456',
	subscribe_URL: 'https://example.com/feed',
	railcar: {
		railcar: 'test-railcar-id',
		fetch_algo: 'test-algo',
		fetch_position: 0,
		rec_blog_id: '456',
		fetch_lang: 'en',
	},
	meta: {},
	...overrides,
} );

describe( 'UnsubscribedFeedsSearchList', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'loading state', () => {
		it( 'shows Spinner when isLoading is true', () => {
			render( <UnsubscribedFeedsSearchList isLoading feedItems={ [] } /> );

			expect( screen.getByRole( 'status' ) ).toBeVisible();
		} );

		it( 'does not show Spinner when isLoading is false', () => {
			render( <UnsubscribedFeedsSearchList isLoading={ false } feedItems={ [] } /> );

			expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'empty state', () => {
		it( 'renders empty list when feedItems is empty', () => {
			render( <UnsubscribedFeedsSearchList isLoading={ false } feedItems={ [] } /> );

			const list = document.querySelector( '.reader-unsubscribed-feeds-search-list' );
			expect( list ).toBeVisible();
			expect( list?.children ).toHaveLength( 0 );
		} );

		it( 'renders empty list when feedItems is undefined', () => {
			render( <UnsubscribedFeedsSearchList isLoading={ false } feedItems={ undefined } /> );

			const list = document.querySelector( '.reader-unsubscribed-feeds-search-list' );
			expect( list ).toBeVisible();
			expect( list?.children ).toHaveLength( 0 );
		} );
	} );

	describe( 'single result', () => {
		it( 'renders FeedPreview when feedItems has exactly one item', () => {
			const feedItems = [ createMockFeedItem() ];

			render( <UnsubscribedFeedsSearchList isLoading={ false } feedItems={ feedItems } /> );

			expect( screen.getByTestId( 'mock-feed-preview' ) ).toBeVisible();
			expect( screen.queryByTestId( 'mock-reader-feed-item' ) ).not.toBeInTheDocument();
		} );

		it( 'passes correct url and source to FeedPreview', () => {
			const feedItems = [ createMockFeedItem( { subscribe_URL: 'https://example.com/rss' } ) ];

			render( <UnsubscribedFeedsSearchList isLoading={ false } feedItems={ feedItems } /> );

			const feedPreview = screen.getByTestId( 'mock-feed-preview' );
			expect( feedPreview ).toHaveAttribute( 'data-url', 'https://example.com/rss' );
			expect( feedPreview ).toHaveAttribute(
				'data-source',
				'manage_subscriptions_single_result_feed_preview'
			);
		} );
	} );

	describe( 'multiple results', () => {
		it( 'renders ReaderFeedItem components when feedItems has multiple items', () => {
			const feedItems = [
				createMockFeedItem( { feed_ID: '1', blog_ID: '1' } ),
				createMockFeedItem( { feed_ID: '2', blog_ID: '2' } ),
				createMockFeedItem( { feed_ID: '3', blog_ID: '3' } ),
			];

			render( <UnsubscribedFeedsSearchList isLoading={ false } feedItems={ feedItems } /> );

			const feedItemElements = screen.getAllByTestId( 'mock-reader-feed-item' );
			expect( feedItemElements ).toHaveLength( 3 );
			expect( screen.queryByTestId( 'mock-feed-preview' ) ).not.toBeInTheDocument();
			feedItemElements.forEach( ( element ) => {
				expect( element ).toHaveAttribute(
					'data-source',
					'subscriptions-search-recommendation-list'
				);
			} );
		} );
	} );
} );
