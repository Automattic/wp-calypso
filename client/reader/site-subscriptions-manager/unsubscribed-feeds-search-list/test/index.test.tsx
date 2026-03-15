/**
 * @jest-environment jsdom
 */

import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen } from '@testing-library/react';
import nock from 'nock';
import { ComponentProps } from 'react';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import FeedPreview from 'calypso/landing/subscriptions/components/feed-preview';
import { UnsubscribedFeedsSearchList } from '../index';

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

const createMockFeedItem = ( overrides = {} ): Partial< Reader.FeedItem > => ( {
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

const Wrapper =
	( { searchTerm }: { searchTerm: string } ) =>
	( { children }: { children: React.ReactNode } ) => (
		<SubscriptionManager.SiteSubscriptionsQueryPropsProvider initialSearchTermState={ searchTerm }>
			<QueryClientProvider
				client={
					new QueryClient( {
						defaultOptions: {
							queries: { retry: false },
						},
					} )
				}
			>
				{ children }
			</QueryClientProvider>
		</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
	);

const render = ( ui: React.ReactNode, renderOptions: Parameters< typeof Wrapper >[ 0 ] ) =>
	rtlRender( ui, { wrapper: Wrapper( renderOptions ) } );

describe( 'UnsubscribedFeedsSearchList', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.disableNetConnect();
	} );

	it( 'shows the loading state', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.delay( 1000 );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );

		expect( screen.getByRole( 'status' ) ).toBeVisible();
	} );

	it( 'renders error message when no feeds are found', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.reply( 200, {
				feeds: [],
			} );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );
		expect(
			await screen.findByText( "Sorry, we couldn't find any sites related to your search." )
		).toBeVisible();
	} );

	it( 'renders error message when there is an error with the api', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 500, {
				error: 'Internal Server Error',
			} );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );
		expect(
			await screen.findByText( "Sorry, we couldn't find any sites related to your search." )
		).toBeVisible();
	} );

	it( 'renders list of feed items', async () => {
		const feedItems = [
			createMockFeedItem( { feed_ID: '1', blog_ID: '1' } ),
			createMockFeedItem( { feed_ID: '2', blog_ID: '2' } ),
			createMockFeedItem( { feed_ID: '3', blog_ID: '3' } ),
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, {
				feeds: feedItems,
			} );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );

		const feedItemElements = await screen.findAllByTestId( 'mock-reader-feed-item' );
		expect( feedItemElements ).toHaveLength( 3 );
		expect( screen.queryByTestId( 'mock-feed-preview' ) ).not.toBeInTheDocument();

		feedItemElements.forEach( ( element ) => {
			expect( element ).toHaveAttribute(
				'data-source',
				'subscriptions-search-recommendation-list'
			);
		} );
	} );

	it( 'renders a feed preview when there is a single feed item', async () => {
		const feedItem = createMockFeedItem( { feed_ID: '1', blog_ID: '1' } );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, { feeds: [ feedItem ] } );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );

		expect( await screen.findByTestId( 'mock-feed-preview' ) ).toBeVisible();
		expect( screen.queryByTestId( 'mock-reader-feed-item' ) ).not.toBeInTheDocument();
	} );
} );
